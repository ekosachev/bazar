package user

import (
	"context"
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

func (s *UserService) GetByID(ctx context.Context, userIDString string) (*UserDTO, error) {
	userID, err := uuid.Parse(userIDString)
	if err != nil {
		return nil, err
	}

	return s.repo.GetByID(ctx, userID)
}
