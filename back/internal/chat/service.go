package chat

import (
	"context"
	"errors"
	"time"

	"github.com/ekosachev/bazar/internal/message"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ChatService struct {
	repo           *ChatRepository
	messageService *message.MessageService
}

func NewChatService(repo *ChatRepository, messageService *message.MessageService) *ChatService {
	return &ChatService{repo: repo, messageService: messageService}
}

func (s *ChatService) CreateDirectChat(
	ctx context.Context,
	request CreateDirectChatRequest,
	creatorIDString string,
) (*ChatResponse, error) {
	creatorID, err := uuid.Parse(creatorIDString)
	if err != nil {
		return nil, err
	}

	targetID, err := uuid.Parse(request.TargetUserID)
	if err != nil {
		return nil, err
	}

	existingChat, err := s.FindDirectChat(ctx, creatorID, targetID)
	if err != nil {
		return nil, err
	}

	if existingChat != nil {
		return existingChat, nil
	}

	chatDTO := ChatDTO{
		Type:      ChatDirect,
		CreatedBy: creatorID,
	}

	err = s.repo.Create(ctx, &chatDTO)
	if err != nil {
		return nil, err
	}

	if err = s.AddUserToChat(ctx, chatDTO.ID, creatorID, creatorID, RoleMember); err != nil {
		return nil, err
	}
	if err = s.AddUserToChat(ctx, chatDTO.ID, targetID, creatorID, RoleMember); err != nil {
		return nil, err
	}

	return &ChatResponse{
		ID:        chatDTO.ID.String(),
		Type:      string(ChatDirect),
		CreatedBy: chatDTO.CreatedBy.String(),
		CreatedAt: chatDTO.CreatedAt.Format(time.RFC3339),
	}, nil
}

func (s *ChatService) CreateGroupChat(
	ctx context.Context,
	request CreateGroupChatRequest,
	creatorIDString string,
) (*ChatResponse, error) {
	creatorID, err := uuid.Parse(creatorIDString)
	if err != nil {
		return nil, err
	}

	chatDTO := ChatDTO{
		Type:        ChatGroup,
		Title:       request.Title,
		Description: request.Description,
		CreatedBy:   creatorID,
	}

	if err = s.repo.Create(ctx, &chatDTO); err != nil {
		return nil, err
	}

	if err = s.AddUserToChat(ctx, chatDTO.ID, creatorID, creatorID, RoleOwner); err != nil {
		return nil, err
	}

	for _, memberID := range request.Members {
		if err = s.AddUserToChat(ctx, chatDTO.ID, memberID, creatorID, RoleMember); err != nil {
			return nil, err
		}
	}

	return &ChatResponse{
		ID:          chatDTO.ID.String(),
		Type:        string(ChatGroup),
		Title:       chatDTO.Title,
		Description: chatDTO.Description,
		CreatedBy:   creatorID.String(),
		CreatedAt:   chatDTO.CreatedAt.Format(time.RFC3339),
	}, nil
}

func (s *ChatService) CreateChannelChat(
	ctx context.Context,
	request CreateChannelChatRequest,
	creatorIDString string,
) (*ChatResponse, error) {
	creatorID, err := uuid.Parse(creatorIDString)
	if err != nil {
		return nil, err
	}

	chatDTO := ChatDTO{
		Type:        ChatChannel,
		Title:       request.Title,
		Description: request.Description,
		CreatedBy:   creatorID,
	}

	if err = s.repo.Create(ctx, &chatDTO); err != nil {
		return nil, err
	}

	if err = s.AddUserToChat(ctx, chatDTO.ID, creatorID, creatorID, RoleOwner); err != nil {
		return nil, err
	}

	return &ChatResponse{
		ID:          chatDTO.ID.String(),
		Type:        string(ChatChannel),
		Title:       chatDTO.Title,
		Description: chatDTO.Description,
		CreatedBy:   chatDTO.CreatedBy.String(),
		CreatedAt:   chatDTO.CreatedAt.Format(time.RFC3339),
	}, nil
}

func (s *ChatService) GetByID(ctx context.Context, userID uuid.UUID, chatID uuid.UUID) (*ChatResponse, error) {
	if _, err := s.GetUserRoleForChat(ctx, userID, chatID); err != nil {
		return nil, err
	}

	chatDTO, err := s.repo.GetByID(ctx, chatID)
	if err != nil {
		return nil, err
	}

	return &ChatResponse{
		ID:          chatDTO.ID.String(),
		Type:        string(chatDTO.Type),
		Title:       chatDTO.Title,
		Description: chatDTO.Description,
		AvatarURL:   chatDTO.AvatarURL,
		CreatedBy:   chatDTO.CreatedBy.String(),
		CreatedAt:   chatDTO.CreatedAt.Format(time.RFC3339),
	}, nil
}

func (s *ChatService) AddUserToChat(
	ctx context.Context,
	chatID uuid.UUID,
	userID uuid.UUID,
	inviterID uuid.UUID,
	role ChatMemberRole,
) error {
	inviterRole, err := s.GetUserRoleForChat(ctx, inviterID, chatID)
	if err != nil {
		return err
	}

	if *inviterRole == RoleMember {
		return &ErrInsufficientPermissions{
			ChatID: chatID,
			UserID: userID,
			Action: "add a user",
		}
	}

	chatMemberDTO := ChatMemberDTO{
		ChatModelID: chatID,
		UserModelID: userID,
		Role:        role,
		InvitedBy:   inviterID,
	}

	err = s.repo.AddUserToChat(ctx, &chatMemberDTO)
	if err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return &ErrAlreadyMember{ChatID: chatID, UserID: userID}
		}
	}
	return nil
}

func (s *ChatService) RemoveUserFromChat(ctx context.Context, chatID uuid.UUID, userID uuid.UUID, removerID uuid.UUID) error {
	removerRole, err := s.GetUserRoleForChat(ctx, removerID, chatID)
	if err != nil {
		return err
	}

	userRole, err := s.GetUserRoleForChat(ctx, removerID, chatID)
	if err != nil {
		return err
	}

	if removerID != userID {
		switch *removerRole {
		case RoleMember:
			return &ErrInsufficientPermissions{
				ChatID: chatID,
				UserID: userID,
				Action: "remove a user",
			}
		case RoleAdmin:
			if *userRole != RoleMember {
				return &ErrInsufficientPermissions{
					ChatID: chatID,
					UserID: userID,
					Action: "remove an admin/owner",
				}
			}
		}
	}

	return s.repo.RemoveUserFromChat(ctx, userID, chatID)
}

func (s *ChatService) GetUserRoleForChat(ctx context.Context, userID uuid.UUID, chatID uuid.UUID) (*ChatMemberRole, error) {
	chatMembership, err := s.repo.GetUserMembershipForChat(ctx, userID, chatID)
	if err != nil {
		return nil, err
	}

	if chatMembership == nil {
		return nil, &ErrNotMember{UserID: userID, ChatID: chatID}
	}

	return &chatMembership.Role, nil
}

func (cm *ChatMemberDTO) IntoResponse() *ChatMemberResponse {
	return &ChatMemberResponse{
		ChatModelID:       cm.ChatModelID,
		UserModelID:       cm.UserModelID,
		Role:              cm.Role,
		LastReadMessageID: cm.LastReadMessageID,
		InvitedBy:         cm.InvitedBy,
		CreatedAt:         cm.CreatedAt.Format(time.RFC3339),
	}
}

func (s *ChatService) GetChatMembers(ctx context.Context, userID uuid.UUID, chatID uuid.UUID) ([]ChatMemberResponse, error) {
	var result []ChatMemberResponse

	if _, err := s.GetUserRoleForChat(ctx, userID, chatID); err != nil {
		return result, err
	}

	memberships, err := s.repo.GetChatMembers(ctx, chatID)
	if err != nil {
		return nil, err
	}

	result = make([]ChatMemberResponse, len(memberships))
	for i, m := range memberships {
		result[i] = *m.IntoResponse()
	}

	return result, nil
}

func (cdto *ChatDTO) IntoResponse() *ChatResponse {
	return &ChatResponse{
		ID:          cdto.ID.String(),
		Type:        string(cdto.Type),
		Title:       cdto.Title,
		Description: cdto.Description,
		AvatarURL:   cdto.AvatarURL,
		CreatedBy:   cdto.CreatedBy.String(),
		CreatedAt:   cdto.CreatedAt.Format(time.RFC3339),
	}
}

func (s *ChatService) FindDirectChat(ctx context.Context, userID uuid.UUID, otherUserID uuid.UUID) (*ChatResponse, error) {
	chat, err := s.repo.FindDirectChat(ctx, userID, otherUserID)
	if err != nil {
		return nil, err
	}
	if chat == nil {
		return nil, nil
	}

	return chat.IntoResponse(), nil
}

func (s *ChatService) UpdateChat(
	ctx context.Context,
	userID uuid.UUID,
	chatID uuid.UUID,
	request UpdateChatRequest,
) (*ChatResponse, error) {
	role, err := s.GetUserRoleForChat(ctx, userID, chatID)
	if err != nil {
		return nil, err
	}

	if *role != RoleOwner {
		return nil, &ErrInsufficientPermissions{
			ChatID: chatID,
			UserID: userID,
			Action: "update chat",
		}
	}
	chat, err := s.repo.GetByID(ctx, chatID)
	if err != nil {
		return nil, err
	}

	if request.Title != nil {
		chat.Title = *request.Title
	}
	if request.Description != nil {
		chat.Description = *request.Description
	}

	err = s.repo.UpdateChat(ctx, chat)
	if err != nil {
		return nil, err
	}

	return chat.IntoResponse(), nil
}

func (s *ChatService) SetRole(
	ctx context.Context,
	userID uuid.UUID,
	chatID uuid.UUID,
	updaterID uuid.UUID,
	newRole ChatMemberRole,
) error {
	updaterRole, err := s.GetUserRoleForChat(ctx, updaterID, chatID)
	if err != nil {
		return err
	}

	if *updaterRole != RoleOwner {
		return &ErrInsufficientPermissions{
			ChatID: chatID,
			UserID: userID,
			Action: "update user roles",
		}
	}

	userRole, err := s.GetUserRoleForChat(ctx, userID, chatID)
	if err != nil {
		return err
	}
	if *userRole == RoleOwner {
		return &ErrInsufficientPermissions{
			ChatID: chatID,
			UserID: userID,
			Action: "change role of the owner",
		}
	}
	if newRole == RoleOwner {
		return &ErrInsufficientPermissions{
			ChatID: chatID,
			UserID: userID,
			Action: "make user an owner",
		}
	}

	return s.repo.SetRole(ctx, userID, chatID, newRole)
}

func (s *ChatService) FindMessages(
	ctx context.Context,
	chatID uuid.UUID,
	userID uuid.UUID,
	before uuid.UUID,
	limit int,
) (*[]message.MessageDTO, error) {
	_, err := s.GetUserRoleForChat(ctx, userID, chatID)
	if err != nil {
		return nil, err
	}

	result, err := s.messageService.FindMessages(ctx, chatID, before, limit)
	if err != nil {
		return nil, err
	}

	return &result, err
}

func (s *ChatService) FindMessagesByContent(
	ctx context.Context,
	chatID uuid.UUID,
	userID uuid.UUID,
	query string,
) (*[]message.MessageDTO, error) {
	_, err := s.GetUserRoleForChat(ctx, userID, chatID)
	if err != nil {
		return nil, err
	}

	result, err := s.messageService.FindMessagesByContent(ctx, chatID, query)
	if err != nil {
		return nil, err
	}

	return &result, err
}

func (s *ChatService) CreateMessage(
	ctx context.Context,
	chatID uuid.UUID,
	userID uuid.UUID,
	content string,
	replyToID *uuid.UUID,
) (*message.MessageDTO, error) {
	_, err := s.GetUserRoleForChat(ctx, userID, chatID)
	if err != nil {
		return nil, err
	}

	if replyToID != nil {
		replyTarget, err := s.messageService.GetMessageByID(ctx, *replyToID)
		if err != nil {
			return nil, err
		}

		if replyTarget == nil {
			return nil, &message.ErrNotFound{ID: *replyToID}
		}
	}

	message := message.MessageDTO{
		ChatModelID: chatID,
		SenderID:    userID,
		Content:     content,
		ReplyToID:   replyToID,
	}

	err = s.messageService.CreateMessage(ctx, &message)
	if err != nil {
		return nil, err
	}

	return &message, nil
}

func (s *ChatService) UpdateMessage(
	ctx context.Context,
	userID uuid.UUID,
	messageID uuid.UUID,
	newContent string,
) error {
	messageToUpdate, err := s.messageService.GetMessageByID(ctx, messageID)
	if err != nil {
		return err
	}

	if messageToUpdate == nil {
		return &message.ErrNotFound{ID: messageID}
	}

	if messageToUpdate.SenderID != userID {
		return &ErrInsufficientPermissions{
			UserID: userID,
			ChatID: messageToUpdate.ChatModelID,
			Action: "update other's messages",
		}
	}

	return s.messageService.UpdateMessage(ctx, messageID, newContent)
}
