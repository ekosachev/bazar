package chat

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

type (
	ChatType       string
	ChatMemberRole string
)

const (
	ChatDirect  ChatType = "direct"
	ChatGroup   ChatType = "group"
	ChatChannel ChatType = "channel"
)

const (
	RoleMember ChatMemberRole = "member"
	RoleAdmin  ChatMemberRole = "admin"
	RoleOwner  ChatMemberRole = "owner"
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

type ChatMemberModel struct {
	ChatModelID uuid.UUID `gorm:"primaryKey"`
	UserModelID uuid.UUID `gorm:"primaryKey"`

	Role              ChatMemberRole
	LastReadMessageID *uuid.UUID

	InvitedBy uuid.UUID
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

type ChatMemberDTO struct {
	ChatModelID uuid.UUID
	UserModelID uuid.UUID

	Role              ChatMemberRole
	LastReadMessageID *uuid.UUID

	InvitedBy uuid.UUID
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

type ChatMemberResponse struct {
	ChatModelID uuid.UUID `json:"chat_id"`
	UserModelID uuid.UUID `json:"user_id"`

	Role              ChatMemberRole `json:"role"`
	LastReadMessageID *uuid.UUID     `json:"last_read_message_id"`

	InvitedBy uuid.UUID `json:"invited_by"`
	CreatedAt string    `json:"created_at"`
}

type CreateDirectChatRequest struct {
	TargetUserID string `json:"target_user_id"`
}

type CreateGroupChatRequest struct {
	Title       string      `json:"title" binding:"required"`
	Description string      `json:"description"`
	Members     []uuid.UUID `json:"members" binding:"required"`
}

type CreateChannelChatRequest struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
}

type ChatMemberEditRequest struct {
	UserID uuid.UUID `json:"user_id" binding:"required"`
}

type UpdateChatRequest struct {
	Title       *string `json:"title"`
	Description *string `json:"description"`
}

type SetRoleRequest struct {
	MemberID uuid.UUID `json:"user_id" binding:"required"`
	NewRole  string    `json:"new_role" binding:"required"`
}

type ErrAlreadyMember struct {
	ChatID uuid.UUID
	UserID uuid.UUID
}

func (e *ErrAlreadyMember) Error() string {
	return fmt.Sprintf("User %s is already a member of chat %s", e.UserID, e.ChatID)
}

type ErrNotMember struct {
	ChatID uuid.UUID
	UserID uuid.UUID
}

func (e *ErrNotMember) Error() string {
	return fmt.Sprintf("User %s is not a member of chat %s", e.UserID, e.ChatID)
}

type ErrInsufficientPermissions struct {
	ChatID uuid.UUID
	UserID uuid.UUID

	Action string
}

func (e *ErrInsufficientPermissions) Error() string {
	return fmt.Sprintf("User %s does not have enough permissions in chat %s to %s", e.UserID, e.ChatID, e.Action)
}
