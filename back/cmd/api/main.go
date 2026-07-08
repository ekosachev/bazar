package main

import (
	"net/http"

	"github.com/ekosachev/bazar/internal/config"
	"github.com/ekosachev/bazar/internal/database"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	r.GET("/ping", func(ctx *gin.Context) { ctx.JSON(http.StatusOK, gin.H{"message": "pong"}) })

	appConfig := config.GetConfig()

	_, err := database.ConnectToDb(database.DatabaseConfig{
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

	r.Run()
}
