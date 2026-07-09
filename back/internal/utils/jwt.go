package utils

import (
	"time"

	"github.com/ekosachev/bazar/internal/config"
	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
)

func GenerateAccessToken(userID uuid.UUID) (string, error) {
	cfg := config.GetConfig()
	claims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(time.Duration(cfg.JWTAccessExpiration) * time.Second).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(cfg.JWTAccessSecret))
}

func GenerateRefreshToken(userID uuid.UUID) (time.Time, string, error) {
	cfg := config.GetConfig()
	exp := time.Now().Add(time.Duration(cfg.JWTRefreshExpiration) * time.Second)

	claims := jwt.MapClaims{
		"sub": userID,
		"exp": exp.Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(cfg.JWTRefreshSecret))
	return exp, tokenString, err
}

func VerifyAccessToken(tokenString string) (bool, *uuid.UUID) {
	cfg := config.GetConfig()
	secretKey := cfg.JWTAccessSecret

	token, _ := jwt.Parse(tokenString, func(t *jwt.Token) (any, error) { return []byte(secretKey), nil })
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		if userId, err := uuid.Parse(claims["sub"].(string)); err == nil {
			return true, &userId
		}
	}

	return false, nil
}

func VerifyRefreshToken(tokenString string) (bool, *uuid.UUID) {
	cfg := config.GetConfig()
	secretKey := cfg.JWTRefreshSecret

	token, _ := jwt.Parse(tokenString, func(t *jwt.Token) (any, error) { return []byte(secretKey), nil })

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		if userId, err := uuid.Parse(claims["sub"].(string)); err == nil {
			return true, &userId
		}
	}

	return false, nil
}
