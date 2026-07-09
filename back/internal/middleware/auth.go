package middleware

import (
	"net/http"

	refreshtoken "github.com/ekosachev/bazar/internal/refresh_token"
	"github.com/ekosachev/bazar/internal/utils"
	"github.com/gin-gonic/gin"
)

func RequiresAccessToken() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		authHeader := ctx.GetHeader("Authorization")
		if authHeader == "" {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, utils.APIResponse{Success: false, Error: "Authorization header required"})
			return
		}

		tokenString := authHeader[7:] // remove "Bearer: " prefix

		if ok, userID := utils.VerifyAccessToken(tokenString); ok && userID != nil {
			ctx.Set("userID", userID.String())
			ctx.Next()
		} else {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, utils.APIResponse{Success: false, Error: "Invalid token"})
		}
	}
}

func RequiresRefreshToken(refreshTokenRepo *refreshtoken.RefreshTokenRepository) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		tokenString, err := ctx.Cookie("refreshToken")
		if err != nil {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, utils.APIResponse{Success: false, Error: "refreshToken cookie required"})
			return
		}

		if ok, userID := utils.VerifyRefreshToken(tokenString); ok && userID != nil {
			validToken, err := refreshTokenRepo.GetValidToken(ctx, *userID)
			if err != nil || validToken == nil {
				ctx.AbortWithStatusJSON(http.StatusUnauthorized, utils.APIResponse{Success: false, Error: "Unauthorized"})
				return
			}

			if validToken.Token != tokenString {
				ctx.AbortWithStatusJSON(http.StatusUnauthorized, utils.APIResponse{Success: false, Error: "Unauthorized"})
				return
			}

			ctx.Set("userID", userID.String())
			ctx.Set("tokenID", validToken.ID.String())
			ctx.Next()
		} else {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, utils.APIResponse{Success: false, Error: "Invalid token"})
		}
	}
}
