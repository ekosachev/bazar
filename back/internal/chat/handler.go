package chat

import (
	"errors"
	"net/http"

	"github.com/ekosachev/bazar/internal/message"
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
			accessTokenGroup.PUT("/:id", h.updateChat)
			accessTokenGroup.GET("/:id/members", h.getChatMembers)
			accessTokenGroup.PUT("/:id/members/add", h.addUserToChat)
			accessTokenGroup.PUT("/:id/members/remove", h.removeUserFromChat)
			accessTokenGroup.PUT("/:id/members/set_role", h.setRole)
			accessTokenGroup.DELETE("/:id/leave", h.leaveChat)
			accessTokenGroup.POST("/direct", h.createDirectChat)
			accessTokenGroup.POST("/group", h.createGroupChat)
			accessTokenGroup.POST("/channel", h.createChannelChat)

			accessTokenGroup.GET("/:id/messages", h.findMessages)
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

	userID, err := uuid.Parse(c.GetString("userID"))
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	chat, err := h.service.GetByID(c, userID, id)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, utils.APIResponse{
		Success: true,
		Data:    chat,
	})
}

func (h *ChatHandler) getChatMembers(c *gin.Context) {
	idString := c.Param("id")

	id, err := uuid.Parse(idString)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Chat ID must be a valid UUID string")
		return
	}

	userID, err := uuid.Parse(c.GetString("userID"))
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	result, err := h.service.GetChatMembers(c, userID, id)
	if err != nil {
		var notMember *ErrNotMember
		if errors.As(err, &notMember) {
			utils.SendError(c, http.StatusForbidden, err.Error())
		}
		utils.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, utils.APIResponse{
		Success: true,
		Data:    result,
	})
}

func (h *ChatHandler) addUserToChat(c *gin.Context) {
	var req ChatMemberEditRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error())
		return
	}

	userID, err := uuid.Parse(c.GetString("userID"))
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	chatID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error())
		return
	}

	err = h.service.AddUserToChat(c, chatID, req.UserID, userID, RoleMember)
	if err != nil {
		var alreadyMember *ErrAlreadyMember
		if errors.As(err, &alreadyMember) {
			utils.SendError(c, http.StatusConflict, err.Error())
			return
		}
		var notMember *ErrNotMember
		if errors.As(err, &notMember) {
			utils.SendError(c, http.StatusForbidden, err.Error())
			return
		}
		var insufficientPermissions *ErrInsufficientPermissions
		if errors.As(err, &insufficientPermissions) {
			utils.SendError(c, http.StatusForbidden, err.Error())
			return
		}
		utils.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, utils.APIResponse{Success: true})
}

func (h *ChatHandler) removeUserFromChat(c *gin.Context) {
	var req ChatMemberEditRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error())
		return
	}

	userID, err := uuid.Parse(c.GetString("userID"))
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	chatID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error())
		return
	}

	err = h.service.RemoveUserFromChat(c, chatID, req.UserID, userID)
	if err != nil {
		var notMember *ErrNotMember
		if errors.As(err, &notMember) {
			utils.SendError(c, http.StatusForbidden, err.Error())
			return
		}
		var insufficientPermissions *ErrInsufficientPermissions
		if errors.As(err, &insufficientPermissions) {
			utils.SendError(c, http.StatusForbidden, err.Error())
			return
		}
		utils.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, utils.APIResponse{Success: true})
}

func (h *ChatHandler) leaveChat(c *gin.Context) {
	chatID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error())
		return
	}

	userID, err := uuid.Parse(c.GetString("userID"))
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	err = h.service.RemoveUserFromChat(c, chatID, userID, userID)
	if err != nil {
		var notMember *ErrNotMember
		if errors.As(err, &notMember) {
			utils.SendError(c, http.StatusConflict, err.Error())
			return
		}
		utils.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, utils.APIResponse{Success: true})
}

func (h *ChatHandler) updateChat(c *gin.Context) {
	chatID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error())
		return
	}

	userID, err := uuid.Parse(c.GetString("userID"))
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	var req UpdateChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error())
		return
	}

	chat, err := h.service.UpdateChat(c, userID, chatID, req)
	if err != nil {
		var notMember *ErrNotMember
		if errors.As(err, &notMember) {
			utils.SendError(c, http.StatusForbidden, err.Error())
			return
		}
		var insufficientPermissions *ErrInsufficientPermissions
		if errors.As(err, &insufficientPermissions) {
			utils.SendError(c, http.StatusForbidden, err.Error())
			return
		}
		utils.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, utils.APIResponse{
		Success: true,
		Data:    chat,
	})
}

func (h *ChatHandler) setRole(c *gin.Context) {
	chatID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error())
		return
	}

	updaterID, err := uuid.Parse(c.GetString("userID"))
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	var req SetRoleRequest

	if err = c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error())
		return
	}

	err = h.service.SetRole(c, req.MemberID, chatID, updaterID, ChatMemberRole(req.NewRole))
	if err != nil {
		var notMember *ErrNotMember
		if errors.As(err, &notMember) {
			utils.SendError(c, http.StatusForbidden, err.Error())
			return
		}
		var insufficientPermissions *ErrInsufficientPermissions
		if errors.As(err, &insufficientPermissions) {
			utils.SendError(c, http.StatusForbidden, err.Error())
			return
		}
		utils.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, utils.APIResponse{
		Success: true,
	})
}

func (h *ChatHandler) findMessages(c *gin.Context) {
	chatID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error())
		return
	}

	userID, err := uuid.Parse(c.GetString("userID"))
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	var req FindMessagesRequest
	if err = c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error())
		return
	}

	messages, err := h.service.FindMessages(c, chatID, userID, req.Before, req.Limit)
	if err != nil {
		var notMember *ErrNotMember
		if errors.As(err, &notMember) {
			utils.SendError(c, http.StatusForbidden, err.Error())
			return
		}

		utils.SendError(c, http.StatusInternalServerError, err.Error())
	}

	result := make([]message.MessageResponse, len(*messages))
	for i, m := range *messages {
		result[i] = *m.IntoResponse()
	}

	c.JSON(http.StatusOK, utils.APIResponse{
		Success: true,
		Data:    result,
	})
}
