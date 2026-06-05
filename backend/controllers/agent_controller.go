package controllers

import (
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"super_real_estate/config"
	"super_real_estate/middleware"
	"super_real_estate/models"
	"super_real_estate/services"
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
	query := ac.db.Preload("Media", func(db *gorm.DB) *gorm.DB {
		return db.Order("sort_order ASC")
	}).Preload("Project").Preload("Project.Developer").Where("agent_id = ?", agentID)

	// Filter: Sub-agents only see their own listings
	role, _ := c.Get("role")
	if role != nil && role.(string) == models.RoleSubAgent {
		userID, ok := middleware.GetUserID(c)
		if ok {
			query = query.Where("created_by = ?", userID)
		}
	}

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

	// Limit
	if limitStr := c.Query("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil && limit > 0 {
			query = query.Limit(limit)
		}
	}

	if err := query.Order("created_at DESC").Find(&listings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch listings"})
		return
	}

	// For each listing with a facility_name, inject the facility's first image if listing has no own images
	for i := range listings {
		if listings[i].FacilityName == "" {
			continue
		}
		hasOwnImages := false
		for _, m := range listings[i].Media {
			if m.Type == "image" && m.Caption == "" {
				hasOwnImages = true
				break
			}
		}
		if !hasOwnImages {
			var facilityMedia []models.FacilityMedia
			ac.db.Where("agent_id = ? AND name = ?", agentID, listings[i].FacilityName).Order("sort_order ASC").Limit(1).Find(&facilityMedia)
			for _, fm := range facilityMedia {
				listings[i].Media = append(listings[i].Media, models.Media{
					URL:      fm.URL,
					Type:     "image",
					RoomType: "Additional Photos",
					Caption:  "(Facility: " + listings[i].FacilityName + ")",
				})
			}
		}
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

	// Auto-Translate missing fields
	aiService := services.NewAIService(ac.db)
	if listing.TitleMY == "" && listing.Title != "" {
		if t, err := aiService.Translate(listing.Title, "my"); err == nil { listing.TitleMY = t }
	}
	if listing.TitleZH == "" && listing.Title != "" {
		if t, err := aiService.Translate(listing.Title, "zh"); err == nil { listing.TitleZH = t }
	}
	if listing.DescriptionMY == "" && listing.Description != "" {
		if t, err := aiService.Translate(listing.Description, "my"); err == nil { listing.DescriptionMY = t }
	}
	if listing.DescriptionZH == "" && listing.Description != "" {
		if t, err := aiService.Translate(listing.Description, "zh"); err == nil { listing.DescriptionZH = t }
	}
	if listing.FeaturesMY == "" && listing.Features != "" && listing.Features != "[]" {
		if t, err := aiService.Translate(listing.Features, "my"); err == nil { listing.FeaturesMY = t }
	}
	if listing.FeaturesZH == "" && listing.Features != "" && listing.Features != "[]" {
		if t, err := aiService.Translate(listing.Features, "zh"); err == nil { listing.FeaturesZH = t }
	}

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
	if err := ac.db.Preload("Media", func(db *gorm.DB) *gorm.DB {
		return db.Order("sort_order ASC")
	}).Preload("Project").Preload("Project.Developer").Where("id = ? AND agent_id = ?", id, agentID).First(&listing).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Listing not found"})
		return
	}

	if listing.FacilityName != "" {
		var facilityMedia []models.FacilityMedia
		ac.db.Where("agent_id = ? AND name = ?", agentID, listing.FacilityName).Order("sort_order ASC").Find(&facilityMedia)
		
		// Prevent duplicates
		existingUrls := make(map[string]bool)
		for _, m := range listing.Media {
			existingUrls[m.URL] = true
		}

		for _, fm := range facilityMedia {
			if !existingUrls[fm.URL] {
				listing.Media = append(listing.Media, models.Media{
					URL:      fm.URL,
					Type:     "image",
					RoomType: "Additional Photos",
					Caption:  "(Facility: " + listing.FacilityName + ")",
				})
			}
		}
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

	// Auto-Translate missing fields
	aiService := services.NewAIService(ac.db)
	if listing.TitleMY == "" && listing.Title != "" {
		if t, err := aiService.Translate(listing.Title, "my"); err == nil { listing.TitleMY = t }
	}
	if listing.TitleZH == "" && listing.Title != "" {
		if t, err := aiService.Translate(listing.Title, "zh"); err == nil { listing.TitleZH = t }
	}
	if listing.DescriptionMY == "" && listing.Description != "" {
		if t, err := aiService.Translate(listing.Description, "my"); err == nil { listing.DescriptionMY = t }
	}
	if listing.DescriptionZH == "" && listing.Description != "" {
		if t, err := aiService.Translate(listing.Description, "zh"); err == nil { listing.DescriptionZH = t }
	}
	if listing.FeaturesMY == "" && listing.Features != "" && listing.Features != "[]" {
		if t, err := aiService.Translate(listing.Features, "my"); err == nil { listing.FeaturesMY = t }
	}
	if listing.FeaturesZH == "" && listing.Features != "" && listing.Features != "[]" {
		if t, err := aiService.Translate(listing.Features, "zh"); err == nil { listing.FeaturesZH = t }
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

	// 1. Get associated media to delete physical files
	var media []models.Media
	ac.db.Where("listing_id = ?", id).Find(&media)

	for _, m := range media {
		if m.URL != "" && strings.HasPrefix(m.URL, "/uploads/") {
			// Only delete if it's NOT a shared facility image (starts with /uploads/AGENT_ID/facilities/)
			if !strings.Contains(m.URL, "/facilities/") {
				filePath := filepath.Join(ac.cfg.UploadPath, strings.TrimPrefix(m.URL, "/uploads/"))
				os.Remove(filePath)
			}
		}
	}

	// 2. Delete associated media records
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

// RepostListing updates the created_at timestamp to "bump" the listing to the top
func (ac *AgentController) RepostListing(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Agent ID not found"})
		return
	}

	id := c.Param("id")

	if err := ac.db.Model(&models.Listing{}).Where("id = ? AND agent_id = ?", id, agentID).Update("created_at", time.Now()).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to repost listing"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Listing reposted successfully"})
}

// ToggleViewingRequests toggles the allow_viewing_requests status of a listing
func (ac *AgentController) ToggleViewingRequests(c *gin.Context) {
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

	listing.AllowViewingRequests = !listing.AllowViewingRequests
	if err := ac.db.Save(&listing).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to toggle viewing requests"})
		return
	}

	c.JSON(http.StatusOK, listing)
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
		Email       string `json:"email" binding:"required,email"`
		Password    string `json:"password" binding:"required,min=8"`
		FirstName   string `json:"first_name" binding:"required"`
		LastName    string `json:"last_name" binding:"required"`
		Permissions string `json:"permissions"`
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
		Permissions:  req.Permissions,
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

	var subAgent models.User
	if err := ac.db.Where("id = ? AND agent_id = ? AND role = ?", id, agentID, models.RoleSubAgent).First(&subAgent).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Sub-agent not found"})
		return
	}

	// Delete physical avatar
	if subAgent.Avatar != "" && strings.HasPrefix(subAgent.Avatar, "/uploads/") {
		filePath := filepath.Join(ac.cfg.UploadPath, strings.TrimPrefix(subAgent.Avatar, "/uploads/"))
		os.Remove(filePath)
	}

	if err := ac.db.Delete(&subAgent).Error; err != nil {
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
		Email       string `json:"email" binding:"required,email"`
		FirstName   string `json:"first_name" binding:"required"`
		LastName    string `json:"last_name" binding:"required"`
		Password    string `json:"password"` // Optional
		Permissions string `json:"permissions"`
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
	subAgent.Permissions = req.Permissions

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
	var user models.User
	if err := ac.db.Where("id = ? AND agent_id = ? AND role = ?", id, agentID, models.RolePublic).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Delete physical avatar
	if user.Avatar != "" && strings.HasPrefix(user.Avatar, "/uploads/") {
		filePath := filepath.Join(ac.cfg.UploadPath, strings.TrimPrefix(user.Avatar, "/uploads/"))
		os.Remove(filePath)
	}

	if err := ac.db.Delete(&user).Error; err != nil {
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

	role, _ := c.Get("role")
	var userID uuid.UUID
	isSubAgent := false
	if role != nil && role.(string) == models.RoleSubAgent {
		uid, ok := middleware.GetUserID(c)
		if ok {
			userID = uid
			isSubAgent = true
		}
	}

	listingsQuery := ac.db.Model(&models.Listing{}).Where("agent_id = ?", agentID)
	if isSubAgent {
		listingsQuery = listingsQuery.Where("created_by = ?", userID)
	}
	listingsQuery.Count(&stats.TotalListings)

	pubQuery := ac.db.Model(&models.Listing{}).Where("agent_id = ? AND is_published = ?", agentID, true)
	if isSubAgent {
		pubQuery = pubQuery.Where("created_by = ?", userID)
	}
	pubQuery.Count(&stats.PublishedListings)

	draftQuery := ac.db.Model(&models.Listing{}).Where("agent_id = ? AND is_published = ?", agentID, false)
	if isSubAgent {
		draftQuery = draftQuery.Where("created_by = ?", userID)
	}
	draftQuery.Count(&stats.DraftListings)

	ac.db.Model(&models.User{}).Where("agent_id = ? AND role = ?", agentID, models.RoleSubAgent).Count(&stats.TotalSubAgents)
	ac.db.Model(&models.User{}).Where("agent_id = ? AND role = ?", agentID, models.RolePublic).Count(&stats.TotalUsers)

	// Sum view counts
	var viewSum struct{ Total int64 }
	viewQuery := ac.db.Model(&models.Listing{}).Select("COALESCE(SUM(view_count), 0) as total").Where("agent_id = ?", agentID)
	if isSubAgent {
		viewQuery = viewQuery.Where("created_by = ?", userID)
	}
	viewQuery.Scan(&viewSum)
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
	recentQuery := ac.db.Preload("Media").Where("agent_id = ?", agentID)
	if isSubAgent {
		recentQuery = recentQuery.Where("created_by = ?", userID)
	}
	recentQuery.Order("created_at DESC").Limit(5).Find(&recentListings)

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

// GetFacilityMedia returns all facility media for the agent
func (ac *AgentController) GetFacilityMedia(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Agent ID not found"})
		return
	}

	var media []models.FacilityMedia
	if err := ac.db.Where("agent_id = ?", agentID).Order("sort_order ASC").Find(&media).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch facility media"})
		return
	}

	c.JSON(http.StatusOK, media)
}

// UpdateFacilityMedia updates a facility media record
func (ac *AgentController) UpdateFacilityMedia(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Agent ID not found"})
		return
	}

	id := c.Param("id")
	var media models.FacilityMedia
	if err := ac.db.Where("id = ? AND agent_id = ?", id, agentID).First(&media).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Media not found"})
		return
	}

	var req struct {
		Name      string `json:"name"`
		SortOrder int    `json:"sort_order"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	media.Name = req.Name
	media.SortOrder = req.SortOrder

	if err := ac.db.Save(&media).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update media"})
		return
	}

	c.JSON(http.StatusOK, media)
}

// DeleteFacilityMedia deletes a facility media record
func (ac *AgentController) DeleteFacilityMedia(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Agent ID not found"})
		return
	}

	id := c.Param("id")
	var media models.FacilityMedia
	if err := ac.db.Where("id = ? AND agent_id = ?", id, agentID).First(&media).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Media not found"})
		return
	}

	// Delete file
	filePath := filepath.Join(ac.cfg.UploadPath, strings.TrimPrefix(media.URL, "/uploads/"))
	os.Remove(filePath)

	if err := ac.db.Delete(&media).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete media"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Media deleted successfully"})
}

// ReorderFacilityMedia updates sort orders for multiple media records
func (ac *AgentController) ReorderFacilityMedia(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Agent ID not found"})
		return
	}

	var req []struct {
		ID        string `json:"id"`
		SortOrder int    `json:"sort_order"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := ac.db.Transaction(func(tx *gorm.DB) error {
		for _, item := range req {
			if err := tx.Model(&models.FacilityMedia{}).Where("id = ? AND agent_id = ?", item.ID, agentID).Update("sort_order", item.SortOrder).Error; err != nil {
				return err
			}
		}
		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reorder media"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Media reordered successfully"})
}

