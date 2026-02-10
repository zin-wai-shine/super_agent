# AI Integration Strategy — Existing Plans, No New Pricing

**Document type:** Logic, process, system behavior, user interaction  
**Context:** Existing real estate SaaS (Go backend, React frontend, multi-tenant, plans, billing, upgrades/downgrades). Integrate AI to increase revenue per agent without new plans or renamed plans.  
**Scope:** Where AI appears, feature definitions, plan interaction, usage control, habit formation, upgrade/downgrade, data dependency, risk control, rollout.  
**No code. No new plans. No Millionaire Plan.**

---

## 1. AI Feature Insertion (Where & When)

### Where AI features appear

- **Property creation and editing:** In the listing create/edit screen: description field, price field, media area. AI appears as actions next to those fields (e.g. “Generate description”, “Suggest price”, “Translate”, “Enhance image”).
- **Listing promotion and marketing:** Where the agent shares or promotes a listing (e.g. “Create social post”, “Copy for ad”). AI suggests or generates short copy from the current listing.
- **Agent website:** On the public site: chat widget for visitors, and on the listings page a natural-language search box. AI powers the chat replies and the search interpretation.
- **Lead inbox and messaging:** Next to each message or thread: “Reply with AI”, “Translate”. AI suggests or drafts a reply, or translates incoming/outgoing text.
- **Agent dashboard:** Summary of AI usage (e.g. “You used the assistant X times this month”), quick actions (“Draft descriptions for new listings”), and when approaching limits a single line about usage or upgrade.

So AI is embedded in the same surfaces agents already use daily; there is no separate “AI app” or “AI section”.

### When AI is triggered

- **Manually by agent:** The agent clicks “Generate description”, “Translate”, “Suggest price”, “Reply with AI”, etc. Every such action is an explicit trigger.
- **Automatically by system:** Optional: when a visitor sends a message on the website chat, the system can auto-reply with AI without the agent clicking. Same for smart search: visitor types a query and the system runs the search. The “trigger” is the visitor action; the agent has configured that the chat/search use AI.
- **Contextually based on behavior:** The system can surface a nudge (e.g. on the dashboard) like “You have 3 new listings without descriptions — generate them with one click” when the agent has draft listings and has used AI before. The nudge does not run AI by itself; it invites a manual trigger.

---

## 2. AI Feature Definitions (Logic Only)

### AI property description generation

- **Problem:** Writing listing descriptions is slow and repetitive; quality varies.
- **Trigger:** Agent clicks “Generate description” (or similar) on the listing form.
- **Input:** Current listing context: type, size, bedrooms, bathrooms, location, price (if set), and any fields already filled.
- **Output:** One or more draft description texts the agent can accept, edit, or discard.
- **Interaction:** Single click; draft appears in the description field. Agent edits if needed and saves.
- **Why it increases income or saves time:** Agents create more listings in less time; better copy can improve views and leads, so revenue per agent can rise.

### Multi-language listing translation (English / Thai / Myanmar)

- **Problem:** One listing in one language limits reach; manual translation is slow.
- **Trigger:** Agent clicks “Translate” (or “Translate to Thai”, etc.) from the listing form or from the description field.
- **Input:** Source text (full description or selection) and target language.
- **Output:** Translated text in the chosen language, placed in the same or a language-specific field.
- **Interaction:** Select language, click translate; text updates in place. Agent reviews and saves.
- **Why it increases income or saves time:** One listing can serve multiple languages and markets, increasing leads and closings without hiring translators.

### AI image enhancement / virtual staging

- **Problem:** Poor or empty-room photos reduce interest; professional staging is costly.
- **Trigger:** Agent uploads an image in the listing media area and clicks “Enhance” or “Virtual stage”.
- **Input:** The uploaded image; optionally room type or “stage as living room”.
- **Output:** Enhanced image (lighting, clarity) or virtually staged image. Agent can accept or revert.
- **Interaction:** Action on the image; result shown; agent keeps or discards.
- **Why it increases income or saves time:** Better visuals can increase inquiries and viewings; agents list more properties without a photographer for every unit.

### AI chatbot for agent websites

- **Problem:** Visitors ask questions outside business hours; slow reply loses leads.
- **Trigger:** Visitor opens the chat on the agent’s site and sends a message. System (and optionally the agent) can configure “use AI for first reply”.
- **Input:** Visitor message; optional context (current page, listing ID).
- **Output:** A reply that answers the question or offers to connect to the agent; optionally a lead record is created in the agent’s inbox.
- **Interaction:** Visitor chats; AI replies in real time. Agent sees the thread in the inbox and can take over.
- **Why it increases income or saves time:** Captures and qualifies leads 24/7; faster response can improve close rates.

### Smart property search (natural language)

- **Problem:** Visitors struggle with filters; natural language is easier (“3 bedroom condo near BTS under 50k”).
- **Trigger:** Visitor types a query in the search box on the agent’s listings page and submits.
- **Input:** Free-text query; optional current filters or location.
- **Output:** A set of listings matching the intent, shown in the same list/grid as normal search.
- **Interaction:** Visitor types and sees results; no separate “AI search” page.
- **Why it increases income or saves time:** Better discovery leads to more qualified leads and higher engagement agents attribute to the product.

### AI rent / price suggestion

- **Problem:** Wrong price means long vacancy or lost deals; agents often guess.
- **Trigger:** Agent is on the listing form at the price field and clicks “Suggest price” or “Suggest rent”.
- **Input:** Listing attributes (type, size, bedrooms, location, listing type rent/sale) and optionally comparable data if the system has it.
- **Output:** A suggested price or range and a short note (e.g. “Based on similar listings in this area”). Agent can accept, adjust, or ignore.
- **Interaction:** One click; suggestion appears near the price field. Agent enters the final price.
- **Why it increases income or saves time:** Faster listing creation and better pricing can improve occupancy and deal flow.

---

## 3. Existing Plan & Permission Interaction

### How AI respects existing plan permissions

- Each **existing plan** (e.g. Free, Starter, Professional, Enterprise) has a set of **capabilities**. AI is treated as a capability: “this plan allows AI” and “this plan has AI usage limit X”.
- Plan metadata (already in the system) is extended only by **flags or limits** (e.g. “AI enabled”, “monthly AI usage cap”). No new plan names, no new pricing tiers. Same plan names and prices; only what the plan allows and how much AI it can use is defined.

### Which AI actions are fully allowed, limited, or disabled

- **Fully allowed:** The plan has AI enabled and the agent is under the usage cap. Every allowed AI action (description, translate, price, etc.) can run until the cap is reached.
- **Limited by usage:** The plan has AI enabled but usage is metered (e.g. N actions per month). Once the agent hits the cap, further AI actions are restricted (see Section 4). Within the cap, actions are fully allowed.
- **Disabled:** The plan does not include AI (e.g. lowest tier). AI entry points are hidden or shown as locked with a message like “Available on [next plan name]”. No usage is consumed.

So: **Fully allowed** = plan allows AI and under cap; **Limited** = plan allows AI but over cap; **Disabled** = plan does not allow AI.

### How plan limits interact with AI usage

- **Plan permission check:** When the agent triggers an AI action, the system first checks: does this plan allow AI at all? If no, the action is disabled and the agent sees the “upgrade plan” message. If yes, the system proceeds to the usage check.
- **Usage check:** The system looks up the agent’s current usage (e.g. this month) and the plan’s cap. If usage is below the cap, the action runs and usage is incremented. If at or over the cap, the action is restricted (e.g. blocked or moved to “grace” — see Section 4).
- **AI execution or restriction:** Only if both checks pass does the AI run. Otherwise the agent sees a clear message: “AI not available on your plan” or “You’ve reached your monthly AI limit.”

Decision logic in short: **Agent action → Plan permission check (AI allowed for this plan?) → Usage check (under cap?) → AI execution or restriction.**

---

## 4. AI Usage Control (No New Plans)

### How AI usage is measured

- Each AI action has a **cost in units** (e.g. 1 request = 1 unit, or heavier actions like image generation = more units). The system records “agent X used Y units this period.”
- Usage is stored per agent, per period (e.g. per calendar month or per billing month). The **cap** is defined per plan (e.g. Starter = 500 units/month, Professional = 2000). Same existing plans; only a numeric cap is attached to each.

### How limits reset

- **Monthly reset:** Usage resets at the start of each billing or calendar month for that agent. No carry-over unless the product explicitly defines it for a given plan.
- **Daily reset (optional):** For “grace” (see below), a small number of uses per day may reset at midnight. That is only for the grace state, not the main cap.

### What happens when usage reaches the limit

- **Before limit:** The system can show “You’ve used X of Y AI actions this month” on the dashboard or after an action so the agent is not surprised.
- **At limit:** The system does **not** hard-block in the middle of a request. It finishes the current action, then applies the rule: no further AI until next period, **or** the agent enters a **grace** state (e.g. a few reduced-speed or limited actions per day) so they can still work but feel the limit.
- **Message:** One clear, non-repeated message: “You’ve reached your monthly AI limit. You have [X] light uses left today, or your limit resets on [date].” Optionally: “Upgrade your plan for more AI” (pointing to the **existing** higher plan, not a new one).

### How this creates natural upsell, fairness, and cost control

- **Natural upsell:** Agents who hit the limit and rely on AI will consider moving to an existing higher plan that has a higher cap. The system only surfaces the existing upgrade path; no new plans.
- **Fairness:** Everyone on the same plan has the same cap; heavy users hit the limit, light users do not. So usage-based pressure is perceived as fair.
- **Cost control:** Caps ensure no single agent (or the whole base) can unboundedly consume AI; the system stays within predictable cost.

---

## 5. Daily Usage & Habit Formation

### Which AI features are used daily

- **Listing creation/editing:** Agents who add or update listings use “Generate description”, “Translate”, “Suggest price” frequently. These become daily if the agent creates or edits listings daily.
- **Lead inbox:** “Reply with AI” and “Translate” are used every time the agent handles messages. If the agent checks the inbox daily, inbox AI is daily.
- **Agent dashboard:** Viewing “AI usage this month” and quick actions (e.g. “Draft descriptions”) reinforces that AI is part of the workflow.

So the features that are used daily are those tied to **listing form**, **inbox**, and **dashboard**.

### How AI becomes part of the agent’s routine

- AI is the **default next step** in existing tasks: e.g. open listing form → fill basics → click “Generate description” → edit → save. No separate “go to AI” step.
- Over time the agent relies on AI for speed and quality; going back to manual writing or pricing feels like a step backward. That creates habit and stickiness.

### How the system nudges usage gently

- **Dashboard:** Short line like “You have 3 listings without descriptions — use the assistant to generate them” when the agent has drafts and has used AI before.
- **After an action:** Optional “You’ve used the assistant X times this month” so the agent sees value.
- **No spam:** One nudge per context (e.g. once per day on dashboard), no repeated popups. Notifications or reminders are rare and value-focused (“Get more leads” not “Use AI”).

### How this reduces churn

- Agents who use AI daily associate the product with productivity. Leaving means losing that productivity, so churn goes down.
- Because AI is inside existing plans and caps, agents do not feel “tricked” into a new product; they feel the same product got better, which supports retention.

---

## 6. Upgrade & Downgrade Behavior

### When the system suggests upgrading (existing plan)

- When the agent **hits the AI usage cap** and would benefit from a higher cap: the message is “You’ve reached your AI limit for this month. [Existing plan name] includes [X] more AI actions — upgrade here.”
- When the agent **tries an AI feature that is disabled on their plan**: the message is “This feature is available on [existing plan name]. Upgrade to use it.”
- **No new plans:** All suggestions point to existing plans (e.g. Starter → Professional). Messaging is “upgrade to [existing plan] for more AI,” not “buy a new AI plan.”

### What behavioral signals trigger suggestions

- **Hitting the cap:** Agent has used 100% of their monthly AI allowance.
- **Frequent near-cap:** Agent has been at e.g. 80%+ of cap in two or more months — optional gentle nudge: “You often use most of your AI — consider [next plan] for more.”
- **Trying a disabled feature:** Agent on a plan that does not include AI (or a specific AI feature) clicks that feature.

### How messaging focuses on value, not selling

- **Problem–solution:** “You’ve run out of AI actions” → “Upgrade to [plan] to get [X] more actions so you can keep going.”
- **One CTA per moment:** One button or one link; no multiple popups or long copy.
- **Reversible:** Agent can dismiss; the suggestion can reappear at the next natural moment (e.g. next time they hit the limit).

### Downgrade effects

- **What AI features become limited:** The new plan’s cap applies. If the new plan has a lower cap, the agent will hit the limit sooner. If the new plan has no AI, all AI features are disabled after the downgrade takes effect.
- **What slows down:** If the agent was relying on AI for descriptions, replies, or pricing, those tasks become manual again — so work slows down.
- **What remains usable:** All non-AI features of the new plan remain usable. Data (listings, inbox, etc.) stays; only AI capability and usage allowance change.

---

## 7. Data Dependency & Ethical Lock-In

### How AI-generated content becomes embedded in workflows

- Descriptions, translations, and suggested prices are **saved in the listing**; suggested replies may be sent and stored in the inbox. So the agent’s content and history are partly AI-generated. The workflow “create listing with AI, edit, save” becomes the default; the agent’s “way of working” depends on having the AI step available.

### Why leaving feels inconvenient

- If the agent switches to another product or downgrades to a plan with no AI, they lose the **ongoing** use of AI (generate, translate, suggest). They do **not** lose the content already created; they lose the convenience and speed of continuing to use AI. So leaving or downgrading is inconvenient (more manual work) but not “data hostage.”

### Why agents still feel respected and in control

- **Data ownership:** Listings, messages, and other data remain the agent’s. They can export or continue to use them on the new plan; the product does not lock data behind AI.
- **Transparency:** The agent sees what their plan allows and what happens at the limit. No hidden removal of data or access.
- **Control:** The agent chooses when to use AI (manual trigger); the agent can edit or discard any AI output. So the system feels like a tool that assists, not one that takes over.

---

## 8. Risk & Cost Control Logic

### AI abuse prevention

- **Rate limits:** Unusually high request rate (e.g. many requests per minute) is detected. The system throttles (e.g. delay or queue) or temporarily restricts that agent. Logic runs automatically; no manual step in the normal flow.
- **Pattern detection:** Bulk, scripted-looking use (e.g. same action in a loop) is treated differently from normal one-by-one use. The system can throttle or require a short delay between similar actions.
- **Policy:** Use is for the agent’s own business. Resale or large-scale external use can be restricted by policy; when patterns suggest that, the system applies restrictions and may alert for review.

### Free-plan protection

- If there is a free plan, it either has **no AI** or a **very low cap** (e.g. 5 actions per month). So free users cannot abuse AI and do not consume disproportionate cost. The upgrade path is to an **existing** paid plan.

### High-usage agent handling

- Agents who consistently use near or at the cap are **within the product design**: they are heavy users, and the cap applies. If the system has alerts (e.g. when an agent’s cost exceeds a threshold), it can auto-throttle or flag for review. The goal is to keep cost predictable while avoiding surprise for normal heavy use.

### Cost explosion prevention

- **Per-agent cap:** The plan’s monthly AI cap limits total use per agent. So no single agent can unboundedly increase cost.
- **Aggregate monitoring:** When total AI cost (system-wide or per segment) crosses a threshold, the system alerts. Optional auto-throttle for the top N heaviest users until reviewed. All handled by logic; parameters (caps, thresholds) are configurable.

---

## 9. Rollout & Migration Strategy

### How to introduce AI features to existing users

- **Announce as part of the product:** “Your [product name] now includes an assistant for descriptions, translation, and pricing.” No new plan names; AI is a capability inside existing plans.
- **Place in existing flows:** Add “Generate description”, “Suggest price”, “Translate”, “Reply with AI” where agents already work (listing form, inbox, dashboard). No new section or app; adoption is “use what you already do, with one more click.”
- **Defaults that teach:** The first time the agent opens the listing form after release, an optional short tip: “Generate a description in one click.” One tip per feature, once. No long tutorials.
- **Visibility of usage:** From day one, show “X of Y AI actions this month” (or similar) on the dashboard or in the header so agents understand limits and reset.

### How to test safely with a small group

- **Pilot segment:** Choose a small set of agents (e.g. 20–50) from one or two existing plans. Invite them: “We’re testing new AI features in your plan. You’ll get early access; we’d like your feedback.”
- **What to observe:** Which features they use, how often, where they get stuck, and when they hit the cap. Also support tickets and feedback.
- **Pilot duration:** Run for at least one billing cycle so usage and limit behavior are visible. Adjust caps or messaging based on what you see.
- **Then expand:** Roll out to the next plan or next cohort. Same logic; tune copy and caps from pilot feedback.

### How to avoid disrupting current workflows

- **No big bang:** Do not launch every AI feature and a new dashboard on the same day. Roll out one or two features (e.g. description and translation) first, then add price, inbox, chat, search over time.
- **Progressive disclosure:** Show only the features the agent’s plan allows. Locked features appear as “Available on [existing plan name],” not as a long list of grayed-out options.
- **One primary CTA:** When the agent is at the limit, one message and one upgrade path. No repeated or aggressive prompts so the product feels calm and predictable.

---

## Summary Table

| Area | Principle |
|------|-----------|
| **Where AI appears** | Listing form, promotion, agent website, lead inbox, dashboard. No new “AI app.” |
| **When triggered** | Manually by agent; automatically for chat/search by visitor; contextually via nudges (invite only). |
| **Features** | Description, translation, image enhance/staging, chatbot, smart search, price suggestion. Each: problem, trigger, input, output, interaction, value. |
| **Plan interaction** | Existing plans only. AI allowed / limited / disabled by plan; usage capped per plan. Decision: action → plan check → usage check → run or restrict. |
| **Usage control** | Measured per agent per period; caps per plan; reset monthly. At limit: no hard block mid-request; grace or clear message; one upgrade CTA to existing plan. |
| **Daily habit** | Listing + inbox + dashboard AI used daily; AI is default next step; gentle nudges; reduces churn. |
| **Upgrade/downgrade** | Suggest upgrade when at cap or when trying disabled feature; point to existing plans only. Downgrade: lower cap or no AI; data stays. |
| **Data dependency** | AI content embedded in workflow; leaving is inconvenient but data is not held hostage; transparency and control. |
| **Risk control** | Abuse: rate/pattern limits, throttle. Free: no or minimal AI. Cost: per-agent cap + aggregate alerts. All by logic. |
| **Rollout** | Introduce inside existing plans; pilot small group; roll out gradually; avoid disrupting current workflows. |

---

*This document replaces the previous “Millionaire Plan”–centric logic with an integration strategy that uses only existing plans, renames no plans, and adds no new pricing. AI is a capability and usage-based dimension inside the current plan structure.*
