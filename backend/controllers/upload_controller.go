package controllers

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"super_real_estate/config"
	"super_real_estate/middleware"
	"super_real_estate/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// secureFilename returns a cryptographically random filename with the given extension.
// Example: a1b2c3d4e5f6...32hexchars.jpg — unguessable, no user/original name exposed.
func secureFilename(ext string) string {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return uuid.New().String() + ext
	}
	return hex.EncodeToString(b) + ext
}

type UploadController struct {
	db  *gorm.DB
	cfg *config.Config
}

func NewUploadController(db *gorm.DB, cfg *config.Config) *UploadController {
	return &UploadController{db: db, cfg: cfg}
}

// Allowed file extensions
var (
	allowedImageTypes = map[string]bool{
		".jpg": true, ".jpeg": true, ".png": true, ".gif": true, ".webp": true,
	}
	allowedVideoTypes = map[string]bool{
		".mp4": true, ".webm": true, ".mov": true, ".avi": true,
	}
	maxImageSize int64 = 10 * 1024 * 1024  // 10MB
	maxVideoSize int64 = 100 * 1024 * 1024 // 100MB
)

// UploadImage handles image uploads
func (uc *UploadController) UploadImage(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Agent ID not found"})
		return
	}

	// Get listing ID
	listingID := c.PostForm("listing_id")
	if listingID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Listing ID required"})
		return
	}

	// Verify listing belongs to agent
	var listing models.Listing
	if err := uc.db.Where("id = ? AND agent_id = ?", listingID, agentID).First(&listing).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Listing not found"})
		return
	}

	// Get file
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}
	defer file.Close()

	// Check file size
	if header.Size > maxImageSize {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File too large. Maximum 10MB allowed"})
		return
	}

	// Check file type
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedImageTypes[ext] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file type. Allowed: jpg, jpeg, png, gif, webp"})
		return
	}

	// Create directory structure
	uploadDir := filepath.Join(uc.cfg.UploadPath, agentID.String(), "images")
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
		return
	}

	// Secure random filename (no original name, no predictable pattern)
	filename := secureFilename(ext)
	filePath := filepath.Join(uploadDir, filename)

	// Save file
	if err := c.SaveUploadedFile(header, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	// Create media record
	listingUUID, _ := uuid.Parse(listingID)
	media := models.Media{
		ListingID: listingUUID,
		Type:      "image",
		URL:       fmt.Sprintf("/uploads/%s/images/%s", agentID.String(), filename),
		Caption:   c.PostForm("caption"),
	}

	if err := uc.db.Create(&media).Error; err != nil {
		// Clean up file on error
		os.Remove(filePath)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save media record"})
		return
	}

	c.JSON(http.StatusCreated, media)
}

// UploadVideo handles video uploads
func (uc *UploadController) UploadVideo(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Agent ID not found"})
		return
	}

	// Get listing ID
	listingID := c.PostForm("listing_id")
	if listingID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Listing ID required"})
		return
	}

	// Verify listing belongs to agent
	var listing models.Listing
	if err := uc.db.Where("id = ? AND agent_id = ?", listingID, agentID).First(&listing).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Listing not found"})
		return
	}

	// Get file
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}
	defer file.Close()

	// Check file size
	if header.Size > maxVideoSize {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File too large. Maximum 100MB allowed"})
		return
	}

	// Check file type
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedVideoTypes[ext] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file type. Allowed: mp4, webm, mov, avi"})
		return
	}

	// Create directory structure
	uploadDir := filepath.Join(uc.cfg.UploadPath, agentID.String(), "videos")
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
		return
	}

	// Secure random filename
	filename := secureFilename(ext)
	filePath := filepath.Join(uploadDir, filename)

	// Save file
	if err := c.SaveUploadedFile(header, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	// Create media record
	listingUUID, _ := uuid.Parse(listingID)
	media := models.Media{
		ListingID: listingUUID,
		Type:      "video",
		URL:       fmt.Sprintf("/uploads/%s/videos/%s", agentID.String(), filename),
		Caption:   c.PostForm("caption"),
	}

	if err := uc.db.Create(&media).Error; err != nil {
		os.Remove(filePath)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save media record"})
		return
	}

	c.JSON(http.StatusCreated, media)
}

// DeleteMedia deletes a media file
func (uc *UploadController) DeleteMedia(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Agent ID not found"})
		return
	}

	mediaID := c.Param("id")

	// Get media record
	var media models.Media
	if err := uc.db.First(&media, "id = ?", mediaID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Media not found"})
		return
	}

	// Verify ownership through listing
	var listing models.Listing
	if err := uc.db.Where("id = ? AND agent_id = ?", media.ListingID, agentID).First(&listing).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized to delete this media"})
		return
	}

	// Delete file
	filePath := filepath.Join(uc.cfg.UploadPath, strings.TrimPrefix(media.URL, "/uploads/"))
	os.Remove(filePath)

	// Delete record
	if err := uc.db.Delete(&media).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete media"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Media deleted successfully"})
}

// UploadLogo handles agent logo uploads
func (uc *UploadController) UploadLogo(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Agent ID not found"})
		return
	}

	// Get file
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}
	defer file.Close()

	// Check file size (logos should be smaller, e.g., 2MB)
	if header.Size > 2*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Logo too large. Maximum 2MB allowed"})
		return
	}

	// Check file type
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedImageTypes[ext] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file type. Allowed: jpg, jpeg, png, webp, gif"})
		return
	}

	// Create directory structure
	uploadDir := filepath.Join(uc.cfg.UploadPath, agentID.String(), "logos")
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
		return
	}

	// Secure random filename (no "logo_" prefix — unguessable)
	filename := secureFilename(ext)
	filePath := filepath.Join(uploadDir, filename)

	// Save file
	if err := c.SaveUploadedFile(header, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save logo"})
		return
	}

	logoURL := fmt.Sprintf("/uploads/%s/logos/%s", agentID.String(), filename)

	c.JSON(http.StatusOK, gin.H{
		"url": logoURL,
	})
}

// UploadBanner handles agent banner uploads
func (uc *UploadController) UploadBanner(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Agent ID not found"})
		return
	}

	// Get file
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}
	defer file.Close()

	// Check file size (banners can be larger, e.g., 5MB)
	if header.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Banner too large. Maximum 5MB allowed"})
		return
	}

	// Check file type
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedImageTypes[ext] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file type. Allowed: jpg, jpeg, png, webp, gif"})
		return
	}

	// Create directory structure
	uploadDir := filepath.Join(uc.cfg.UploadPath, agentID.String(), "banners")
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
		return
	}

	// Secure random filename (no "banner_" prefix — unguessable)
	filename := secureFilename(ext)
	filePath := filepath.Join(uploadDir, filename)

	// Save file
	if err := c.SaveUploadedFile(header, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save banner"})
		return
	}

	bannerURL := fmt.Sprintf("/uploads/%s/banners/%s", agentID.String(), filename)
	c.JSON(http.StatusOK, gin.H{"url": bannerURL})
}
