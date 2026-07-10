package chat

import (
	"context"
	"errors"
	"slices"
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

func validateChatType(chatType string) bool {
	validTypes := []ChatType{ChatDirect, ChatGroup, ChatChannel}

	return slices.Contains(validTypes, ChatType(chatType))
}
