package chat

import (
	"context"
	"errors"

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

func (r *ChatRepository) GetUserMembershipForChat(
	ctx context.Context,
	userID uuid.UUID,
	chatID uuid.UUID,
) (*ChatMemberDTO, error) {
	chatMembership, err := gorm.G[ChatMemberModel](r.db).
		Where("chat_model_id = ? AND user_model_id = ?", chatID, userID).
		First(ctx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}

	return chatMembership.IntoDTO(), nil
}

func (cmm *ChatMemberModel) IntoDTO() *ChatMemberDTO {
	return &ChatMemberDTO{
		ChatModelID:       cmm.ChatModelID,
		UserModelID:       cmm.UserModelID,
		Role:              cmm.Role,
		LastReadMessageID: cmm.LastReadMessageID,
		InvitedBy:         cmm.InvitedBy,
		CreatedAt:         cmm.CreatedAt,
	}
}

func (r *ChatRepository) GetChatMembers(ctx context.Context, chatID uuid.UUID) ([]ChatMemberDTO, error) {
	var result []ChatMemberDTO
	var memberModels []ChatMemberModel

	err := r.db.Model(&ChatMemberModel{}).Where("chat_model_id = ?", chatID).Find(&memberModels).Error
	if err != nil {
		return result, err
	}

	result = make([]ChatMemberDTO, len(memberModels))
	for i, cm := range memberModels {
		result[i] = *cm.IntoDTO()
	}

	return result, err
}
