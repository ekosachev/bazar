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

func (s *MessageService) FindMessagesByContent(ctx context.Context, chatID uuid.UUID, query string) ([]MessageDTO, error) {
	return s.repo.FindMessagesByContent(ctx, chatID, query)
}

func (s *MessageService) CreateMessage(ctx context.Context, message *MessageDTO) error {
	return s.repo.CreateMessage(ctx, message)
}

func (s *MessageService) UpdateMessage(ctx context.Context, id uuid.UUID, newContent string) error {
	existingMessage, err := s.GetMessageByID(ctx, id)
	if err != nil {
		return err
	}
	if existingMessage == nil {
		return &ErrNotFound{ID: id}
	}

	return s.repo.UpdateMessage(ctx, id, newContent)
}

func (s *MessageService) DeleteMessage(ctx context.Context, id uuid.UUID) error {
	existingMessage, err := s.GetMessageByID(ctx, id)
	if err != nil {
		return err
	}
	if existingMessage == nil {
		return &ErrNotFound{ID: id}
	}

	return s.repo.DeleteMessage(ctx, id)
}
