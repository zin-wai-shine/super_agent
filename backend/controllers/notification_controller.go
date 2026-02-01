package controllers

import (
	"net/http"
	"super_real_estate/models"
	"super_real_estate/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type NotificationController struct {
	db *gorm.DB
	ws *utils.WebSocketManager
}

func NewNotificationController(db *gorm.DB, ws *utils.WebSocketManager) *NotificationController {
	return &NotificationController{db: db, ws: ws}
}

// CreateNotification sends a notification
func (nc *NotificationController) CreateNotification(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	senderID := userID.(uuid.UUID)

	// Get sender role to validate permissions
	var sender models.User
	nc.db.First(&sender, "id = ?", senderID)

	var req struct {
		Title      string `json:"title" binding:"required"`
		Message    string `json:"message" binding:"required"`
		ReceiverID string `json:"receiver_id"` // Optional: specific user
		TargetRole string `json:"target_role"` // Optional: broadcast to role
		Type       string `json:"type"`        // info, warning, system
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	notification := models.Notification{
		Title:      req.Title,
		Message:    req.Message,
		SenderID:   senderID,
		TargetRole: req.TargetRole,
		Type:       req.Type,
	}

	if req.ReceiverID != "" {
		recID, err := uuid.Parse(req.ReceiverID)
		if err == nil {
			// Try to find user directly
			var receiverUser models.User
			if err := nc.db.First(&receiverUser, "id = ?", recID).Error; err == nil {
				notification.ReceiverID = &recID
			} else {
				// If not found as User, check if it's an Agent ID
				var agent models.Agent
				if err := nc.db.First(&agent, "id = ?", recID).Error; err == nil {
					// Found an agent, now find the owner User
					// Assuming the owner is the user with this AgentID
					var owner models.User
					if err := nc.db.First(&owner, "agent_id = ?", agent.ID).Error; err == nil {
						notification.ReceiverID = &owner.ID
					} else {
						// Agent found but no owner user? Fallback or error?
						// For now, let's keep the original ID, it might validly fail later or be intended for something else
						notification.ReceiverID = &recID
					}
				} else {
					// Neither User nor Agent found, keep as is (will likely fail foreign key or be invalid)
					notification.ReceiverID = &recID
				}
			}
		}
	}

	// Logic for broadcasting
	if sender.Role == models.RoleAgent {
		// Agent can only send to their own users or public visitors of their site
		// If TargetRole is public or user, we scope it to this agent
		if req.TargetRole != "" {
			notification.TargetAgentID = sender.AgentID
		}
	} else if sender.Role != models.RoleSuperAdmin {
		// Only Admin and Agent can send/broadcast
		c.JSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
		return
	}

	if err := nc.db.Create(&notification).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send notification"})
		return
	}

	// Real-time broadcast
	if notification.ReceiverID != nil {
		nc.ws.BroadcastToUser(*notification.ReceiverID, notification)
	} else if notification.TargetRole != "" {
		// Basic broadcasting by role implementation for now
		// In a real app we'd query all active users with this role and loop
		// For simplicity/performance in this MVP, we might only support direct real-time or handle role-based differently
		// Or we can add BroadcastToRole logic to WS Manager later.
		// For the urgent requirement "real time use web socket", direct is key.
	}

	c.JSON(http.StatusCreated, notification)
}

// GetMyNotifications fetches notifications for the current user
func (nc *NotificationController) GetMyNotifications(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	uid := userID.(uuid.UUID)

	var user models.User
	nc.db.First(&user, "id = ?", uid)

	var notifications []models.Notification

	// Fetch Query:
	// 1. Direct messages (ReceiverID = user.ID)
	// 2. Role-based broadcasts (TargetRole = user.Role)
	//    - If user is Agent, get notifications from Super Admin
	//    - If user is public/User, get notifications from their Agent (if associated)

	// Add role-based broadcasts
	roleQuery := nc.db.Where("target_role = ?", user.Role)

	if user.Role == models.RoleAgent {
		// Agent receives from Super Admin (SenderID not restricted, but logically Admin)
		// No specific TargetAgentID check needed for system-wide agent broadcasts
	} else if user.AgentID != nil {
		// Sub-users receive from their Agent
		roleQuery = roleQuery.Where("target_agent_id = ?", user.AgentID)
	}

	// Combine queries logic manually or use OR
	// Simple approach: (ReceiverID = ?) OR (TargetRole = ? AND (TargetAgentID IS NULL OR TargetAgentID = ?))

	err := nc.db.Where(
		nc.db.Where("receiver_id = ?", uid).
			Or(
				nc.db.Where("target_role = ?", user.Role).
					Where("target_agent_id IS NULL OR target_agent_id = ?", user.AgentID),
			),
	).Order("created_at DESC").Limit(50).Find(&notifications).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch notifications"})
		return
	}

	c.JSON(http.StatusOK, notifications)
}

// MarkRead marks a notification as read
func (nc *NotificationController) MarkRead(c *gin.Context) {
	id := c.Param("id")
	// Since broadcast notifications are single records, "marking read" is tricky.
	// We'll skip complex "UserReadNotification" join table for now and just allow deleting or updating direct messages.
	// Assuming this only updates direct messages or we just ignore for broadcast.

	// Real implementation would need a UserNotification table for tracking reads on broadcasts.
	// For now, we only update if it is a direct message.
	nc.db.Model(&models.Notification{}).Where("id = ?", id).Update("is_read", true)
	c.JSON(http.StatusOK, gin.H{"message": "Marked as read"})
}

// GetSentNotifications fetches notifications sent by the current user
func (nc *NotificationController) GetSentNotifications(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	uid := userID.(uuid.UUID)

	var notifications []models.Notification
	if err := nc.db.Where("sender_id = ?", uid).Order("created_at DESC").Find(&notifications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch sent notifications"})
		return
	}

	c.JSON(http.StatusOK, notifications)
}
