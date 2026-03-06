package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"super_real_estate/config"
	"super_real_estate/models"
	"super_real_estate/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"gorm.io/gorm"
)

type GoogleAuthController struct {
	db     *gorm.DB
	cfg    *config.Config
	oauth2 *oauth2.Config
}

func NewGoogleAuthController(db *gorm.DB, cfg *config.Config) *GoogleAuthController {
	log.Printf("Initializing Google Auth with ClientID: %s... (len: %d), SecretLen: %d, RedirectURL: %s", cfg.GoogleClientID[:10], len(cfg.GoogleClientID), len(cfg.GoogleClientSecret), cfg.GoogleRedirectURL)
	conf := &oauth2.Config{
		ClientID:     cfg.GoogleClientID,
		ClientSecret: cfg.GoogleClientSecret,
		RedirectURL:  cfg.GoogleRedirectURL,
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}
	return &GoogleAuthController{
		db:     db,
		cfg:    cfg,
		oauth2: conf,
	}
}

func (gc *GoogleAuthController) GoogleLogin(c *gin.Context) {
	// State should contain the origin domain to redirect back correctly
	state := c.Query("state")
	if state == "" {
		state = c.Request.Host
	}
	url := gc.oauth2.AuthCodeURL(state)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

func (gc *GoogleAuthController) GoogleCallback(c *gin.Context) {
	state := c.Query("state")
	code := c.Query("code")

	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Code not found"})
		return
	}

	token, err := gc.oauth2.Exchange(context.Background(), code)
	if err != nil {
		log.Printf("Google OAuth Exchange Error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to exchange token: " + err.Error(),
			"debug": gin.H{
				"client_id_prefix": gc.oauth2.ClientID[:10],
				"secret_len":       len(gc.oauth2.ClientSecret),
				"redirect_url":     gc.oauth2.RedirectURL,
			},
		})
		return
	}

	// Fetch user info from Google
	resp, err := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + token.AccessToken)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user info"})
		return
	}
	defer resp.Body.Close()

	var googleUser struct {
		ID            string `json:"id"`
		Email         string `json:"email"`
		VerifiedEmail bool   `json:"verified_email"`
		Name          string `json:"name"`
		GivenName     string `json:"given_name"`
		FamilyName    string `json:"family_name"`
		Picture       string `json:"picture"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&googleUser); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode user info"})
		return
	}

	// Find or create user
	var user models.User
	result := gc.db.Where("email = ?", googleUser.Email).First(&user)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			// Create new user
			user = models.User{
				Email:     googleUser.Email,
				FirstName: googleUser.GivenName,
				LastName:  googleUser.FamilyName,
				Role:      models.RolePublic,
				IsActive:  true,
			}
			if err := gc.db.Create(&user).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
				return
			}
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
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
	// The state contains the original host
	// Use https for production domains, http for localhost
	scheme := "https"
	if state == "localhost" || state == "localhost:3000" || state == "127.0.0.1" {
		scheme = "http"
	}
	frontendURL := fmt.Sprintf("%s://%s/auth/google/callback?access_token=%s&refresh_token=%s", scheme, state, accessToken, refreshToken)
	c.Redirect(http.StatusTemporaryRedirect, frontendURL)
}
