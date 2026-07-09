package config

import (
	"os"
	"strconv"
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

	JWTAccessSecret      string
	JWTRefreshSecret     string
	JWTAccessExpiration  int
	JWTRefreshExpiration int
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

			JWTAccessSecret:      getEnv("JWT_ACCESS_SECRET", ""),
			JWTRefreshSecret:     getEnv("JWT_REFRESH_SECRET", ""),
			JWTAccessExpiration:  getEnvAsInt("JWT_ACCESS_EXPIRATION", 15*60),
			JWTRefreshExpiration: getEnvAsInt("JWT_REFRESH_EXPIRATION", 60*60*24*30),
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

func getEnvAsInt(key string, defaultValue int) int {
	valueStr := getEnv(key, "")
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultValue
}
