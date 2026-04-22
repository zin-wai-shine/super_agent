package middleware

import (
	"log"
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
		// Skip tenant resolution for specific routes (like health check)
		if c.Request.URL.Path == "/api/health" || c.Request.URL.Path == "/health" {
			c.Set("is_main_domain", true)
			c.Next()
			return
		}

		host := c.Request.Host
		if forwardedHost := c.GetHeader("X-Forwarded-Host"); forwardedHost != "" {
			host = forwardedHost
		}
		// Remove port if present (e.g. localhost:8080)
		hostPort := strings.Split(host, ":")
		domain := hostPort[0]

		// Main domain detection logic (support srv1534108.hstgr.cloud and configured domain)
		mainDomain := cfg.MainDomain
		if mainDomain == "" {
			mainDomain = "srv1534108.hstgr.cloud"
		}

		isMainDomain := domain == mainDomain ||
			domain == "www."+mainDomain ||
			domain == "srv1534108.hstgr.cloud" ||
			domain == "www.srv1534108.hstgr.cloud" ||
			domain == "super-agent-frontend-zin.fly.dev" ||
			domain == "super-agent-backend-zin.fly.dev" ||
			domain == "localhost" ||
			domain == "127.0.0.1" ||
			domain == "superrealestate.localhost" ||
			domain == "superrealestate.localhost:3000" ||
			domain == "superealestate.localhost" ||
			domain == "superealestate.test" ||
			domain == "superealestate.local"

		searchDomain := domain
		if idx := strings.Index(domain, ":"); idx > 0 {
			searchDomain = domain[:idx]
		}
		// Tenant resolution
		var tenantID uuid.UUID
		var tenant *models.Agent
		foundTenant := false
		
		cleanDomain := strings.TrimPrefix(searchDomain, "www.")

		// 1. Try resolving as a custom domain first (exact match or without www)
		var agent models.Agent
		if err := db.Where("(custom_domain = ? OR custom_domain = ?) AND is_active = ? AND is_suspended = ?", searchDomain, cleanDomain, true, false).First(&agent).Error; err == nil {
			tenantID = agent.ID
			tenant = &agent
			foundTenant = true
			log.Printf("[TenantMiddleware] Resolved tenant from custom domain '%s': %s", searchDomain, agent.Name)
		}

		// 2. Try resolving from subdomain (split by dot)
		if !foundTenant {
			parts := strings.Split(searchDomain, ".")
			if len(parts) >= 2 {
				potentialSub := parts[0]
				// Skip common platform subdomains
				if potentialSub != "www" && potentialSub != "api" && potentialSub != "admin" {
					potentialSub = strings.ToLower(potentialSub)
					if err := db.Where("subdomain = ? AND is_active = ? AND is_suspended = ?", potentialSub, true, false).First(&agent).Error; err == nil {
						tenantID = agent.ID
						tenant = &agent
						foundTenant = true
						log.Printf("[TenantMiddleware] Resolved tenant from subdomain '%s': %s", potentialSub, agent.Name)
					}
				}
			}
		}

		if foundTenant {
			c.Set("tenant_id", tenantID)
			c.Set("tenant", tenant)
			c.Set("is_main_domain", false)
		} else {
			c.Set("is_main_domain", isMainDomain)
		}

		if !foundTenant && !isMainDomain && domain != "localhost" && domain != "127.0.0.1" {
			log.Printf("[TenantMiddleware] No tenant found for non-main domain: %s", domain)
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
					foundTenant = true
					log.Printf("[TenantMiddleware] Local dev fallback for agent_id: %s", devAgentID)
				}
			}
		}

		// Final Fallback: Resolve tenant from X-Tenant header (e.g. for cross-domain requests on Fly.io)
		if !foundTenant {
			if subdomainHeader := strings.TrimSpace(c.GetHeader("X-Tenant")); subdomainHeader != "" && subdomainHeader != "www" && subdomainHeader != "api" {
				subdomainHeader = strings.ToLower(subdomainHeader)
				var agent models.Agent
				if err := db.Where("subdomain = ? AND is_active = ? AND is_suspended = ?", subdomainHeader, true, false).First(&agent).Error; err == nil {
					tenantID = agent.ID
					tenant = &agent
					foundTenant = true
					// IMPORTANT: Store in context for controllers to use
					c.Set("tenant_id", tenantID)
					c.Set("tenant", tenant)
					// If we forced it via header, we are definitely NOT on main domain anymore
					c.Set("is_main_domain", false)
					isMainDomain = false
					log.Printf("[TenantMiddleware] Resolved tenant from X-Tenant header '%s': %s", subdomainHeader, agent.Name)
				}
			}
		}

		// Final check: If not on the main domain and no valid tenant found, prevent access
		// EXEMPTION: Public share routes don't strictly need tenant pre-resolution as they use UUIDs
		isShareRoute := strings.Contains(c.Request.URL.Path, "/api/public/share") || strings.Contains(c.Request.URL.Path, "/p/")
		
		if !isMainDomain && !foundTenant && !isShareRoute {
			log.Printf("[TenantMiddleware] Aborting 404: Not main domain and no tenant found for host '%s'", host)
			c.JSON(http.StatusNotFound, gin.H{"error": "Agent not found or inactive"})
			c.Abort()
			return
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
