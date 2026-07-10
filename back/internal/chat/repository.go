package chat

import (
	"context"

	"github.com/google/uuid"
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

func (r *ChatRepository) AddUserToChat(ctx context.Context, chatMember *ChatMemberDTO) error {
	chatMemberModel := ChatMemberModel{
		ChatModelID: chatMember.ChatModelID,
		UserModelID: chatMember.UserModelID,
		Role:        chatMember.Role,
		InvitedBy:   chatMember.InvitedBy,
	}

	err := gorm.G[ChatMemberModel](r.db).Create(ctx, &chatMemberModel)
	if err != nil {
		return err
	}

	chatMember.CreatedAt = chatMemberModel.CreatedAt
	return nil
}

func (r *ChatRepository) GetByID(ctx context.Context, chatID uuid.UUID) (*ChatDTO, error) {
	chatModel, err := gorm.G[ChatModel](r.db).Where("id = ?", chatID).First(ctx)
	if err != nil {
		return nil, err
	}

	return &ChatDTO{
		ID:          chatModel.ID,
		Type:        chatModel.Type,
		Title:       chatModel.Title,
		Description: chatModel.Description,
		AvatarURL:   chatModel.AvatarURL,
		CreatedBy:   chatModel.CreatedBy,
		CreatedAt:   chatModel.CreatedAt,
	}, nil
}
