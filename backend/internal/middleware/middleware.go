package middleware

import (
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"bizcatalog/backend/internal/models"
	"bizcatalog/backend/internal/repository"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var JWTSecretKey = []byte("bizcatalog-super-secret-key-2026-saas")

type JWTClaims struct {
	UserID string          `json:"user_id"`
	Email  string          `json:"email"`
	Plan   models.UserPlan `json:"plan"`
	jwt.RegisteredClaims
}

func GenerateToken(user *models.User) (string, error) {
	claims := JWTClaims{
		UserID: user.ID,
		Email:  user.Email,
		Plan:   user.Plan,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "bizcatalog",
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(JWTSecretKey)
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header format"})
			return
		}

		tokenString := parts[1]
		claims := &JWTClaims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return JWTSecretKey, nil
		})

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			return
		}

		c.Set("userID", claims.UserID)
		c.Set("userEmail", claims.Email)
		c.Set("userPlan", claims.Plan)
		c.Next()
	}
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func LoggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		latency := time.Since(start)
		status := c.Writer.Status()
		fmt.Printf("[%s] %s %s | %d | %v\n", time.Now().Format("15:04:05"), c.Request.Method, c.Request.URL.Path, status, latency)
	}
}

// SubscriptionLimitMiddleware checks quotas before creating products or applying themes
func SubscriptionLimitMiddleware(repo repository.Repository) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDVal, exists := c.Get("userID")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}
		userID := userIDVal.(string)

		user, err := repo.GetUserByID(userID)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			return
		}

		ws, err := repo.GetWebsiteByUserID(userID)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Website not found"})
			return
		}

		// Product limit check on POST /api/products
		if c.Request.Method == http.MethodPost && strings.HasSuffix(c.Request.URL.Path, "/products") {
			count, err := repo.CountProductsByWebsiteID(ws.ID)
			if err != nil {
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Failed to count products"})
				return
			}

			maxProducts := 5
			switch user.Plan {
			case models.PlanPro:
				maxProducts = 25
			case models.PlanUltimate:
				maxProducts = 100
			}

			if count >= maxProducts {
				c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
					"error": fmt.Sprintf("Batas kuota produk tercapai untuk paket %s (Maksimal %d produk). Silakan upgrade paket Anda.", strings.ToUpper(string(user.Plan)), maxProducts),
					"code":  "PLAN_LIMIT_REACHED",
					"limit": maxProducts,
					"plan":  user.Plan,
				})
				return
			}
		}

		c.Next()
	}
}

// CheckThemeAccess validates if current user's plan is allowed to use requested theme
func CheckThemeAccess(plan models.UserPlan, themeID string) error {
	if plan == models.PlanFree && themeID != "minimalist" {
		return errors.New("tema ini hanya tersedia untuk paket Pro & Ultimate. Paket Free hanya mendukung tema Minimalist.")
	}
	return nil
}
