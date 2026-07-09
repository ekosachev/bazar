package refreshtoken

import (
	"time"

	"github.com/google/uuid"
)

type RefreshTokenDTO struct {
	ID     uuid.UUID
	UserID uuid.UUID

	Token     string
	ExpiresAt time.Time
	Revoked   bool

	CreatedAt time.Time
}
