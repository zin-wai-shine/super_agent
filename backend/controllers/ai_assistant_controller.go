package controllers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"super_real_estate/models"
	"super_real_estate/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AIAssistantController struct {
	db        *gorm.DB
	wsManager *utils.WebSocketManager
	apiKey    string
}

func NewAIAssistantController(db *gorm.DB, wsManager *utils.WebSocketManager) *AIAssistantController {
	return &AIAssistantController{
		db:        db,
		wsManager: wsManager,
		apiKey:    os.Getenv("OPENAI_API_KEY"),
	}
}

type AIAssistantMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type AIChatRequest struct {
	Message     string               `json:"message"`
	History     []AIAssistantMessage `json:"history"`
	Preferences map[string]string    `json:"preferences"`
}

type ExtractedCriteria struct {
	PropertyType         string    `json:"property_type"`         // condo, house, land, townhome
	ListingType          string    `json:"listing_type"`          // sale, rent
	MinPrice             *float64  `json:"min_price"`
	MaxPrice             *float64  `json:"max_price"`
	Bedrooms             *int      `json:"bedrooms"`
	Bathrooms            *int      `json:"bathrooms"`
	MinArea              *float64  `json:"min_area"`
	MaxArea              *float64  `json:"max_area"`
	StationName          string    `json:"station_name"`          // station name fuzzy string
	Landmark             string    `json:"landmark"`              // landmark/shopping mall/hospital/university
	SearchText           string    `json:"search_text"`           // keywords
	Facilities           []string  `json:"facilities"`           // swimming pool, gym, washing machine, parking, pet friendly
	Intent               string    `json:"intent"`               // search, compare, lead_generation, general_chat
	ComparisonListingIDs []string  `json:"comparison_listing_ids"`
	LeadDetails          *LeadDetails `json:"lead_details"`
}

type LeadDetails struct {
	Name          string `json:"name"`
	Phone         string `json:"phone"`
	Email         string `json:"email"`
	PreferredDate string `json:"preferred_date"` // YYYY-MM-DD
	PreferredTime string `json:"preferred_time"` // HH:MM
	ListingID     string `json:"listing_id"`
}

type OpenAIRequest struct {
	Model       string               `json:"model"`
	Messages    []AIAssistantMessage `json:"messages"`
	Temperature float64              `json:"temperature"`
}

type OpenAIResponse struct {
	Choices []struct {
		Message AIAssistantMessage `json:"message"`
	} `json:"choices"`
}

// AIChat processes the user message, parses filters, searches database, ranks matching properties, does lead gen, and outputs professional consultant advice.
func (ai *AIAssistantController) AIChat(c *gin.Context) {
	if ai.apiKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "OPENAI_API_KEY is not configured on the server"})
		return
	}

	var req AIChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload"})
		return
	}

	// 1. Resolve Tenant/Agent ID Scoping
	tenantIDObj, hasTenant := c.Get("tenant_id")
	var tenantID uuid.UUID
	if hasTenant {
		tenantID = tenantIDObj.(uuid.UUID)
	} else {
		// Fallback: look up default agent if none resolved (e.g. Bolt Haven Realty)
		var agent models.Agent
		if err := ai.db.First(&agent).Error; err == nil {
			tenantID = agent.ID
			hasTenant = true
		}
	}

	// Fetch all stations to inject into the parser prompt for location intelligence mapping
	var stations []models.Station
	ai.db.Find(&stations)
	stationListStr := ""
	for _, st := range stations {
		stationListStr += fmt.Sprintf("- ID: %s, Name: %s, Line: %s\n", st.ID, st.NameEN, st.LineName)
	}

	// Double-Pass Flow
	// PASS 1: Natural Language Understanding (JSON parameter extraction)
	criteria, err := ai.parseCriteria(req.Message, req.History, stationListStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to understand user query: " + err.Error()})
		return
	}

	// Merge preferences in session memory
	if req.Preferences == nil {
		req.Preferences = make(map[string]string)
	}
	if criteria.PropertyType != "" {
		req.Preferences["property_type"] = criteria.PropertyType
	}
	if criteria.ListingType != "" {
		req.Preferences["listing_type"] = criteria.ListingType
	}
	if criteria.MaxPrice != nil {
		req.Preferences["max_price"] = fmt.Sprintf("%.2f", *criteria.MaxPrice)
	}
	if criteria.MinPrice != nil {
		req.Preferences["min_price"] = fmt.Sprintf("%.2f", *criteria.MinPrice)
	}
	if criteria.StationName != "" {
		req.Preferences["station_name"] = criteria.StationName
	}

	// Retrieve correct StationID using fuzzy search/exact match mapped by OpenAI parser or manual database check
	var mappedStationID string
	if criteria.StationName != "" {
		// Try to match station name to our DB
		var dbStation models.Station
		searchTerm := "%" + strings.TrimSpace(criteria.StationName) + "%"
		if err := ai.db.Where("name_en ILIKE ? OR name_th ILIKE ? OR id ILIKE ?", searchTerm, searchTerm, searchTerm).First(&dbStation).Error; err == nil {
			mappedStationID = dbStation.ID
		}
	}

	// 2. Query Database for Scoped Listings
	var rawListings []models.Listing
	query := ai.db.Model(&models.Listing{}).
		Preload("Media", func(db *gorm.DB) *gorm.DB {
			return db.Order("sort_order ASC")
		}).Preload("Agent").Preload("Agent.Theme").Preload("Station").
		Where("is_published = ?", true)

	if hasTenant {
		query = query.Where("agent_id = ?", tenantID)
	}

	// Build GORM query constraints based on extracted parameters
	if criteria.PropertyType != "" {
		query = query.Where("property_type = ?", criteria.PropertyType)
	}
	if criteria.ListingType != "" {
		query = query.Where("listing_type = ?", criteria.ListingType)
	}
	if criteria.MinPrice != nil {
		query = query.Where("price >= ?", *criteria.MinPrice)
	}
	if criteria.MaxPrice != nil {
		query = query.Where("price <= ?", *criteria.MaxPrice)
	}
	if criteria.Bedrooms != nil {
		query = query.Where("bedrooms >= ?", *criteria.Bedrooms)
	}
	if criteria.Bathrooms != nil {
		query = query.Where("bathrooms >= ?", *criteria.Bathrooms)
	}
	if criteria.MinArea != nil {
		query = query.Where("area >= ?", *criteria.MinArea)
	}
	if criteria.MaxArea != nil {
		query = query.Where("area <= ?", *criteria.MaxArea)
	}
	if mappedStationID != "" {
		query = query.Where("station_id = ?", mappedStationID)
	}

	// Text matching (landmarks or keywords)
	if criteria.Landmark != "" || criteria.SearchText != "" {
		term := criteria.Landmark
		if term == "" {
			term = criteria.SearchText
		}
		query = query.Where("title ILIKE ? OR description ILIKE ? OR address ILIKE ? OR district ILIKE ?",
			"%"+term+"%", "%"+term+"%", "%"+term+"%", "%"+term+"%")
	}

	// Fetch standard matching listings
	if err := query.Limit(10).Find(&rawListings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve listings"})
		return
	}

	// If comparison is requested and exact IDs are provided, fetch them specifically
	var compareListings []models.Listing
	if criteria.Intent == "compare" && len(criteria.ComparisonListingIDs) > 0 {
		ai.db.Model(&models.Listing{}).
			Preload("Media", func(db *gorm.DB) *gorm.DB {
				return db.Order("sort_order ASC")
			}).Preload("Agent").Preload("Station").
			Where("id IN (?)", criteria.ComparisonListingIDs).Find(&compareListings)
	}

	// 3. Scoring & Ranking Matching Listings
	type RankedListing struct {
		Listing models.Listing
		Score   int
	}
	var rankedListings []RankedListing
	for _, listing := range rawListings {
		score := ai.calculateMatchScore(listing, criteria, mappedStationID)
		rankedListings = append(rankedListings, RankedListing{Listing: listing, Score: score})
	}

	// Sort ranked listings descending
	for i := 0; i < len(rankedListings); i++ {
		for j := i + 1; j < len(rankedListings); j++ {
			if rankedListings[i].Score < rankedListings[j].Score {
				rankedListings[i], rankedListings[j] = rankedListings[j], rankedListings[i]
			}
		}
	}

	// Select top listings
	var finalMatchingListings []models.Listing
	for _, rl := range rankedListings {
		finalMatchingListings = append(finalMatchingListings, rl.Listing)
	}

	// Smart Alternatives fallback if no direct matches found (threshold score or zero listings)
	var alternatives []models.Listing
	if len(finalMatchingListings) == 0 && criteria.Intent == "search" {
		// Relax constraints: extend budget by 25% and relax bedrooms/station boundaries
		altQuery := ai.db.Model(&models.Listing{}).
			Preload("Media", func(db *gorm.DB) *gorm.DB {
				return db.Order("sort_order ASC")
			}).Preload("Agent").Preload("Station").
			Where("is_published = ?", true)

		if hasTenant {
			altQuery = altQuery.Where("agent_id = ?", tenantID)
		}

		if criteria.PropertyType != "" {
			altQuery = altQuery.Where("property_type = ?", criteria.PropertyType)
		}
		if criteria.ListingType != "" {
			altQuery = altQuery.Where("listing_type = ?", criteria.ListingType)
		}
		if criteria.MaxPrice != nil {
			altQuery = altQuery.Where("price <= ?", (*criteria.MaxPrice)*1.25) // 25% higher budget
		}
		
		// If station was requested, check same line or nearby station
		if mappedStationID != "" {
			var station models.Station
			if err := ai.db.First(&station, "id = ?", mappedStationID).Error; err == nil {
				altQuery = altQuery.Joins("JOIN stations ON stations.id = listings.station_id").
					Where("stations.line_name = ?", station.LineName)
			}
		}

		altQuery.Limit(3).Find(&alternatives)
	}

	// 4. Lead Generation & Appointment Booking
	leadStatus := "none"
	var missingFields []string
	var createdAppointment *models.Appointment

	if criteria.Intent == "lead_generation" && criteria.LeadDetails != nil {
		ld := criteria.LeadDetails
		// Validate required lead details
		if ld.Name == "" {
			missingFields = append(missingFields, "name")
		}
		if ld.Phone == "" {
			missingFields = append(missingFields, "phone")
		}
		if ld.Email == "" {
			missingFields = append(missingFields, "email")
		}
		if ld.PreferredDate == "" {
			missingFields = append(missingFields, "preferred_date")
		}
		if ld.PreferredTime == "" {
			missingFields = append(missingFields, "preferred_time")
		}
		if ld.ListingID == "" {
			missingFields = append(missingFields, "listing_id")
		}

		if len(missingFields) == 0 {
			// All fields collected! Auto-create lead
			preferredDate, dateErr := time.Parse("2006-01-02", ld.PreferredDate)
			listingUUID, uuidErr := uuid.Parse(ld.ListingID)

			if dateErr == nil && uuidErr == nil {
				var targetListing models.Listing
				if err := ai.db.First(&targetListing, "id = ?", listingUUID).Error; err == nil {
					leadStatus = "collected"
					
					appointment := models.Appointment{
						ListingID:     targetListing.ID,
						AgentID:       targetListing.AgentID,
						FullName:      ld.Name,
						Email:         ld.Email,
						Phone:         ld.Phone,
						PreferredDate: preferredDate,
						PreferredTime: ld.PreferredTime,
						Purpose:       targetListing.ListingType,
						Status:        models.AppointmentPending,
					}

					if err := ai.db.Create(&appointment).Error; err == nil {
						createdAppointment = &appointment

						// Trigger real-time notifications to agent dashboard (WebSocket + Notification GORM)
						notification := models.Notification{
							Title:         "New Lead via AI Assistant",
							Message:       fmt.Sprintf("%s requested a viewing for %s on %s at %s", appointment.FullName, targetListing.Title, appointment.PreferredDate.Format("2006-01-02"), appointment.PreferredTime),
							SenderID:      uuid.Nil,
							ReceiverID:    &targetListing.AgentID,
							TargetAgentID: &targetListing.AgentID,
							Type:          "info",
						}
						ai.db.Create(&notification)
						
						ai.wsManager.BroadcastToUser(targetListing.AgentID, gin.H{
							"type":    "notification",
							"payload": notification,
						})
						ai.wsManager.BroadcastToUser(targetListing.AgentID, gin.H{
							"type":    "appointment_created",
							"payload": appointment,
						})
					} else {
						leadStatus = "error"
					}
				}
			} else {
				leadStatus = "invalid_input"
			}
		} else {
			leadStatus = "missing_fields"
		}
	}

	// 5. PASS 2: Formulation of Premium Advice / Explanation / Comparisons
	aiResponse, err := ai.generateAdvice(
		req.Message,
		req.History,
		finalMatchingListings,
		alternatives,
		compareListings,
		criteria,
		leadStatus,
		missingFields,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to compile AI response: " + err.Error()})
		return
	}

	// Render beautiful structured payload
	c.JSON(http.StatusOK, gin.H{
		"message":            aiResponse,
		"listings":           finalMatchingListings,
		"alternatives":       alternatives,
		"compare_listings":   compareListings,
		"preferences":        req.Preferences,
		"lead_status":        leadStatus,
		"missing_fields":     missingFields,
		"created_booking":    createdAppointment,
	})
}

// parseCriteria calls OpenAI in Step 1 to understand and extract parameters from the conversation
func (ai *AIAssistantController) parseCriteria(userMessage string, history []AIAssistantMessage, stationsList string) (*ExtractedCriteria, error) {
	systemPrompt := `You are the parsing module of an advanced AI real estate assistant.
Analyze the user's latest message and the conversation history to extract structured search criteria and user intent.

Available BTS/MRT stations list (ID, name, line):
` + stationsList + `

Rules:
1. Map fuzzy station names (e.g. "Onnut", "BTS Onnut", "On Nut") to the matching Station Name or ID from the list.
2. Formulate pricing inputs precisely. If the user specifies "under 12000" or "below 12000", set max_price to 12000. If "8500 to 12000", set min_price to 8500 and max_price to 12000.
3. Detect intent: 
   - Use "search" if they are looking for properties.
   - Use "compare" if they explicitly ask to compare properties (e.g., "compare A and B", "which one is better?").
   - Use "lead_generation" if they express interest to visit, book a viewing, schedule a viewing, or rent/buy a room.
   - Use "general_chat" for greetings or unrelated queries.
4. Extract Lead Details if lead_generation intent is detected. Search for fields like full name, phone number, email, date (format YYYY-MM-DD), time (format HH:MM), and Listing ID. Do not invent details; set them to null if missing.

Output ONLY a raw, structured JSON matching the schema below. DO NOT wrap the output in markdown code blocks or quotes.

JSON Schema:
{
  "property_type": "condo" | "house" | "land" | "townhome" | "",
  "listing_type": "sale" | "rent" | "",
  "min_price": float | null,
  "max_price": float | null,
  "bedrooms": int | null,
  "bathrooms": int | null,
  "min_area": float | null,
  "max_area": float | null,
  "station_name": "station name" | "",
  "landmark": "landmark name" | "",
  "search_text": "keywords" | "",
  "facilities": ["swimming pool", "gym", "washing machine", "parking", "pet friendly"] | null,
  "intent": "search" | "compare" | "lead_generation" | "general_chat",
  "comparison_listing_ids": ["uuid-1", "uuid-2"] | null,
  "lead_details": {
    "name": "name" | "",
    "phone": "phone" | "",
    "email": "email" | "",
    "preferred_date": "YYYY-MM-DD" | "",
    "preferred_time": "HH:MM" | "",
    "listing_id": "listing-uuid" | ""
  } | null
}`

	messages := []AIAssistantMessage{
		{Role: "system", Content: systemPrompt},
	}
	// Limit history payload
	historyLen := len(history)
	if historyLen > 6 {
		history = history[historyLen-6:]
	}
	messages = append(messages, history...)
	messages = append(messages, AIAssistantMessage{Role: "user", Content: userMessage})

	reqBody := OpenAIRequest{
		Model:       "gpt-4o",
		Temperature: 0.1,
		Messages:    messages,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", "https://api.openai.com/v1/chat/completions", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+ai.apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("OpenAI API error %d: %s", resp.StatusCode, string(body))
	}

	var openAIResp OpenAIResponse
	if err := json.NewDecoder(resp.Body).Decode(&openAIResp); err != nil {
		return nil, err
	}

	if len(openAIResp.Choices) == 0 {
		return nil, fmt.Errorf("no choice returned")
	}

	content := strings.TrimSpace(openAIResp.Choices[0].Message.Content)
	// Remove markdown wrapping if the model ignored instructions
	content = strings.TrimPrefix(content, "```json")
	content = strings.TrimPrefix(content, "```")
	content = strings.TrimSuffix(content, "```")
	content = strings.TrimSpace(content)

	var criteria ExtractedCriteria
	if err := json.Unmarshal([]byte(content), &criteria); err != nil {
		return nil, fmt.Errorf("failed to unmarshal criteria JSON: %v. Raw: %s", err, content)
	}

	return &criteria, nil
}

// calculateMatchScore ranks properties using 8 parameters (Location, Price, Type, Landmark, Transit, Features, Size, Preferences)
func (ai *AIAssistantController) calculateMatchScore(listing models.Listing, crit *ExtractedCriteria, stationID string) int {
	score := 0

	// 1. Property Type Match (Max: 15)
	if crit.PropertyType != "" {
		if strings.EqualFold(listing.PropertyType, crit.PropertyType) {
			score += 15
		}
	} else {
		score += 15
	}

	// 2. Listing Type Match (Max: 15)
	if crit.ListingType != "" {
		if strings.EqualFold(listing.ListingType, crit.ListingType) {
			score += 15
		}
	} else {
		score += 15
	}

	// 3. Location/Station Match (Max: 20)
	if stationID != "" {
		if listing.StationID == stationID {
			score += 20
		} else if listing.DistanceToStation > 0 && listing.DistanceToStation <= 500 {
			score += 15
		} else if listing.DistanceToStation > 0 && listing.DistanceToStation <= 1000 {
			score += 10
		}
	} else {
		score += 20
	}

	// 4. Budget Match (Max: 20)
	if crit.MaxPrice != nil || crit.MinPrice != nil {
		priceMatch := true
		if crit.MinPrice != nil && listing.Price < *crit.MinPrice {
			priceMatch = false
		}
		if crit.MaxPrice != nil && listing.Price > *crit.MaxPrice {
			priceMatch = false
		}

		if priceMatch {
			score += 20
		} else {
			// Partial points if off by less than 20%
			diff := 0.0
			if crit.MaxPrice != nil && listing.Price > *crit.MaxPrice {
				diff = (listing.Price - *crit.MaxPrice) / *crit.MaxPrice
			} else if crit.MinPrice != nil && listing.Price < *crit.MinPrice {
				diff = (*crit.MinPrice - listing.Price) / *crit.MinPrice
			}

			if diff <= 0.10 {
				score += 12
			} else if diff <= 0.20 {
				score += 6
			}
		}
	} else {
		score += 20
	}

	// 5. Size / Area Match (Max: 10)
	if crit.MinArea != nil || crit.MaxArea != nil {
		sizeMatch := true
		if crit.MinArea != nil && listing.Area < *crit.MinArea {
			sizeMatch = false
		}
		if crit.MaxArea != nil && listing.Area > *crit.MaxArea {
			sizeMatch = false
		}
		if sizeMatch {
			score += 10
		}
	} else {
		score += 10
	}

	// 6. Facilities/Features Match (Max: 10)
	if len(crit.Facilities) > 0 {
		matchedCount := 0
		descLower := strings.ToLower(listing.Description)
		titleLower := strings.ToLower(listing.Title)
		featuresLower := strings.ToLower(listing.Features)

		for _, fac := range crit.Facilities {
			facLower := strings.ToLower(fac)
			if strings.Contains(descLower, facLower) || strings.Contains(titleLower, facLower) || strings.Contains(featuresLower, facLower) {
				matchedCount++
			}
		}
		score += (matchedCount * 10) / len(crit.Facilities)
	} else {
		score += 10
	}

	// 7. Landmark Match (Max: 10)
	if crit.Landmark != "" {
		landLower := strings.ToLower(crit.Landmark)
		titleLower := strings.ToLower(listing.Title)
		descLower := strings.ToLower(listing.Description)
		addrLower := strings.ToLower(listing.Address)

		if strings.Contains(titleLower, landLower) || strings.Contains(descLower, landLower) || strings.Contains(addrLower, landLower) {
			score += 10
		}
	} else {
		score += 10
	}

	return score
}

// generateAdvice calls OpenAI in Step 2 to formulate the conversational consultant response
func (ai *AIAssistantController) generateAdvice(
	userMsg string,
	history []AIAssistantMessage,
	matches []models.Listing,
	alternatives []models.Listing,
	compares []models.Listing,
	criteria *ExtractedCriteria,
	leadStatus string,
	missingFields []string,
) (string, error) {
	// Construct data descriptors for listings
	listingsSummary := "No properties match."
	if len(matches) > 0 {
		listingsSummary = "MATCHING LISTINGS RETRIEVED:\n"
		for i, l := range matches {
			listingsSummary += fmt.Sprintf(
				"[%d] ID: %s, Name: %s, Price: %.0f, Location: %s, Area: %.0f sqm, Bedrooms: %d, Bathrooms: %d, Distance to BTS/MRT: %d meters, Station: %s, Facilities: %s, Description: %s\n",
				i+1, l.ID, l.Title, l.Price, l.Address, l.Area, l.Bedrooms, l.Bathrooms, l.DistanceToStation, l.StationName, l.Features, l.Description,
			)
		}
	}

	altSummary := ""
	if len(alternatives) > 0 {
		altSummary = "ALTERNATIVE/SIMILAR LISTINGS (Slightly relaxed search):\n"
		for i, l := range alternatives {
			altSummary += fmt.Sprintf(
				"[%d] ID: %s, Name: %s, Price: %.0f, Location: %s, Area: %.0f sqm, Bedrooms: %d, Bathrooms: %d, Distance to BTS/MRT: %d meters, Station: %s, Facilities: %s, Description: %s\n",
				i+1, l.ID, l.Title, l.Price, l.Address, l.Area, l.Bedrooms, l.Bathrooms, l.DistanceToStation, l.StationName, l.Features, l.Description,
			)
		}
	}

	compSummary := ""
	if len(compares) > 0 {
		compSummary = "LISTINGS FOR COMPARISON:\n"
		for i, l := range compares {
			compSummary += fmt.Sprintf(
				"[%d] ID: %s, Name: %s, Price: %.0f, Area: %.0f sqm, Bedrooms: %d, Bathrooms: %d, Station: %s, Distance: %d meters, Facilities: %s, Description: %s\n",
				i+1, l.ID, l.Title, l.Price, l.Area, l.Bedrooms, l.Bathrooms, l.StationName, l.DistanceToStation, l.Features, l.Description,
			)
		}
	}

	systemPrompt := `You are a professional real estate consultant for a premium estate firm.
Your tone must be helpful, friendly, active, and human-like. Never sound robotic or generic.
Analyze the provided listing data matching the user's requirements.

` + listingsSummary + `
` + altSummary + `
` + compSummary + `

CRITICAL RULES:
1. DO NOT output long bulleted lists of property specs, details (Price, Location, Area, Bedrooms, Facilities, Advantages, Disadvantages), or long headers for individual properties in your text response. These properties are already rendered as interactive graphical cards directly below your message bubble.
2. Provide a very concise, short summary (1-3 sentences total) of the found matching or alternative properties. Simply introduce them and state why they match, pointing the user to the cards below (e.g., "I couldn't find any exact matches near BTS On Nut with a washing machine, but I found 3 great alternative options nearby on the Sukhumvit line. You can explore their photos, amenities, and request a viewing using the cards below!").
3. DO NOT include excessive bold markup (**) or bullet points listing specs. Keep the text clean, brief, and friendly.
4. Do not invent any fake property listings or details. Use only listings from the retrieved context.
5. If the user asks for comparison, write a brief, clean high-level summary of the key differences in 2-3 sentences. A structured comparison table is already rendered below your message, so do not write out a large text table.
6. Lead Generation / Appointment Booking intent:
   - Lead Status: ` + leadStatus + `
   - Missing fields: ` + strings.Join(missingFields, ", ") + `
   - If lead status is "collected", confirm to the user that you have successfully scheduled their viewing request and that an agent will follow up.
   - If lead status is "missing_fields", politely ask the user for the missing fields (` + strings.Join(missingFields, ", ") + `) in a friendly way. Let them know why you need this information to secure the appointment.
   - If they like a property and want to book but haven't given listing_id, ask which property they are interested in.
7. Provide concise, premium responses. Do not wrap the entire response in markdown backticks.
8. Language consistency: You MUST reply in the exact same language as the user's latest query (e.g. if the user query is in Burmese, you must reply in Burmese; if in Thai, you must reply in Thai; if in English, reply in English). Maintain a highly professional and natural tone in that language.`

	messages := []AIAssistantMessage{
		{Role: "system", Content: systemPrompt},
	}
	
	// Limit history
	historyLen := len(history)
	if historyLen > 6 {
		history = history[historyLen-6:]
	}
	messages = append(messages, history...)
	messages = append(messages, AIAssistantMessage{Role: "user", Content: userMsg})

	reqBody := OpenAIRequest{
		Model:       "gpt-4o",
		Temperature: 0.7,
		Messages:    messages,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", "https://api.openai.com/v1/chat/completions", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+ai.apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("OpenAI API error %d: %s", resp.StatusCode, string(body))
	}

	var openAIResp OpenAIResponse
	if err := json.NewDecoder(resp.Body).Decode(&openAIResp); err != nil {
		return "", err
	}

	if len(openAIResp.Choices) == 0 {
		return "", fmt.Errorf("no choices returned")
	}

	return openAIResp.Choices[0].Message.Content, nil
}

// SharedChatPayload represents the data saved when a user shares a chat session
type SharedChatPayload struct {
	ID       string `json:"id"`
	Title    string `json:"title"`
	Messages string `json:"messages"` // JSON string representation of messages
}

func (ai *AIAssistantController) SaveSharedChat(c *gin.Context) {
	var req SharedChatPayload
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	if req.ID == "" || req.Title == "" || req.Messages == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID, Title and Messages are required"})
		return
	}

	// Create or update the shared chat
	sharedChat := models.SharedChat{
		ID:        req.ID,
		Title:     req.Title,
		Messages:  req.Messages,
		CreatedAt: time.Now(),
	}

	if err := ai.db.Save(&sharedChat).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save shared chat"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Shared chat saved successfully"})
}

func (ai *AIAssistantController) GetSharedChat(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID is required"})
		return
	}

	var sharedChat models.SharedChat
	if err := ai.db.Where("id = ?", id).First(&sharedChat).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Shared chat not found"})
		return
	}

	c.JSON(http.StatusOK, sharedChat)
}

