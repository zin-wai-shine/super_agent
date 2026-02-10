package controllers

import (
	"encoding/json"
	"net/http"
	"regexp"
	"strconv"
	"time"

	"super_real_estate/config"
	"super_real_estate/middleware"
	"super_real_estate/models"
	"super_real_estate/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

const (
	creditCostDescription  = 5
	creditCostTranslation  = 3
	creditCostPrice        = 2
	creditCostChat         = 1
	creditCostSmartSearch  = 2
	creditCostImageEnhance = 10
	graceDailyLimit        = 5
)

type AIController struct {
	db  *gorm.DB
	cfg *config.Config
	ai  *utils.AIClient
}

func NewAIController(db *gorm.DB, cfg *config.Config) *AIController {
	var ai *utils.AIClient
	if cfg.AIAPIURL != "" {
		ai = utils.NewAIClient(cfg.AIAPIURL, cfg.AIAPIKey)
	}
	return &AIController{db: db, cfg: cfg, ai: ai}
}

func (ac *AIController) getAgentAndPlan(c *gin.Context) (agentID uuid.UUID, plan *models.Subscription, ok bool) {
	agentID, ok = middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Agent ID not found"})
		return
	}
	var agent models.Agent
	if err := ac.db.Preload("Subscription").Where("id = ?", agentID).First(&agent).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Agent not found"})
		return agentID, nil, false
	}
	if agent.SubscriptionID == nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "No subscription plan", "code": "no_plan"})
		return agentID, nil, false
	}
	plan = agent.Subscription
	if plan == nil {
		var sub models.Subscription
		if err := ac.db.Where("id = ?", *agent.SubscriptionID).First(&sub).Error; err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "Plan not found", "code": "no_plan"})
			return agentID, nil, false
		}
		plan = &sub
	}
	return agentID, plan, true
}

func (ac *AIController) getOrCreateBalance(agentID uuid.UUID, plan *models.Subscription) (*models.AICreditBalance, bool, *gin.Context) {
	now := time.Now().UTC()
	period := now.Format("2006-01")
	var balance models.AICreditBalance
	err := ac.db.Where("agent_id = ? AND period_month = ?", agentID, period).First(&balance).Error
	if err == gorm.ErrRecordNotFound {
		balance = models.AICreditBalance{
			AgentID:        agentID,
			PeriodMonth:    period,
			CreditsAllowed: plan.MonthlyAICredits,
			CreditsUsed:    0,
		}
		if err := ac.db.Create(&balance).Error; err != nil {
			return nil, false, nil
		}
	} else if err != nil {
		return nil, false, nil
	}
	return &balance, true, nil
}

// canSpend returns true if the agent can spend `cost` credits (either from balance or grace)
func (ac *AIController) canSpend(c *gin.Context, balance *models.AICreditBalance, cost int) (allowed bool, inGrace bool) {
	if balance.CreditsUsed+cost <= balance.CreditsAllowed {
		return true, false
	}
	// Grace: allow limited uses per day when over allowance
	now := time.Now().UTC()
	today := now.Format("2006-01-02")
	if balance.GraceDailyReset != nil && balance.GraceDailyReset.Format("2006-01-02") != today {
		balance.GraceDailyUsed = 0
		balance.GraceDailyReset = &now
		ac.db.Model(balance).Updates(map[string]interface{}{"grace_daily_used": 0, "grace_daily_reset": now})
	}
	if balance.GraceDailyReset == nil {
		balance.GraceDailyReset = &now
		balance.GraceDailyUsed = 0
		ac.db.Model(balance).Updates(map[string]interface{}{"grace_daily_reset": now})
	}
	if balance.GraceDailyUsed < graceDailyLimit {
		return true, true
	}
	return false, true
}

func (ac *AIController) deduct(c *gin.Context, balance *models.AICreditBalance, cost int, inGrace bool) {
	if inGrace {
		ac.db.Model(balance).Update("grace_daily_used", balance.GraceDailyUsed+1)
	} else {
		ac.db.Model(balance).Update("credits_used", balance.CreditsUsed+cost)
	}
}

// GetCredits returns current AI credit balance for the agent
func (ac *AIController) GetCredits(c *gin.Context) {
	agentID, plan, ok := ac.getAgentAndPlan(c)
	if !ok {
		return
	}
	if plan.AITier == models.AITierNone || plan.MonthlyAICredits <= 0 {
		c.JSON(http.StatusOK, gin.H{
			"credits_remaining": 0,
			"credits_total":     0,
			"period_end":        "",
			"in_grace":          false,
			"ai_tier":           plan.AITier,
			"ai_enabled":        false,
			"upgrade_message":   "Upgrade your plan to use AI features.",
		})
		return
	}
	balance, _, _ := ac.getOrCreateBalance(agentID, plan)
	if balance == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load credits"})
		return
	}
	now := time.Now().UTC()
	endOfMonth := time.Date(now.Year(), now.Month()+1, 0, 23, 59, 59, 0, time.UTC)
	inGrace := balance.CreditsUsed >= balance.CreditsAllowed
	remaining := balance.CreditsAllowed - balance.CreditsUsed
	if remaining < 0 {
		remaining = 0
	}
	c.JSON(http.StatusOK, gin.H{
		"credits_remaining": remaining,
		"credits_total":     balance.CreditsAllowed,
		"credits_used":      balance.CreditsUsed,
		"period_end":        endOfMonth.Format("2006-01-02"),
		"in_grace":          inGrace,
		"ai_tier":           plan.AITier,
		"ai_enabled":        true,
		"upgrade_message":   "",
	})
}

// GenerateDescription generates a listing description using AI
func (ac *AIController) GenerateDescription(c *gin.Context) {
	agentID, plan, ok := ac.getAgentAndPlan(c)
	if !ok {
		return
	}
	if plan.AITier == models.AITierNone {
		c.JSON(http.StatusForbidden, gin.H{"error": "AI not available on your plan", "code": "ai_locked"})
		return
	}
	balance, _, _ := ac.getOrCreateBalance(agentID, plan)
	if balance == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load credits"})
		return
	}
	allowed, inGrace := ac.canSpend(c, balance, creditCostDescription)
	if !allowed {
		c.JSON(http.StatusPaymentRequired, gin.H{
			"error":           "AI credits exhausted for this month",
			"code":            "credits_exhausted",
			"upgrade_message": "Upgrade your plan or wait for next month to get more credits.",
		})
		return
	}
	if ac.ai == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "AI service not configured"})
		return
	}
	var req struct {
		Title        string  `json:"title"`
		PropertyType string  `json:"property_type"`
		ListingType  string  `json:"listing_type"`
		Bedrooms     int     `json:"bedrooms"`
		Bathrooms    int     `json:"bathrooms"`
		Area         float64 `json:"area"`
		Address      string  `json:"address"`
		District     string  `json:"district"`
		Price        float64 `json:"price"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	systemPrompt := `You are a real estate listing copywriter. Write a compelling, professional property description in plain text (no markdown). Focus on features, location, and appeal. Keep it 2-4 short paragraphs. Write in English.`
	userMsg := "Property: " + req.Title + ". Type: " + req.PropertyType + " (" + req.ListingType + "). "
	if req.Bedrooms > 0 {
		userMsg += "Bedrooms: " + strconv.Itoa(req.Bedrooms) + ". "
	}
	if req.Bathrooms > 0 {
		userMsg += "Bathrooms: " + strconv.Itoa(req.Bathrooms) + ". "
	}
	if req.Area > 0 {
		userMsg += "Area: " + strconv.FormatFloat(req.Area, 'f', 0, 64) + " sqm. "
	}
	if req.Address != "" {
		userMsg += "Address: " + req.Address + ". "
	}
	if req.District != "" {
		userMsg += "District: " + req.District + ". "
	}
	if req.Price > 0 {
		userMsg += "Price: " + strconv.FormatFloat(req.Price, 'f', 0, 64) + " THB."
	}
	text, err := ac.ai.Complete(systemPrompt, userMsg, 600)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI request failed: " + err.Error()})
		return
	}
	ac.deduct(c, balance, creditCostDescription, inGrace)
	c.JSON(http.StatusOK, gin.H{"description": text, "credits_used": creditCostDescription})
}

// Translate translates listing text to target language
func (ac *AIController) Translate(c *gin.Context) {
	agentID, plan, ok := ac.getAgentAndPlan(c)
	if !ok {
		return
	}
	if plan.AITier == models.AITierNone {
		c.JSON(http.StatusForbidden, gin.H{"error": "AI not available on your plan", "code": "ai_locked"})
		return
	}
	balance, _, _ := ac.getOrCreateBalance(agentID, plan)
	if balance == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load credits"})
		return
	}
	allowed, inGrace := ac.canSpend(c, balance, creditCostTranslation)
	if !allowed {
		c.JSON(http.StatusPaymentRequired, gin.H{
			"error":           "AI credits exhausted for this month",
			"code":            "credits_exhausted",
			"upgrade_message": "Upgrade your plan or wait for next month.",
		})
		return
	}
	if ac.ai == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "AI service not configured"})
		return
	}
	var req struct {
		Text   string `json:"text" binding:"required"`
		Target string `json:"target" binding:"required"` // en, th, my
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	langName := map[string]string{"en": "English", "th": "Thai", "my": "Myanmar"}
	targetLang, ok := langName[req.Target]
	if !ok {
		targetLang = req.Target
	}
	systemPrompt := "You are a professional translator for real estate content. Translate the user's text into " + targetLang + ". Preserve formatting and tone. Output only the translation, no explanations."
	text, err := ac.ai.Complete(systemPrompt, req.Text, 1500)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Translation failed: " + err.Error()})
		return
	}
	ac.deduct(c, balance, creditCostTranslation, inGrace)
	c.JSON(http.StatusOK, gin.H{"translated_text": text, "credits_used": creditCostTranslation})
}

// SuggestPrice returns an AI-suggested price or range for a listing
func (ac *AIController) SuggestPrice(c *gin.Context) {
	agentID, plan, ok := ac.getAgentAndPlan(c)
	if !ok {
		return
	}
	if plan.AITier == models.AITierNone {
		c.JSON(http.StatusForbidden, gin.H{"error": "AI not available on your plan", "code": "ai_locked"})
		return
	}
	balance, _, _ := ac.getOrCreateBalance(agentID, plan)
	if balance == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load credits"})
		return
	}
	allowed, inGrace := ac.canSpend(c, balance, creditCostPrice)
	if !allowed {
		c.JSON(http.StatusPaymentRequired, gin.H{
			"error":           "AI credits exhausted for this month",
			"code":            "credits_exhausted",
			"upgrade_message": "Upgrade your plan or wait for next month.",
		})
		return
	}
	if ac.ai == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "AI service not configured"})
		return
	}
	var req struct {
		PropertyType string  `json:"property_type"`
		ListingType  string  `json:"listing_type"`
		Bedrooms     int     `json:"bedrooms"`
		Bathrooms    int     `json:"bathrooms"`
		Area         float64 `json:"area"`
		District     string  `json:"district"`
		Province     string  `json:"province"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	systemPrompt := `You are a real estate pricing advisor for Thailand (THB). Given property details, suggest a monthly rent in THB (for rent) or sale price (for sale). Reply with a single JSON object: {"suggested_price": number, "range_low": number, "range_high": number, "note": "short reason"}. No other text.`
	userMsg := "Type: " + req.PropertyType + ", " + req.ListingType + ". Bedrooms: " + strconv.Itoa(req.Bedrooms) + ", Bathrooms: " + strconv.Itoa(req.Bathrooms) + ". Area: " + strconv.FormatFloat(req.Area, 'f', 0, 64) + " sqm. "
	if req.District != "" {
		userMsg += "District: " + req.District + ". "
	}
	if req.Province != "" {
		userMsg += "Province: " + req.Province + "."
	}
	text, err := ac.ai.Complete(systemPrompt, userMsg, 200)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI request failed: " + err.Error()})
		return
	}
	// Parse simple JSON from model (may be wrapped in markdown code block)
	raw := text
	if s := extractJSON(raw); s != "" {
		raw = s
	}
	var result struct {
		SuggestedPrice float64 `json:"suggested_price"`
		RangeLow       float64 `json:"range_low"`
		RangeHigh      float64 `json:"range_high"`
		Note           string  `json:"note"`
	}
	_ = json.Unmarshal([]byte(raw), &result)
	if result.SuggestedPrice == 0 {
		result.Note = "Unable to suggest; check property details."
	}
	ac.deduct(c, balance, creditCostPrice, inGrace)
	c.JSON(http.StatusOK, gin.H{
		"suggested_price": result.SuggestedPrice,
		"range_low":       result.RangeLow,
		"range_high":      result.RangeHigh,
		"note":            result.Note,
		"credits_used":    creditCostPrice,
	})
}

// extractJSON pulls first {...} from text (for LLM responses wrapped in markdown)
func extractJSON(s string) string {
	re := regexp.MustCompile(`\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}`)
	m := re.FindString(s)
	return m
}

// getAgentFromTenant gets agent and plan from tenant context (for public routes, no auth)
func (ac *AIController) getAgentFromTenant(c *gin.Context) (agentID uuid.UUID, plan *models.Subscription, ok bool) {
	agentID, ok = middleware.GetAgentID(c)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Agent not found"})
		return
	}
	var agent models.Agent
	if err := ac.db.Preload("Subscription").Where("id = ?", agentID).First(&agent).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Agent not found"})
		return agentID, nil, false
	}
	if agent.SubscriptionID == nil {
		c.JSON(http.StatusOK, gin.H{"reply": "Sorry, the agent's AI assistant is not available right now."})
		return agentID, nil, false
	}
	plan = agent.Subscription
	if plan == nil {
		var sub models.Subscription
		if err := ac.db.Where("id = ?", *agent.SubscriptionID).First(&sub).Error; err != nil {
			c.JSON(http.StatusOK, gin.H{"reply": "Sorry, the agent's AI assistant is not available."})
			return agentID, nil, false
		}
		plan = &sub
	}
	if plan.AITier == models.AITierNone || plan.MonthlyAICredits <= 0 {
		c.JSON(http.StatusOK, gin.H{"reply": "The agent's assistant is not enabled. Please contact the agent directly."})
		return agentID, nil, false
	}
	return agentID, plan, true
}

// PublicChat handles website chatbot messages (public, no auth; tenant from context)
func (ac *AIController) PublicChat(c *gin.Context) {
	agentID, plan, ok := ac.getAgentFromTenant(c)
	if !ok {
		return
	}
	balance, _, _ := ac.getOrCreateBalance(agentID, plan)
	if balance == nil {
		c.JSON(http.StatusOK, gin.H{"reply": "Sorry, something went wrong. Please try again later."})
		return
	}
	allowed, inGrace := ac.canSpend(c, balance, creditCostChat)
	if !allowed {
		c.JSON(http.StatusOK, gin.H{"reply": "The agent's assistant has reached its limit for this month. Please email or call the agent directly."})
		return
	}
	if ac.ai == nil {
		c.JSON(http.StatusOK, gin.H{"reply": "The assistant is temporarily unavailable. Please contact the agent directly."})
		return
	}
	var req struct {
		Message string `json:"message" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Message required"})
		return
	}
	var agent models.Agent
	ac.db.Where("id = ?", agentID).First(&agent)
	systemPrompt := "You are the friendly assistant for " + agent.Name + ", a real estate agent. Answer briefly and professionally. Help with property inquiries, viewing requests, and general questions. If you don't know something, suggest the visitor contact the agent. Keep replies to 1-3 short sentences."
	reply, err := ac.ai.Complete(systemPrompt, req.Message, 300)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"reply": "Sorry, I couldn't process that. Please try again or contact the agent directly."})
		return
	}
	ac.deduct(c, balance, creditCostChat, inGrace)
	c.JSON(http.StatusOK, gin.H{"reply": reply})
}

// SmartSearch parses natural language and returns listings (public, tenant from context)
func (ac *AIController) SmartSearch(c *gin.Context) {
	agentID, plan, ok := ac.getAgentFromTenant(c)
	if !ok {
		return
	}
	balance, _, _ := ac.getOrCreateBalance(agentID, plan)
	if balance == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load credits"})
		return
	}
	allowed, inGrace := ac.canSpend(c, balance, creditCostSmartSearch)
	if !allowed {
		c.JSON(http.StatusPaymentRequired, gin.H{"error": "AI search limit reached", "code": "credits_exhausted"})
		return
	}
	if ac.ai == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Smart search not available"})
		return
	}
	q := c.Query("q")
	if q == "" {
		q = c.PostForm("q")
	}
	if q == "" {
		var body struct {
			Q string `json:"q"`
		}
		_ = c.ShouldBindJSON(&body)
		q = body.Q
	}
	if q == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Query required"})
		return
	}
	systemPrompt := `You are a real estate search parser. Given a natural language query about property search in Thailand, output ONLY a JSON object with these keys (use null or omit if not specified): property_type (condo|house|townhouse|apartment|land), listing_type (sale|rent), min_price (number), max_price (number), bedrooms (number, minimum), search (string for text search). Example: "3 bed condo under 50k" -> {"property_type":"condo","bedrooms":3,"max_price":50000,"listing_type":"rent"}. Output only valid JSON, no other text.`
	text, err := ac.ai.Complete(systemPrompt, "Query: "+q, 200)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Search failed"})
		return
	}
	raw := text
	if s := extractJSON(raw); s != "" {
		raw = s
	}
	var filters struct {
		PropertyType string   `json:"property_type"`
		ListingType  string   `json:"listing_type"`
		MinPrice     *float64 `json:"min_price"`
		MaxPrice     *float64 `json:"max_price"`
		Bedrooms     *int     `json:"bedrooms"`
		Search       string   `json:"search"`
	}
	_ = json.Unmarshal([]byte(raw), &filters)
	query := ac.db.Model(&models.Listing{}).Preload("Media").Preload("Agent").Preload("Station").
		Where("agent_id = ? AND is_published = ?", agentID, true)
	if filters.PropertyType != "" {
		query = query.Where("property_type = ?", filters.PropertyType)
	}
	if filters.ListingType != "" {
		query = query.Where("listing_type = ?", filters.ListingType)
	}
	if filters.MinPrice != nil && *filters.MinPrice > 0 {
		query = query.Where("price >= ?", *filters.MinPrice)
	}
	if filters.MaxPrice != nil && *filters.MaxPrice > 0 {
		query = query.Where("price <= ?", *filters.MaxPrice)
	}
	if filters.Bedrooms != nil && *filters.Bedrooms > 0 {
		query = query.Where("bedrooms >= ?", *filters.Bedrooms)
	}
	if filters.Search != "" {
		query = query.Where("title ILIKE ? OR description ILIKE ? OR address ILIKE ?",
			"%"+filters.Search+"%", "%"+filters.Search+"%", "%"+filters.Search+"%")
	}
	query = query.Order("created_at DESC").Limit(24)
	var listings []models.Listing
	if err := query.Find(&listings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch listings"})
		return
	}
	ac.deduct(c, balance, creditCostSmartSearch, inGrace)
	c.JSON(http.StatusOK, gin.H{"listings": listings, "filters_applied": filters})
}

// EnhanceImage accepts an image and returns enhanced version (stub: not configured returns 503)
func (ac *AIController) EnhanceImage(c *gin.Context) {
	_, plan, ok := ac.getAgentAndPlan(c)
	if !ok {
		return
	}
	if plan.AITier == models.AITierNone {
		c.JSON(http.StatusForbidden, gin.H{"error": "AI not available on your plan", "code": "ai_locked"})
		return
	}
	agentID, _ := middleware.GetAgentID(c)
	balance, _, _ := ac.getOrCreateBalance(agentID, plan)
	if balance == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load credits"})
		return
	}
	allowed, _ := ac.canSpend(c, balance, creditCostImageEnhance)
	if !allowed {
		c.JSON(http.StatusPaymentRequired, gin.H{"error": "AI credits exhausted", "code": "credits_exhausted"})
		return
	}
	// Image enhance API not implemented; return 503 so UI can show "not configured"
	c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Image enhancement is not configured. Use description and price AI for now."})
}
