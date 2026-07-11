package user

import (
	"context"
	"time"

	"github.com/ekosachev/bazar/internal/chat"
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

func (u *UserDTO) IntoResponse() *UserResponse {
	return &UserResponse{
		ID:          u.ID.String(),
		Username:    u.Username,
		DisplayName: u.DisplayName,
		Email:       u.Email,
		AvatarUrl:   u.AvatarUrl,
		CreatedAt:   u.CreatedAt.Format(time.RFC3339),
	}
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

func (s *UserService) SearchByUsername(ctx context.Context, username string) ([]UserResponse, error) {
	var result []UserResponse
	users, err := s.repo.SearchByUsername(ctx, username)
	if err != nil {
		return result, err
	}

	result = make([]UserResponse, len(users))
	for i, u := range users {
		result[i] = *u.IntoResponse()
	}

	return result, nil
}

func (s *UserService) GetUserChats(ctx context.Context, userIDString string) ([]chat.ChatMemberDTO, error) {
	userID, err := uuid.Parse(userIDString)
	if err != nil {
		return nil, err
	}

	return s.repo.GetUserChats(ctx, userID)
}
