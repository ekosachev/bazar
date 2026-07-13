package ws

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/ekosachev/bazar/internal/message"
)

type MessageHandler func(client *Client, payload json.RawMessage) error

var messageHandlers = map[MessageType]MessageHandler{
	SendMessage: handleSendMessage,
}

func handleSendMessage(client *Client, payload json.RawMessage) error {
	var msg SendMessagePayload
	if err := json.Unmarshal(payload, &msg); err != nil {
		return fmt.Errorf("ivalid message:send payload: %w", err)
	}

	ctx, cancel := context.WithTimeout(client.ctx, 10*time.Second)
	defer cancel()

	var newMessageDTO *message.MessageDTO

	setNewMessage := func(msg *message.MessageDTO) {
		newMessageDTO = msg
	}

	ackBytes, isDuplicate, err := client.hub.dedupCache.CheckOrStore(
		client.userID,
		msg.ClientMessageID,
		func() ([]byte, error) {
			newMessage, err := client.hub.chatService.CreateMessage(ctx, msg.ChatID, client.userID, msg.Content, msg.ReplyToID)
			setNewMessage(newMessage)
			if err != nil {
				return []byte{}, err
			}

			ackMessage := OutgoingMessage{
				Type: MessageSent,
				Payload: MessageSentPayload{
					Message:         *newMessage.IntoResponse(),
					ClientMessageID: msg.ClientMessageID,
				},
			}

			ackMessageBytes, _ := json.Marshal(ackMessage)
			return ackMessageBytes, nil
		},
	)
	if err != nil {
		return err
	}

	client.hub.SendToUser(client.userID, ackBytes)

	if !isDuplicate {

		chatMembers, err := client.hub.chatService.GetChatMembers(ctx, client.userID, msg.ChatID)
		if err != nil {
			return err
		}

		notification := OutgoingMessage{
			Type: NewMessage,
			Payload: NewMessagePayload{
				Message: *newMessageDTO.IntoResponse(),
			},
		}

		notificationBytes, _ := json.Marshal(notification)

		for _, member := range chatMembers {
			if member.UserModelID == client.userID {
				continue
			}
			client.hub.SendToUser(member.UserModelID, notificationBytes)
		}
	}

	return nil
}
