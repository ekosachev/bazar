package chat

import (
	"context"
	"slices"
	"time"

	"github.com/google/uuid"
)

type ChatService struct {
	repo *ChatRepository
}

func NewChatService(repo *ChatRepository) *ChatService {
	return &ChatService{repo: repo}
}

func (s *ChatService) Create(ctx context.Context, request CreateChatRequest, userIDString string) (*ChatResponse, error) {
	if !validateChatType(request.Type) {
		return nil, &ErrInvalidChatType{Value: request.Type}
	}

	userID, err := uuid.Parse(userIDString)
	if err != nil {
		return nil, err
	}

	chatDTO := ChatDTO{
		Type:        ChatType(request.Type),
		Title:       request.Title,
		Description: request.Description,
		CreatedBy:   userID,
	}

	err = s.repo.Create(ctx, &chatDTO)
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

func validateChatType(chatType string) bool {
	validTypes := []ChatType{ChatDirect, ChatGroup, ChatChannel}

	return slices.Contains(validTypes, ChatType(chatType))
}
