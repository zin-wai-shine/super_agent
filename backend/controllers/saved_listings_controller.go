package controllers

import (
	"net/http"
	"super_real_estate/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// SavedListingsController handles saved listings operations
type SavedListingsController struct {
	DB *gorm.DB
}

// NewSavedListingsController creates a new saved listings controller
func NewSavedListingsController(db *gorm.DB) *SavedListingsController {
	return &SavedListingsController{DB: db}
}

// SaveListing saves a listing for the authenticated user
func (ctrl *SavedListingsController) SaveListing(c *gin.Context) {
	// Get user from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req struct {
		ListingID string `json:"listing_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	listingUUID, err := uuid.Parse(req.ListingID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid listing ID"})
		return
	}

	// Check if listing exists
	var listing models.Listing
	if err := ctrl.DB.First(&listing, "id = ?", listingUUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Listing not found"})
		return
	}

	// Check if already saved
	var existingSave models.SavedListing
	err = ctrl.DB.Where("user_id = ? AND listing_id = ?", userID, listingUUID).First(&existingSave).Error
	if err == nil {
		c.JSON(http.StatusOK, gin.H{
			"message": "Listing already saved",
			"saved":   true,
		})
		return
	}

	// Create saved listing
	savedListing := models.SavedListing{
		UserID:    userID.(uuid.UUID),
		ListingID: listingUUID,
	}

	if err := ctrl.DB.Create(&savedListing).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save listing"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Listing saved successfully",
		"saved":   true,
		"data":    savedListing,
	})
}

// UnsaveListing removes a saved listing for the authenticated user
func (ctrl *SavedListingsController) UnsaveListing(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	listingID := c.Param("listingId")
	listingUUID, err := uuid.Parse(listingID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid listing ID"})
		return
	}

	// Delete the saved listing
	result := ctrl.DB.Where("user_id = ? AND listing_id = ?", userID, listingUUID).Delete(&models.SavedListing{})
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unsave listing"})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Saved listing not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Listing unsaved successfully",
		"saved":   false,
	})
}

// GetSavedListings retrieves all saved listings for the authenticated user
func (ctrl *SavedListingsController) GetSavedListings(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var savedListings []models.SavedListing
	err := ctrl.DB.
		Preload("Listing.Media").
		Preload("Listing.Agent").
		Preload("Listing.Station").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&savedListings).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch saved listings"})
		return
	}

	// Extract listings from saved listings, and include saved_at timestamp
	type SavedListingItem struct {
		models.Listing
		SavedAt interface{} `json:"saved_at"`
	}
	items := make([]SavedListingItem, 0, len(savedListings))
	for _, saved := range savedListings {
		if saved.Listing != nil {
			items = append(items, SavedListingItem{
				Listing: *saved.Listing,
				SavedAt: saved.CreatedAt,
			})
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  items,
		"count": len(items),
	})
}

// CheckIfSaved checks if a specific listing is saved by the authenticated user
func (ctrl *SavedListingsController) CheckIfSaved(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	listingID := c.Param("listingId")
	listingUUID, err := uuid.Parse(listingID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid listing ID"})
		return
	}

	var savedListing models.SavedListing
	err = ctrl.DB.Where("user_id = ? AND listing_id = ?", userID, listingUUID).First(&savedListing).Error

	isSaved := err == nil

	c.JSON(http.StatusOK, gin.H{
		"saved": isSaved,
	})
}
