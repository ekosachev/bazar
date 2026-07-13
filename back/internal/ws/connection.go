package ws

import (
	"context"
	"net/http"

	"github.com/ekosachev/bazar/internal/auth"
	"github.com/ekosachev/bazar/internal/utils"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

func ServeWs(hub *Hub, authService *auth.AuthService, c *gin.Context) {
	var request struct {
		Token string `form:"token" binding:"required"`
	}

	if err := c.ShouldBindQuery(&request); err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error())
		return
	}

	ok, userID := utils.VerifyAccessToken(request.Token)
	if !ok {
		utils.SendError(c, http.StatusUnauthorized, "Invalid token")
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Upgrade failed")
		return
	}

	client := &Client{
		hub:    hub,
		conn:   conn,
		send:   make(chan []byte, 256),
		userID: *userID,
	}
	client.ctx, client.cancelFunc = context.WithCancel(context.Background())
	hub.register <- client

	go client.writePump()
	go client.readPump()
}
