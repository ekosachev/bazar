package refreshtoken

import (
	"context"
	"errors"
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

func (r *RefreshTokenRepository) GetValidToken(ctx context.Context, userID uuid.UUID) (*RefreshTokenDTO, error) {
	token, err := gorm.G[RefreshTokenModel](r.db).Where(RefreshTokenModel{
		Revoked:     false,
		UserModelID: userID,
	}).Where("expires_at > ?", time.Now()).Order("created_at desc").First(ctx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}

	return &RefreshTokenDTO{
		ID:        token.ID,
		UserID:    token.UserModelID,
		Token:     token.Token,
		ExpiresAt: token.ExpiresAt,
		Revoked:   token.Revoked,
		CreatedAt: token.CreatedAt,
	}, nil
}

func (r *RefreshTokenRepository) RevokeToken(ctx context.Context, tokenID uuid.UUID) error {
	_, err := gorm.G[RefreshTokenModel](r.db).Where(RefreshTokenModel{ID: tokenID}).Update(ctx, "revoked", true)
	return err
}
