package auth

import (
	"context"

	"github.com/ekosachev/bazar/internal/user"
	"github.com/ekosachev/bazar/internal/utils"
)

type AuthService struct {
	userRepo *user.UserRepository
}

func NewAuthService(userRepo *user.UserRepository) *AuthService {
	return &AuthService{userRepo: userRepo}
}

func (s *AuthService) Register(ctx context.Context, user *user.UserDTO) error {
	hash, err := utils.HashPassword(user.PasswordHash)
	if err != nil {
		return err
	}

	user.PasswordHash = hash

	existingUser, err := s.userRepo.GetByUsername(ctx, user.Username)
	if err != nil {
		return err
	}

	if existingUser != nil {
		return &ErrUsernameTaken{Username: user.Username}
	}

	return s.userRepo.Create(ctx, user)
}
