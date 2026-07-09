package refreshtoken

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RefreshTokenModel struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	UserModelID uuid.UUID

	Token     string `gorm:"unique"`
	ExpiresAt time.Time
	Revoked   bool

	CreatedAt time.Time
}

type RefreshTokenRepository struct {
	db *gorm.DB
}

func NewRefreshTokenRepository(db *gorm.DB) *RefreshTokenRepository {
	return &RefreshTokenRepository{db: db}
}

func (r *RefreshTokenRepository) Create(ctx context.Context, refreshToken *RefreshTokenDTO) error {
	model := RefreshTokenModel{
		UserModelID: refreshToken.UserID,
		Token:       refreshToken.Token,
		ExpiresAt:   refreshToken.ExpiresAt,
		Revoked:     refreshToken.Revoked,
	}

	err := gorm.G[RefreshTokenModel](r.db).Create(ctx, &model)
	if err != nil {
		return err
	}

	refreshToken.ID = model.ID
	refreshToken.CreatedAt = model.CreatedAt
	return nil
}
