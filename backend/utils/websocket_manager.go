package utils

import (
	"log"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

// WebSocketManager handles active WebSocket connections
type WebSocketManager struct {
	clients    map[uuid.UUID][]*websocket.Conn // UserID -> Connections (multiple tabs allowed)
	register   chan *ClientConnection          // Channel to register new connections
	unregister chan *ClientConnection          // Channel to remove closed connections
	mutex      sync.RWMutex
}

// ClientConnection represents a single user connection
type ClientConnection struct {
	UserID uuid.UUID
	Conn   *websocket.Conn
}

// NotificationPayload structure for JSON messages
type NotificationPayload struct {
	Type    string      `json:"type"`    // e.g., "notification", "ping"
	Payload interface{} `json:"payload"` // The actual data
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for development
	},
}

// NewWebSocketManager creates a new manager instance
func NewWebSocketManager() *WebSocketManager {
	return &WebSocketManager{
		clients:    make(map[uuid.UUID][]*websocket.Conn),
		register:   make(chan *ClientConnection),
		unregister: make(chan *ClientConnection),
	}
}

// Run starts the manager loop
func (wm *WebSocketManager) Run() {
	for {
		select {
		case client := <-wm.register:
			wm.mutex.Lock()
			wm.clients[client.UserID] = append(wm.clients[client.UserID], client.Conn)
			log.Printf("Client connected: %s. Total active: %d", client.UserID, len(wm.clients))
			wm.mutex.Unlock()

		case client := <-wm.unregister:
			wm.mutex.Lock()
			if conns, ok := wm.clients[client.UserID]; ok {
				// Filter out the disconnected connection
				var activeConns []*websocket.Conn
				for _, conn := range conns {
					if conn != client.Conn {
						activeConns = append(activeConns, conn)
					}
				}

				if len(activeConns) == 0 {
					delete(wm.clients, client.UserID)
				} else {
					wm.clients[client.UserID] = activeConns
				}
				client.Conn.Close()
				log.Printf("Client disconnected: %s", client.UserID)
			}
			wm.mutex.Unlock()
		}
	}
}

// ServeWS handles the WebSocket handshake
func (wm *WebSocketManager) ServeWS(c *gin.Context) {
	// 1. Upgrade HTTP to WebSocket
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
		return
	}

	// 2. Validate Token (Protocol or Query Param)
	// For simplicity, we'll expect the User ID to be extracted from the Context by AuthMiddleware
	// verifying the "Authorization: Bearer <token>" header works for standard HTTP requests,
	// but WebSockets in browsers don't support custom headers in the handshake easily.
	// We'll rely on the query param ?token=... or assume the route is protected by AuthMiddleware which extracted "user_id"
	// NOTE: If using AuthMiddleware before this handler, "user_id" should be in context.

	userIDraw, exists := c.Get("user_id")
	if !exists {
		// Try to get from query param if context fails (e.g. if middleware skipped for WS)
		// For now, let's assume valid AuthMiddleware runs before this.
		log.Println("Unauthorized WebSocket attempt")
		conn.Close()
		return
	}

	userID := userIDraw.(uuid.UUID)

	// 3. Register Client
	client := &ClientConnection{
		UserID: userID,
		Conn:   conn,
	}
	wm.register <- client

	// 4. Listen for close (Pump)
	go func() {
		defer func() {
			wm.unregister <- client
		}()

		for {
			// Read loop to keep connection alive and detect disconnects
			_, _, err := conn.ReadMessage()
			if err != nil {
				break
			}
		}
	}()
}

// BroadcastToUser sends a message to a specific user
func (wm *WebSocketManager) BroadcastToUser(userID uuid.UUID, message interface{}) {
	wm.mutex.RLock()
	defer wm.mutex.RUnlock()

	if conns, ok := wm.clients[userID]; ok {
		for _, conn := range conns {
			err := conn.WriteJSON(NotificationPayload{
				Type:    "notification",
				Payload: message,
			})
			if err != nil {
				log.Printf("Failed to write to client %s: %v", userID, err)
				// Clean up handled by read pump
			}
		}
	}
}

// BroadcastToRole sends a message to all users of a role (simplified: needs User tracking)
// Since we map by UserID, broadcasting to a Role requires knowing which users have that role.
// For efficient broadcasting, we might iterate all or keep separate maps.
// For this MVP, we will only implement BroadcastToUser.
