package controllers

import (
	"net/http"
	"strconv"

	"super_real_estate/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type PublicController struct {
	db *gorm.DB
}

func NewPublicController(db *gorm.DB) *PublicController {
	return &PublicController{db: db}
}

// GetListings returns published listings with optional filters
func (pc *PublicController) GetListings(c *gin.Context) {
	var listings []models.Listing
	query := pc.db.Model(&models.Listing{}).
		Preload("Media").Preload("Agent").Preload("Station").
		Where("is_published = ?", true)

	// Tenant filtering (if accessed via agent subdomain)
	if tenantID, exists := c.Get("tenant_id"); exists {
		query = query.Where("agent_id = ?", tenantID)
	}

	// Filter by property type
	if propertyType := c.Query("type"); propertyType != "" {
		query = query.Where("property_type = ?", propertyType)
	}

	// Filter by listing type (sale/rent)
	if listingType := c.Query("listing_type"); listingType != "" {
		query = query.Where("listing_type = ?", listingType)
	}

	// Filter by station ID (transit map filtering)
	if stationID := c.Query("station_id"); stationID != "" {
		query = query.Where("station_id = ?", stationID)
	}

	// Filter by price range
	if minPrice := c.Query("min_price"); minPrice != "" {
		if price, err := strconv.ParseFloat(minPrice, 64); err == nil {
			query = query.Where("price >= ?", price)
		}
	}
	if maxPrice := c.Query("max_price"); maxPrice != "" {
		if price, err := strconv.ParseFloat(maxPrice, 64); err == nil {
			query = query.Where("price <= ?", price)
		}
	}

	// Filter by bedrooms
	if bedrooms := c.Query("bedrooms"); bedrooms != "" {
		if beds, err := strconv.Atoi(bedrooms); err == nil {
			query = query.Where("bedrooms >= ?", beds)
		}
	}

	// Filter by area
	if minArea := c.Query("min_area"); minArea != "" {
		if area, err := strconv.ParseFloat(minArea, 64); err == nil {
			query = query.Where("area >= ?", area)
		}
	}

	// Search in title and description
	if search := c.Query("search"); search != "" {
		query = query.Where("title ILIKE ? OR description ILIKE ? OR address ILIKE ?",
			"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	// Geographic bounds filtering (for map-based search)
	if minLat := c.Query("min_lat"); minLat != "" {
		if lat, err := strconv.ParseFloat(minLat, 64); err == nil {
			query = query.Where("CAST(latitude AS DECIMAL) >= ?", lat)
		}
	}
	if maxLat := c.Query("max_lat"); maxLat != "" {
		if lat, err := strconv.ParseFloat(maxLat, 64); err == nil {
			query = query.Where("CAST(latitude AS DECIMAL) <= ?", lat)
		}
	}
	if minLng := c.Query("min_lng"); minLng != "" {
		if lng, err := strconv.ParseFloat(minLng, 64); err == nil {
			query = query.Where("CAST(longitude AS DECIMAL) >= ?", lng)
		}
	}
	if maxLng := c.Query("max_lng"); maxLng != "" {
		if lng, err := strconv.ParseFloat(maxLng, 64); err == nil {
			query = query.Where("CAST(longitude AS DECIMAL) <= ?", lng)
		}
	}

	// Exclude specific ID (usually for "related properties")
	if excludeID := c.Query("exclude_id"); excludeID != "" {
		query = query.Where("id <> ?", excludeID)
	}

	// Sorting
	sortBy := c.DefaultQuery("sort", "created_at")
	sortOrder := c.DefaultQuery("order", "desc")
	query = query.Order(sortBy + " " + sortOrder)

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "12"))
	offset := (page - 1) * limit

	// Get total count
	var total int64
	query.Model(&models.Listing{}).Count(&total)

	// Fetch listings
	if err := query.Offset(offset).Limit(limit).Find(&listings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch listings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"listings": listings,
		"total":    total,
		"page":     page,
		"limit":    limit,
		"pages":    (total + int64(limit) - 1) / int64(limit),
	})
}

// GetListing returns a single listing by ID
func (pc *PublicController) GetListing(c *gin.Context) {
	id := c.Param("id")

	var listing models.Listing
	query := pc.db.Preload("Media").Preload("Agent").Preload("Agent.Theme").Preload("Station").Where("id = ? AND is_published = ?", id, true)

	// Tenant filtering
	if tenantID, exists := c.Get("tenant_id"); exists {
		query = query.Where("agent_id = ?", tenantID)
	}

	if err := query.First(&listing).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Listing not found"})
		return
	}

	// Increment view count
	pc.db.Model(&listing).Update("view_count", gorm.Expr("view_count + 1"))

	c.JSON(http.StatusOK, listing)
}

// GetStations returns all transit stations
func (pc *PublicController) GetStations(c *gin.Context) {
	var stations []models.Station

	query := pc.db.Model(&models.Station{})

	// Filter by line
	if line := c.Query("line"); line != "" {
		query = query.Where("line_name = ?", line)
	}

	// Filter by status
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Order("line_name, id").Find(&stations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch stations"})
		return
	}

	// Group by line for easier frontend use
	lineStations := make(map[string][]models.Station)
	for _, station := range stations {
		lineStations[station.LineName] = append(lineStations[station.LineName], station)
	}

	c.JSON(http.StatusOK, gin.H{
		"stations": stations,
		"by_line":  lineStations,
		"total":    len(stations),
	})
}

// GetListingsByStation returns listings near a specific transit station
func (pc *PublicController) GetListingsByStation(c *gin.Context) {
	stationID := c.Param("stationId")

	var listings []models.Listing
	query := pc.db.Preload("Media").Preload("Agent").Where("station_id = ? AND is_published = ?", stationID, true)

	// Tenant filtering
	if tenantID, exists := c.Get("tenant_id"); exists {
		query = query.Where("agent_id = ?", tenantID)
	}

	if err := query.Order("created_at DESC").Find(&listings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch listings"})
		return
	}

	// Get station info
	var station models.Station
	pc.db.First(&station, "id = ?", stationID)

	c.JSON(http.StatusOK, gin.H{
		"station":  station,
		"listings": listings,
		"total":    len(listings),
	})
}

// GetAgentInfo returns public agent information
func (pc *PublicController) GetAgentInfo(c *gin.Context) {
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Agent not found"})
		return
	}

	var agent models.Agent
	if err := pc.db.Preload("Theme").First(&agent, "id = ?", tenantID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Agent not found"})
		return
	}

	// Public info only
	c.JSON(http.StatusOK, gin.H{
		"id":              agent.ID,
		"name":            agent.Name,
		"logo":            agent.Logo,
		"description":     agent.Description,
		"vision":          agent.Vision,
		"mission":         agent.Mission,
		"phone":           agent.Phone,
		"email":           agent.Email,
		"address":         agent.Address,
		"theme":           agent.Theme,
		"min_price_limit": agent.MinPriceLimit,
		"max_price_limit": agent.MaxPriceLimit,
		"price_format":    agent.PriceFormat,
		"facebook":        agent.Facebook,
		"instagram":       agent.Instagram,
		"linkedin":        agent.LinkedIn,
		"line":            agent.Line,
	})
}

// GetTenantConfig returns the resolved tenant configuration for the frontend
func (pc *PublicController) GetTenantConfig(c *gin.Context) {
	isMainDomain, _ := c.Get("is_main_domain")
	tenantID, tenantExists := c.Get("tenant_id")

	response := gin.H{
		"is_main_domain": isMainDomain,
	}

	if tenantExists {
		var agent models.Agent
		if err := pc.db.Preload("Theme").First(&agent, "id = ?", tenantID).Error; err == nil {
			response["agent"] = gin.H{
				"id":              agent.ID,
				"name":            agent.Name,
				"logo":            agent.Logo,
				"description":     agent.Description,
				"vision":          agent.Vision,
				"mission":         agent.Mission,
				"phone":           agent.Phone,
				"email":           agent.Email,
				"address":         agent.Address,
				"theme":           agent.Theme,
				"min_price_limit": agent.MinPriceLimit,
				"max_price_limit": agent.MaxPriceLimit,
				"price_format":    agent.PriceFormat,
				"facebook":        agent.Facebook,
				"instagram":       agent.Instagram,
				"linkedin":        agent.LinkedIn,
				"line":            agent.Line,
			}
		}
	}

	c.JSON(http.StatusOK, response)
}

// GetPlans returns active subscription plans for the public sales page
func (pc *PublicController) GetPlans(c *gin.Context) {
	var plans []models.Subscription
	if err := pc.db.Where("is_active = ?", true).Order("price ASC").Find(&plans).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch plans"})
		return
	}
	c.JSON(http.StatusOK, plans)
}
