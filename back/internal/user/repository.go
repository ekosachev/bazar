package user

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserModel struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Username     string
	DisplayName  string
	Email        string `gorm:"email"`
	PasswordHash string
	AvatarUrl    *string
	CreatedAt    time.Time
}

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, user *UserDTO) error {
	model := &UserModel{
		ID:           user.ID,
		Username:     user.Username,
		DisplayName:  user.DisplayName,
		Email:        user.Email,
		PasswordHash: user.PasswordHash,
		AvatarUrl:    user.AvatarUrl,
		CreatedAt:    user.CreatedAt,
	}
	err := gorm.G[UserModel](r.db).Create(ctx, model)
	if err != nil {
		return err
	}

	user.ID = model.ID
	user.CreatedAt = model.CreatedAt

	return nil
}

func (r *UserRepository) GetByUsername(ctx context.Context, username string) (*UserDTO, error) {
	user, err := gorm.G[UserModel](r.db).Where(UserModel{Username: username}).First(ctx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}

	return &UserDTO{
		ID:           user.ID,
		Username:     user.Username,
		DisplayName:  user.DisplayName,
		Email:        user.Email,
		PasswordHash: user.PasswordHash,
		AvatarUrl:    user.AvatarUrl,
		CreatedAt:    user.CreatedAt,
	}, nil
}
