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
	ID                    uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Email                 string         `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash          string         `gorm:"not null" json:"-"`
	FirstName             string         `gorm:"size:100" json:"first_name"`
	LastName              string         `gorm:"size:100" json:"last_name"`
	Role                  string         `gorm:"size:20;not null;default:'public'" json:"role"`
	AgentID               *uuid.UUID     `gorm:"type:uuid" json:"agent_id,omitempty"`
	Agent                 *Agent         `gorm:"foreignKey:AgentID" json:"agent,omitempty"`
	IsActive              bool           `gorm:"default:true" json:"is_active"`
	LateCancellationCount int            `gorm:"default:0" json:"late_cancellation_count"`
	CreatedAt             time.Time      `json:"created_at"`
	UpdatedAt             time.Time      `json:"updated_at"`
	DeletedAt             gorm.DeletedAt `gorm:"index" json:"-"`
}

// Agent represents a real estate agent/tenant
type Agent struct {
	ID             uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name           string         `gorm:"size:200;not null" json:"name"`
	Subdomain      string         `gorm:"size:100;uniqueIndex" json:"subdomain"`
	DomainType     string         `gorm:"size:20;default:'subdomain'" json:"domain_type"` // subdomain or custom
	CustomDomain   string         `gorm:"size:255" json:"custom_domain,omitempty"`        // e.g., agent.com
	Domain         string         `gorm:"size:255" json:"domain,omitempty"`               // Computed full domain
	Logo           string         `gorm:"size:500" json:"logo,omitempty"`
	Description    string         `gorm:"type:text" json:"description,omitempty"`
	Vision         string         `gorm:"type:text" json:"vision,omitempty"`
	Mission        string         `gorm:"type:text" json:"mission,omitempty"`
	Phone          string         `gorm:"size:50" json:"phone,omitempty"`
	Email          string         `gorm:"size:255" json:"email,omitempty"`
	Address        string         `gorm:"type:text" json:"address,omitempty"`
	Facebook       string         `gorm:"size:255;column:facebook" json:"facebook,omitempty"`
	Instagram      string         `gorm:"size:255;column:instagram" json:"instagram,omitempty"`
	LinkedIn       string         `gorm:"size:255;column:linkedin" json:"linkedin,omitempty"`
	Line           string         `gorm:"size:255;column:line" json:"line,omitempty"`
	MinPriceLimit  float64        `gorm:"type:decimal(15,2);default:0" json:"min_price_limit"`
	MaxPriceLimit  float64        `gorm:"type:decimal(15,2);default:0" json:"max_price_limit"`
	PriceFormat    string         `gorm:"size:20;default:'full'" json:"price_format"` // full (e.g. 3,000) or short (e.g. 3K)
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
	ID                   uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	AgentID              uuid.UUID `gorm:"type:uuid;uniqueIndex;not null" json:"agent_id"`
	BackgroundColor      string    `gorm:"size:20;default:'#f5f5f5'" json:"background_color"`
	PrimaryColor         string    `gorm:"size:20;default:'#1a73e8'" json:"primary_color"`
	SecondaryColor       string    `gorm:"size:20;default:'#34a853'" json:"secondary_color"`
	TextColor            string    `gorm:"size:20;default:'#202124'" json:"text_color"`
	FontFamily           string    `gorm:"size:100;default:'Inter, sans-serif'" json:"font_family"`
	LogoURL              string    `gorm:"size:500" json:"logo_url,omitempty"`
	HeaderText           string    `gorm:"size:100;default:'Super Real Estate'" json:"header_text,omitempty"`
	FooterText           string    `gorm:"size:200;default:'© 2024 Super Real Estate. All rights reserved.'" json:"footer_text,omitempty"`
	ButtonRadius         string    `gorm:"size:50;default:'0.5rem'" json:"button_radius"` // e.g., 0, 0.25rem, 0.5rem, 9999px, or 4 values
	CardRadius           string    `gorm:"size:50;default:'1rem'" json:"card_radius"`     // e.g., 0, 0.5rem, 1rem, or 4 values
	MenuRadius           string    `gorm:"size:50;default:'1rem'" json:"menu_radius"`     // e.g., 0, 0.5rem, 1rem, or 4 values
	MenuBackgroundColor  string    `gorm:"size:20;default:'#ffffff'" json:"menu_background_color"`
	ButtonGradient       bool      `gorm:"default:false" json:"button_gradient"`
	ButtonGradientColor2 string    `gorm:"size:20;default:'#34a853'" json:"button_gradient_color2"`
	ButtonGradientStyle  string    `gorm:"size:255;default:''" json:"button_gradient_style"` // Linear gradient string
	ShadowStyle          string    `gorm:"size:20;default:'soft'" json:"shadow_style"`       // none, soft, hard
	ShadowX              int       `gorm:"default:0" json:"shadow_x"`
	ShadowY              int       `gorm:"default:4" json:"shadow_y"`
	ShadowBlur           int       `gorm:"default:4" json:"shadow_blur"`
	ShadowSpread         int       `gorm:"default:0" json:"shadow_spread"`
	ShadowColor          string    `gorm:"size:20;default:'#000000'" json:"shadow_color"`
	ShadowOpacity        int       `gorm:"default:25" json:"shadow_opacity"`
	ButtonShadowX        int       `gorm:"default:0" json:"button_shadow_x"`
	ButtonShadowY        int       `gorm:"default:4" json:"button_shadow_y"`
	ButtonShadowBlur     int       `gorm:"default:4" json:"button_shadow_blur"`
	ButtonShadowSpread   int       `gorm:"default:0" json:"button_shadow_spread"`
	ButtonShadowColor    string    `gorm:"size:20;default:'#000000'" json:"button_shadow_color"`
	ButtonShadowOpacity  int       `gorm:"default:25" json:"button_shadow_opacity"`
	CustomCSS            string    `gorm:"type:text" json:"custom_css,omitempty"`
	CreatedAt            time.Time `json:"created_at"`
	UpdatedAt            time.Time `json:"updated_at"`
}

// Domain type constants
const (
	DomainTypeSubdomain = "subdomain" // e.g., agent.super.app
	DomainTypeCustom    = "custom"    // e.g., agent.com
)

// Subscription represents subscription plans
type Subscription struct {
	ID                 uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	PlanName           string         `gorm:"size:100;not null" json:"plan_name"`
	Description        string         `gorm:"type:text" json:"description,omitempty"`
	DomainType         string         `gorm:"size:20;default:'subdomain'" json:"domain_type"` // subdomain or custom
	Price              float64        `gorm:"type:decimal(10,2);default:0" json:"price"`
	Duration           int            `gorm:"default:30" json:"duration"` // days
	MaxListings        int            `gorm:"default:10" json:"max_listings"`
	MaxSubAgents       int            `gorm:"default:2" json:"max_sub_agents"`
	AllowCustomDomain  bool           `gorm:"default:false" json:"allow_custom_domain"`
	AllowAppointments  bool           `gorm:"default:true" json:"allow_appointments"`
	AllowTheme         bool           `gorm:"default:true" json:"allow_theme"`
	AllowSubAgents     bool           `gorm:"default:true" json:"allow_sub_agents"`
	AllowNotifications bool           `gorm:"default:true" json:"allow_notifications"`
	AllowBanners       bool           `gorm:"default:true" json:"allow_banners"`
	Features           string         `gorm:"type:text" json:"features,omitempty"` // JSON string
	IsActive           bool           `gorm:"default:true" json:"is_active"`
	StartDate          *time.Time     `json:"start_date,omitempty"`
	EndDate            *time.Time     `json:"end_date,omitempty"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
	DeletedAt          gorm.DeletedAt `gorm:"index" json:"-"`
}

// Developer represents a property developer company
type Developer struct {
	ID        uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	AgentID   uuid.UUID      `gorm:"type:uuid;not null;index" json:"agent_id"`
	Name      string         `gorm:"size:255;not null" json:"name"`
	Logo      string         `gorm:"size:500" json:"logo,omitempty"`
	Website   string         `gorm:"size:500" json:"website,omitempty"`
	Projects  []Project      `gorm:"foreignKey:DeveloperID" json:"projects,omitempty"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// Project represents a property development project
type Project struct {
	ID          uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	AgentID     uuid.UUID      `gorm:"type:uuid;not null;index" json:"agent_id"`
	DeveloperID uuid.UUID      `gorm:"type:uuid;not null" json:"developer_id"`
	Developer   *Developer     `gorm:"foreignKey:DeveloperID" json:"developer,omitempty"`
	Name        string         `gorm:"size:255;not null" json:"name"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// Listing represents a property listing
type Listing struct {
	ID                 uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	AgentID            uuid.UUID      `gorm:"type:uuid;not null" json:"agent_id"`
	Agent              *Agent         `gorm:"foreignKey:AgentID" json:"agent,omitempty"`
	CreatedBy          uuid.UUID      `gorm:"type:uuid;not null" json:"created_by"`
	ProjectID          *uuid.UUID     `gorm:"type:uuid;index" json:"project_id,omitempty"`
	Project            *Project       `gorm:"foreignKey:ProjectID" json:"project,omitempty"`
	Title              string         `gorm:"size:255;not null" json:"title"`
	Description        string         `gorm:"type:text" json:"description,omitempty"`
	PropertyType       string         `gorm:"size:50" json:"property_type"` // condo, house, land, etc.
	ListingType        string         `gorm:"size:20" json:"listing_type"`  // sale, rent
	Price              float64        `gorm:"type:decimal(15,2)" json:"price"`
	PriceUnit          string         `gorm:"size:20;default:'THB'" json:"price_unit"`
	Bedrooms           int            `gorm:"default:0" json:"bedrooms"`
	Bathrooms          int            `gorm:"default:0" json:"bathrooms"`
	Area               float64        `gorm:"type:decimal(10,2)" json:"area"` // sqm
	Floor              string         `gorm:"size:50" json:"floor,omitempty"` // e.g., "G", "12A", "PH"
	Road               string         `gorm:"size:255" json:"road,omitempty"`
	Address            string         `gorm:"type:text" json:"address,omitempty"`
	District           string         `gorm:"size:100" json:"district,omitempty"`
	Province           string         `gorm:"size:100" json:"province,omitempty"`
	PostalCode         string         `gorm:"size:10" json:"postal_code,omitempty"`
	Latitude           float64        `gorm:"type:decimal(10,7)" json:"latitude,omitempty"`
	Longitude          float64        `gorm:"type:decimal(10,7)" json:"longitude,omitempty"`
	MapURL             string         `gorm:"type:text" json:"map_url,omitempty"`
	StationID          string         `gorm:"size:20;index" json:"station_id,omitempty"` // Transit station ID from SVG
	StationName        string         `gorm:"size:100" json:"station_name,omitempty"`
	DistanceToStation  int            `gorm:"default:0" json:"distance_to_station"` // Distance in meters
	AvailabilityStatus string         `gorm:"size:50" json:"availability_status"`   // e.g., "Ready to Move", "Rent until Oct"
	YearBuilt          int            `gorm:"default:0" json:"year_built"`
	Station            *Station       `gorm:"foreignKey:StationID" json:"station,omitempty"`
	Features           string         `gorm:"type:text" json:"features,omitempty"` // JSON array
	IsPublished        bool           `gorm:"default:false" json:"is_published"`
	IsFeatured         bool           `gorm:"default:false" json:"is_featured"`
	ViewCount          int            `gorm:"default:0" json:"view_count"`
	Media              []Media        `gorm:"foreignKey:ListingID" json:"media,omitempty"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
	DeletedAt          gorm.DeletedAt `gorm:"index" json:"-"`
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

// Notification represents a system notification
type Notification struct {
	ID            uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Title         string         `gorm:"size:255;not null" json:"title"`
	Message       string         `gorm:"type:text;not null" json:"message"`
	SenderID      uuid.UUID      `gorm:"type:uuid;not null" json:"sender_id"`
	Sender        *User          `gorm:"foreignKey:SenderID" json:"sender,omitempty"`
	ReceiverID    *uuid.UUID     `gorm:"type:uuid" json:"receiver_id,omitempty"` // Nullable if broadcast
	Receiver      *User          `gorm:"foreignKey:ReceiverID" json:"receiver,omitempty"`
	TargetRole    string         `gorm:"size:50" json:"target_role,omitempty"`       // e.g., "agent", "public"
	TargetAgentID *uuid.UUID     `gorm:"type:uuid" json:"target_agent_id,omitempty"` // For Agent -> User broadcast
	Type          string         `gorm:"size:20;default:'info'" json:"type"`         // info, warning, system
	IsRead        bool           `gorm:"default:false" json:"is_read"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

// Banner represents a promotional or informational banner
type Banner struct {
	ID          uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Title       string         `gorm:"size:255;not null" json:"title"`
	Description string         `gorm:"type:text" json:"description,omitempty"`
	ImageURL    string         `gorm:"size:500;not null" json:"image_url"`
	LinkURL     string         `gorm:"size:500" json:"link_url,omitempty"`
	OwnerID     uuid.UUID      `gorm:"type:uuid;not null" json:"owner_id"` // Creator
	TargetRole  string         `gorm:"size:50;default:'all'" json:"target_role"`
	AgentID     *uuid.UUID     `gorm:"type:uuid" json:"agent_id,omitempty"` // Null for Platform banners
	IsActive    bool           `gorm:"default:true" json:"is_active"`
	StartDate   *time.Time     `json:"start_date,omitempty"`
	EndDate     *time.Time     `json:"end_date,omitempty"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// Appointment status constants
const (
	AppointmentPending   = "pending"
	AppointmentConfirmed = "confirmed"
	AppointmentCompleted = "completed"
	AppointmentCancelled = "cancelled"
)

// Appointment represents a property viewing appointment
type Appointment struct {
	ID                    uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	ListingID             uuid.UUID      `gorm:"type:uuid;not null" json:"listing_id"`
	Listing               *Listing       `gorm:"foreignKey:ListingID" json:"listing,omitempty"`
	AgentID               uuid.UUID      `gorm:"type:uuid;not null;index" json:"agent_id"`
	Agent                 *Agent         `gorm:"foreignKey:AgentID" json:"agent,omitempty"`
	FullName              string         `gorm:"size:200;not null" json:"full_name"`
	Email                 string         `gorm:"size:255;not null" json:"email"`
	Phone                 string         `gorm:"size:50;not null" json:"phone"`
	PreferredDate         time.Time      `gorm:"type:date;not null" json:"preferred_date"`
	PreferredTime         string         `gorm:"size:10;not null" json:"preferred_time"` // e.g. "10:00", "14:30"
	Purpose               string         `gorm:"size:20;not null" json:"purpose"`        // rent, buy
	Message               string         `gorm:"type:text" json:"message,omitempty"`
	Status                string         `gorm:"size:20;not null;default:'pending'" json:"status"`
	AgentNotes            string         `gorm:"type:text" json:"agent_notes,omitempty"`
	ExpiresAt             *time.Time     `json:"expires_at,omitempty"`
	LateCancellationCount int            `gorm:"-" json:"late_cancellation_count"`
	IsRegistered          bool           `gorm:"-" json:"is_registered"`
	CreatedAt             time.Time      `json:"created_at"`
	UpdatedAt             time.Time      `json:"updated_at"`
	DeletedAt             gorm.DeletedAt `gorm:"index" json:"-"`
}

// SavedListing represents a user's saved/bookmarked listing
type SavedListing struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	ListingID uuid.UUID `gorm:"type:uuid;not null;index" json:"listing_id"`
	CreatedAt time.Time `json:"created_at"`

	User    *User    `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Listing *Listing `gorm:"foreignKey:ListingID" json:"listing,omitempty"`
}

// TableName specifies the table name for SavedListing
func (SavedListing) TableName() string {
	return "saved_listings"
}
