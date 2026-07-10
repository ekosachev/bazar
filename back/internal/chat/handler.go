package chat

import (
	"errors"
	"net/http"

	"github.com/ekosachev/bazar/internal/middleware"
	"github.com/ekosachev/bazar/internal/utils"
	"github.com/gin-gonic/gin"
)

type ChatHandler struct {
	service *ChatService
}

func NewChatHandler(service *ChatService) *ChatHandler {
	return &ChatHandler{service: service}
}

func (h *ChatHandler) RegisterRoutes(group *gin.RouterGroup) {
	chatGroup := group.Group("/chat")
	{
		accessTokenGroup := chatGroup.Group("/").Use(middleware.RequiresAccessToken())
		{
			accessTokenGroup.POST("/", h.create)
		}
	}
}

func (h *ChatHandler) create(c *gin.Context) {
	var req CreateChatRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error())
		return
	}

	response, err := h.service.Create(c, req, c.GetString("userID"))
	if err != nil {
		var invalidChatType *ErrInvalidChatType
		if errors.As(err, &invalidChatType) {
			utils.SendError(c, http.StatusBadRequest, err.Error())
			return
		}

		utils.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusCreated, utils.APIResponse{
		Success: true,
		Data:    response,
	})
}
