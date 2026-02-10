# Millionaire Plan — Implementation Summary

This document summarizes what was **implemented in code** for the AI-powered Millionaire Plan. For strategy and product design, see **Millionaire-Plan-Strategy.md** and **Millionaire-Features-Product-Design.md**.

---

## Backend (Go)

### Config
- **`config/database.go`**: Added `AIAPIURL` and `AIAPIKey` (env: `AI_API_URL`, `AI_API_KEY`). Used for OpenAI-compatible chat API.

### Models
- **`models/models.go`**:
  - **Subscription**: `AITier` (none | basic | pro | millionaire), `MonthlyAICredits`.
  - **AICreditBalance**: Per-agent, per-month usage: `AgentID`, `PeriodMonth` (e.g. `2006-01`), `CreditsAllowed`, `CreditsUsed`, `GraceDailyUsed`, `GraceDailyReset` (for grace mode when credits exhausted).

### AI Service
- **`utils/ai.go`**: `AIClient` calls OpenAI-compatible `/v1/chat/completions`. `Complete(systemPrompt, userMessage, maxTokens)` returns assistant text.

### AI Controller
- **`controllers/ai_controller.go`**:
  - **GetCredits** `GET /agent/ai/credits`: Returns `credits_remaining`, `credits_total`, `period_end`, `in_grace`, `ai_tier`, `ai_enabled`, `upgrade_message`.
  - **GenerateDescription** `POST /agent/ai/description`: Body: title, property_type, listing_type, bedrooms, bathrooms, area, address, district, province, price. Consumes 5 credits. Returns `description`.
  - **Translate** `POST /agent/ai/translate`: Body: `text`, `target` (en | th | my). Consumes 3 credits. Returns `translated_text`.
  - **SuggestPrice** `POST /agent/ai/suggest-price`: Body: property_type, listing_type, bedrooms, bathrooms, area, district, province. Consumes 2 credits. Returns `suggested_price`, `range_low`, `range_high`, `note`.
  - Plan check: Agent must have a subscription; `AITier` must not be `none`; credits checked/deducted; grace mode (5 uses/day when exhausted) applied when needed.

### Routes
- Under `protected` + `agent` group: `GET /agent/ai/credits`, `POST /agent/ai/description`, `POST /agent/ai/translate`, `POST /agent/ai/suggest-price`.

### Migration & Seed
- **`main.go`**: AutoMigrate `AICreditBalance`. Seed plans updated with `AITier` and `MonthlyAICredits`:
  - Free: none, 0
  - Starter: basic, 500
  - Professional: pro, 2000
  - Enterprise: pro, 5000
  - **Millionaire**: millionaire, 10000 (new plan)

---

## Frontend (React)

### API
- **`services/api.js`**: **aiApi** — `getCredits()`, `generateDescription(data)`, `translate(text, target)`, `suggestPrice(data)`. Duplicate `updateTheme` removed.

### Components
- **`components/Common/AICreditsBadge.js`**: Fetches `/agent/ai/credits`, shows remaining/total and “Upgrade” when AI disabled or low/grace. Rendered in agent header.

### Layout
- **`components/Layout/DashboardLayout.js`**: Renders `AICreditsBadge` in the top bar for agent role only.

### Pages
- **CreateListing.js**:
  - Description: “Generate with AI” button (uses form fields); “EN” / “TH” / “MM” translate buttons when description exists.
  - Price: “Suggest” button (uses property fields). Toasts for success and for 403/402/errors.
- **EditListing.js**: Same AI actions (Generate description, Translate, Suggest price) with same error handling.
- **AgentDashboard.js**: “AI Listing Assistant” card with short copy and “Create listing with AI” link to `/agent/listings/new`.

---

## Environment

Backend needs an OpenAI-compatible API for AI features to work:

```env
AI_API_URL=https://api.openai.com
AI_API_KEY=sk-...
```

If `AI_API_URL` is empty, AI endpoints return 503 “AI service not configured”. Agents still see UI; they get a clear error when they trigger an action.

---

## Enabling AI for an Agent

1. **Assign a plan with AI**: In Super Admin → Agents, set the agent’s subscription to Starter or above (or Millionaire for 10k credits).
2. **Optional**: In Super Admin → Subscription Plans, edit a plan’s `ai_tier` and `monthly_ai_credits` (via API or DB until admin UI fields are added).

---

## Credit Costs (Backend Constants)

| Action            | Credits |
|-------------------|--------|
| Generate description | 5   |
| Translate         | 3      |
| Suggest price     | 2      |

Grace mode: when monthly credits are exhausted, agents get 5 “light” uses per day (same costs) until the next billing period.

---

*Implementation matches the logic described in Millionaire-Plan-Strategy.md and Millionaire-Features-Product-Design.md.*
