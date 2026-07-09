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

	refreshTokenGroup := group.Group("/").Use(RequiresRefreshToken(r.service.refreshTokenRepo))
	{
		refreshTokenGroup.GET("/refresh", r.refresh)
	}

	accessTokenGroup := group.Group("/").Use(RequiresAccessToken())
	{
		accessTokenGroup.GET("/logout", r.logout)
		accessTokenGroup.GET("/me", r.getMyID)
	}
}

func (r *AuthRouter) register(c *gin.Context) {
	var req RegistractionRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error())
		return
	}

	userDTO := user.UserDTO{
		Username:     req.Username,
		DisplayName:  req.DisplayName,
		Email:        req.Email,
		PasswordHash: req.Password,
	}

	if err := r.service.Register(c, &userDTO); err != nil {
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
		Data: user.UserResponse{
			ID:          userDTO.ID.String(),
			Username:    userDTO.Username,
			DisplayName: userDTO.DisplayName,
			Email:       userDTO.Email,
			AvatarUrl:   userDTO.AvatarUrl,
			CreatedAt:   userDTO.CreatedAt.Format(time.RFC3339),
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

func (r *AuthRouter) refresh(c *gin.Context) {
	userID := c.GetString("userID")
	tokenID := c.GetString("tokenID")

	loginResponse, err := r.service.Refresh(c, userID, tokenID)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, utils.APIResponse{
		Success: true,
		Data:    loginResponse,
	})
}

func (r *AuthRouter) logout(c *gin.Context) {
	userID := c.GetString("userID")
	err := r.service.Logout(c, userID)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, utils.APIResponse{Success: true})
}

func (r *AuthRouter) getMyID(c *gin.Context) {
	c.JSON(http.StatusOK, utils.APIResponse{Success: true, Data: map[string]string{"user_id": c.GetString("userID")}})
}
