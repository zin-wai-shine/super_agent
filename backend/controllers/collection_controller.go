package controllers

import (
	"net/http"
	"super_real_estate/middleware"
	"super_real_estate/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CollectionController struct {
	db *gorm.DB
}

func NewCollectionController(db *gorm.DB) *CollectionController {
	return &CollectionController{db: db}
}

// CreateCollection creates a new collection
func (cc *CollectionController) CreateCollection(c *gin.Context) {
	userID, _ := c.Get("user_id")
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Agent context required"})
		return
	}

	var req struct {
		Name     string                   `json:"name" binding:"required"`
		Icon     string                   `json:"icon"`
		ParentID *uuid.UUID               `json:"parent_id"`
		Media    []models.CollectionMedia `json:"media"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	for i := range req.Media {
		req.Media[i].SortOrder = i
	}

	collection := models.Collection{
		AgentID:   agentID,
		ParentID:  req.ParentID,
		Name:      req.Name,
		Icon:      req.Icon,
		CreatedBy: userID.(uuid.UUID),
		Media:     req.Media,
	}

	if err := cc.db.Create(&collection).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create collection"})
		return
	}

	c.JSON(http.StatusCreated, collection)
}

// GetCollections fetches collections for an agent with listing count
func (cc *CollectionController) GetCollections(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "Agent not found"})
		return
	}

	var collections []models.Collection
	if err := cc.db.Preload("Media", func(db *gorm.DB) *gorm.DB {
		return db.Order("sort_order ASC")
	}).Preload("Parent").Where("agent_id = ?", agentID).Order("created_at DESC").Find(&collections).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch collections"})
		return
	}

	type CollectionWithCount struct {
		models.Collection
		ListingsCount int64 `json:"listings_count"`
	}

	result := []CollectionWithCount{}
	for _, col := range collections {
		var count int64
		cc.db.Model(&models.CollectionListing{}).Where("collection_id = ?", col.ID).Count(&count)
		result = append(result, CollectionWithCount{
			Collection:    col,
			ListingsCount: count,
		})
	}

	c.JSON(http.StatusOK, result)
}

// GetCollection fetches a single collection with its listings
func (cc *CollectionController) GetCollection(c *gin.Context) {
	id := c.Param("id")
	var collection models.Collection
	if err := cc.db.Preload("Media", func(db *gorm.DB) *gorm.DB {
		return db.Order("sort_order ASC")
	}).Preload("Listings.Media").First(&collection, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Collection not found"})
		return
	}

	c.JSON(http.StatusOK, collection)
}

// UpdateCollection updates a collection name and media
func (cc *CollectionController) UpdateCollection(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Name     string                   `json:"name" binding:"required"`
		Icon     string                   `json:"icon"`
		ParentID *uuid.UUID               `json:"parent_id"`
		Media    []models.CollectionMedia `json:"media"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tx := cc.db.Begin()

	if err := tx.Model(&models.Collection{}).Where("id = ?", id).Updates(map[string]interface{}{
		"name":      req.Name,
		"icon":      req.Icon,
		"parent_id": req.ParentID,
	}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update collection"})
		return
	}

	// Replace media
	if err := tx.Where("collection_id = ?", id).Delete(&models.CollectionMedia{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reset media"})
		return
	}

	for i, m := range req.Media {
		m.ID = uuid.Nil
		m.CollectionID = uuid.MustParse(id)
		m.SortOrder = i
		if err := tx.Create(&m).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update media"})
			return
		}
	}

	tx.Commit()

	var updated models.Collection
	cc.db.Preload("Media").First(&updated, "id = ?", id)
	c.JSON(http.StatusOK, updated)
}

// DeleteCollection deletes a collection
func (cc *CollectionController) DeleteCollection(c *gin.Context) {
	id := c.Param("id")
	if err := cc.db.Delete(&models.Collection{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete collection"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

// AddListingToCollection adds a listing to a collection
func (cc *CollectionController) AddListingToCollection(c *gin.Context) {
	colID := c.Param("id")
	listingID := c.Param("listingId")

	cl := models.CollectionListing{
		CollectionID: uuid.MustParse(colID),
		ListingID:    uuid.MustParse(listingID),
	}

	if err := cc.db.Create(&cl).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add listing to collection"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "added"})
}

// RemoveListingFromCollection removes a listing from a collection
func (cc *CollectionController) RemoveListingFromCollection(c *gin.Context) {
	colID := c.Param("id")
	listingID := c.Param("listingId")

	if err := cc.db.Where("collection_id = ? AND listing_id = ?", colID, listingID).Delete(&models.CollectionListing{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove listing from collection"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "removed"})
}
