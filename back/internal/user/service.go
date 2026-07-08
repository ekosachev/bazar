package user

import (
	"time"

	"github.com/google/uuid"
)

type UserDTO struct {
	ID           uuid.UUID
	Username     string
	DisplayName  string
	Email        string
	PasswordHash string
	AvatarUrl    *string
	CreatedAt    time.Time
}

type UserService struct {
	repo *UserRepository
}

func NewUserService(repo *UserRepository) *UserService {
	return &UserService{repo: repo}
}
