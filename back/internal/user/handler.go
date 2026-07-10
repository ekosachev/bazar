package user

import (
	"net/http"
	"time"

	"github.com/ekosachev/bazar/internal/chat"
	"github.com/ekosachev/bazar/internal/middleware"
	"github.com/ekosachev/bazar/internal/utils"
	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	service *UserService
}

type UserResponse struct {
	ID          string  `json:"id"`
	Username    string  `json:"username"`
	DisplayName string  `json:"display_name"`
	Email       string  `json:"email"`
	AvatarUrl   *string `json:"avatar_url"`
	CreatedAt   string  `json:"created_at"`
}

func NewUserHandler(service *UserService) *UserHandler {
	return &UserHandler{service: service}
}

func (r *UserHandler) RegisterRoutes(router *gin.RouterGroup) {
	group := router.Group("/user")

	accessTokenGroup := group.Group("/").Use(middleware.RequiresAccessToken())
	{
		accessTokenGroup.GET("/:id", r.getByID)
		accessTokenGroup.GET("/my_chats", r.getUserChats)
	}
}

func (r *UserHandler) getByID(c *gin.Context) {
	id := c.Param("id")

	userDTO, err := r.service.GetByID(c, id)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, err.Error())
	}

	if userDTO == nil {
		utils.SendError(c, http.StatusNotFound, "User not found")
	}

	c.JSON(http.StatusOK, utils.APIResponse{
		Success: true,
		Data: UserResponse{
			ID:          userDTO.ID.String(),
			Username:    userDTO.Username,
			DisplayName: userDTO.DisplayName,
			Email:       userDTO.Email,
			AvatarUrl:   userDTO.AvatarUrl,
			CreatedAt:   userDTO.CreatedAt.Format(time.RFC3339),
		},
	})
}

func (h *UserHandler) getUserChats(c *gin.Context) {
	userID := c.GetString("userID")

	chatMembers, err := h.service.GetUserChats(c, userID)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	result := make([]chat.ChatMemberResponse, len(chatMembers))
	for i, cm := range chatMembers {
		result[i] = chat.ChatMemberResponse{
			ChatModelID:       cm.ChatModelID,
			UserModelID:       cm.UserModelID,
			Role:              cm.Role,
			LastReadMessageID: cm.LastReadMessageID,
			InvitedBy:         cm.InvitedBy,
			CreatedAt:         cm.CreatedAt.Format(time.RFC3339),
		}
	}

	c.JSON(http.StatusOK, utils.APIResponse{
		Success: true,
		Data:    result,
	})
}
