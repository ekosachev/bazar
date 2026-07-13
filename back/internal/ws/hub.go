package ws

import (
	"github.com/ekosachev/bazar/internal/chat"
	"github.com/google/uuid"
)

type Hub struct {
	clients     map[uuid.UUID]map[*Client]bool
	register    chan *Client
	unregister  chan *Client
	chatService *chat.ChatService
}

func NewHub(chatService *chat.ChatService) *Hub {
	return &Hub{
		clients:     make(map[uuid.UUID]map[*Client]bool),
		register:    make(chan *Client),
		unregister:  make(chan *Client),
		chatService: chatService,
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
