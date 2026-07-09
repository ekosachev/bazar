package chat

import (
	"context"

	"gorm.io/gorm"
)

type ChatRepository struct {
	db *gorm.DB
}

func NewChatRepository(db *gorm.DB) *ChatRepository {
	return &ChatRepository{db: db}
}

func (r *ChatRepository) Create(ctx context.Context, chat *ChatDTO) error {
	chatModel := ChatModel{
		Type:        chat.Type,
		Title:       chat.Title,
		Description: chat.Description,
		AvatarURL:   chat.AvatarURL,
		CreatedBy:   chat.CreatedBy,
	}

	err := gorm.G[ChatModel](r.db).Create(ctx, &chatModel)
	if err != nil {
		return err
	}

	chat.ID = chatModel.ID
	chat.CreatedAt = chatModel.CreatedAt
	return nil
}
