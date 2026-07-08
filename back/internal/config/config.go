package config

import (
	"os"
	"sync"

	"github.com/joho/godotenv"
)

type Config struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBTimezone string
}

var (
	instance *Config
	once     sync.Once
)

func loadConfig() *Config {
	once.Do(func() {
		if err := godotenv.Load(); err != nil {
		}
		instance = &Config{
			DBHost:     getEnv("DB_HOST", ""),
			DBPort:     getEnv("DB_PORT", ""),
			DBUser:     getEnv("DB_USER", ""),
			DBPassword: getEnv("DB_PASSWORD", ""),
			DBName:     getEnv("DB_NAME", ""),
			DBTimezone: getEnv("DB_TIMEZONE", "UTC"),
		}
	})
	return instance
}

func GetConfig() *Config {
	if instance == nil {
		return loadConfig()
	}
	return instance
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
