package main

import (
	"log"
	"net/http"

	"github.com/ekosachev/bazar/internal/auth"
	"github.com/ekosachev/bazar/internal/chat"
	"github.com/ekosachev/bazar/internal/config"
	"github.com/ekosachev/bazar/internal/database"
	"github.com/ekosachev/bazar/internal/message"
	refreshtoken "github.com/ekosachev/bazar/internal/refresh_token"
	"github.com/ekosachev/bazar/internal/user"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	r.GET("/ping", func(ctx *gin.Context) { ctx.JSON(http.StatusOK, gin.H{"message": "pong"}) })

	appConfig := config.GetConfig()

	db, err := database.ConnectToDb(database.DatabaseConfig{
		Host:     appConfig.DBHost,
		User:     appConfig.DBUser,
		Password: appConfig.DBPassword,
		DBName:   appConfig.DBName,
		Port:     appConfig.DBPort,
		TimeZone: appConfig.DBTimezone,
	})
	if err != nil {
		log.Fatalf("Error when initializing database: %s", err.Error())
		return
	}

	userRepo := user.NewUserRepository(db)
	refreshTokenRepo := refreshtoken.NewRefreshTokenRepository(db)
	chatRepo := chat.NewChatRepository(db)
	messageRepo := message.NewMessageRepository(db)

	authService := auth.NewAuthService(userRepo, refreshTokenRepo)
	userService := user.NewUserService(userRepo)
	messageService := message.NewMessageService(messageRepo)
	chatService := chat.NewChatService(chatRepo, messageService)

	authRouter := auth.NewAuthRouter(authService)
	userHandler := user.NewUserHandler(userService)
	chatHandler := chat.NewChatHandler(chatService)

	group := r.Group("/api/v1")
	{
		authRouter.RegisterRoutes(group)
		userHandler.RegisterRoutes(group)
		chatHandler.RegisterRoutes(group)
	}

	r.Run()
}
