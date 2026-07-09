package auth

import (
	"errors"
	"net/http"
	"time"

	"github.com/ekosachev/bazar/internal/user"
	"github.com/ekosachev/bazar/internal/utils"
	"github.com/gin-gonic/gin"
)

type AuthRouter struct {
	service *AuthService
}

func NewAuthRouter(service *AuthService) *AuthRouter {
	return &AuthRouter{service: service}
}

func (r *AuthRouter) RegisterRoutes(router *gin.RouterGroup) {
	group := router.Group("/auth")

	group.POST("/register", r.register)
	group.POST("/login", r.login)
}

func (r *AuthRouter) register(c *gin.Context) {
	var req RegistractionRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error())
		return
	}

	user := user.UserDTO{
		Username:     req.Username,
		DisplayName:  req.DisplayName,
		Email:        req.Email,
		PasswordHash: req.Password,
	}

	if err := r.service.Register(c, &user); err != nil {
		var usernameTakenErr *ErrUsernameTaken
		if errors.As(err, &usernameTakenErr) {
			utils.SendError(c, http.StatusConflict, usernameTakenErr.Error())
			return
		}

		utils.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusCreated, utils.APIResponse{
		Success: true,
		Data: UserResponse{
			ID:          user.ID,
			Username:    user.Username,
			DisplayName: user.DisplayName,
			Email:       user.Email,
			AvatarUrl:   user.AvatarUrl,
			CreatedAt:   user.CreatedAt.Format(time.RFC3339),
		},
	})
}

func (r *AuthRouter) login(c *gin.Context) {
	var req LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error())
		return
	}

	response, err := r.service.Login(c, req)
	if err != nil {
		var authFailedErr *ErrAuthFailed
		if errors.As(err, &authFailedErr) {
			utils.SendError(c, http.StatusUnauthorized, err.Error())
			return
		}
		utils.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, utils.APIResponse{
		Success: true,
		Data:    response,
	})
}
