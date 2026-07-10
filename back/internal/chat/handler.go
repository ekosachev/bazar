package chat

import (
	"net/http"

	"github.com/ekosachev/bazar/internal/middleware"
	"github.com/ekosachev/bazar/internal/utils"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
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
			accessTokenGroup.GET("/:id", h.getByID)
			accessTokenGroup.POST("/direct", h.createDirectChat)
			accessTokenGroup.POST("/group", h.createGroupChat)
			accessTokenGroup.POST("/channel", h.createChannelChat)
		}
	}
}

func (h *ChatHandler) createDirectChat(c *gin.Context) {
	var req CreateDirectChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error())
		return
	}

	creatorID := c.GetString("userID")
	response, err := h.service.CreateDirectChat(c, req, creatorID)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusCreated, utils.APIResponse{
		Success: true,
		Data:    response,
	})
}

func (h *ChatHandler) createGroupChat(c *gin.Context) {
	var req CreateGroupChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error())
		return
	}

	creatorID := c.GetString("userID")
	response, err := h.service.CreateGroupChat(c, req, creatorID)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusCreated, utils.APIResponse{
		Success: true,
		Data:    response,
	})
}

func (h *ChatHandler) createChannelChat(c *gin.Context) {
	var req CreateChannelChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error())
		return
	}

	creatorID := c.GetString("userID")
	response, err := h.service.CreateChannelChat(c, req, creatorID)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusCreated, utils.APIResponse{
		Success: true,
		Data:    response,
	})
}

func (h *ChatHandler) getByID(c *gin.Context) {
	idString := c.Param("id")

	id, err := uuid.Parse(idString)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Chat ID must be a valid UUID string")
		return
	}

	chat, err := h.service.GetByID(c, id)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, utils.APIResponse{
		Success: true,
		Data:    chat,
	})
}
