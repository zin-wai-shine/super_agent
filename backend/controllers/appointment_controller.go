package controllers

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"super_real_estate/middleware"
	"super_real_estate/models"

	"super_real_estate/utils"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AppointmentController struct {
	db *gorm.DB
	ws *utils.WebSocketManager
}

func NewAppointmentController(db *gorm.DB, ws *utils.WebSocketManager) *AppointmentController {
	return &AppointmentController{db: db, ws: ws}
}

const (
	MaxDailyAppointments   = 6
	LeadTimeHours          = 12
	BookingHorizonDays     = 14
	AppointmentDurationMin = 45
	BufferZoneMin          = 15
	SoftLockDurationMin    = 10
)

// CreateAppointment handles the final step of booking (replaces or enhances previous logic)
func (ac *AppointmentController) CreateAppointment(c *gin.Context) {
	var input struct {
		ID            string `json:"id"` // Optional ID for soft-locked appointment
		ListingID     string `json:"listing_id" binding:"required"`
		FullName      string `json:"full_name" binding:"required"`
		Email         string `json:"email" binding:"required,email"`
		Phone         string `json:"phone" binding:"required"`
		PreferredDate string `json:"preferred_date" binding:"required"`
		PreferredTime string `json:"preferred_time" binding:"required"`
		Purpose       string `json:"purpose" binding:"required"`
		Message       string `json:"message"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
		return
	}

	preferredDate, _ := time.Parse("2006-01-02", input.PreferredDate)

	// Verify listing
	var listing models.Listing
	if err := ac.db.First(&listing, "id = ?", input.ListingID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Listing not found"})
		return
	}

	// FINAL CONFLICT VALIDATION (Millisecond-level check)
	// Check if the slot is still available (not taken by someone else)
	if !ac.isSlotAvailable(listing.ID, preferredDate, input.PreferredTime, input.ID) {
		c.JSON(http.StatusConflict, gin.H{"error": "This slot has just been taken by someone else. Please choose another time."})
		return
	}

	var appointment models.Appointment
	if input.ID != "" {
		// Use existing soft-locked appointment
		if err := ac.db.Where("id = ? AND status = ?", input.ID, models.AppointmentPending).First(&appointment).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Booking session expired or not found"})
			return
		}
	} else {
		// Manual creation (fallback)
		appointment.ListingID = listing.ID
		appointment.AgentID = listing.AgentID
	}

	appointment.FullName = input.FullName
	appointment.Email = input.Email
	appointment.Phone = input.Phone
	appointment.PreferredDate = preferredDate
	appointment.PreferredTime = input.PreferredTime
	appointment.Purpose = input.Purpose
	appointment.Message = input.Message
	appointment.Status = models.AppointmentPending // Final step confirms it to pending, awaiting agent approval
	appointment.ExpiresAt = nil                    // Clear expiration

	if err := ac.db.Save(&appointment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to finalize booking"})
		return
	}

	// Trigger real-time notification to the agent
	notification := models.Notification{
		Title:         "New Viewing Request",
		Message:       fmt.Sprintf("%s requested a viewing for %s on %s at %s", appointment.FullName, listing.Title, appointment.PreferredDate.Format("2006-01-02"), appointment.PreferredTime),
		SenderID:      uuid.Nil, // System notification
		ReceiverID:    &listing.AgentID,
		TargetAgentID: &listing.AgentID,
		Type:          "info",
	}
	ac.db.Create(&notification)
	ac.ws.BroadcastToUser(listing.AgentID, gin.H{
		"type":    "notification",
		"payload": notification,
	})
	// Broadcast a specific event to refresh the appointments table
	ac.ws.BroadcastToUser(listing.AgentID, gin.H{
		"type":    "appointment_created",
		"payload": appointment,
	})

	c.JSON(http.StatusOK, gin.H{
		"message":     "Appointment confirmed successfully",
		"appointment": appointment,
	})
}

// GetAvailableSlots returns available time slots for a specific listing and date
func (ac *AppointmentController) GetAvailableSlots(c *gin.Context) {
	listingID := c.Query("listing_id")
	dateStr := c.Query("date")

	if listingID == "" || dateStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "listing_id and date are required"})
		return
	}

	preferredDate, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
		return
	}

	// 14-Day Horizon check
	now := time.Now()
	horizon := now.AddDate(0, 0, BookingHorizonDays).Truncate(24 * time.Hour)
	if preferredDate.After(horizon) {
		c.JSON(http.StatusOK, gin.H{"slots": []string{}, "message": "Booking window is limited to 14 days"})
		return
	}

	// 12-Hour Lead Time check
	leadTime := now.Add(time.Hour * LeadTimeHours)
	// This is a bit complex as we need to check both date and time,
	// but for the daily slots we check if the entire date is too early or part of it.

	var listing models.Listing
	if err := ac.db.First(&listing, "id = ?", listingID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Listing not found"})
		return
	}

	// Daily Appointment Cap Check (Property-Level)
	var dailyCount int64
	ac.db.Model(&models.Appointment{}).
		Where("listing_id = ? AND preferred_date = ? AND status IN (?)",
			listing.ID, preferredDate, []string{models.AppointmentConfirmed, models.AppointmentPending}).
		Count(&dailyCount)

	if dailyCount >= MaxDailyAppointments {
		c.JSON(http.StatusOK, gin.H{"slots": []string{}, "message": "Daily appointment limit reached for this agent"})
		return
	}

	// Generate candidate slots
	candidates := []string{"09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"}

	type SlotInfo struct {
		Time   string `json:"time"`
		Status string `json:"status"`
	}
	var availableSlots []SlotInfo

	for _, timeStr := range candidates {
		// Lead time check for each slot
		slotTime, _ := time.Parse("2006-01-02 15:04", dateStr+" "+timeStr)
		if slotTime.Before(leadTime) {
			continue
		}

		status := "locked"
		if ac.isSlotAvailable(listing.ID, preferredDate, timeStr, "") {
			status = "available"
		}

		availableSlots = append(availableSlots, SlotInfo{
			Time:   timeStr,
			Status: status,
		})
	}

	c.JSON(http.StatusOK, gin.H{"slots": availableSlots})
}

// SoftLockSlot creates a temporary pending appointment to lock a slot
func (ac *AppointmentController) SoftLockSlot(c *gin.Context) {
	fmt.Printf("\n--- [START] SOFT LOCK REQUEST ---\n")

	var input struct {
		LockID        string `json:"lock_id"` // Optional: existing soft-lock ID
		ListingID     string `json:"listing_id" binding:"required"`
		PreferredDate string `json:"preferred_date" binding:"required"`
		PreferredTime string `json:"preferred_time" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		fmt.Printf("Error binding JSON: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	fmt.Printf("Received Input: LockID='%s', Date='%s', Time='%s'\n", input.LockID, input.PreferredDate, input.PreferredTime)

	preferredDate, _ := time.Parse("2006-01-02", input.PreferredDate)

	var listing models.Listing
	if err := ac.db.First(&listing, "id = ?", input.ListingID).Error; err != nil {
		fmt.Printf("Error finding listing\n")
		c.JSON(http.StatusNotFound, gin.H{"error": "Listing not found"})
		return
	}

	// Re-verify availability, ignoring the user's current lock if provided
	fmt.Printf("Calling isSlotAvailable with LockID='%s'\n", input.LockID)
	if !ac.isSlotAvailable(listing.ID, preferredDate, input.PreferredTime, input.LockID) {
		fmt.Printf("isSlotAvailable returned FALSE. Returning 409 Conflict.\n")
		c.JSON(http.StatusConflict, gin.H{"error": "This slot was just locked by someone else"})
		return
	}

	expiresAt := time.Now().Add(time.Minute * SoftLockDurationMin)

	var appointment models.Appointment
	isUpdate := false

	// Try to update existing lock if provided
	if input.LockID != "" {
		if err := ac.db.Where("id = ? AND status = ?", input.LockID, models.AppointmentPending).First(&appointment).Error; err == nil {
			isUpdate = true
			appointment.PreferredDate = preferredDate
			appointment.PreferredTime = input.PreferredTime
			appointment.ExpiresAt = &expiresAt
			fmt.Printf("Successfully found existing lock %s to update\n", appointment.ID)
		} else {
			fmt.Printf("Failed to find existing lock %s to update: %v\n", input.LockID, err)
		}
	}

	fmt.Printf("IsUpdate flag: %v\n", isUpdate)

	// Create new lock if not updating
	if !isUpdate {
		appointment = models.Appointment{
			ListingID:     listing.ID,
			AgentID:       listing.AgentID,
			PreferredDate: preferredDate,
			PreferredTime: input.PreferredTime,
			Status:        models.AppointmentPending,
			ExpiresAt:     &expiresAt,
			FullName:      "Pending Session", // Placeholder
			Email:         "pending@lock.temp",
			Phone:         "0000000000",
			Purpose:       "Viewing",
		}

		if err := ac.db.Create(&appointment).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to lock slot"})
			return
		}
	} else {
		if err := ac.db.Save(&appointment).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update locked slot"})
			return
		}
	}

	c.JSON(http.StatusCreated, gin.H{
		"lock_id":    appointment.ID,
		"expires_at": expiresAt,
	})
}

// Helper: isSlotAvailable checks if a slot is available considering buffers and locks
func (ac *AppointmentController) isSlotAvailable(listingID uuid.UUID, date time.Time, timeStr string, excludeID interface{}) bool {
	// 1. Parse slot start time
	layout := "15:04"
	slotTime, err := time.Parse(layout, timeStr)
	if err != nil {
		return false
	}

	slotStart := date.Add(time.Duration(slotTime.Hour())*time.Hour + time.Duration(slotTime.Minute())*time.Minute)
	slotEnd := slotStart.Add(time.Duration(AppointmentDurationMin) * time.Minute)

	// 2. Define protected range (Slot + Buffers)
	// Theoretically, if an appointment is at 10:00-10:45, the next one can start at 11:00.
	// So protected range for an existing appointment [A_start, A_end] is [A_start - 15m, A_end + 15m].
	// Our new slot [S_start, S_end] conflicts if it overlaps with [A_start - 15m, A_end + 15m].

	var appointments []models.Appointment
	query := ac.db.Where("listing_id = ? AND preferred_date = ?", listingID, date)

	fmt.Printf("\n--- isSlotAvailable Check ---\n")
	fmt.Printf("Examine excluding ID: %v (Type: %T)\n", excludeID, excludeID)

	// Safely exclude the provided ID if it's a valid non-empty string
	if excludeIDStr, ok := excludeID.(string); ok && len(excludeIDStr) > 0 {
		query = query.Where("id != ?", excludeIDStr)
		fmt.Printf("Query builder avoiding ID: %s\n", excludeIDStr)
	}

	if err := query.Find(&appointments).Error; err != nil {
		fmt.Printf("Error fetching appointments: %v\n", err)
		return false
	}

	fmt.Printf("Found %d potential conflicting appointments on %s\n", len(appointments), date.Format("2006-01-02"))

	for _, app := range appointments {
		// Ignore cancelled appointments
		if app.Status == models.AppointmentCancelled {
			continue
		}

		// Handle Pending expirations
		if app.Status == models.AppointmentPending {
			if app.ExpiresAt != nil && time.Now().After(*app.ExpiresAt) {
				continue // Expired lock
			}
		}

		// Calculate existing appointment's protected range
		appTime, _ := time.Parse(layout, app.PreferredTime)
		appStart := date.Add(time.Duration(appTime.Hour())*time.Hour + time.Duration(appTime.Minute())*time.Minute)
		appEnd := appStart.Add(time.Duration(AppointmentDurationMin) * time.Minute)

		// Overlap check with 15-minute buffers
		// Protected existing: [appStart - 15m, appEnd + 15m]
		// New slot: [slotStart, slotEnd]
		protectedStart := appStart.Add(-time.Duration(BufferZoneMin) * time.Minute)
		protectedEnd := appEnd.Add(time.Duration(BufferZoneMin) * time.Minute)

		fmt.Printf("Checking against Appointment %s (Status: %s, Time: %s)\n", app.ID, app.Status, app.PreferredTime)

		// Conflict if slotStart < protectedEnd AND slotEnd > protectedStart
		if slotStart.Before(protectedEnd) && slotEnd.After(protectedStart) {
			fmt.Printf("Conflict detected with Appointment %s! Requested: %s - %s, Conflict Range: %s - %s\n",
				app.ID, slotStart.Format("15:04"), slotEnd.Format("15:04"), protectedStart.Format("15:04"), protectedEnd.Format("15:04"))
			return false
		}
	}

	return true
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
	if err := ac.db.Preload("Listing").Where("id = ? AND agent_id = ?", id, agentID).First(&appointment).Error; err != nil {
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

	// Notify the agent's other sessions/tabs
	ac.ws.BroadcastToUser(agentID, gin.H{
		"type":    "appointment_updated",
		"payload": appointment,
	})

	// Notify the user about the status update
	// We need to find the user ID associated with the email
	var receiver models.User
	if err := ac.db.Where("TRIM(LOWER(email)) = ?", strings.TrimSpace(strings.ToLower(appointment.Email))).First(&receiver).Error; err == nil {
		notification := models.Notification{
			Title:      "Viewing Status Updated",
			Message:    fmt.Sprintf("Your viewing for %s has been %s", appointment.Listing.Title, appointment.Status),
			SenderID:   agentID,
			ReceiverID: &receiver.ID,
			Type:       "info",
		}
		ac.db.Create(&notification)
		ac.ws.BroadcastToUser(receiver.ID, gin.H{
			"type":    "notification",
			"payload": notification,
		})
		// Specifically for the ListingDetailPage status update
		ac.ws.BroadcastToUser(receiver.ID, gin.H{
			"type":    "appointment_updated",
			"payload": appointment,
		})
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
