package auth

import (
	"context"

	refreshtoken "github.com/ekosachev/bazar/internal/refresh_token"
	"github.com/ekosachev/bazar/internal/user"
	"github.com/ekosachev/bazar/internal/utils"
	"github.com/google/uuid"
)

type AuthService struct {
	userRepo         *user.UserRepository
	refreshTokenRepo *refreshtoken.RefreshTokenRepository
}

func NewAuthService(userRepo *user.UserRepository, refreshTokenRepo *refreshtoken.RefreshTokenRepository) *AuthService {
	return &AuthService{userRepo: userRepo, refreshTokenRepo: refreshTokenRepo}
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

func (s *AuthService) Login(ctx context.Context, request LoginRequest) (*LoginResponse, error) {
	user, err := s.userRepo.GetByUsername(ctx, request.Username)
	if err != nil {
		return nil, err
	}

	if user == nil {
		return nil, &ErrAuthFailed{}
	}

	if err := utils.CheckPassword(user.PasswordHash, request.Password); err != nil {
		return nil, &ErrAuthFailed{}
	}

	accessToken, err := GenerateAccessToken(user.ID)
	if err != nil {
		return nil, err
	}

	expTime, refreshToken, err := GenerateRefreshToken(user.ID)
	if err != nil {
		return nil, err
	}

	refreshTokenDto := refreshtoken.RefreshTokenDTO{
		UserID:    user.ID,
		Token:     refreshToken,
		ExpiresAt: expTime,
		Revoked:   false,
	}
	if err = s.refreshTokenRepo.Create(ctx, &refreshTokenDto); err != nil {
		return nil, err
	}

	return &LoginResponse{
		Access:  accessToken,
		Refresh: refreshToken,
	}, nil
}

func (s *AuthService) Refresh(ctx context.Context, userIDString string, tokenIDString string) (*LoginResponse, error) {
	userID, err := uuid.Parse(userIDString)
	if err != nil {
		return nil, err
	}

	tokenID, err := uuid.Parse(tokenIDString)
	if err != nil {
		return nil, err
	}

	accessToken, err := GenerateAccessToken(userID)
	if err != nil {
		return nil, err
	}

	expTime, refreshToken, err := GenerateRefreshToken(userID)
	if err != nil {
		return nil, err
	}

	refreshTokenDto := refreshtoken.RefreshTokenDTO{
		UserID:    userID,
		Token:     refreshToken,
		ExpiresAt: expTime,
		Revoked:   false,
	}
	if err = s.refreshTokenRepo.Create(ctx, &refreshTokenDto); err != nil {
		return nil, err
	}

	err = s.refreshTokenRepo.RevokeToken(ctx, tokenID)
	if err != nil {
		return nil, err
	}

	return &LoginResponse{
		Access:  accessToken,
		Refresh: refreshToken,
	}, nil
}
