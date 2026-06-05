package controllers

import (
	"net/http"
	"super_real_estate/models"
	"super_real_estate/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// TranslationController handles manual and batch translations via OpenAI
type TranslationController struct {
	DB        *gorm.DB
	AIService *services.AIService
}

// NewTranslationController creates a new instance
func NewTranslationController(db *gorm.DB) *TranslationController {
	return &TranslationController{
		DB:        db,
		AIService: services.NewAIService(db),
	}
}

// MigrateListings handles batch processing of listings missing translations
func (tc *TranslationController) MigrateListings(c *gin.Context) {
	var listings []models.Listing
	// Find up to 10 listings missing basic translations (to avoid timeouts)
	if err := tc.DB.Where("title_my = '' OR title_zh = '' OR description_my = '' OR description_zh = '' OR title_my IS NULL OR title_zh IS NULL").Limit(10).Find(&listings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch listings"})
		return
	}

	translatedCount := 0
	for _, listing := range listings {
		updated := false

		// Title
		if listing.TitleMY == "" && listing.Title != "" {
			if t, err := tc.AIService.Translate(listing.Title, "my"); err == nil {
				listing.TitleMY = t
				updated = true
			}
		}
		if listing.TitleZH == "" && listing.Title != "" {
			if t, err := tc.AIService.Translate(listing.Title, "zh"); err == nil {
				listing.TitleZH = t
				updated = true
			}
		}

		// Description
		if listing.DescriptionMY == "" && listing.Description != "" {
			if t, err := tc.AIService.Translate(listing.Description, "my"); err == nil {
				listing.DescriptionMY = t
				updated = true
			}
		}
		if listing.DescriptionZH == "" && listing.Description != "" {
			if t, err := tc.AIService.Translate(listing.Description, "zh"); err == nil {
				listing.DescriptionZH = t
				updated = true
			}
		}

		// Features (JSON string)
		if listing.FeaturesMY == "" && listing.Features != "" && listing.Features != "[]" {
			if t, err := tc.AIService.Translate(listing.Features, "my"); err == nil {
				listing.FeaturesMY = t
				updated = true
			}
		}
		if listing.FeaturesZH == "" && listing.Features != "" && listing.Features != "[]" {
			if t, err := tc.AIService.Translate(listing.Features, "zh"); err == nil {
				listing.FeaturesZH = t
				updated = true
			}
		}

		if updated {
			tc.DB.Save(&listing)
			translatedCount++
		}
	}

	var remaining int64
	tc.DB.Model(&models.Listing{}).Where("title_my = '' OR title_zh = '' OR description_my = '' OR description_zh = '' OR title_my IS NULL OR title_zh IS NULL").Count(&remaining)

	c.JSON(http.StatusOK, gin.H{
		"message":          "Batch translation completed successfully",
		"processed_count":  len(listings),
		"translated_count": translatedCount,
		"remaining_count":  remaining,
	})
}
