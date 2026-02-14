package controllers

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"super_real_estate/middleware"
	"super_real_estate/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AppointmentController struct {
	db *gorm.DB
}

func NewAppointmentController(db *gorm.DB) *AppointmentController {
	return &AppointmentController{db: db}
}

// CreateAppointment allows public users to book a property viewing (no auth required)
func (ac *AppointmentController) CreateAppointment(c *gin.Context) {
	var input struct {
		ListingID     string `json:"listing_id" binding:"required"`
		FullName      string `json:"full_name" binding:"required"`
		Email         string `json:"email" binding:"required,email"`
		Phone         string `json:"phone" binding:"required"`
		PreferredDate string `json:"preferred_date" binding:"required"` // YYYY-MM-DD
		PreferredTime string `json:"preferred_time" binding:"required"` // HH:MM
		Purpose       string `json:"purpose" binding:"required"`        // rent or buy
		Message       string `json:"message"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
		return
	}

	// Validate purpose
	if input.Purpose != "rent" && input.Purpose != "buy" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Purpose must be 'rent' or 'buy'"})
		return
	}

	// Parse preferred date
	preferredDate, err := time.Parse("2006-01-02", input.PreferredDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
		return
	}

	// Date must be today or in the future
	today := time.Now().Truncate(24 * time.Hour)
	if preferredDate.Before(today) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Preferred date must be today or in the future"})
		return
	}

	// Verify listing exists and is published
	var listing models.Listing
	if err := ac.db.Where("id = ? AND is_published = ?", input.ListingID, true).First(&listing).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Listing not found or not published"})
		return
	}

	appointment := models.Appointment{
		ListingID:     listing.ID,
		AgentID:       listing.AgentID,
		FullName:      input.FullName,
		Email:         input.Email,
		Phone:         input.Phone,
		PreferredDate: preferredDate,
		PreferredTime: input.PreferredTime,
		Purpose:       input.Purpose,
		Message:       input.Message,
		Status:        models.AppointmentPending,
	}

	if err := ac.db.Create(&appointment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create appointment"})
		return
	}

	// Reload with listing info
	ac.db.Preload("Listing").First(&appointment, "id = ?", appointment.ID)

	c.JSON(http.StatusCreated, gin.H{
		"message":     "Appointment booked successfully",
		"appointment": appointment,
	})
}

// GetAppointments returns appointments for the agent's listings (agent-protected)
func (ac *AppointmentController) GetAppointments(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Agent not found"})
		return
	}

	query := ac.db.Model(&models.Appointment{}).
		Preload("Listing").Preload("Listing.Media").
		Where("appointments.agent_id = ?", agentID)

	// Filter by status
	if status := c.Query("status"); status != "" {
		query = query.Where("appointments.status = ?", status)
	}

	// Filter by purpose
	if purpose := c.Query("purpose"); purpose != "" {
		query = query.Where("appointments.purpose = ?", purpose)
	}

	// Search by visitor name or email
	if search := c.Query("search"); search != "" {
		query = query.Where("appointments.full_name ILIKE ? OR appointments.email ILIKE ?",
			"%"+search+"%", "%"+search+"%")
	}

	// Filter by date range
	if dateFrom := c.Query("date_from"); dateFrom != "" {
		if t, err := time.Parse("2006-01-02", dateFrom); err == nil {
			query = query.Where("appointments.preferred_date >= ?", t)
		}
	}
	if dateTo := c.Query("date_to"); dateTo != "" {
		if t, err := time.Parse("2006-01-02", dateTo); err == nil {
			query = query.Where("appointments.preferred_date <= ?", t)
		}
	}

	// Sorting
	sortBy := c.DefaultQuery("sort", "created_at")
	sortOrder := c.DefaultQuery("order", "desc")
	query = query.Order("appointments." + sortBy + " " + sortOrder)

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset := (page - 1) * limit

	// Get total count (for filtered results)
	var total int64
	query.Count(&total)

	// Fetch appointments
	var appointments []models.Appointment
	if err := query.Offset(offset).Limit(limit).Find(&appointments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch appointments"})
		return
	}

	// Populate LateCancellationCount and IsRegistered for each appointment
	for i := range appointments {
		var user models.User
		if err := ac.db.Where("TRIM(LOWER(email)) = ?", strings.TrimSpace(strings.ToLower(appointments[i].Email))).First(&user).Error; err == nil {
			appointments[i].LateCancellationCount = user.LateCancellationCount
			appointments[i].IsRegistered = true
		}
	}

	// Calculate global stats for this agent (not affected by current filters)
	type GlobalStats struct {
		Pending   int64 `json:"pending"`
		Confirmed int64 `json:"confirmed"`
		Completed int64 `json:"completed"`
		Cancelled int64 `json:"cancelled"`
		Total     int64 `json:"total"`
	}
	var stats GlobalStats
	ac.db.Model(&models.Appointment{}).Where("agent_id = ?", agentID).Count(&stats.Total)
	ac.db.Model(&models.Appointment{}).Where("agent_id = ? AND status = ?", agentID, models.AppointmentPending).Count(&stats.Pending)
	ac.db.Model(&models.Appointment{}).Where("agent_id = ? AND status = ?", agentID, models.AppointmentConfirmed).Count(&stats.Confirmed)
	ac.db.Model(&models.Appointment{}).Where("agent_id = ? AND status = ?", agentID, models.AppointmentCompleted).Count(&stats.Completed)
	ac.db.Model(&models.Appointment{}).Where("agent_id = ? AND status = ?", agentID, models.AppointmentCancelled).Count(&stats.Cancelled)

	c.JSON(http.StatusOK, gin.H{
		"appointments": appointments,
		"total":        total,
		"page":         page,
		"limit":        limit,
		"pages":        (total + int64(limit) - 1) / int64(limit),
		"stats":        stats,
	})
}

// GetAppointment returns a single appointment detail (agent-protected)
func (ac *AppointmentController) GetAppointment(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Agent not found"})
		return
	}

	id := c.Param("id")
	var appointment models.Appointment
	if err := ac.db.Preload("Listing").Preload("Listing.Media").
		Where("id = ? AND agent_id = ?", id, agentID).
		First(&appointment).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
		return
	}

	// Populate LateCancellationCount and IsRegistered
	var user models.User
	if err := ac.db.Where("TRIM(LOWER(email)) = ?", strings.TrimSpace(strings.ToLower(appointment.Email))).First(&user).Error; err == nil {
		appointment.LateCancellationCount = user.LateCancellationCount
		appointment.IsRegistered = true
	}

	c.JSON(http.StatusOK, appointment)
}

// UpdateAppointmentStatus updates appointment status and agent notes (agent-protected)
func (ac *AppointmentController) UpdateAppointmentStatus(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Agent not found"})
		return
	}

	id := c.Param("id")
	var appointment models.Appointment
	if err := ac.db.Where("id = ? AND agent_id = ?", id, agentID).First(&appointment).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
		return
	}

	var input struct {
		Status     string `json:"status"`
		AgentNotes string `json:"agent_notes"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Validate status if provided
	if input.Status != "" {
		validStatuses := map[string]bool{
			models.AppointmentPending:   true,
			models.AppointmentConfirmed: true,
			models.AppointmentCompleted: true,
			models.AppointmentCancelled: true,
		}
		if !validStatuses[input.Status] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status. Must be: pending, confirmed, completed, or cancelled"})
			return
		}

		// Handle late cancellation warning logic
		if appointment.Status == models.AppointmentConfirmed && input.Status == models.AppointmentCancelled {
			// Find user by email and increment LateCancellationCount
			var user models.User
			if err := ac.db.Where("TRIM(LOWER(email)) = ?", strings.TrimSpace(strings.ToLower(appointment.Email))).First(&user).Error; err == nil {
				ac.db.Model(&user).Update("late_cancellation_count", user.LateCancellationCount+1)
			}
		}

		appointment.Status = input.Status
	}

	if input.AgentNotes != "" {
		appointment.AgentNotes = input.AgentNotes
	}

	if err := ac.db.Save(&appointment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update appointment"})
		return
	}

	// Reload with listing
	ac.db.Preload("Listing").First(&appointment, "id = ?", appointment.ID)

	c.JSON(http.StatusOK, gin.H{
		"message":     "Appointment updated successfully",
		"appointment": appointment,
	})
}

// DeleteAppointment soft-deletes an appointment (agent-protected)
func (ac *AppointmentController) DeleteAppointment(c *gin.Context) {
	agentID, ok := middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Agent not found"})
		return
	}

	id := c.Param("id")
	var appointment models.Appointment
	if err := ac.db.Where("id = ? AND agent_id = ?", id, agentID).First(&appointment).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
		return
	}

	if err := ac.db.Delete(&appointment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete appointment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Appointment deleted successfully"})
}

// GetAllAppointments returns all appointments across the platform (admin-protected)
func (ac *AppointmentController) GetAllAppointments(c *gin.Context) {
	query := ac.db.Model(&models.Appointment{}).
		Preload("Listing").Preload("Agent")

	// Filter by status
	if status := c.Query("status"); status != "" {
		query = query.Where("appointments.status = ?", status)
	}

	// Filter by agent
	if agentID := c.Query("agent_id"); agentID != "" {
		query = query.Where("appointments.agent_id = ?", agentID)
	}

	// Search
	if search := c.Query("search"); search != "" {
		query = query.Where("appointments.full_name ILIKE ? OR appointments.email ILIKE ?",
			"%"+search+"%", "%"+search+"%")
	}

	// Sorting
	sortBy := c.DefaultQuery("sort", "created_at")
	sortOrder := c.DefaultQuery("order", "desc")
	query = query.Order("appointments." + sortBy + " " + sortOrder)

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset := (page - 1) * limit

	var total int64
	query.Count(&total)

	var appointments []models.Appointment
	if err := query.Offset(offset).Limit(limit).Find(&appointments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch appointments"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"appointments": appointments,
		"total":        total,
		"page":         page,
		"limit":        limit,
		"pages":        (total + int64(limit) - 1) / int64(limit),
	})
}

// GetAppointmentStats returns appointment statistics (admin-protected)
func (ac *AppointmentController) GetAppointmentStats(c *gin.Context) {
	type StatusCount struct {
		Status string `json:"status"`
		Count  int64  `json:"count"`
	}

	var statusCounts []StatusCount
	ac.db.Model(&models.Appointment{}).
		Select("status, count(*) as count").
		Group("status").
		Find(&statusCounts)

	var totalAppointments int64
	ac.db.Model(&models.Appointment{}).Count(&totalAppointments)

	// Today's appointments
	today := time.Now().Truncate(24 * time.Hour)
	var todayCount int64
	ac.db.Model(&models.Appointment{}).
		Where("preferred_date = ?", today).
		Count(&todayCount)

	// This week
	weekStart := today.AddDate(0, 0, -int(today.Weekday()))
	weekEnd := weekStart.AddDate(0, 0, 7)
	var weekCount int64
	ac.db.Model(&models.Appointment{}).
		Where("preferred_date >= ? AND preferred_date < ?", weekStart, weekEnd).
		Count(&weekCount)

	c.JSON(http.StatusOK, gin.H{
		"total":     totalAppointments,
		"today":     todayCount,
		"this_week": weekCount,
		"by_status": statusCounts,
	})
}

// GetMyAppointments returns appointments for the logged-in user (based on email)
func (ac *AppointmentController) GetMyAppointments(c *gin.Context) {
	email, exists := c.Get("email")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User email not found in context"})
		return
	}

	userEmail := strings.TrimSpace(strings.ToLower(email.(string)))

	var appointments []models.Appointment
	if err := ac.db.Model(&models.Appointment{}).
		Preload("Listing").Preload("Listing.Media").
		Where("TRIM(LOWER(email)) = ?", userEmail).
		Order("created_at desc").
		Find(&appointments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch appointments"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"appointments": appointments,
	})
}
