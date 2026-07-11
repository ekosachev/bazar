package chat

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ChatService struct {
	repo *ChatRepository
}

func NewChatService(repo *ChatRepository) *ChatService {
	return &ChatService{repo: repo}
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

	if err = s.addUserToChat(ctx, chatDTO.ID, creatorID, creatorID, RoleMember); err != nil {
		return nil, err
	}
	if err = s.addUserToChat(ctx, chatDTO.ID, targetID, creatorID, RoleMember); err != nil {
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

	if err = s.addUserToChat(ctx, chatDTO.ID, creatorID, creatorID, RoleOwner); err != nil {
		return nil, err
	}

	for _, memberID := range request.Members {
		if err = s.addUserToChat(ctx, chatDTO.ID, memberID, creatorID, RoleMember); err != nil {
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

	if err = s.addUserToChat(ctx, chatDTO.ID, creatorID, creatorID, RoleOwner); err != nil {
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

func (s *ChatService) GetByID(ctx context.Context, chatID uuid.UUID) (*ChatResponse, error) {
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

func (s *ChatService) addUserToChat(
	ctx context.Context,
	chatID uuid.UUID,
	userID uuid.UUID,
	inviterID uuid.UUID,
	role ChatMemberRole,
) error {
	chatMemberDTO := ChatMemberDTO{
		ChatModelID: chatID,
		UserModelID: userID,
		Role:        role,
		InvitedBy:   inviterID,
	}

	err := s.repo.AddUserToChat(ctx, &chatMemberDTO)
	if err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return &ErrAlreadyMember{ChatID: chatID, UserID: userID}
		}
	}
	return nil
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
