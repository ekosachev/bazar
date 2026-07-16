package ws

import (
	"context"
	"encoding/json"
	"time"

	"github.com/ekosachev/bazar/internal/chat"
	"github.com/google/uuid"
)

type Hub struct {
	clients     map[uuid.UUID]map[*Client]bool
	register    chan *Client
	unregister  chan *Client
	chatService *chat.ChatService
	dedupCache  *DedupCache
}

func NewHub(chatService *chat.ChatService) *Hub {
	return &Hub{
		clients:     make(map[uuid.UUID]map[*Client]bool),
		register:    make(chan *Client),
		unregister:  make(chan *Client),
		chatService: chatService,
		dedupCache:  NewDedupCache(1 * time.Minute),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			if h.clients[client.userID] == nil {
				h.clients[client.userID] = make(map[*Client]bool)
			}
			h.clients[client.userID][client] = true
		case client := <-h.unregister:
			if clients, ok := h.clients[client.userID]; ok {
				if _, ok := clients[client]; ok {
					delete(clients, client)
					close(client.send)
					if len(clients) == 0 {
						delete(h.clients, client.userID)
					}
				}
			}
		}
	}
}

func (h *Hub) SendToUser(userID uuid.UUID, message []byte) {
	if clients, ok := h.clients[userID]; ok {
		for client := range clients {
			select {
			case client.send <- message:
			default:
				close(client.send)
				delete(clients, client)
			}
		}
	}
}

func (h *Hub) BroadcastMessageRead(chatID, readerID, messageID uuid.UUID) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	members, err := h.chatService.GetChatMembers(ctx, readerID, chatID)
	if err != nil {
		return
	}

	notification := OutgoingMessage{
		Type: MessageRead,
		Payload: MessageReadPayload{
			ChatID:    chatID,
			UserID:    readerID,
			MessageID: messageID,
		},
	}

	notificationBytes, err := json.Marshal(notification)
	if err != nil {
		return
	}

	for _, member := range members {
		if member.UserModelID == readerID {
			continue
		}
		h.SendToUser(member.UserModelID, notificationBytes)
	}
}
