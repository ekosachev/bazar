package main

import (
	"net/http"

	"github.com/ekosachev/bazar/internal/auth"
	"github.com/ekosachev/bazar/internal/config"
	"github.com/ekosachev/bazar/internal/database"
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
		return
	}

	userRepo := user.NewUserRepository(db)
	refreshTokenRepo := refreshtoken.NewRefreshTokenRepository(db)

	authService := auth.NewAuthService(userRepo, refreshTokenRepo)
	userService := user.NewUserService(userRepo)

	authRouter := auth.NewAuthRouter(authService)
	userHandler := user.NewUserHandler(userService)

	group := r.Group("/api/v1")
	{
		authRouter.RegisterRoutes(group)
		userHandler.RegisterRoutes(group)
	}

	r.Run()
}
