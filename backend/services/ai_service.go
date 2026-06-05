package services

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"super_real_estate/models"

	"gorm.io/gorm"
)

type AIService struct {
	DB     *gorm.DB
	APIKey string
}

func NewAIService(db *gorm.DB) *AIService {
	return &AIService{
		DB:     db,
		APIKey: os.Getenv("OPENAI_API_KEY"),
	}
}

type OpenAIChatRequest struct {
	Model       string    `json:"model"`
	Messages    []Message `json:"messages"`
	Temperature float64   `json:"temperature"`
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type OpenAIResponse struct {
	Choices []struct {
		Message Message `json:"message"`
	} `json:"choices"`
}

// GenerateHash creates a SHA256 hash of the source text and target language
func (s *AIService) GenerateHash(sourceText, targetLang string) string {
	hasher := sha256.New()
	hasher.Write([]byte(sourceText + "|" + targetLang))
	return hex.EncodeToString(hasher.Sum(nil))
}

// Translate handles the translation logic with caching
func (s *AIService) Translate(sourceText, targetLang string) (string, error) {
	if strings.TrimSpace(sourceText) == "" {
		return "", nil
	}

	// 1. Check Cache
	hash := s.GenerateHash(sourceText, targetLang)
	var cache models.TranslationCache
	if err := s.DB.Where("hash = ?", hash).First(&cache).Error; err == nil {
		// Cache hit! Return immediately without calling AI
		return cache.TranslatedText, nil
	}

	// 2. Prepare OpenAI API request if cache missed
	if s.APIKey == "" {
		return "", fmt.Errorf("OPENAI_API_KEY is not set")
	}

	targetLanguageName := "Myanmar (Burmese)"
	if targetLang == "zh" {
		targetLanguageName = "Simplified Chinese"
	}

	systemPrompt := fmt.Sprintf(`You are an expert real estate translator. 
Translate the provided text into %s professionally for real estate marketing.
CRITICAL RULES:
1. DO NOT translate proper nouns (Property names, Project names, Developer names).
2. DO NOT translate BTS/MRT station names (e.g., "BTS Asoke").
3. DO NOT translate Addresses or Locations.
4. DO NOT translate Prices or numbers.
5. DO NOT translate Measurements (e.g., "Sqm", "Sq.m.").
6. Return ONLY the translated text, with no conversational filler, quotes, or markdown blocks unless present in the source.`, targetLanguageName)

	reqBody := OpenAIChatRequest{
		Model:       "gpt-4o", // User recommended gpt-4o for highest quality translation
		Temperature: 0.1,      // Low temperature for accurate, deterministic translation
		Messages: []Message{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: sourceText},
		},
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %v", err)
	}

	req, err := http.NewRequest("POST", "https://api.openai.com/v1/chat/completions", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+s.APIKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to execute request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("OpenAI API returned non-200 status: %d - %s", resp.StatusCode, string(body))
	}

	var openAIResp OpenAIResponse
	if err := json.NewDecoder(resp.Body).Decode(&openAIResp); err != nil {
		return "", fmt.Errorf("failed to decode response: %v", err)
	}

	if len(openAIResp.Choices) == 0 {
		return "", fmt.Errorf("no translation choices returned from OpenAI")
	}

	translatedText := strings.TrimSpace(openAIResp.Choices[0].Message.Content)

	// 3. Save to Cache for future use
	newCache := models.TranslationCache{
		Hash:           hash,
		SourceText:     sourceText,
		LangCode:       targetLang,
		TranslatedText: translatedText,
	}
	// Use Clauses to handle concurrent inserts safely
	s.DB.Create(&newCache)

	return translatedText, nil
}
