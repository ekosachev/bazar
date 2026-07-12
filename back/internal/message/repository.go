package message

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MessageRepository struct {
	db *gorm.DB
}

func NewMessageRepository(db *gorm.DB) *MessageRepository {
	return &MessageRepository{db: db}
}

func (r *MessageRepository) GetByID(ctx context.Context, id uuid.UUID) (*MessageDTO, error) {
	message, err := gorm.G[MessageModel](r.db).Where("id = ?", id).First(ctx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}

	return message.IntoDTO(), nil
}

func (r *MessageRepository) FindMessages(
	ctx context.Context,
	chatID uuid.UUID,
	before uuid.UUID,
	limit int,
) ([]MessageDTO, error) {
	var result []MessageDTO

	beforeMessage, err := r.GetByID(ctx, before)
	if err != nil {
		return result, err
	}

	if beforeMessage == nil {
		return result, nil
	}

	messages, err := gorm.G[MessageModel](r.db).
		Where("chat_model_id = ?", chatID).
		Where("created_at < ?", beforeMessage.CreatedAt).
		Limit(limit).
		Find(ctx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return result, nil
		}

		return nil, err
	}

	result = make([]MessageDTO, len(messages))
	for i, m := range messages {
		result[i] = *m.IntoDTO()
	}

	return result, nil
}
