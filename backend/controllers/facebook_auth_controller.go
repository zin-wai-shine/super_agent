package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"super_real_estate/config"
	"super_real_estate/models"
	"super_real_estate/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/facebook"
	"gorm.io/gorm"
)

type FacebookAuthController struct {
	db     *gorm.DB
	cfg    *config.Config
	oauth2 *oauth2.Config
}

func NewFacebookAuthController(db *gorm.DB, cfg *config.Config) *FacebookAuthController {
	if cfg.FacebookAppID == "" || cfg.FacebookAppSecret == "" {
		log.Println("WARNING: Facebook Auth credentials not configured (FACEBOOK_APP_ID / FACEBOOK_APP_SECRET)")
	} else {
		log.Printf("Initializing Facebook Auth with AppID: %s... (len: %d)", cfg.FacebookAppID[:6], len(cfg.FacebookAppID))
	}

	conf := &oauth2.Config{
		ClientID:     cfg.FacebookAppID,
		ClientSecret: cfg.FacebookAppSecret,
		RedirectURL:  cfg.FacebookRedirectURL,
		Scopes:       []string{"email", "public_profile"},
		Endpoint:     facebook.Endpoint,
	}
	return &FacebookAuthController{
		db:     db,
		cfg:    cfg,
		oauth2: conf,
	}
}

func (fc *FacebookAuthController) FacebookLogin(c *gin.Context) {
	// State should contain the origin domain to redirect back correctly
	state := c.Query("state")
	if state == "" {
		state = c.Request.Host
	}

	// Use dynamic redirect URL based on current host
	scheme := "https"
	if c.Request.Header.Get("X-Forwarded-Proto") == "http" || (c.Request.TLS == nil && c.Request.Header.Get("X-Forwarded-Proto") == "") {
		scheme = "http"
	}
	redirectURL := fmt.Sprintf("%s://%s/api/auth/facebook/callback", scheme, c.Request.Host)

	// Create a temporary config with the dynamic redirect URL
	conf := *fc.oauth2
	conf.RedirectURL = redirectURL

	url := conf.AuthCodeURL(state)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

func (fc *FacebookAuthController) FacebookCallback(c *gin.Context) {
	state := c.Query("state")
	code := c.Query("code")
	authError := c.Query("error")

	// If the user clicked "Cancel", Facebook returns an error parameter instead of a code
	if authError != "" {
		redirectScheme := "https"
		if state == "localhost" || state == "localhost:3000" || state == "127.0.0.1" {
			redirectScheme = "http"
		}
		errorURL := fmt.Sprintf("%s://%s/login", redirectScheme, state)
		c.Redirect(http.StatusTemporaryRedirect, errorURL)
		return
	}

	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Code not found"})
		return
	}

	// Use the same dynamic redirect URL used in FacebookLogin
	scheme := "https"
	if c.Request.Header.Get("X-Forwarded-Proto") == "http" || (c.Request.TLS == nil && c.Request.Header.Get("X-Forwarded-Proto") == "") {
		scheme = "http"
	}
	redirectURL := fmt.Sprintf("%s://%s/api/auth/facebook/callback", scheme, c.Request.Host)

	conf := *fc.oauth2
	conf.RedirectURL = redirectURL

	token, err := conf.Exchange(context.Background(), code)
	if err != nil {
		log.Printf("Facebook OAuth Exchange Error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to exchange token: " + err.Error(),
		})
		return
	}

	// Fetch user info from Facebook Graph API
	resp, err := http.Get("https://graph.facebook.com/me?fields=id,name,email,first_name,last_name,picture.type(large)&access_token=" + token.AccessToken)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user info"})
		return
	}
	defer resp.Body.Close()

	var fbUser struct {
		ID        string `json:"id"`
		Name      string `json:"name"`
		Email     string `json:"email"`
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Picture   struct {
			Data struct {
				URL string `json:"url"`
			} `json:"data"`
		} `json:"picture"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&fbUser); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode user info"})
		return
	}

	// Facebook may not return email if user hasn't granted permission
	if fbUser.Email == "" {
		// Redirect back to login with error
		redirectScheme := "https"
		if state == "localhost" || state == "localhost:3000" || state == "127.0.0.1" {
			redirectScheme = "http"
		}
		errorURL := fmt.Sprintf("%s://%s/login?error=facebook_no_email", redirectScheme, state)
		c.Redirect(http.StatusTemporaryRedirect, errorURL)
		return
	}

	// Find or create user (same logic as Google auth)
	var user models.User
	isMainDomain, _ := c.Get("is_main_domain")
	tenantID, tenantExists := c.Get("tenant_id")

	result := fc.db.Where("email = ?", fbUser.Email).First(&user)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			// Create new user associated with current tenant if on an agent site
			var agentIDPtr *uuid.UUID
			if isMain, ok := isMainDomain.(bool); ok && !isMain && tenantExists {
				id := tenantID.(uuid.UUID)
				agentIDPtr = &id
			}

			user = models.User{
				Email:     fbUser.Email,
				FirstName: fbUser.FirstName,
				LastName:  fbUser.LastName,
				Role:      models.RolePublic,
				AgentID:   agentIDPtr,
				IsActive:  true,
			}
			if err := fc.db.Create(&user).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
				return
			}
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
	} else {
		// Existing user: check tenant isolation on agent subdomains
		if isMain, ok := isMainDomain.(bool); ok && !isMain && tenantExists {
			tID := tenantID.(uuid.UUID)
			if user.Role != models.RoleSuperAdmin && (user.AgentID == nil || *user.AgentID != tID) {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "This account belongs to another site and cannot be used here."})
				return
			}
		}
	}

	// Generate JWT
	accessToken, err := utils.GenerateToken(user.ID, user.Email, user.Role, user.AgentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	refreshToken, err := utils.GenerateRefreshToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate refresh token"})
		return
	}

	// Redirect back to frontend with tokens
	scheme = "https"
	if state == "localhost" || state == "localhost:3000" || state == "127.0.0.1" {
		scheme = "http"
	}
	pictureURL := fbUser.Picture.Data.URL
	frontendURL := fmt.Sprintf("%s://%s/auth/facebook/callback?access_token=%s&refresh_token=%s&picture=%s", scheme, state, accessToken, refreshToken, url.QueryEscape(pictureURL))
	c.Redirect(http.StatusTemporaryRedirect, frontendURL)
}
