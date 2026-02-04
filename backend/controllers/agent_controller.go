package controllers

import (
	"net/http"

	"super_real_estate/config"
	"super_real_estate/middleware"
	"super_real_estate/models"
	"super_real_estate/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AgentController struct {
	db  *gorm.DB
	cfg *config.Config
}

func NewAgentController(db *gorm.DB, cfg *config.Config) *AgentController {
	return &AgentController{db: db, cfg: cfg}
}

// GetListings returns listings for the agent
func (ac *AgentController) GetListings(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Agent ID not found"})
		return
	}

	var listings []models.Listing
	query := ac.db.Preload("Media").Where("agent_id = ?", agentID)

	// Filter by published status
	if status := c.Query("status"); status != "" {
		switch status {
		case "published":
			query = query.Where("is_published = ?", true)
		case "draft":
			query = query.Where("is_published = ?", false)
		}
	}

	// Filter by property type
	if propertyType := c.Query("type"); propertyType != "" {
		query = query.Where("property_type = ?", propertyType)
	}

	// Search
	if search := c.Query("search"); search != "" {
		query = query.Where("title ILIKE ? OR description ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if err := query.Order("created_at DESC").Find(&listings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch listings"})
		return
	}

	c.JSON(http.StatusOK, listings)
}

// CreateListing creates a new listing
func (ac *AgentController) CreateListing(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Agent ID not found"})
		return
	}
	userID, _ := middleware.GetUserID(c)

	var listing models.Listing
	if err := c.ShouldBindJSON(&listing); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	listing.AgentID = agentID
	listing.CreatedBy = userID

	if err := ac.db.Create(&listing).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create listing"})
		return
	}

	c.JSON(http.StatusCreated, listing)
}

// GetListing returns a specific listing
func (ac *AgentController) GetListing(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Agent ID not found"})
		return
	}

	id := c.Param("id")

	var listing models.Listing
	if err := ac.db.Preload("Media").Where("id = ? AND agent_id = ?", id, agentID).First(&listing).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Listing not found"})
		return
	}

	c.JSON(http.StatusOK, listing)
}

// UpdateListing updates a listing
func (ac *AgentController) UpdateListing(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Agent ID not found"})
		return
	}

	id := c.Param("id")

	var listing models.Listing
	if err := ac.db.Where("id = ? AND agent_id = ?", id, agentID).First(&listing).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Listing not found"})
		return
	}

	if err := c.ShouldBindJSON(&listing); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := ac.db.Save(&listing).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update listing"})
		return
	}

	ac.db.Preload("Media").First(&listing, "id = ?", id)
	c.JSON(http.StatusOK, listing)
}

// DeleteListing deletes a listing
func (ac *AgentController) DeleteListing(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Agent ID not found"})
		return
	}

	id := c.Param("id")

	// Delete associated media
	ac.db.Where("listing_id = ?", id).Delete(&models.Media{})

	if err := ac.db.Where("id = ? AND agent_id = ?", id, agentID).Delete(&models.Listing{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete listing"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Listing deleted successfully"})
}

// PublishListing publishes a listing
func (ac *AgentController) PublishListing(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Agent ID not found"})
		return
	}

	id := c.Param("id")

	if err := ac.db.Model(&models.Listing{}).Where("id = ? AND agent_id = ?", id, agentID).Update("is_published", true).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to publish listing"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Listing published successfully"})
}

// UnpublishListing unpublishes a listing
func (ac *AgentController) UnpublishListing(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Agent ID not found"})
		return
	}

	id := c.Param("id")

	if err := ac.db.Model(&models.Listing{}).Where("id = ? AND agent_id = ?", id, agentID).Update("is_published", false).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unpublish listing"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Listing unpublished successfully"})
}

// GetSubAgents returns sub-agents for the agent
func (ac *AgentController) GetSubAgents(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Agent ID not found"})
		return
	}

	var subAgents []models.User
	if err := ac.db.Where("agent_id = ? AND role = ?", agentID, models.RoleSubAgent).Find(&subAgents).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch sub-agents"})
		return
	}

	c.JSON(http.StatusOK, subAgents)
}

// CreateSubAgent creates a new sub-agent
func (ac *AgentController) CreateSubAgent(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Agent ID not found"})
		return
	}

	var req struct {
		Email     string `json:"email" binding:"required,email"`
		Password  string `json:"password" binding:"required,min=8"`
		FirstName string `json:"first_name" binding:"required"`
		LastName  string `json:"last_name" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check email availability
	var existingUser models.User
	if err := ac.db.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
		return
	}

	// Hash password
	hashedPassword, _ := utils.HashPassword(req.Password)

	subAgent := models.User{
		Email:        req.Email,
		PasswordHash: hashedPassword,
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Role:         models.RoleSubAgent,
		AgentID:      &agentID,
		IsActive:     true,
	}

	if err := ac.db.Create(&subAgent).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create sub-agent"})
		return
	}

	c.JSON(http.StatusCreated, subAgent)
}

// DeleteSubAgent deletes a sub-agent
func (ac *AgentController) DeleteSubAgent(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Agent ID not found"})
		return
	}

	id := c.Param("id")

	if err := ac.db.Where("id = ? AND agent_id = ? AND role = ?", id, agentID, models.RoleSubAgent).Delete(&models.User{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete sub-agent"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Sub-agent deleted successfully"})
}

// UpdateSubAgent updates a sub-agent
func (ac *AgentController) UpdateSubAgent(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Agent ID not found"})
		return
	}

	id := c.Param("id")

	var subAgent models.User
	if err := ac.db.Where("id = ? AND agent_id = ? AND role = ?", id, agentID, models.RoleSubAgent).First(&subAgent).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Sub-agent not found"})
		return
	}

	var req struct {
		Email     string `json:"email" binding:"required,email"`
		FirstName string `json:"first_name" binding:"required"`
		LastName  string `json:"last_name" binding:"required"`
		Password  string `json:"password"` // Optional
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check email availability if changed
	if req.Email != subAgent.Email {
		var existingUser models.User
		if err := ac.db.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
			return
		}
		subAgent.Email = req.Email
	}

	subAgent.FirstName = req.FirstName
	subAgent.LastName = req.LastName

	if req.Password != "" {
		hashedPassword, _ := utils.HashPassword(req.Password)
		subAgent.PasswordHash = hashedPassword
	}

	if err := ac.db.Save(&subAgent).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update sub-agent"})
		return
	}

	c.JSON(http.StatusOK, subAgent)
}

// GetTheme returns the agent's theme
func (ac *AgentController) GetTheme(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Agent ID not found"})
		return
	}

	var theme models.Theme
	if err := ac.db.Where("agent_id = ?", agentID).First(&theme).Error; err != nil {
		// Return default theme if not found
		theme = models.Theme{
			AgentID:         agentID,
			BackgroundColor: "#f5f5f5",
			PrimaryColor:    "#1a73e8",
			SecondaryColor:  "#34a853",
			TextColor:       "#202124",
			FontFamily:      "Inter, sans-serif",
			HeaderText:      "Super Real Estate",
			FooterText:      "© 2024 Super Real Estate. All rights reserved.",
		}
	}

	c.JSON(http.StatusOK, theme)
}

// UpdateTheme updates the agent's theme
func (ac *AgentController) UpdateTheme(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Agent ID not found"})
		return
	}

	var theme models.Theme
	if err := ac.db.Where("agent_id = ?", agentID).First(&theme).Error; err != nil {
		// Create new theme if not exists
		theme.AgentID = agentID
	}

	if err := c.ShouldBindJSON(&theme); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	theme.AgentID = agentID

	if theme.ID == uuid.Nil {
		ac.db.Create(&theme)
	} else {
		ac.db.Save(&theme)
	}

	c.JSON(http.StatusOK, theme)
}

// GetDashboard returns agent dashboard data
func (ac *AgentController) GetDashboard(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Agent ID not found"})
		return
	}

	var stats struct {
		TotalListings     int64 `json:"total_listings"`
		PublishedListings int64 `json:"published_listings"`
		DraftListings     int64 `json:"draft_listings"`
		TotalSubAgents    int64 `json:"total_sub_agents"`
		TotalViews        int64 `json:"total_views"`
	}

	ac.db.Model(&models.Listing{}).Where("agent_id = ?", agentID).Count(&stats.TotalListings)
	ac.db.Model(&models.Listing{}).Where("agent_id = ? AND is_published = ?", agentID, true).Count(&stats.PublishedListings)
	ac.db.Model(&models.Listing{}).Where("agent_id = ? AND is_published = ?", agentID, false).Count(&stats.DraftListings)
	ac.db.Model(&models.User{}).Where("agent_id = ? AND role = ?", agentID, models.RoleSubAgent).Count(&stats.TotalSubAgents)

	// Sum view counts
	var viewSum struct{ Total int64 }
	ac.db.Model(&models.Listing{}).Select("COALESCE(SUM(view_count), 0) as total").Where("agent_id = ?", agentID).Scan(&viewSum)
	stats.TotalViews = viewSum.Total

	// Get recent listings
	var recentListings []models.Listing
	ac.db.Preload("Media").Where("agent_id = ?", agentID).Order("created_at DESC").Limit(5).Find(&recentListings)

	c.JSON(http.StatusOK, gin.H{
		"stats":           stats,
		"recent_listings": recentListings,
	})
}

// UpdateSettings updates agent settings (price limits, etc.)
func (ac *AgentController) UpdateSettings(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Agent ID not found"})
		return
	}

	var req struct {
		MinPriceLimit float64 `json:"min_price_limit"`
		MaxPriceLimit float64 `json:"max_price_limit"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate limits
	if req.MaxPriceLimit < req.MinPriceLimit && req.MaxPriceLimit != 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Max price limit cannot be less than min price limit"})
		return
	}

	if err := ac.db.Model(&models.Agent{}).Where("id = ?", agentID).Updates(map[string]interface{}{
		"min_price_limit": req.MinPriceLimit,
		"max_price_limit": req.MaxPriceLimit,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update settings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Settings updated successfully", "data": req})
}
