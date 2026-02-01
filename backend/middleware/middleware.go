package middleware

import (
	"net/http"
	"strings"
	"sync"
	"time"

	"super_real_estate/models"
	"super_real_estate/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// CORSMiddleware handles Cross-Origin Resource Sharing
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With, X-Tenant")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

// AuthMiddleware validates JWT tokens
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := ""
		authHeader := c.GetHeader("Authorization")

		if authHeader != "" {
			tokenParts := strings.Split(authHeader, " ")
			if len(tokenParts) == 2 && tokenParts[0] == "Bearer" {
				tokenString = tokenParts[1]
			}
		}

		// Fallback to query param (for WebSocket)
		if tokenString == "" {
			tokenString = c.Query("token")
		}

		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization token required"})
			c.Abort()
			return
		}

		claims, err := utils.ValidateToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Set user info in context
		c.Set("user_id", claims.UserID)
		c.Set("email", claims.Email)
		c.Set("role", claims.Role)
		if claims.AgentID != nil {
			c.Set("agent_id", *claims.AgentID)
		}

		c.Next()
	}
}

// RoleMiddleware checks if user has required role
func RoleMiddleware(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Role not found"})
			c.Abort()
			return
		}

		userRole := role.(string)
		for _, allowed := range allowedRoles {
			if userRole == allowed {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
		c.Abort()
	}
}

// TenantMiddleware handles multi-tenant isolation
func TenantMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get tenant from header (set by Nginx based on subdomain)
		tenant := c.GetHeader("X-Tenant")

		// Also check subdomain from host
		if tenant == "" {
			host := c.Request.Host
			parts := strings.Split(host, ".")
			if len(parts) > 2 {
				tenant = parts[0]
			}
		}

		if tenant != "" && tenant != "www" && tenant != "api" {
			// Look up agent by subdomain
			var agent models.Agent
			if err := db.Where("subdomain = ? AND is_active = ? AND is_suspended = ?", tenant, true, false).First(&agent).Error; err == nil {
				c.Set("tenant_id", agent.ID)
				c.Set("tenant", &agent)
			}
		}

		c.Next()
	}
}

// Simple in-memory rate limiter
var (
	rateLimiters = make(map[string]*rateLimiter)
	rateMutex    sync.RWMutex
)

type rateLimiter struct {
	tokens    int
	lastCheck time.Time
	maxTokens int
	rate      int // tokens per second
}

func (r *rateLimiter) allow() bool {
	now := time.Now()
	elapsed := now.Sub(r.lastCheck)
	r.lastCheck = now

	// Add tokens based on elapsed time
	r.tokens += int(elapsed.Seconds()) * r.rate
	if r.tokens > r.maxTokens {
		r.tokens = r.maxTokens
	}

	if r.tokens > 0 {
		r.tokens--
		return true
	}
	return false
}

// RateLimitMiddleware implements simple rate limiting
func RateLimitMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()

		rateMutex.Lock()
		limiter, exists := rateLimiters[ip]
		if !exists {
			limiter = &rateLimiter{
				tokens:    100,
				lastCheck: time.Now(),
				maxTokens: 100,
				rate:      10,
			}
			rateLimiters[ip] = limiter
		}
		allowed := limiter.allow()
		rateMutex.Unlock()

		if !allowed {
			c.JSON(http.StatusTooManyRequests, gin.H{"error": "Rate limit exceeded"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// GetUserID retrieves user ID from context
func GetUserID(c *gin.Context) (uuid.UUID, bool) {
	id, exists := c.Get("user_id")
	if !exists {
		return uuid.Nil, false
	}
	return id.(uuid.UUID), true
}

// GetAgentID retrieves agent ID from context
func GetAgentID(c *gin.Context) (uuid.UUID, bool) {
	id, exists := c.Get("agent_id")
	if !exists {
		// Check tenant context
		id, exists = c.Get("tenant_id")
		if !exists {
			return uuid.Nil, false
		}
	}
	return id.(uuid.UUID), true
}
