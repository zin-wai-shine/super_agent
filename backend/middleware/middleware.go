package middleware

import (
	"net/http"
	"strings"
	"sync"
	"time"

	"super_real_estate/config"
	"super_real_estate/models"
	"super_real_estate/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// CORSMiddleware handles Cross-Origin Resource Sharing
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if origin != "" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		}
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
func TenantMiddleware(db *gorm.DB, cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		host := c.Request.Host
		if forwardedHost := c.GetHeader("X-Forwarded-Host"); forwardedHost != "" {
			host = forwardedHost
		}
		// Remove port if present (e.g. localhost:8080)
		hostPort := strings.Split(host, ":")
		domain := hostPort[0]

		isMainDomain := domain == cfg.MainDomain || domain == "localhost" || domain == "127.0.0.1"

		var tenantID uuid.UUID
		var tenant *models.Agent
		foundTenant := false

		// Explicitly set is_main_domain based on calculation
		c.Set("is_main_domain", isMainDomain)

		if !isMainDomain {
			// 1. Try to resolve as a subdomain of main domain (e.g. domono.superealestate.localhost)
			mainDomainWithDot := "." + cfg.MainDomain
			if strings.HasSuffix(domain, mainDomainWithDot) {
				subdomain := strings.TrimSuffix(domain, mainDomainWithDot)
				if subdomain != "" && subdomain != "www" && subdomain != "api" {
					var agent models.Agent
					if err := db.Where("subdomain = ? AND is_active = ? AND is_suspended = ?", subdomain, true, false).First(&agent).Error; err == nil {
						tenantID = agent.ID
						tenant = &agent
						foundTenant = true
					}
				}
			}
			// 1b. Mobile / same network: subdomain.superealestate.<IP> (e.g. domono.superealestate.192.168.1.5)
			if !foundTenant {
				mainDomainBase := cfg.MainDomain
				if idx := strings.Index(cfg.MainDomain, "."); idx > 0 {
					mainDomainBase = cfg.MainDomain[:idx]
				}
				prefix := "." + mainDomainBase + "."
				if strings.Contains(domain, prefix) {
					subdomain := strings.Split(domain, prefix)[0]
					if subdomain != "" && subdomain != "www" && subdomain != "api" {
						var agent models.Agent
						if err := db.Where("subdomain = ? AND is_active = ? AND is_suspended = ?", subdomain, true, false).First(&agent).Error; err == nil {
							tenantID = agent.ID
							tenant = &agent
							foundTenant = true
						}
					}
				}
			}

			// 2. Try to resolve as a custom domain
			if !foundTenant {
				var agent models.Agent
				if err := db.Where("custom_domain = ? AND is_active = ? AND is_suspended = ?", domain, true, false).First(&agent).Error; err == nil {
					tenantID = agent.ID
					tenant = &agent
					foundTenant = true
				}
			}
		}

		if foundTenant {
			c.Set("tenant_id", tenantID)
			c.Set("tenant", tenant)
		} else if !isMainDomain && domain != "localhost" {
			// If not main domain and no tenant found, might be an invalid domain
			// For now, we just proceed, but we could abort with error
		}

		// DEV FALLBACK: If on localhost and no tenant resolved yet, check for agent_id query param
		if domain == "localhost" && !foundTenant {
			devAgentID := c.Query("agent_id")
			if devAgentID != "" {
				var agent models.Agent
				if err := db.Where("id = ? AND is_active = ? AND is_suspended = ?", devAgentID, true, false).First(&agent).Error; err == nil {
					c.Set("tenant_id", agent.ID)
					c.Set("tenant", &agent)
					c.Set("is_main_domain", false)
				}
			}
		}

		// Final Fallback: Resolve tenant from X-Tenant header (e.g. for cross-domain requests on Fly.io)
		if !foundTenant {
			if subdomain := strings.TrimSpace(c.GetHeader("X-Tenant")); subdomain != "" && subdomain != "www" && subdomain != "api" {
				var agent models.Agent
				if err := db.Where("subdomain = ? AND is_active = ? AND is_suspended = ?", subdomain, true, false).First(&agent).Error; err == nil {
					c.Set("tenant_id", agent.ID)
					c.Set("tenant", &agent)
					c.Set("is_main_domain", false)
					foundTenant = true
				}
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

// FeatureMiddleware checks if the agent's plan allows a specific feature
func FeatureMiddleware(db *gorm.DB, feature string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, _ := c.Get("role")
		if role.(string) == models.RoleSuperAdmin {
			c.Next()
			return
		}

		agentID, ok := GetAgentID(c)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Agent context required"})
			c.Abort()
			return
		}

		var agent models.Agent
		if err := db.Preload("Subscription").First(&agent, "id = ?", agentID).Error; err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "Agent plan not found"})
			c.Abort()
			return
		}

		if agent.Subscription == nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "No active subscription plan"})
			c.Abort()
			return
		}

		allowed := false
		switch feature {
		case "appointments":
			allowed = agent.Subscription.AllowAppointments
		case "theme":
			allowed = agent.Subscription.AllowTheme
		case "sub_agents":
			allowed = agent.Subscription.AllowSubAgents
		case "notifications":
			allowed = agent.Subscription.AllowNotifications
		case "banners":
			allowed = agent.Subscription.AllowBanners
		default:
			allowed = true
		}

		if !allowed {
			c.JSON(http.StatusForbidden, gin.H{"error": "This feature is not included in your plan. Please upgrade to access."})
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
