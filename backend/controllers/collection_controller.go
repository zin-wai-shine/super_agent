package controllers

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"super_real_estate/config"
	"super_real_estate/middleware"
	"super_real_estate/models"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CollectionController struct {
	db  *gorm.DB
	cfg *config.Config
}

func NewCollectionController(db *gorm.DB, cfg *config.Config) *CollectionController {
	return &CollectionController{db: db, cfg: cfg}
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
		Name         string                   `json:"name" binding:"required"`
		Type         string                   `json:"type"`
		IsParent     bool                     `json:"is_parent"`
		Icon         string                   `json:"icon"`
		ParentID     *uuid.UUID               `json:"parent_id"`
		FacilityName string                   `json:"facility_name"`
		Media        []models.CollectionMedia `json:"media"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	for i := range req.Media {
		req.Media[i].SortOrder = i
	}

	collection := models.Collection{
		AgentID:      agentID,
		ParentID:     req.ParentID,
		Name:         req.Name,
		Type:         req.Type,
		IsParent:     req.IsParent,
		Icon:         req.Icon,
		FacilityName: req.FacilityName,
		CreatedBy:    userID.(uuid.UUID),
		Media:        req.Media,
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

	// Pre-fetch facility media
	var facilityNames []string
	for _, col := range collections {
		if col.FacilityName != "" {
			facilityNames = append(facilityNames, col.FacilityName)
		}
	}

	facilityMediaMap := make(map[string][]models.FacilityMedia)
	if len(facilityNames) > 0 {
		var fms []models.FacilityMedia
		cc.db.Where("agent_id = ? AND name IN ?", agentID, facilityNames).Order("sort_order ASC").Find(&fms)
		for _, fm := range fms {
			facilityMediaMap[fm.Name] = append(facilityMediaMap[fm.Name], fm)
		}
	}

	result := []CollectionWithCount{}
	for _, col := range collections {
		var count int64
		cc.db.Model(&models.CollectionListing{}).Where("collection_id = ?", col.ID).Count(&count)

		if col.FacilityName != "" {
			for _, fm := range facilityMediaMap[col.FacilityName] {
				col.Media = append(col.Media, models.CollectionMedia{
					URL:  fm.URL,
					Type: "image",
				})
			}
		}

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

	if collection.FacilityName != "" {
		var facilityMedia []models.FacilityMedia
		cc.db.Where("agent_id = ? AND name = ?", collection.AgentID, collection.FacilityName).Order("sort_order ASC").Find(&facilityMedia)
		
		// Prevent duplicates
		existingUrls := make(map[string]bool)
		for _, m := range collection.Media {
			existingUrls[m.URL] = true
		}

		for _, fm := range facilityMedia {
			if !existingUrls[fm.URL] {
				collection.Media = append(collection.Media, models.CollectionMedia{
					URL:  fm.URL,
					Type: "image",
				})
			}
		}
	}

	c.JSON(http.StatusOK, collection)
}

// UpdateCollection updates a collection name and media
func (cc *CollectionController) UpdateCollection(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Name         string                   `json:"name" binding:"required"`
		Type         string                   `json:"type"`
		IsParent     bool                     `json:"is_parent"`
		Icon         string                   `json:"icon"`
		ParentID     *uuid.UUID               `json:"parent_id"`
		FacilityName string                   `json:"facility_name"`
		Media        []models.CollectionMedia `json:"media"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tx := cc.db.Begin()

	if err := tx.Model(&models.Collection{}).Where("id = ?", id).Updates(map[string]interface{}{
		"name":          req.Name,
		"type":          req.Type,
		"is_parent":     req.IsParent,
		"icon":          req.Icon,
		"parent_id":     req.ParentID,
		"facility_name": req.FacilityName,
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

	// 1. Get associated media to delete files
	var media []models.CollectionMedia
	cc.db.Where("collection_id = ?", id).Find(&media)

	for _, m := range media {
		if m.URL != "" && strings.HasPrefix(m.URL, "/uploads/") {
			filePath := filepath.Join(cc.cfg.UploadPath, strings.TrimPrefix(m.URL, "/uploads/"))
			os.Remove(filePath)
		}
	}

	// 2. Delete database records
	if err := cc.db.Where("collection_id = ?", id).Delete(&models.CollectionMedia{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete collection media"})
		return
	}

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

// ReorderCollections reorders collections by adjusting their created_at timestamps
func (cc *CollectionController) ReorderCollections(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "Agent not found"})
		return
	}

	var req struct {
		CollectionIDs []string `json:"collection_ids" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tx := cc.db.Begin()
	// The collection passed first should have the highest CreatedAt (since ordered DESC)
	// We use time.Now() and subtract 1 second for each subsequent item
	importTime := time.Now()
	for i, id := range req.CollectionIDs {
		newTime := importTime.Add(-time.Duration(i) * time.Second)
		if err := tx.Model(&models.Collection{}).Where("id = ? AND agent_id = ?", id, agentID).Update("created_at", newTime).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reorder collections"})
			return
		}
	}

	tx.Commit()
	c.JSON(http.StatusOK, gin.H{"message": "reordered"})
}
