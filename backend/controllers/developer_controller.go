package controllers

import (
	"net/http"
	"super_real_estate/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type DeveloperController struct {
	db *gorm.DB
}

func NewDeveloperController(db *gorm.DB) *DeveloperController {
	return &DeveloperController{db: db}
}

// ==================== DEVELOPERS ====================

func (dc *DeveloperController) GetDevelopers(c *gin.Context) {
	agentID, _ := c.Get("agent_id")

	var developers []models.Developer
	dc.db.Where("agent_id = ?", agentID).
		Preload("Projects").
		Order("name ASC").
		Find(&developers)

	c.JSON(http.StatusOK, gin.H{"developers": developers})
}

func (dc *DeveloperController) CreateDeveloper(c *gin.Context) {
	agentID, _ := c.Get("agent_id")

	var input struct {
		Name    string `json:"name" binding:"required"`
		Logo    string `json:"logo"`
		Website string `json:"website"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	developer := models.Developer{
		AgentID: agentID.(uuid.UUID),
		Name:    input.Name,
		Logo:    input.Logo,
		Website: input.Website,
	}

	if err := dc.db.Create(&developer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create developer"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"developer": developer})
}

func (dc *DeveloperController) UpdateDeveloper(c *gin.Context) {
	agentID, _ := c.Get("agent_id")
	id := c.Param("id")

	var developer models.Developer
	if err := dc.db.Where("id = ? AND agent_id = ?", id, agentID).First(&developer).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Developer not found"})
		return
	}

	var input struct {
		Name    string `json:"name"`
		Logo    string `json:"logo"`
		Website string `json:"website"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Name != "" {
		developer.Name = input.Name
	}
	developer.Logo = input.Logo
	developer.Website = input.Website

	dc.db.Save(&developer)
	c.JSON(http.StatusOK, gin.H{"developer": developer})
}

func (dc *DeveloperController) DeleteDeveloper(c *gin.Context) {
	agentID, _ := c.Get("agent_id")
	id := c.Param("id")

	// Check if any projects exist for this developer
	var projectCount int64
	dc.db.Model(&models.Project{}).Where("developer_id = ? AND agent_id = ?", id, agentID).Count(&projectCount)
	if projectCount > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot delete developer with existing projects. Delete projects first."})
		return
	}

	result := dc.db.Where("id = ? AND agent_id = ?", id, agentID).Delete(&models.Developer{})
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Developer not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Developer deleted successfully"})
}

// ==================== PROJECTS ====================

func (dc *DeveloperController) GetProjects(c *gin.Context) {
	agentID, _ := c.Get("agent_id")
	developerID := c.Query("developer_id")

	query := dc.db.Where("projects.agent_id = ?", agentID).Preload("Developer").Order("projects.name ASC")

	if developerID != "" {
		query = query.Where("developer_id = ?", developerID)
	}

	var projects []models.Project
	query.Find(&projects)

	c.JSON(http.StatusOK, gin.H{"projects": projects})
}

func (dc *DeveloperController) CreateProject(c *gin.Context) {
	agentID, _ := c.Get("agent_id")

	var input struct {
		Name        string  `json:"name" binding:"required"`
		DeveloperID string  `json:"developer_id" binding:"required"`
		Description string  `json:"description"`
		Status      string  `json:"status"`
		ProjectType string  `json:"project_type"`
		District    string  `json:"district"`
		StationID   string  `json:"station_id"`
		Latitude    float64 `json:"latitude"`
		Longitude   float64 `json:"longitude"`
		CoverImage  string  `json:"cover_image"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	devID, err := uuid.Parse(input.DeveloperID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid developer ID"})
		return
	}

	// Verify developer belongs to this agent
	var dev models.Developer
	if err := dc.db.Where("id = ? AND agent_id = ?", devID, agentID).First(&dev).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Developer not found"})
		return
	}

	project := models.Project{
		AgentID:     agentID.(uuid.UUID),
		DeveloperID: devID,
		Name:        input.Name,
		Description: input.Description,
		Status:      input.Status,
		ProjectType: input.ProjectType,
		District:    input.District,
		StationID:   input.StationID,
		Latitude:    input.Latitude,
		Longitude:   input.Longitude,
		CoverImage:  input.CoverImage,
	}

	if err := dc.db.Create(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create project"})
		return
	}

	// Reload with developer
	dc.db.Preload("Developer").First(&project, "id = ?", project.ID)

	c.JSON(http.StatusCreated, gin.H{"project": project})
}

func (dc *DeveloperController) UpdateProject(c *gin.Context) {
	agentID, _ := c.Get("agent_id")
	id := c.Param("id")

	var project models.Project
	if err := dc.db.Where("id = ? AND agent_id = ?", id, agentID).First(&project).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	var input struct {
		Name        string  `json:"name"`
		DeveloperID string  `json:"developer_id"`
		Description string  `json:"description"`
		Status      string  `json:"status"`
		ProjectType string  `json:"project_type"`
		District    string  `json:"district"`
		StationID   string  `json:"station_id"`
		Latitude    float64 `json:"latitude"`
		Longitude   float64 `json:"longitude"`
		CoverImage  string  `json:"cover_image"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Name != "" {
		project.Name = input.Name
	}

	if input.DeveloperID != "" {
		devID, err := uuid.Parse(input.DeveloperID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid developer ID"})
			return
		}
		// Verify developer belongs to agent
		var dev models.Developer
		if err := dc.db.Where("id = ? AND agent_id = ?", devID, agentID).First(&dev).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Developer not found"})
			return
		}
		project.DeveloperID = devID
	}

	if input.Description != "" {
		project.Description = input.Description
	}
	if input.Status != "" {
		project.Status = input.Status
	}
	if input.ProjectType != "" {
		project.ProjectType = input.ProjectType
	}
	if input.District != "" {
		project.District = input.District
	}
	if input.StationID != "" {
		project.StationID = input.StationID
	}
	if input.Latitude != 0 {
		project.Latitude = input.Latitude
	}
	if input.Longitude != 0 {
		project.Longitude = input.Longitude
	}
	if input.CoverImage != "" {
		project.CoverImage = input.CoverImage
	}

	dc.db.Save(&project)

	// Reload with developer
	dc.db.Preload("Developer").First(&project, "id = ?", project.ID)

	c.JSON(http.StatusOK, gin.H{"project": project})
}

func (dc *DeveloperController) DeleteProject(c *gin.Context) {
	agentID, _ := c.Get("agent_id")
	id := c.Param("id")

	// Check if any listings reference this project
	var listingCount int64
	dc.db.Model(&models.Listing{}).Where("project_id = ?", id).Count(&listingCount)
	if listingCount > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot delete project with existing listings. Remove project from listings first."})
		return
	}

	result := dc.db.Where("id = ? AND agent_id = ?", id, agentID).Delete(&models.Project{})
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Project deleted successfully"})
}
