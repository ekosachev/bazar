package message

import (
	"context"

	"github.com/google/uuid"
)

type MessageService struct {
	repo *MessageRepository
}

func NewMessageService(repo *MessageRepository) *MessageService {
	return &MessageService{repo: repo}
}

func (s *MessageService) GetMessageByID(ctx context.Context, id uuid.UUID) (*MessageDTO, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *MessageService) FindMessages(ctx context.Context, chatID uuid.UUID, before uuid.UUID, limit int) ([]MessageDTO, error) {
	return s.repo.FindMessages(ctx, chatID, before, limit)
}
