package user

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/ekosachev/bazar/internal/chat"
	refreshtoken "github.com/ekosachev/bazar/internal/refresh_token"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserModel struct {
	ID       uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Username string    `gorm:"unique"`

	DisplayName  string
	Email        string `gorm:"email"`
	AvatarUrl    *string
	PasswordHash string

	RefreshTokens []refreshtoken.RefreshTokenModel
	CreatedChats  []chat.ChatModel `gorm:"foreignKey:CreatedBy"`
	ChatModels    []chat.ChatModel `gorm:"many2many:chat_member_models;"`

	CreatedAt time.Time
}

func (u *UserModel) IntoDTO() *UserDTO {
	return &UserDTO{
		ID:           u.ID,
		Username:     u.Username,
		DisplayName:  u.DisplayName,
		Email:        u.Email,
		PasswordHash: u.PasswordHash,
		AvatarUrl:    u.AvatarUrl,
		CreatedAt:    u.CreatedAt,
	}
}

func (u *UserDTO) IntoModel() *UserModel {
	return &UserModel{
		ID:           u.ID,
		Username:     u.Username,
		DisplayName:  u.DisplayName,
		Email:        u.Email,
		AvatarUrl:    u.AvatarUrl,
		PasswordHash: u.PasswordHash,
	}
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

func (r *UserRepository) SearchByUsername(ctx context.Context, username string) ([]UserDTO, error) {
	var result []UserDTO

	users, err := gorm.G[UserModel](r.db).Where("username ILIKE ?", fmt.Sprintf("%%%s%%", username)).Find(ctx)
	if err != nil {
		return result, err
	}

	result = make([]UserDTO, len(users))
	for i, u := range users {
		result[i] = *u.IntoDTO()
	}

	return result, nil
}

func (r *UserRepository) GetByID(ctx context.Context, userID uuid.UUID) (*UserDTO, error) {
	user, err := gorm.G[UserModel](r.db).Where(UserModel{ID: userID}).First(ctx)
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

func (r *UserRepository) GetUserChats(ctx context.Context, userID uuid.UUID) ([]chat.ChatMemberDTO, error) {
	var chatMembers []chat.ChatMemberModel

	err := r.db.Where("user_model_id = ?", userID).Find(&chatMembers).Error
	if err != nil {
		return []chat.ChatMemberDTO{}, err
	}

	result := make([]chat.ChatMemberDTO, len(chatMembers))
	for i, cm := range chatMembers {
		result[i] = chat.ChatMemberDTO{
			ChatModelID:       cm.ChatModelID,
			UserModelID:       cm.UserModelID,
			Role:              cm.Role,
			LastReadMessageID: cm.LastReadMessageID,
			InvitedBy:         cm.InvitedBy,
			CreatedAt:         cm.CreatedAt,
		}
	}

	return result, nil
}

func (r *UserRepository) UpdateUser(ctx context.Context, user *UserDTO) error {
	_, err := gorm.G[UserModel](r.db).Where("id = ?", user.ID).Updates(ctx, *user.IntoModel())
	return err
}
