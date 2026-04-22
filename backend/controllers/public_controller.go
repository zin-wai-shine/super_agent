package controllers

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"super_real_estate/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
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
		Preload("Media").Preload("Agent").Preload("Agent.Theme").Preload("Station").
		Where("is_published = ?", true)

	tenantID, hasTenant := c.Get("tenant_id")
	collectionID := c.Query("collection_id")


	// Filter by property type (supports comma-separated for multi-select)
	if propertyType := c.Query("type"); propertyType != "" {
		types := strings.Split(propertyType, ",")
		if len(types) == 1 {
			query = query.Where("property_type = ?", types[0])
		} else {
			query = query.Where("property_type IN (?)", types)
		}
	}

	// Filter by listing type (supports comma-separated for multi-select)
	if listingType := c.Query("listing_type"); listingType != "" {
		ltypes := strings.Split(listingType, ",")
		if len(ltypes) == 1 {
			query = query.Where("listing_type = ?", ltypes[0])
		} else {
			query = query.Where("listing_type IN (?)", ltypes)
		}
	}

	// Filter by station ID (transit map filtering)
	if stationID := c.Query("station_id"); stationID != "" {
		ids := strings.Split(stationID, ",")
		if len(ids) == 1 {
			query = query.Where("station_id = ?", ids[0])
		} else {
			query = query.Where("station_id IN (?)", ids)
		}
	}

	// Filter by max distance to station (e.g. 600 = show listings within 600m of any station)
	if maxDist := c.Query("max_distance_to_station"); maxDist != "" {
		if dist, err := strconv.Atoi(maxDist); err == nil && dist > 0 {
			query = query.Where("distance_to_station > 0 AND distance_to_station <= ?", dist)
		}
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

	// Filter by bedrooms (supports comma-separated for multi-select)
	if bedrooms := c.Query("bedrooms"); bedrooms != "" {
		bedVals := strings.Split(bedrooms, ",")
		if len(bedVals) == 1 {
			if beds, err := strconv.Atoi(bedVals[0]); err == nil {
				query = query.Where("bedrooms >= ?", beds)
			}
		} else {
			var bedInts []int
			for _, b := range bedVals {
				if n, err := strconv.Atoi(b); err == nil {
					bedInts = append(bedInts, n)
				}
			}
			if len(bedInts) > 0 {
				query = query.Where("bedrooms IN ?", bedInts)
			}
		}
	}
	if bathrooms := c.Query("bathrooms"); bathrooms != "" {
		if n, err := strconv.Atoi(bathrooms); err == nil {
			query = query.Where("bathrooms >= ?", n)
		}
	}

	// Filter by developer or project
	if projectID := c.Query("project_id"); projectID != "" {
		query = query.Where("project_id = ?", projectID)
	} else if developerID := c.Query("developer_id"); developerID != "" {
		// If filtering by developer, we need to join with projects
		query = query.Joins("JOIN projects ON projects.id = listings.project_id").
			Where("projects.developer_id = ?", developerID)
	}
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
	if maxArea := c.Query("max_area"); maxArea != "" {
		if area, err := strconv.ParseFloat(maxArea, 64); err == nil {
			query = query.Where("area <= ?", area)
		}
	}

	// Search in title and description (skip when search is the "Near BTS / MRT stations" quick-search label so only max_distance_to_station applies)
	const nearTransitLabel = "Near BTS / MRT stations"
	if search := c.Query("search"); search != "" && strings.TrimSpace(search) != nearTransitLabel {
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

	// Filter by collection and apply tenant scoping
	if collectionID != "" {
		query = query.Joins("JOIN collection_listings ON collection_listings.listing_id = listings.id").
			Where("collection_listings.collection_id = ?", collectionID)

		if hasTenant {
			// Ensure the collection belongs to the current tenant
			query = query.Joins("JOIN collections ON collections.id = collection_listings.collection_id").
				Where("collections.agent_id = ?", tenantID)
		}
	} else if hasTenant {
		// Standard tenant scoping for non-collection views
		query = query.Where("listings.agent_id = ?", tenantID)
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

// GetProjects returns published projects with optional filters
func (pc *PublicController) GetProjects(c *gin.Context) {
	var projects []models.Project
	query := pc.db.Model(&models.Project{}).Preload("Developer")

	// Tenant filtering (if accessed via agent subdomain)
	if tenantID, exists := c.Get("tenant_id"); exists {
		query = query.Where("agent_id = ?", tenantID)
	}

	// Filter by developer
	if developerID := c.Query("developer"); developerID != "" {
		// Use developer name or ID depending on frontend implementation
		// The mega menu sends developer name aliases like 'sansiri', 'ap', 'origin'. Let's handle generic exact match if it's an ID, or ilike if it's a name
		if _, err := uuid.Parse(developerID); err == nil {
			query = query.Where("developer_id = ?", developerID)
		} else {
			query = query.Joins("JOIN developers ON developers.id = projects.developer_id").Where("developers.name ILIKE ?", "%"+developerID+"%")
		}
	}

	// Filter by status (supports comma-separated for multi-select)
	if status := c.Query("status"); status != "" {
		statuses := strings.Split(status, ",")
		if len(statuses) == 1 {
			query = query.Where("status ILIKE ?", "%"+statuses[0]+"%")
		} else {
			query = query.Where("status IN ?", statuses)
		}
	}

	// Filter by project type (supports comma-separated for multi-select)
	if projectType := c.Query("type"); projectType != "" {
		ptypes := strings.Split(projectType, ",")
		if len(ptypes) == 1 {
			query = query.Where("project_type ILIKE ?", "%"+ptypes[0]+"%")
		} else {
			query = query.Where("project_type IN ?", ptypes)
		}
	}

	// Filter by style/height (if we use style query param)
	if style := c.Query("style"); style != "" {
		query = query.Where("project_type ILIKE ? OR description ILIKE ?", "%"+style+"%", "%"+style+"%")
	}

	// Filter by feature
	if feature := c.Query("feature"); feature != "" {
		query = query.Where("description ILIKE ? OR name ILIKE ?", "%"+feature+"%", "%"+feature+"%")
	}

	// Filter by district
	if district := c.Query("district"); district != "" {
		query = query.Where("district ILIKE ?", "%"+district+"%")
	}

	// Filter by station ID (transit map filtering)
	if stationID := c.Query("station_id"); stationID != "" {
		ids := strings.Split(stationID, ",")
		if len(ids) == 1 {
			query = query.Where("station_id = ?", ids[0])
		} else {
			query = query.Where("station_id IN (?)", ids)
		}
	}

	// Search in name, description, district
	if search := c.Query("search"); search != "" {
		query = query.Where("name ILIKE ? OR description ILIKE ? OR district ILIKE ?",
			"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	// Sorting
	sortBy := c.DefaultQuery("sort", "created_at")
	sortOrder := c.DefaultQuery("order", "desc")

	allowedSorts := map[string]bool{"created_at": true, "name": true}
	allowedOrders := map[string]bool{"asc": true, "desc": true}

	if !allowedSorts[sortBy] {
		sortBy = "created_at"
	}
	if !allowedOrders[sortOrder] {
		sortOrder = "desc"
	}

	query = query.Order(sortBy + " " + sortOrder)

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "12"))
	offset := (page - 1) * limit

	// Get total count
	var total int64
	query.Model(&models.Project{}).Count(&total)

	// Fetch projects
	if err := query.Offset(offset).Limit(limit).Find(&projects).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch projects"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"projects": projects,
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
		"social_links":    agent.SocialLinks,
	})
}

// GetTenantConfig returns the resolved tenant configuration for the frontend
func (pc *PublicController) GetTenantConfig(c *gin.Context) {
	isMainDomain, _ := c.Get("is_main_domain")
	tenantID, tenantExists := c.Get("tenant_id")

	// Calculate system-wide or tenant-specific price range
	var priceRange struct {
		MinPrice float64 `gorm:"column:min_price"`
		MaxPrice float64 `gorm:"column:max_price"`
	}
	priceQuery := pc.db.Model(&models.Listing{}).
		Select("MIN(price) as min_price, MAX(price) as max_price").
		Where("is_published = ?", true)

	if tenantExists {
		priceQuery = priceQuery.Where("agent_id = ?", tenantID)
	}
	priceQuery.Scan(&priceRange)

	response := gin.H{
		"is_main_domain":   isMainDomain,
		"actual_min_price": priceRange.MinPrice,
		"actual_max_price": priceRange.MaxPrice,
	}

	if tenantExists {
		var agent models.Agent
		if err := pc.db.Preload("Theme").First(&agent, "id = ?", tenantID).Error; err == nil {
			// Fallback to agent limits if no listings found for this specifically
			actualMin := priceRange.MinPrice
			actualMax := priceRange.MaxPrice
			if actualMax == 0 {
				actualMin = agent.MinPriceLimit
				actualMax = agent.MaxPriceLimit
			}

			response["agent"] = gin.H{
				"id":               agent.ID,
				"name":             agent.Name,
				"logo":             agent.Logo,
				"description":      agent.Description,
				"vision":           agent.Vision,
				"mission":          agent.Mission,
				"phone":            agent.Phone,
				"email":            agent.Email,
				"address":          agent.Address,
				"theme":            agent.Theme,
				"min_price_limit":  agent.MinPriceLimit,
				"max_price_limit":  agent.MaxPriceLimit,
				"actual_min_price": actualMin,
				"actual_max_price": actualMax,
				"price_format":     agent.PriceFormat,
				"facebook":         agent.Facebook,
				"instagram":        agent.Instagram,
				"linkedin":         agent.LinkedIn,
				"line":             agent.Line,
				"social_links":     agent.SocialLinks,
			}
			// Sync root values
			response["actual_min_price"] = actualMin
			response["actual_max_price"] = actualMax
		}
	} else {
		if response["actual_max_price"] == 0 {
			response["actual_max_price"] = 5000000.0
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

// GetDevelopers returns all developers for the current agent
func (pc *PublicController) GetDevelopers(c *gin.Context) {
	var developers []models.Developer
	query := pc.db.Model(&models.Developer{})

	// Tenant filtering
	if tenantID, exists := c.Get("tenant_id"); exists {
		query = query.Where("agent_id = ?", tenantID)
	}

	if err := query.Order("name ASC").Find(&developers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch developers"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"developers": developers,
		"total":      len(developers),
	})
}

// ServeListingMeta returns a minimal HTML with meta tags for social media crawlers
func (pc *PublicController) ServeListingMeta(c *gin.Context) {
	id := c.Param("id")

	var listing models.Listing
	// Preload media sorted by SortOrder
	if err := pc.db.Preload("Media", func(db *gorm.DB) *gorm.DB {
		return db.Order("sort_order ASC")
	}).Preload("Agent").Preload("Agent.Theme").Where("id = ?", id).First(&listing).Error; err != nil {
		c.String(http.StatusNotFound, "Listing not found")
		return
	}

	title := listing.Title
	// Format price nicely
	priceStr := fmt.Sprintf("%.0f", listing.Price)
	if listing.Price >= 1000000 {
		priceStr = fmt.Sprintf("%.1fM", listing.Price/1000000)
	} else if listing.Price >= 1000 {
		priceStr = fmt.Sprintf("%.0fK", listing.Price/1000)
	}

	description := fmt.Sprintf("฿%s | %d Bed | %d Bath | %.0f sqm", priceStr, listing.Bedrooms, listing.Bathrooms, listing.Area)
	if listing.Description != "" {
		// Basic HTML tag stripping
		cleanDesc := listing.Description
		for strings.Contains(cleanDesc, "<") && strings.Contains(cleanDesc, ">") {
			start := strings.Index(cleanDesc, "<")
			end := strings.Index(cleanDesc, ">")
			if start < end {
				cleanDesc = cleanDesc[:start] + cleanDesc[end+1:]
			} else {
				break
			}
		}
		cleanDesc = strings.ReplaceAll(cleanDesc, "\n", " ")
		cleanDesc = strings.TrimSpace(cleanDesc)

		if len(cleanDesc) > 150 {
			cleanDesc = cleanDesc[:147] + "..."
		}
		description = description + " - " + cleanDesc
	}

	image := ""
	if len(listing.Media) > 0 {
		image = listing.Media[0].URL
	} else if listing.Agent.Theme != nil && listing.Agent.Theme.SharePreviewImage != "" {
		image = listing.Agent.Theme.SharePreviewImage
	} else if listing.Agent.Logo != "" {
		image = listing.Agent.Logo
	}

	// Form absolute URL
	scheme := "https"
	if proto := c.GetHeader("X-Forwarded-Proto"); proto != "" {
		scheme = proto
	}
	host := c.GetHeader("X-Forwarded-Host")
	if host == "" {
		host = c.Request.Host
	}

	if strings.HasPrefix(image, "/") {
		image = fmt.Sprintf("%s://%s%s", scheme, host, image)
	}

	html := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>%s</title>
    <!-- Social Preview Tags (Backend Rendered) -->
    <meta property="og:title" content="%s" />
    <meta property="og:description" content="%s" />
    <meta property="og:image" content="%s" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="%s" />
    <meta name="twitter:description" content="%s" />
    <meta name="twitter:image" content="%s" />
</head>
<body>
    <p>Redirecting to property...</p>
    <script>
        window.location.href = "/listings/%s";
    </script>
</body>
</html>`, title, title, description, image, title, description, image, id)

	c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(html))
}

// ServeAgentMeta handles social previews for the agent's homepage
func (pc *PublicController) ServeAgentMeta(c *gin.Context) {
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		c.String(http.StatusNotFound, "Agent not found")
		return
	}

	var agent models.Agent
	if err := pc.db.Preload("Theme").First(&agent, "id = ?", tenantID).Error; err != nil {
		c.String(http.StatusNotFound, "Agent not found")
		return
	}

	// Use Theme HeaderTitle if set, otherwise Agent Name
	title := agent.Theme.HeaderText
	if title == "" {
		title = agent.Name
	}

	description := agent.Description
	if description == "" {
		description = "Find your dream property near Bangkok's transit lines. High-quality listings, easy search, and professional service."
	}

	// Clean description (remove newlines)
	description = strings.ReplaceAll(description, "\n", " ")
	if len(description) > 300 {
		description = description[:297] + "..."
	}

	image := ""
	if agent.Theme != nil && agent.Theme.SharePreviewImage != "" {
		image = agent.Theme.SharePreviewImage
	} else if agent.Logo != "" {
		image = agent.Logo
	} else {
		// Use a high-quality default if no logo or preview image
		image = "/logo-super.png"
	}

	// Form absolute URL
	scheme := "https"
	if proto := c.GetHeader("X-Forwarded-Proto"); proto != "" {
		scheme = proto
	}
	host := c.GetHeader("X-Forwarded-Host")
	if host == "" {
		host = c.Request.Host
	}

	if strings.HasPrefix(image, "/") {
		if strings.HasPrefix(image, "/uploads") {
			// Ensure it points to the full domain
			image = fmt.Sprintf("%s://%s%s", scheme, host, image)
		} else {
			// Static assets should also be absolute
			image = fmt.Sprintf("%s://%s%s", scheme, host, image)
		}
	}

	html := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>%s</title>
    <!-- Social Preview Tags (Backend Rendered) -->
    <meta property="og:title" content="%s" />
    <meta property="og:description" content="%s" />
    <meta property="og:image" content="%s" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="%s://%s/" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="%s" />
    <meta name="twitter:description" content="%s" />
    <meta name="twitter:image" content="%s" />
    <link rel="icon" href="%s://%s/favicon.ico" />
</head>
<body>
    <h1>%s</h1>
    <p>%s</p>
    <img src="%s" />
    <script>
        // Redirect actual users to the frontend
        window.location.href = "/";
    </script>
</body>
</html>`, title, title, description, image, scheme, host, title, description, image, scheme, host, title, description, image)

	c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(html))
}
