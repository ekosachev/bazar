package auth

import (
	"fmt"

	"github.com/google/uuid"
)

type ErrUsernameTaken struct {
	Username string
}

func (e *ErrUsernameTaken) Error() string {
	return fmt.Sprintf("Username %s is already taken", e.Username)
}

type ErrAuthFailed struct{}

func (e *ErrAuthFailed) Error() string {
	return "Authentication failed"
}

type RegistractionRequest struct {
	Username    string `json:"username"`
	DisplayName string `json:"display_name"`
	Email       string `json:"email"`
	Password    string `json:"password"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Access  string `json:"access"`
	Refresh string `json:"refresh"`
}

type UserResponse struct {
	ID          uuid.UUID `json:"id"`
	Username    string    `json:"username"`
	DisplayName string    `json:"display_name"`
	Email       string    `json:"email"`
	AvatarUrl   *string   `json:"avatar_url,omitempty"`
	CreatedAt   string    `json:"created_at"`
}
