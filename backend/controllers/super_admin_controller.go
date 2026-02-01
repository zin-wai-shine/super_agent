package controllers

import (
	"net/http"

	"super_real_estate/models"
	"super_real_estate/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SuperAdminController struct {
	db *gorm.DB
}

func NewSuperAdminController(db *gorm.DB) *SuperAdminController {
	return &SuperAdminController{db: db}
}

// GetAgents returns all agents
func (sac *SuperAdminController) GetAgents(c *gin.Context) {
	var agents []models.Agent

	query := sac.db.Preload("Subscription").Preload("Theme")

	// Filter by status
	if status := c.Query("status"); status != "" {
		switch status {
		case "active":
			query = query.Where("is_active = ? AND is_suspended = ?", true, false)
		case "suspended":
			query = query.Where("is_suspended = ?", true)
		case "inactive":
			query = query.Where("is_active = ?", false)
		}
	}

	// Search by name
	if search := c.Query("search"); search != "" {
		query = query.Where("name ILIKE ?", "%"+search+"%")
	}

	if err := query.Order("created_at DESC").Find(&agents).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch agents"})
		return
	}

	c.JSON(http.StatusOK, agents)
}

// CreateAgent creates a new agent with an owner user
func (sac *SuperAdminController) CreateAgent(c *gin.Context) {
	var req struct {
		Name           string `json:"name" binding:"required"`
		Subdomain      string `json:"subdomain" binding:"required"`
		Email          string `json:"email" binding:"required,email"`
		Password       string `json:"password" binding:"required,min=8"`
		Phone          string `json:"phone"`
		DomainType     string `json:"domain_type"`   // "subdomain" or "custom"
		CustomDomain   string `json:"custom_domain"` // e.g., "agent.com"
		SubscriptionID string `json:"subscription_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Default domain type to subdomain
	if req.DomainType == "" {
		req.DomainType = models.DomainTypeSubdomain
	}

	// Validate domain type
	if req.DomainType != models.DomainTypeSubdomain && req.DomainType != models.DomainTypeCustom {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid domain type. Must be 'subdomain' or 'custom'"})
		return
	}

	// If custom domain type, require custom domain
	if req.DomainType == models.DomainTypeCustom && req.CustomDomain == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Custom domain is required for custom domain type"})
		return
	}

	// Check subdomain availability
	var existing models.Agent
	if err := sac.db.Where("subdomain = ?", req.Subdomain).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Subdomain already taken"})
		return
	}

	// Check custom domain availability if provided
	if req.CustomDomain != "" {
		if err := sac.db.Where("custom_domain = ?", req.CustomDomain).First(&existing).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Custom domain already registered"})
			return
		}
	}

	// Check email availability
	var existingUser models.User
	if err := sac.db.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
		return
	}

	// Start transaction
	tx := sac.db.Begin()

	// Create agent
	agent := models.Agent{
		Name:         req.Name,
		Subdomain:    req.Subdomain,
		DomainType:   req.DomainType,
		CustomDomain: req.CustomDomain,
		Email:        req.Email,
		Phone:        req.Phone,
		IsActive:     true,
	}

	// Set the computed domain
	if req.DomainType == models.DomainTypeCustom && req.CustomDomain != "" {
		agent.Domain = req.CustomDomain
	} else {
		agent.Domain = req.Subdomain + ".super.app"
	}

	// Set subscription if provided, otherwise auto-assign based on domain type
	if req.SubscriptionID != "" {
		subID, err := uuid.Parse(req.SubscriptionID)
		if err == nil {
			agent.SubscriptionID = &subID
		}
	} else {
		// Auto-assign plan based on domain type
		var plan models.Subscription
		if req.DomainType == models.DomainTypeCustom {
			// Find a custom domain plan
			if err := sac.db.Where("domain_type = ? AND is_active = ?", models.DomainTypeCustom, true).
				Order("price ASC").First(&plan).Error; err == nil {
				agent.SubscriptionID = &plan.ID
			}
		} else {
			// Find a subdomain plan (usually free tier)
			if err := sac.db.Where("domain_type = ? AND is_active = ?", models.DomainTypeSubdomain, true).
				Order("price ASC").First(&plan).Error; err == nil {
				agent.SubscriptionID = &plan.ID
			}
		}
	}

	if err := tx.Create(&agent).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create agent"})
		return
	}

	// Create default theme
	theme := models.Theme{
		AgentID:         agent.ID,
		BackgroundColor: "#f5f5f5",
		PrimaryColor:    "#1a73e8",
		SecondaryColor:  "#34a853",
		TextColor:       "#202124",
		FontFamily:      "Inter, sans-serif",
	}
	tx.Create(&theme)

	// Create owner user
	hashedPassword, _ := utils.HashPassword(req.Password)
	user := models.User{
		Email:        req.Email,
		PasswordHash: hashedPassword,
		FirstName:    req.Name,
		Role:         models.RoleAgent,
		AgentID:      &agent.ID,
		IsActive:     true,
	}

	if err := tx.Create(&user).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	tx.Commit()

	// Reload with associations
	sac.db.Preload("Subscription").Preload("Theme").First(&agent, "id = ?", agent.ID)

	c.JSON(http.StatusCreated, agent)
}

// GetAgent returns a specific agent
func (sac *SuperAdminController) GetAgent(c *gin.Context) {
	id := c.Param("id")

	var agent models.Agent
	if err := sac.db.Preload("Subscription").Preload("Theme").Preload("Users").First(&agent, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Agent not found"})
		return
	}

	// Count listings
	var listingCount int64
	sac.db.Model(&models.Listing{}).Where("agent_id = ?", id).Count(&listingCount)

	c.JSON(http.StatusOK, gin.H{
		"agent":         agent,
		"listing_count": listingCount,
	})
}

// UpdateAgent updates an agent
func (sac *SuperAdminController) UpdateAgent(c *gin.Context) {
	id := c.Param("id")

	var agent models.Agent
	if err := sac.db.First(&agent, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Agent not found"})
		return
	}

	var req struct {
		Name           string `json:"name"`
		Domain         string `json:"domain"`
		Phone          string `json:"phone"`
		Description    string `json:"description"`
		SubscriptionID string `json:"subscription_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]interface{}{}
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Domain != "" {
		updates["domain"] = req.Domain
	}
	if req.Phone != "" {
		updates["phone"] = req.Phone
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}
	if req.SubscriptionID != "" {
		subID, err := uuid.Parse(req.SubscriptionID)
		if err == nil {
			updates["subscription_id"] = subID
		}
	}

	if err := sac.db.Model(&agent).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update agent"})
		return
	}

	sac.db.Preload("Subscription").Preload("Theme").First(&agent, "id = ?", id)
	c.JSON(http.StatusOK, agent)
}

// DeleteAgent soft deletes an agent
func (sac *SuperAdminController) DeleteAgent(c *gin.Context) {
	id := c.Param("id")

	if err := sac.db.Delete(&models.Agent{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete agent"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Agent deleted successfully"})
}

// SuspendAgent suspends an agent
func (sac *SuperAdminController) SuspendAgent(c *gin.Context) {
	id := c.Param("id")

	if err := sac.db.Model(&models.Agent{}).Where("id = ?", id).Update("is_suspended", true).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to suspend agent"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Agent suspended successfully"})
}

// ActivateAgent activates a suspended agent
func (sac *SuperAdminController) ActivateAgent(c *gin.Context) {
	id := c.Param("id")

	if err := sac.db.Model(&models.Agent{}).Where("id = ?", id).Updates(map[string]interface{}{
		"is_suspended": false,
		"is_active":    true,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to activate agent"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Agent activated successfully"})
}

// GetPlans returns all subscription plans
func (sac *SuperAdminController) GetPlans(c *gin.Context) {
	var plans []models.Subscription
	if err := sac.db.Order("price ASC").Find(&plans).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch plans"})
		return
	}
	c.JSON(http.StatusOK, plans)
}

// CreatePlan creates a new subscription plan
func (sac *SuperAdminController) CreatePlan(c *gin.Context) {
	var plan models.Subscription
	if err := c.ShouldBindJSON(&plan); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := sac.db.Create(&plan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create plan"})
		return
	}

	c.JSON(http.StatusCreated, plan)
}

// UpdatePlan updates a subscription plan
func (sac *SuperAdminController) UpdatePlan(c *gin.Context) {
	id := c.Param("id")

	var plan models.Subscription
	if err := sac.db.First(&plan, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Plan not found"})
		return
	}

	if err := c.ShouldBindJSON(&plan); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := sac.db.Save(&plan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update plan"})
		return
	}

	c.JSON(http.StatusOK, plan)
}

// DeletePlan deletes a subscription plan
func (sac *SuperAdminController) DeletePlan(c *gin.Context) {
	id := c.Param("id")

	if err := sac.db.Delete(&models.Subscription{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete plan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Plan deleted successfully"})
}

// GetUsers returns all users
func (sac *SuperAdminController) GetUsers(c *gin.Context) {
	var users []models.User

	query := sac.db.Preload("Agent")

	if role := c.Query("role"); role != "" {
		query = query.Where("role = ?", role)
	}

	if err := query.Order("created_at DESC").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	c.JSON(http.StatusOK, users)
}

// GetDashboardStats returns dashboard statistics
func (sac *SuperAdminController) GetDashboardStats(c *gin.Context) {
	var stats struct {
		TotalAgents     int64 `json:"total_agents"`
		ActiveAgents    int64 `json:"active_agents"`
		SuspendedAgents int64 `json:"suspended_agents"`
		TotalListings   int64 `json:"total_listings"`
		TotalUsers      int64 `json:"total_users"`
	}

	sac.db.Model(&models.Agent{}).Count(&stats.TotalAgents)
	sac.db.Model(&models.Agent{}).Where("is_active = ? AND is_suspended = ?", true, false).Count(&stats.ActiveAgents)
	sac.db.Model(&models.Agent{}).Where("is_suspended = ?", true).Count(&stats.SuspendedAgents)
	sac.db.Model(&models.Listing{}).Count(&stats.TotalListings)
	sac.db.Model(&models.User{}).Count(&stats.TotalUsers)

	c.JSON(http.StatusOK, stats)
}
