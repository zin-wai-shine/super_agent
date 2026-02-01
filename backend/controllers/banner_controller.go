package controllers

import (
	"net/http"
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
		Title      string `json:"title" binding:"required"`
		ImageURL   string `json:"image_url" binding:"required"`
		LinkURL    string `json:"link_url"`
		TargetRole string `json:"target_role"` // "all", "agent", "public"
		IsActive   bool   `json:"is_active"`
		DaysActive int    `json:"days_active"`
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
		Title:      req.Title,
		ImageURL:   req.ImageURL,
		LinkURL:    req.LinkURL,
		OwnerID:    ownerID,
		TargetRole: req.TargetRole,
		IsActive:   req.IsActive,
		StartDate:  &startDate,
		EndDate:    endDate,
	}

	// Agent created banners are scoped to their site
	if user.Role == models.RoleAgent {
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

// GetBanners fetches active banners
func (bc *BannerController) GetBanners(c *gin.Context) {
	// Query params: context (platform or agent_id)
	agentID := c.Query("agent_id")

	query := bc.db.Where("is_active = ?", true).
		Where("start_date <= ? AND (end_date IS NULL OR end_date >= ?)", time.Now(), time.Now())

	if agentID != "" {
		// Fetch banners for specific agent site (Owner is Agent)
		query = query.Where("agent_id = ?", agentID)
	} else {
		// Fetch Platform banners (AgentID is NULL)
		// Optionally filter by target role if user is logged in
		targetRole := c.Query("target_role")
		if targetRole != "" {
			query = query.Where("agent_id IS NULL").Where("target_role = ? OR target_role = 'all'", targetRole)
		} else {
			// Public platform banners
			query = query.Where("agent_id IS NULL").Where("target_role = 'all' OR target_role = 'public'")
		}
	}

	var banners []models.Banner
	if err := query.Order("created_at DESC").Find(&banners).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch banners"})
		return
	}

	c.JSON(http.StatusOK, banners)
}

// DeleteBanner
func (bc *BannerController) DeleteBanner(c *gin.Context) {
	id := c.Param("id")
	// TODO: Check ownership before delete for Agent
	if err := bc.db.Delete(&models.Banner{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}
