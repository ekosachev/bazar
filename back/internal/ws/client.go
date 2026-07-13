package ws

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type Client struct {
	hub        *Hub
	conn       *websocket.Conn
	send       chan []byte
	userID     uuid.UUID
	ctx        context.Context
	cancelFunc context.CancelFunc
}

func (c *Client) readPump() {
	defer func() {
		c.cancelFunc()
		c.hub.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(4096)
	for {
		_, msgBytes, err := c.conn.ReadMessage()
		if err != nil {
			return
		}

		var incoming IncomingMessage
		if err := json.Unmarshal(msgBytes, &incoming); err != nil {
			c.sendError("invalid_json", "Cannot parse JSON")
			continue
		}

		handler, ok := messageHandlers[incoming.Type]
		if !ok {
			c.sendError("unknown_type", "Unknown message type: "+string(incoming.Type))
			continue
		}

		if err := handler(c, incoming.Payload); err != nil {
			c.sendError("handler_error", err.Error())
		}
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(54 * time.Second)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func handleIncomingMessage(c *Client, msg []byte) {
}

func (c *Client) sendError(code string, description string) {
	errMsg := map[string]string{
		"type":        "error",
		"code":        code,
		"description": description,
	}
	bytes, _ := json.Marshal(errMsg)
	select {
	case c.send <- bytes:
	default:
		log.Println("client buffer full, dropping error")
	}
}
