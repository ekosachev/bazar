package database

import (
	"fmt"

	"github.com/ekosachev/bazar/internal/chat"
	"github.com/ekosachev/bazar/internal/message"
	refreshtoken "github.com/ekosachev/bazar/internal/refresh_token"
	"github.com/ekosachev/bazar/internal/user"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type DatabaseConfig struct {
	Host     string
	User     string
	Password string
	DBName   string
	Port     string
	TimeZone string
}

func ConnectToDb(config DatabaseConfig) (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=%s",
		config.Host,
		config.User,
		config.Password,
		config.DBName,
		config.Port,
		config.TimeZone,
	)

	db, err := gorm.Open(postgres.Open(dsn))
	if err != nil {
		return nil, err
	}

	err = db.SetupJoinTable(&user.UserModel{}, "ChatModels", &chat.ChatMemberModel{})
	if err != nil {
		return nil, err
	}

	db.AutoMigrate(
		&user.UserModel{},
		&refreshtoken.RefreshTokenModel{},
		&chat.ChatModel{},
		&message.MessageModel{},
	)

	return db, nil
}
