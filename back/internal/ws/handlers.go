package ws

import (
	"context"
	"encoding/json"
	"fmt"
	"time"
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

	newMessage, err := client.hub.chatService.CreateMessage(ctx, msg.ChatID, client.userID, msg.Content, msg.ReplyToID)
	if err != nil {
		return err
	}

	ackMessage := OutgoingMessage{
		Type: MessageSent,
		Payload: MessageSentPayload{
			Message:         *newMessage.IntoResponse(),
			ClientMessageID: msg.ClientMessageID,
		},
	}

	ackMessageBytes, _ := json.Marshal(ackMessage)
	client.hub.SendToUser(client.userID, ackMessageBytes)

	chatMembers, err := client.hub.chatService.GetChatMembers(ctx, client.userID, msg.ChatID)
	if err != nil {
		return err
	}

	notification := OutgoingMessage{
		Type: NewMessage,
		Payload: NewMessagePayload{
			Message: *newMessage.IntoResponse(),
		},
	}

	notificationBytes, _ := json.Marshal(notification)

	for _, member := range chatMembers {
		if member.UserModelID == client.userID {
			continue
		}
		client.hub.SendToUser(member.UserModelID, notificationBytes)
	}

	return nil
}
