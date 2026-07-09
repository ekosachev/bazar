package chat

import (
	"time"

	"github.com/google/uuid"
)

type ChatType string

const (
	ChatDirect  ChatType = "direct"
	ChatGroup   ChatType = "group"
	ChatChannel ChatType = "channel"
)

type ChatModel struct {
	ID   uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Type ChatType

	Title       string
	Description string
	AvatarURL   *string

	CreatedBy uuid.UUID
	CreatedAt time.Time
}

type ChatDTO struct {
	ID   uuid.UUID
	Type ChatType

	Title       string
	Description string
	AvatarURL   *string

	CreatedBy uuid.UUID
	CreatedAt time.Time
}

type ChatResponse struct {
	ID   string `json:"id"`
	Type string `json:"chat_type"`

	Title       string  `json:"title"`
	Description string  `json:"description"`
	AvatarURL   *string `json:"avatar_url"`

	CreatedBy string `json:"created_by"`
	CreatedAt string `json:"created_at"`
}
