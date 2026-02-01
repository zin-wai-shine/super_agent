package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Role constants
const (
	RoleSuperAdmin = "super_admin"
	RoleAgent      = "agent"
	RoleSubAgent   = "sub_agent"
	RolePublic     = "public"
)

// User represents a user in the system
type User struct {
	ID           uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Email        string         `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash string         `gorm:"not null" json:"-"`
	FirstName    string         `gorm:"size:100" json:"first_name"`
	LastName     string         `gorm:"size:100" json:"last_name"`
	Role         string         `gorm:"size:20;not null;default:'public'" json:"role"`
	AgentID      *uuid.UUID     `gorm:"type:uuid" json:"agent_id,omitempty"`
	Agent        *Agent         `gorm:"foreignKey:AgentID" json:"agent,omitempty"`
	IsActive     bool           `gorm:"default:true" json:"is_active"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

// Agent represents a real estate agent/tenant
type Agent struct {
	ID             uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name           string         `gorm:"size:200;not null" json:"name"`
	Subdomain      string         `gorm:"size:100;uniqueIndex" json:"subdomain"`
	Domain         string         `gorm:"size:255" json:"domain,omitempty"`
	Logo           string         `gorm:"size:500" json:"logo,omitempty"`
	Description    string         `gorm:"type:text" json:"description,omitempty"`
	Phone          string         `gorm:"size:50" json:"phone,omitempty"`
	Email          string         `gorm:"size:255" json:"email,omitempty"`
	Address        string         `gorm:"type:text" json:"address,omitempty"`
	IsActive       bool           `gorm:"default:true" json:"is_active"`
	IsSuspended    bool           `gorm:"default:false" json:"is_suspended"`
	SubscriptionID *uuid.UUID     `gorm:"type:uuid" json:"subscription_id,omitempty"`
	Subscription   *Subscription  `gorm:"foreignKey:SubscriptionID" json:"subscription,omitempty"`
	Theme          *Theme         `gorm:"foreignKey:AgentID" json:"theme,omitempty"`
	Users          []User         `gorm:"foreignKey:AgentID" json:"users,omitempty"`
	Listings       []Listing      `gorm:"foreignKey:AgentID" json:"listings,omitempty"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}

// Theme represents agent site customization
type Theme struct {
	ID              uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	AgentID         uuid.UUID `gorm:"type:uuid;uniqueIndex;not null" json:"agent_id"`
	BackgroundColor string    `gorm:"size:20;default:'#f5f5f5'" json:"background_color"`
	PrimaryColor    string    `gorm:"size:20;default:'#1a73e8'" json:"primary_color"`
	SecondaryColor  string    `gorm:"size:20;default:'#34a853'" json:"secondary_color"`
	TextColor       string    `gorm:"size:20;default:'#202124'" json:"text_color"`
	FontFamily      string    `gorm:"size:100;default:'Inter, sans-serif'" json:"font_family"`
	CustomCSS       string    `gorm:"type:text" json:"custom_css,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// Subscription represents subscription plans
type Subscription struct {
	ID           uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	PlanName     string         `gorm:"size:100;not null" json:"plan_name"`
	Description  string         `gorm:"type:text" json:"description,omitempty"`
	Price        float64        `gorm:"type:decimal(10,2);default:0" json:"price"`
	Duration     int            `gorm:"default:30" json:"duration"` // days
	MaxListings  int            `gorm:"default:10" json:"max_listings"`
	MaxSubAgents int            `gorm:"default:2" json:"max_sub_agents"`
	Features     string         `gorm:"type:text" json:"features,omitempty"` // JSON string
	IsActive     bool           `gorm:"default:true" json:"is_active"`
	StartDate    *time.Time     `json:"start_date,omitempty"`
	EndDate      *time.Time     `json:"end_date,omitempty"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

// Listing represents a property listing
type Listing struct {
	ID           uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	AgentID      uuid.UUID      `gorm:"type:uuid;not null" json:"agent_id"`
	Agent        *Agent         `gorm:"foreignKey:AgentID" json:"agent,omitempty"`
	CreatedBy    uuid.UUID      `gorm:"type:uuid;not null" json:"created_by"`
	Title        string         `gorm:"size:255;not null" json:"title"`
	Description  string         `gorm:"type:text" json:"description,omitempty"`
	PropertyType string         `gorm:"size:50" json:"property_type"` // condo, house, land, etc.
	ListingType  string         `gorm:"size:20" json:"listing_type"`  // sale, rent
	Price        float64        `gorm:"type:decimal(15,2)" json:"price"`
	PriceUnit    string         `gorm:"size:20;default:'THB'" json:"price_unit"`
	Bedrooms     int            `gorm:"default:0" json:"bedrooms"`
	Bathrooms    int            `gorm:"default:0" json:"bathrooms"`
	Area         float64        `gorm:"type:decimal(10,2)" json:"area"` // sqm
	Address      string         `gorm:"type:text" json:"address,omitempty"`
	District     string         `gorm:"size:100" json:"district,omitempty"`
	Province     string         `gorm:"size:100" json:"province,omitempty"`
	PostalCode   string         `gorm:"size:10" json:"postal_code,omitempty"`
	Latitude     float64        `gorm:"type:decimal(10,7)" json:"latitude,omitempty"`
	Longitude    float64        `gorm:"type:decimal(10,7)" json:"longitude,omitempty"`
	StationID    string         `gorm:"size:20;index" json:"station_id,omitempty"` // Transit station ID from SVG
	StationName  string         `gorm:"size:100" json:"station_name,omitempty"`
	Features     string         `gorm:"type:text" json:"features,omitempty"` // JSON array
	IsPublished  bool           `gorm:"default:false" json:"is_published"`
	IsFeatured   bool           `gorm:"default:false" json:"is_featured"`
	ViewCount    int            `gorm:"default:0" json:"view_count"`
	Media        []Media        `gorm:"foreignKey:ListingID" json:"media,omitempty"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

// Media represents images and videos for listings
type Media struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	ListingID uuid.UUID `gorm:"type:uuid;not null" json:"listing_id"`
	Type      string    `gorm:"size:20;not null" json:"type"` // image, video
	URL       string    `gorm:"size:500;not null" json:"url"`
	Thumbnail string    `gorm:"size:500" json:"thumbnail,omitempty"`
	Caption   string    `gorm:"size:255" json:"caption,omitempty"`
	SortOrder int       `gorm:"default:0" json:"sort_order"`
	CreatedAt time.Time `json:"created_at"`
}

// Station represents transit stations (pre-populated from SVG)
type Station struct {
	ID        string  `gorm:"primaryKey;size:20" json:"id"` // e.g., BL01, N24
	NameEN    string  `gorm:"size:100" json:"name_en"`
	NameTH    string  `gorm:"size:100" json:"name_th"`
	LineName  string  `gorm:"size:50" json:"line_name"`
	LineColor string  `gorm:"size:20" json:"line_color"`
	Status    string  `gorm:"size:20;default:'open'" json:"status"` // open, future, under-construction
	Latitude  float64 `gorm:"type:decimal(10,7)" json:"latitude,omitempty"`
	Longitude float64 `gorm:"type:decimal(10,7)" json:"longitude,omitempty"`
}
