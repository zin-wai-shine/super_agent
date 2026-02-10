package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// OpenAI-compatible chat request/response (minimal)
type chatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type chatRequest struct {
	Model     string        `json:"model"`
	Messages  []chatMessage `json:"messages"`
	MaxTokens int           `json:"max_tokens,omitempty"`
}

type chatChoice struct {
	Message chatMessage `json:"message"`
}

type chatResponse struct {
	Choices []chatChoice `json:"choices"`
}

// AIClient calls an OpenAI-compatible API
type AIClient struct {
	BaseURL string
	APIKey  string
	Client  *http.Client
}

func NewAIClient(baseURL, apiKey string) *AIClient {
	if baseURL == "" {
		return nil
	}
	return &AIClient{
		BaseURL: baseURL,
		APIKey:  apiKey,
		Client:  &http.Client{Timeout: 60 * time.Second},
	}
}

// Complete sends a single user message and returns the assistant reply text
func (c *AIClient) Complete(systemPrompt, userMessage string, maxTokens int) (string, error) {
	if c == nil || c.BaseURL == "" {
		return "", fmt.Errorf("AI client not configured")
	}
	url := c.BaseURL + "/v1/chat/completions"
	if maxTokens <= 0 {
		maxTokens = 1024
	}
	reqBody := chatRequest{
		Model: "gpt-4o-mini",
		Messages: []chatMessage{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: userMessage},
		},
		MaxTokens: maxTokens,
	}
	body, _ := json.Marshal(reqBody)
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	if c.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+c.APIKey)
	}
	resp, err := c.Client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("AI API error %d: %s", resp.StatusCode, string(b))
	}
	var out chatResponse
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return "", err
	}
	if len(out.Choices) == 0 {
		return "", fmt.Errorf("AI API returned no choices")
	}
	return out.Choices[0].Message.Content, nil
}
