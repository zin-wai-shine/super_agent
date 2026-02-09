package controllers

import (
	"net/http"
	"strings"
	"super_real_estate/models"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BannerController struct {
	db *gorm.DB
}

func NewBannerController(db *gorm.DB) *BannerController {
	return &BannerController{db: db}
}

// CreateBanner creates a new banner
func (bc *BannerController) CreateBanner(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	ownerID := userID.(uuid.UUID)

	var user models.User
	bc.db.First(&user, "id = ?", ownerID)

	var req struct {
		Title       string `json:"title" binding:"required"`
		Description string `json:"description"`
		ImageURL    string `json:"image_url" binding:"required"`
		LinkURL     string `json:"link_url"`
		TargetRole  string `json:"target_role"` // "all", "agent", "public"
		IsActive    bool   `json:"is_active"`
		DaysActive  int    `json:"days_active"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	startDate := time.Now()
	var endDate *time.Time
	if req.DaysActive > 0 {
		end := startDate.AddDate(0, 0, req.DaysActive)
		endDate = &end
	}

	banner := models.Banner{
		Title:       req.Title,
		Description: req.Description,
		ImageURL:    req.ImageURL,
		LinkURL:     req.LinkURL,
		OwnerID:     ownerID,
		TargetRole:  req.TargetRole,
		IsActive:    req.IsActive,
		StartDate:   &startDate,
		EndDate:     endDate,
	}

	// Agent created banners are scoped to their site
	if user.Role == models.RoleAgent || user.Role == models.RoleSubAgent {
		banner.AgentID = user.AgentID
	} else if user.Role != models.RoleSuperAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
		return
	}

	if err := bc.db.Create(&banner).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create banner"})
		return
	}

	c.JSON(http.StatusCreated, banner)
}

// GetBanners fetches banners with strict scoping
func (bc *BannerController) GetBanners(c *gin.Context) {
	query := bc.db.Order("created_at DESC")

	// Check context: Public or Management
	isPublic := strings.Contains(c.Request.URL.Path, "/public/")

	if isPublic {
		// PUBLIC VIEW: Strict filtering (Active only, Valid Dates)
		query = query.Where("is_active = ?", true).
			Where("start_date <= ? AND (end_date IS NULL OR end_date >= ?)", time.Now(), time.Now())

		agentID := c.Query("agent_id")
		if agentID != "" {
			// Show Agent specific banners AND Platform banners (Global)
			query = query.Where(bc.db.Where("agent_id = ?", agentID).Or("agent_id IS NULL"))
		} else {
			// Platform only
			query = query.Where("agent_id IS NULL")
		}

		// Public Target Role Filtering
		targetRole := c.Query("target_role")
		if targetRole != "" {
			query = query.Where("target_role = ? OR target_role = 'all'", targetRole)
		} else {
			query = query.Where("target_role = 'all' OR target_role = 'public'")
		}

	} else {
		// MANAGEMENT VIEW: Scoped by User Role (Show All Status: Active/Inactive)
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		var user models.User
		if err := bc.db.First(&user, "id = ?", userID.(uuid.UUID)).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			return
		}

		if user.Role == models.RoleSuperAdmin {
			// Super Admin manages Platform Banners
			query = query.Where("agent_id IS NULL")
		} else if (user.Role == models.RoleAgent || user.Role == models.RoleSubAgent) && user.AgentID != nil {
			// Agents manage their Agency Banners
			query = query.Where("agent_id = ?", user.AgentID)
		} else {
			// Others see nothing
			c.JSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
			return
		}
	}

	var banners []models.Banner
	if err := query.Find(&banners).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch banners"})
		return
	}

	c.JSON(http.StatusOK, banners)
}

// GetBanner fetches a single banner
func (bc *BannerController) GetBanner(c *gin.Context) {
	id := c.Param("id")
	var banner models.Banner
	if err := bc.db.First(&banner, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Banner not found"})
		return
	}
	c.JSON(http.StatusOK, banner)
}

// UpdateBanner updates an existing banner
func (bc *BannerController) UpdateBanner(c *gin.Context) {
	id := c.Param("id")
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	ownerID := userID.(uuid.UUID)

	var user models.User
	bc.db.First(&user, "id = ?", ownerID)

	var banner models.Banner
	if err := bc.db.First(&banner, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Banner not found"})
		return
	}

	// Check ownership
	if user.Role != models.RoleSuperAdmin {
		if banner.OwnerID != ownerID && (banner.AgentID == nil || *banner.AgentID != *user.AgentID) {
			c.JSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
			return
		}
	}

	var req struct {
		Title       string `json:"title" binding:"required"`
		Description string `json:"description"`
		ImageURL    string `json:"image_url" binding:"required"`
		LinkURL     string `json:"link_url"`
		TargetRole  string `json:"target_role"`
		IsActive    bool   `json:"is_active"`
		DaysActive  int    `json:"days_active"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update dates if needed
	if req.DaysActive > 0 {
		startDate := time.Now()
		banner.StartDate = &startDate
		end := startDate.AddDate(0, 0, req.DaysActive)
		banner.EndDate = &end
	}

	banner.Title = req.Title
	banner.Description = req.Description
	banner.ImageURL = req.ImageURL
	banner.LinkURL = req.LinkURL
	banner.TargetRole = req.TargetRole
	banner.IsActive = req.IsActive
	// DaysActive is not stored in DB, only used to calculate EndDate

	if err := bc.db.Save(&banner).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update banner"})
		return
	}

	c.JSON(http.StatusOK, banner)
}

// DeleteBanner
func (bc *BannerController) DeleteBanner(c *gin.Context) {
	id := c.Param("id")
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	ownerID := userID.(uuid.UUID)

	var user models.User
	bc.db.First(&user, "id = ?", ownerID)

	var banner models.Banner
	if err := bc.db.First(&banner, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Banner not found"})
		return
	}

	// Check ownership
	if user.Role != models.RoleSuperAdmin {
		if banner.OwnerID != ownerID && (banner.AgentID == nil || user.AgentID == nil || *banner.AgentID != *user.AgentID) {
			c.JSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
			return
		}
	}

	if err := bc.db.Delete(&banner).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}
