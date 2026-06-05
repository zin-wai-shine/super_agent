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
	HasPassword           bool           `gorm:"-" json:"has_password"`
	FirstName             string         `gorm:"size:100" json:"first_name"`
	LastName              string         `gorm:"size:100" json:"last_name"`
	Role                  string         `gorm:"size:20;not null;default:'public'" json:"role"`
	AgentID               *uuid.UUID     `gorm:"type:uuid" json:"agent_id,omitempty"`
	Agent                 *Agent         `gorm:"foreignKey:AgentID" json:"agent,omitempty"`
	Phone                 string         `gorm:"size:50" json:"phone,omitempty"`
	Line                  string         `gorm:"size:255" json:"line,omitempty"`
	Whatsapp              string         `gorm:"size:255" json:"whatsapp,omitempty"`
	Viber                 string         `gorm:"size:255" json:"viber,omitempty"`
	Avatar                string         `gorm:"size:500" json:"avatar,omitempty"`
	IsActive              bool           `gorm:"default:true" json:"is_active"`
	LateCancellationCount int            `gorm:"default:0" json:"late_cancellation_count"`
	Permissions           string         `gorm:"type:text" json:"permissions,omitempty"`
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
	DescriptionMY  string         `gorm:"type:text" json:"description_my,omitempty"`
	DescriptionZH  string         `gorm:"type:text" json:"description_zh,omitempty"`
	Vision         string         `gorm:"type:text" json:"vision,omitempty"`
	VisionMY       string         `gorm:"type:text" json:"vision_my,omitempty"`
	VisionZH       string         `gorm:"type:text" json:"vision_zh,omitempty"`
	Mission        string         `gorm:"type:text" json:"mission,omitempty"`
	MissionMY      string         `gorm:"type:text" json:"mission_my,omitempty"`
	MissionZH      string         `gorm:"type:text" json:"mission_zh,omitempty"`
	Phone          string         `gorm:"size:50" json:"phone,omitempty"`
	Email          string         `gorm:"size:255" json:"email,omitempty"`
	Address        string         `gorm:"type:text" json:"address,omitempty"`
	Facebook       string         `gorm:"size:255;column:facebook" json:"facebook,omitempty"`
	Instagram      string         `gorm:"size:255;column:instagram" json:"instagram,omitempty"`
	LinkedIn       string         `gorm:"size:255;column:linkedin" json:"linkedin,omitempty"`
	Line           string         `gorm:"size:255;column:line" json:"line,omitempty"`
	SocialLinks    string         `gorm:"type:text" json:"social_links,omitempty"` // JSON string: [{"platform": "Facebook", "value": "url"}, ...]
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
	FaviconURL           string    `gorm:"size:500" json:"favicon_url,omitempty"`
	SharePreviewImage    string    `gorm:"size:500" json:"share_preview_image,omitempty"`
	SharePreviewImageScale int     `gorm:"default:100" json:"share_preview_image_scale"`
	HeaderText           string    `gorm:"size:100;default:'Super Real Estate'" json:"header_text,omitempty"`
	HeaderTextMY         string    `gorm:"size:100" json:"header_text_my,omitempty"`
	HeaderTextZH         string    `gorm:"size:100" json:"header_text_zh,omitempty"`
	FooterText           string    `gorm:"size:200;default:'© 2024 Super Real Estate. All rights reserved.'" json:"footer_text,omitempty"`
	FooterTextMY         string    `gorm:"size:200" json:"footer_text_my,omitempty"`
	FooterTextZH         string    `gorm:"size:200" json:"footer_text_zh,omitempty"`
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
	NavbarLogoHeight     int       `gorm:"default:100" json:"navbar_logo_height"`
	PageLogoHeight       int       `gorm:"default:100" json:"page_logo_height"`
	DashboardLogoHeight  int       `gorm:"default:100" json:"dashboard_logo_height"`
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
	NameMY      string         `gorm:"size:255" json:"name_my,omitempty"`
	NameZH      string         `gorm:"size:255" json:"name_zh,omitempty"`
	Description string         `gorm:"type:text" json:"description,omitempty"`
	DescriptionMY string       `gorm:"type:text" json:"description_my,omitempty"`
	DescriptionZH string       `gorm:"type:text" json:"description_zh,omitempty"`
	Status      string         `gorm:"size:50" json:"status,omitempty"`           // e.g., "New Launch", "Ready to Move"
	ProjectType string         `gorm:"size:50" json:"project_type,omitempty"`     // e.g., "Condominium", "Housing Estate"
	District    string         `gorm:"size:100" json:"district,omitempty"`        // e.g., "Sukhumvit", "Rama 9"
	StationID   string         `gorm:"size:20;index" json:"station_id,omitempty"` // e.g., "BTS Asoke"
	Latitude    float64        `gorm:"type:decimal(10,7)" json:"latitude,omitempty"`
	Longitude   float64        `gorm:"type:decimal(10,7)" json:"longitude,omitempty"`
	CoverImage  string         `gorm:"size:500" json:"cover_image,omitempty"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
// Listing represents a property listing
type Listing struct {
	ID                 uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	AgentID            uuid.UUID      `gorm:"type:uuid;not null;index" json:"agent_id"`
	Agent              *Agent         `gorm:"foreignKey:AgentID" json:"agent,omitempty"`
	CreatedBy          uuid.UUID      `gorm:"type:uuid;not null" json:"created_by"`
	ProjectID          *uuid.UUID     `gorm:"type:uuid;index" json:"project_id,omitempty"`
	Project            *Project       `gorm:"foreignKey:ProjectID" json:"project,omitempty"`
	Title              string         `gorm:"size:255;not null" json:"title"`
	TitleMY            string         `gorm:"size:255" json:"title_my,omitempty"`
	TitleZH            string         `gorm:"size:255" json:"title_zh,omitempty"`
	Description        string         `gorm:"type:text" json:"description,omitempty"`
	DescriptionMY      string         `gorm:"type:text" json:"description_my,omitempty"`
	DescriptionZH      string         `gorm:"type:text" json:"description_zh,omitempty"`
	PropertyType       string         `gorm:"size:50;index" json:"property_type"` // condo, house, land, etc.
	ListingType        string         `gorm:"size:20;index" json:"listing_type"`  // sale, rent
	Price              float64        `gorm:"type:decimal(15,2);index" json:"price"`
	PriceUnit          string         `gorm:"size:20;default:'THB'" json:"price_unit"`
	Bedrooms           int            `gorm:"default:0;index" json:"bedrooms"`
	Bathrooms          int            `gorm:"default:0;index" json:"bathrooms"`
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
	FeaturesMY         string         `gorm:"type:text" json:"features_my,omitempty"` // JSON array
	FeaturesZH         string         `gorm:"type:text" json:"features_zh,omitempty"` // JSON array
	IsPublished          bool           `gorm:"default:false;index" json:"is_published"`
	IsFeatured           bool           `gorm:"default:false;index" json:"is_featured"`
	AllowViewingRequests bool           `gorm:"default:true" json:"allow_viewing_requests"`
	ViewCount            int            `gorm:"default:0" json:"view_count"`
	FacilityName         string         `gorm:"size:255" json:"facility_name,omitempty"`
	Media              []Media        `gorm:"foreignKey:ListingID" json:"media,omitempty"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
	DeletedAt          gorm.DeletedAt `gorm:"index" json:"-"`
}

// Photo room type constants for display grouping
const (
	RoomTypeLivingRoom         = "Living Room"
	RoomTypeDiningArea         = "Dining Area"
	RoomTypeBedroom            = "Bedroom"
	RoomTypeSharedFullBathroom = "Shared Full Bathroom"
	RoomTypeLaundryArea        = "Laundry area"
	RoomTypeExterior           = "Exterior"
	RoomTypeAdditionalPhotos   = "Additional Photos"
)

// Media represents images and videos for listings
type Media struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	ListingID uuid.UUID `gorm:"type:uuid;not null;index" json:"listing_id"`
	Type      string    `gorm:"size:20;not null" json:"type"` // image, video
	URL       string    `gorm:"size:500;not null" json:"url"`
	Thumbnail string    `gorm:"size:500" json:"thumbnail,omitempty"`
	Caption   string    `gorm:"size:255" json:"caption,omitempty"`
	RoomType  string    `gorm:"size:50;default:Additional Photos" json:"room_type,omitempty"` // Living Room, Dining Area, Bedroom, etc.
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
	TitleMY     string         `gorm:"size:255" json:"title_my,omitempty"`
	TitleZH     string         `gorm:"size:255" json:"title_zh,omitempty"`
	Description string         `gorm:"type:text" json:"description,omitempty"`
	DescriptionMY string       `gorm:"type:text" json:"description_my,omitempty"`
	DescriptionZH string       `gorm:"type:text" json:"description_zh,omitempty"`
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
	CancellationReason    string         `gorm:"type:text" json:"cancellation_reason,omitempty"`
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

// Collection represents a grouping of listings
type Collection struct {
	ID             uuid.UUID         `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	AgentID        uuid.UUID         `gorm:"type:uuid;not null;index" json:"agent_id"`
	ParentID       *uuid.UUID        `gorm:"type:uuid;index" json:"parent_id,omitempty"`
	Parent         *Collection       `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	SubCollections []Collection      `gorm:"foreignKey:ParentID" json:"sub_collections,omitempty"`
	Name           string            `gorm:"size:255;not null" json:"name"`
	NameMY         string            `gorm:"size:255" json:"name_my,omitempty"`
	NameZH         string            `gorm:"size:255" json:"name_zh,omitempty"`
	Type           string            `gorm:"size:20;default:'image'" json:"type"` // "image" or "icon"
	IsParent       bool              `gorm:"default:false" json:"is_parent"`
	Icon           string            `gorm:"size:100" json:"icon,omitempty"`
	FacilityName   string            `gorm:"size:255" json:"facility_name,omitempty"`
	CreatedBy      uuid.UUID         `gorm:"type:uuid;not null" json:"created_by"`
	Media          []CollectionMedia `gorm:"foreignKey:CollectionID" json:"media,omitempty"`
	Listings       []Listing         `gorm:"many2many:collection_listings;" json:"listings,omitempty"`
	CreatedAt      time.Time         `json:"created_at"`
	UpdatedAt      time.Time         `json:"updated_at"`
	DeletedAt      gorm.DeletedAt    `gorm:"index" json:"-"`
}

type CollectionMedia struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	CollectionID uuid.UUID `gorm:"type:uuid;not null;index" json:"collection_id"`
	Type         string    `gorm:"size:20;not null" json:"type"` // image, video
	URL          string    `gorm:"size:500;not null" json:"url"`
	SortOrder    int       `gorm:"default:0" json:"sort_order"`
	CreatedAt    time.Time `json:"created_at"`
}

// CollectionListing is the junction table for many-to-many
type CollectionListing struct {
	CollectionID uuid.UUID `gorm:"type:uuid;primaryKey" json:"collection_id"`
	ListingID    uuid.UUID `gorm:"type:uuid;primaryKey" json:"listing_id"`
	CreatedAt    time.Time `json:"created_at"`
}

// UniqueView tracks unique views per listing per user fingerprint
type UniqueView struct {
	ListingID   uuid.UUID `gorm:"type:uuid;primaryKey;index"`
	Fingerprint string    `gorm:"size:255;primaryKey;index"` // Hash or combined IP + UA
	CreatedAt   time.Time
}// FacilityMedia represents general property building/facility images for an agent
type FacilityMedia struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	AgentID   uuid.UUID `gorm:"type:uuid;not null;index" json:"agent_id"`
	Name      string    `gorm:"size:255;index" json:"name"`
	URL       string    `gorm:"size:500;not null" json:"url"`
	SortOrder int       `gorm:"default:0" json:"sort_order"`
	CreatedAt time.Time `json:"created_at"`
}

// TranslationCache stores API translations to avoid duplicate OpenAI calls
type TranslationCache struct {
	Hash           string    `gorm:"primaryKey;size:64" json:"hash"` // SHA256 of SourceText + LangCode
	SourceText     string    `gorm:"type:text;not null;index" json:"source_text"`
	LangCode       string    `gorm:"size:10;not null;index" json:"lang_code"`
	TranslatedText string    `gorm:"type:text;not null" json:"translated_text"`
	CreatedAt      time.Time `json:"created_at"`
}
