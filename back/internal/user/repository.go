package user

import (
	"context"
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

func (r *UserRepository) Create(ctx context.Context, user *UserModel) error {
	return gorm.G[UserModel](r.db).Create(ctx, user)
}
