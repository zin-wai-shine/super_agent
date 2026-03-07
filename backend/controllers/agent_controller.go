package controllers

import (
	"net/http"
	"time"

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
	query := ac.db.Preload("Media").Preload("Project").Preload("Project.Developer").Where("agent_id = ?", agentID)

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
	ac.db.Preload("Media").Preload("Project").Preload("Project.Developer").First(&listing, "id = ?", listing.ID)

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
	if err := ac.db.Preload("Media").Preload("Project").Preload("Project.Developer").Where("id = ? AND agent_id = ?", id, agentID).First(&listing).Error; err != nil {
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

	ac.db.Preload("Media").Preload("Project").Preload("Project.Developer").First(&listing, "id = ?", id)
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

// GetUsers returns all public users registered for this agent
func (ac *AgentController) GetUsers(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Agent ID not found"})
		return
	}

	var users []models.User
	if err := ac.db.Where("agent_id = ? AND role = ?", agentID, models.RolePublic).Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	c.JSON(http.StatusOK, users)
}

// ToggleUserStatus toggles the IsActive status of a registered user
func (ac *AgentController) ToggleUserStatus(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Agent ID not found"})
		return
	}

	id := c.Param("id")
	var user models.User
	if err := ac.db.Where("id = ? AND agent_id = ? AND role = ?", id, agentID, models.RolePublic).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	user.IsActive = !user.IsActive
	if err := ac.db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user status"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// DeleteUser deletes a registered user
func (ac *AgentController) DeleteUser(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Agent ID not found"})
		return
	}

	id := c.Param("id")
	if err := ac.db.Where("id = ? AND agent_id = ? AND role = ?", id, agentID, models.RolePublic).Delete(&models.User{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
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
		TotalListings        int64 `json:"total_listings"`
		PublishedListings    int64 `json:"published_listings"`
		DraftListings        int64 `json:"draft_listings"`
		TotalSubAgents       int64 `json:"total_sub_agents"`
		TotalUsers           int64 `json:"total_users"`
		TotalViews           int64 `json:"total_views"`
		TotalAppointments    int64 `json:"total_appointments"`
		PendingAppointments  int64 `json:"pending_appointments"`
		AppointmentsThisWeek int64 `json:"appointments_this_week"`
	}

	ac.db.Model(&models.Listing{}).Where("agent_id = ?", agentID).Count(&stats.TotalListings)
	ac.db.Model(&models.Listing{}).Where("agent_id = ? AND is_published = ?", agentID, true).Count(&stats.PublishedListings)
	ac.db.Model(&models.Listing{}).Where("agent_id = ? AND is_published = ?", agentID, false).Count(&stats.DraftListings)
	ac.db.Model(&models.User{}).Where("agent_id = ? AND role = ?", agentID, models.RoleSubAgent).Count(&stats.TotalSubAgents)
	ac.db.Model(&models.User{}).Where("agent_id = ? AND role = ?", agentID, models.RolePublic).Count(&stats.TotalUsers)

	// Sum view counts
	var viewSum struct{ Total int64 }
	ac.db.Model(&models.Listing{}).Select("COALESCE(SUM(view_count), 0) as total").Where("agent_id = ?", agentID).Scan(&viewSum)
	stats.TotalViews = viewSum.Total

	// Appointment stats
	ac.db.Model(&models.Appointment{}).Where("agent_id = ?", agentID).Count(&stats.TotalAppointments)
	ac.db.Model(&models.Appointment{}).Where("agent_id = ? AND status = ?", agentID, models.AppointmentPending).Count(&stats.PendingAppointments)

	// This week's appointments
	now := time.Now()
	weekStart := now.AddDate(0, 0, -int(now.Weekday()))
	ac.db.Model(&models.Appointment{}).Where("agent_id = ? AND preferred_date >= ?", agentID, weekStart).Count(&stats.AppointmentsThisWeek)

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
		PriceFormat   string  `json:"price_format"`
		Description   string  `json:"description"`
		Vision        string  `json:"vision"`
		Mission       string  `json:"mission"`
		Facebook      string  `json:"facebook"`
		Instagram     string  `json:"instagram"`
		LinkedIn      string  `json:"linkedin"`
		Line          string  `json:"line"`
		Phone         string  `json:"phone"`
		SocialLinks   string  `json:"social_links"`
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

	updates := map[string]interface{}{
		"min_price_limit": req.MinPriceLimit,
		"max_price_limit": req.MaxPriceLimit,
	}

	if req.PriceFormat != "" {
		updates["price_format"] = req.PriceFormat
	}

	updates["description"] = req.Description
	updates["vision"] = req.Vision
	updates["mission"] = req.Mission
	updates["facebook"] = req.Facebook
	updates["instagram"] = req.Instagram
	updates["linkedin"] = req.LinkedIn
	updates["line"] = req.Line
	updates["phone"] = req.Phone
	updates["social_links"] = req.SocialLinks

	if err := ac.db.Model(&models.Agent{}).Where("id = ?", agentID).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update settings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Settings updated successfully", "data": req})
}

// GetSettings returns agent settings
func (ac *AgentController) GetSettings(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Agent ID not found"})
		return
	}

	var agent models.Agent
	if err := ac.db.Where("id = ?", agentID).First(&agent).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Agent not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"min_price_limit": agent.MinPriceLimit,
		"max_price_limit": agent.MaxPriceLimit,
		"price_format":    agent.PriceFormat,
		"description":     agent.Description,
		"vision":          agent.Vision,
		"mission":         agent.Mission,
		"facebook":        agent.Facebook,
		"instagram":       agent.Instagram,
		"linkedin":        agent.LinkedIn,
		"line":            agent.Line,
		"phone":           agent.Phone,
		"social_links":    agent.SocialLinks,
	})
}
