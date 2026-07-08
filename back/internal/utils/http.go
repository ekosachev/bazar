package utils

import "github.com/gin-gonic/gin"

type APIResponse struct {
	Success bool   `json:"success"`
	Data    any    `json:"result,omitempty"`
	Error   string `json:"error,omitempty"`
}

func SendError(c *gin.Context, status int, message string) {
	c.JSON(status, APIResponse{
		Success: false,
		Error:   message,
	})
}
