package ws

import (
	"encoding/json"

	"github.com/ekosachev/bazar/internal/message"
	"github.com/google/uuid"
)

type MessageType string

const (
	SendMessage MessageType = "message:send"
	MessageSent MessageType = "message:sent"
	NewMessage  MessageType = "message:new"
)

type IncomingMessage struct {
	Type    MessageType     `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

type OutgoingMessage struct {
	Type    MessageType `json:"type"`
	Payload any         `json:"payload"`
}

type SendMessagePayload struct {
	ChatID    uuid.UUID  `json:"chat_id"`
	Content   string     `json:"content"`
	ReplyToID *uuid.UUID `json:"reply_to_id"`

	ClientMessageID uuid.UUID `json:"client_message_id"`
}

type MessageSentPayload struct {
	Message         message.MessageResponse `json:"message"`
	ClientMessageID uuid.UUID               `json:"client_message_id"`
}

type NewMessagePayload struct {
	Message message.MessageResponse `json:"message"`
}
