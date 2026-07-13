package message

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

type MessageModel struct {
	ID uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`

	ChatModelID uuid.UUID `gorm:"type:uuid"`
	SenderID    uuid.UUID

	Content   string
	ReplyToID *uuid.UUID
	ReplyTo   *MessageModel

	CreatedAt time.Time
	UpdatedAt time.Time
}

type MessageDTO struct {
	ID uuid.UUID

	ChatModelID uuid.UUID
	SenderID    uuid.UUID

	Content   string
	ReplyToID *uuid.UUID

	CreatedAt time.Time
	UpdatedAt time.Time
}

func (mm *MessageModel) IntoDTO() *MessageDTO {
	return &MessageDTO{
		ID:          mm.ID,
		ChatModelID: mm.ChatModelID,
		SenderID:    mm.SenderID,
		Content:     mm.Content,
		ReplyToID:   mm.ReplyToID,
		CreatedAt:   mm.CreatedAt,
		UpdatedAt:   mm.UpdatedAt,
	}
}

type MessageResponse struct {
	ID uuid.UUID `json:"id"`

	ChatModelID uuid.UUID `json:"chat_id"`
	SenderID    uuid.UUID `json:"sender_id"`

	Content   string     `json:"content"`
	ReplyToID *uuid.UUID `json:"reply_to_id"`

	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

func (mdto *MessageDTO) IntoResponse() *MessageResponse {
	return &MessageResponse{
		ID:          mdto.ID,
		ChatModelID: mdto.ChatModelID,
		SenderID:    mdto.SenderID,
		Content:     mdto.Content,
		ReplyToID:   mdto.ReplyToID,
		CreatedAt:   mdto.CreatedAt.Format(time.RFC3339),
		UpdatedAt:   mdto.UpdatedAt.Format(time.RFC3339),
	}
}

type ErrNotFound struct {
	ID uuid.UUID
}

func (e *ErrNotFound) Error() string {
	return fmt.Sprintf("Message with id %s does not exist", e.ID)
}
