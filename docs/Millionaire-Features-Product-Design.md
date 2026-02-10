# Millionaire Features — Product Integration Design

**Document type:** Feature map, process flow, decision logic, system behavior  
**Context:** Existing real estate SaaS (Go API, React frontend, multi-tenant, plans, billing). Adding AI without rewriting the system.  
**Scope:** Where AI lives, what it does, how plans and credits gate it, daily habit, risk control, rollout.  
**No code. No tech stack changes.** Logic and experience only.

---

## 1. AI Feature Map (Where Features Live)

Each AI feature is placed where the agent already works. The goal: AI appears in the path of existing tasks so usage is daily and natural, and premium usage drives revenue.

### Agent dashboard

- **What lives here:** AI usage summary (credits used this month, top actions), quick actions (“Draft 3 listing descriptions,” “Reply to 5 inquiries”), and upgrade or top-up prompts when approaching limits.
- **Why here:** The dashboard is the first screen after login. Showing AI usage and one-click AI actions makes the assistant the default starting point. Agents who see “You used the assistant 12 times this week” and “Draft today’s listings” form a habit. Revenue: heavy users see limits here and get a clear path to upgrade or add credits.

### Property listing creation / edit

- **What lives here:** AI property description generator, multi-language translation, AI pricing suggestion, and (if in scope) AI image enhancement or virtual staging. Each appears as a button or inline option next to the relevant field (e.g. “Generate description,” “Translate to Thai,” “Suggest price,” “Enhance image”).
- **Why here:** Creating or editing a listing is a high-frequency, high-friction task. Putting AI next to the fields that take the most time (description, price, photos, languages) means every new or updated listing can trigger AI use. Revenue: listing volume correlates with plan tier and credits; more listings mean more consumption and more reason to stay on or upgrade to a higher plan.

### Marketing tools (if present) or listing promotion

- **What lives here:** AI-generated social post or ad copy from the current listing, “Share to Facebook/LINE” style flows with pre-written captions, and optional image suggestions for ads.
- **Why here:** Agents who promote listings are serious about volume. AI that turns “this listing” into “this week’s posts” saves time and increases perceived value. Revenue: marketing-heavy agents are power users; they hit limits and upgrade or buy add-ons.

### Agent website (public-facing)

- **What lives here:** AI chatbot on the agent’s public site (e.g. “Ask about this property” or “Chat with us”). Optionally, smart property search (natural language) on the listings page.
- **Why here:** The website is where leads appear. A chatbot that answers questions and qualifies interest keeps the agent’s brand “always on” and feeds leads into the same inbox they already use. Revenue: chatbot usage can be metered per agent (e.g. conversations or messages per month); high-traffic agents need higher plans or more credits. Natural-language search increases engagement and conversions, which agents attribute to the product.

### Lead inbox (inquiries, appointments, messages)

- **What lives here:** AI-suggested replies to inquiries (“Reply with AI”), one-click translation of incoming messages, and optional “Summarize this thread” or “Suggest next step.” Buttons live next to each message or thread.
- **Why here:** Inbox is checked many times per day. “Reply with AI” and translation turn every open thread into a potential AI use. Fast response improves close rates; agents attribute that to the product. Revenue: inbox AI is highly habitual; running out of credits here creates immediate upgrade pressure.

### Summary: why these locations maximize usage and revenue

- **Daily usage:** Dashboard, listing create/edit, and inbox are used every day. AI in these surfaces gets used every day.
- **Revenue:** High-value actions (description, translation, chatbot, pricing) consume credits; power users hit limits and upgrade. Premium plans (e.g. Millionaire) feel necessary for agents who rely on these flows.
- **Habit:** AI is not a separate “AI section”; it is the default next step in existing tasks. That creates dependence and makes downgrading feel like losing a team member.

---

## 2. AI Feature Definitions (Process Only)

For each feature: trigger, input, output, agent interaction, and why it saves time or increases income.

### AI property description generator

- **Trigger:** Agent clicks “Generate description” (or similar) on the listing create/edit screen, from a field tied to the listing (e.g. description or title).
- **Input:** Listing context: property type, size, bedrooms, bathrooms, location/area, key features, price (if entered). Optional: agent’s tone or brand hints (e.g. “luxury,” “family-friendly”).
- **Output:** One or more ready-to-use description drafts (and optionally a short headline). Agent can accept, edit, or regenerate.
- **Interaction:** Single click to generate; text appears in the same form. Agent edits if needed and saves. No separate screen.
- **Why it saves time or increases income:** Writing descriptions is slow and repetitive. Good copy improves listing appeal and inquiry rate. Agents do more listings in less time and attribute better performance to the product.

### Multi-language listing translation (English / Thai / Myanmar)

- **Trigger:** Agent clicks “Translate” (or “Translate to Thai,” “Translate to Myanmar”) from the listing create/edit screen, or from a listing detail view. Optionally triggered after generating a description (“Generate in English, then translate to Thai and Myanmar”).
- **Input:** Source text (full description, headline, or selected paragraph) and target language(s). Listing context can be used to keep terms consistent (e.g. “condo,” “sqm”).
- **Output:** Translated text in the chosen language(s), placed in the same field or in language-specific fields. Agent can edit and save.
- **Interaction:** Select language, click translate; text updates in place. Agent reviews and saves. No separate translation page.
- **Why it saves time or increases income:** Southeast Asia is multilingual. One listing in three languages reaches more buyers and renters without hiring translators. More reach, more leads, more closings; agents associate that with the product.

### AI image enhancement / virtual staging

- **Trigger:** Agent uploads a photo in listing create/edit (or media gallery) and clicks “Enhance” or “Virtual stage.” Optionally offered when the agent has few or low-quality images.
- **Input:** Uploaded image(s), optional room type or “stage as living room / bedroom.” Listing context (e.g. property type) can guide style.
- **Output:** Enhanced image (lighting, clarity) or virtually staged image (furniture added). Agent can accept, replace original, or discard.
- **Interaction:** Action on the image (button or right-click). Result shown side-by-side or as replacement. Agent keeps or reverts.
- **Why it saves time or increases income:** Good photos increase clicks and viewings. Virtual staging helps empty units. Agents list more properties and get more inquiries without a photographer for every unit; they attribute better results to the product.

### AI chatbot for agent websites

- **Trigger:** Visitor on the agent’s public site opens the chat widget and sends a message, or clicks “Ask about this property” on a listing.
- **Input:** Visitor message, optional context (current page, listing ID if on a listing page). Agent’s FAQs, listing summaries, or brand info can be used as context.
- **Output:** A reply that answers the question, suggests listings, or offers to connect to the agent. Optionally: “An agent will follow up” and creation of a lead or inquiry in the agent’s inbox.
- **Interaction:** Visitor chats; AI replies in real time. Agent sees the thread in inbox and can take over or let AI continue. Agent can tune tone or answers in settings (no implementation detail; just that they can influence behavior).
- **Why it saves time or increases income:** Chat captures leads 24/7. Agents respond faster and don’t lose night/weekend inquiries. More leads and higher close rates; agents see the chatbot as essential and don’t want to lose it.

### Smart property search (natural language)

- **Trigger:** Visitor on the agent’s listings page types a natural-language query (e.g. “3 bedroom condo near BTS under 50k”) in a search box, or uses a “Search by description” option.
- **Input:** Free-text query. Optional: current filters (location, price) and listing corpus.
- **Output:** A set of listings that match the intent (and optionally a short “We found X listings…”). Results shown in the same list/grid the site already uses.
- **Interaction:** Visitor types and submits; results refresh. No separate “AI search” page; same UX as normal search but with natural language.
- **Why it saves time or increases income:** Visitors find the right properties faster; agents get more qualified leads. Agents see higher engagement and attribute it to the product, making the feature a reason to stay on a plan that includes it.

### AI pricing suggestion / rent range

- **Trigger:** Agent is on listing create/edit, in the price or rent field, and clicks “Suggest price” or “Suggest rent range.”
- **Input:** Listing attributes (location, size, bedrooms, type, comparable area), optional: similar listings’ prices from the same agent or market (if available in the system).
- **Output:** A suggested price or range (e.g. “Suggested: 45,000–50,000 THB/month”) with optional short reasoning (“Based on similar listings in this area”). Agent can accept, adjust, or ignore.
- **Interaction:** One click; suggestion appears near the price field. Agent types the final price. No separate pricing tool.
- **Why it saves time or increases income:** Pricing is hard; wrong price means lost deals or long vacancy. A suggestion speeds up listing creation and improves outcomes. Agents rely on it and don’t want to go back to guessing.

---

## 3. Plan & Permission Interaction Logic

AI access is gated by the agent’s current plan. The logic is: agent action → plan check → AI access decision → outcome.

### How existing plans gate AI features

- Each plan has an **AI tier:** e.g. None, Basic, Pro, Millionaire.
- Each AI feature has a **minimum tier** to use it (e.g. description generator = Basic+, translation = Basic+, chatbot = Pro+, virtual staging = Pro+, smart search = Pro+, pricing suggestion = Basic+).
- Within a tier, **credits** (see Section 4) cap how much the agent can use per billing cycle. Plan defines access; credits define usage.

### Which AI features are locked, limited, or fully enabled

- **Locked:** Not available on the plan. The button or entry point is hidden or shown as locked with “Upgrade to [Plan] to use this.” No credits consumed.
- **Limited:** Available but subject to a credit allowance. When credits run out, the feature moves to “grace” (e.g. reduced use per day) or soft block with upgrade/add-credits CTA. See Section 4.
- **Fully enabled:** Available with a high or soft-capped allowance (e.g. Millionaire Plan) so normal use rarely hits a hard limit. Still metered for cost control; overuse triggers throttle or outreach, not silent block.

Example mapping (logic only; exact names can vary):

- **No AI plan:** All AI entry points locked or hidden.
- **Basic:** Description generator, translation, pricing suggestion = limited (credit cap). Image enhancement, chatbot, smart search = locked.
- **Pro:** All of the above; image enhancement, chatbot, smart search = limited. Higher credit cap than Basic.
- **Millionaire:** All features fully enabled; high or soft-capped credits; priority support and possibly priority AI queue so responses feel faster.

### How the Millionaire Plan overrides normal limits

- **Access:** Every AI feature that exists in the product is available; none are locked.
- **Usage:** Credit allowance is high or effectively “unlimited” with a soft cap (e.g. throttle only after very high daily use). No daily hard block for normal use.
- **Priority:** When the system is under load, Millionaire requests are served first so agents feel speed and reliability.
- **Grace:** If they ever hit the soft cap, they get a gentle throttle and a single CTA (e.g. add-on pack or custom), not the same “you’re out” experience as lower tiers.

So: **Agent action → system checks plan tier → if feature is locked, show upgrade; if limited, check credits and allow or apply grace/CTA; if Millionaire, allow and apply priority.** Outcome is either: use proceeds, or clear message + upgrade/add-credits path.

---

## 4. AI Credit System (Logic & Flow)

### Why AI credits are necessary

- Each AI action has a real cost (e.g. external or internal API cost). Unbounded use would make margins negative.
- Credits create a **meter** that ties usage to the plan and optional add-ons, so heavy users pay more (via plan or packs) and light users don’t subsidize them.
- Credits also create a **natural upgrade moment** when the agent runs low or hits grace, without needing to hard-block in the middle of work.

### How credits are assigned per plan

- Each plan has a **monthly credit allowance** (e.g. Basic = 500, Pro = 2,000, Millionaire = 10,000 or “soft unlimited”).
- Credits reset on the billing cycle date (e.g. 1st of the month or renewal date). No carry-over unless the plan explicitly includes it (e.g. Millionaire “carry up to 20%”).
- Optional: one-time **add-on packs** that add credits for the current period; packs can expire at cycle end or after 30 days (one rule, applied consistently).

### How each AI action consumes credits

- Each feature has a **credit cost per use** (e.g. one description = 5, one translation = 3, one image enhance = 15, one chatbot message = 1, one search = 2, one pricing suggestion = 2). Numbers are illustrative; the principle is: expensive actions (e.g. image) cost more than cheap ones (e.g. single message).
- When the agent triggers an AI action, the system: (1) checks plan allows the feature, (2) checks remaining credits ≥ cost, (3) if yes, deduct and run the action; if no, apply exhaustion behavior (see below). Optionally, allow the current action to complete then apply exhaustion so the agent is never cut off mid-request.

### How credit exhaustion is handled gracefully

- **Before exhaustion:** When credits drop below a threshold (e.g. 20% left), show a short in-app message: “You’ve used 80% of your AI credits this month. Upgrade or add a pack for more.”
- **At exhaustion:** Do not hard-block in the middle of a request. Finish the current action, then:
  - **Grace mode:** Allow a small number of “light” uses per day (e.g. 5 description or 10 chatbot messages) at reduced speed or with a short delay, so the agent can still work but feels the limit. Show: “Monthly credits used. You have X light uses left today. Upgrade or add credits for full access.”
  - **Single CTA:** One clear upgrade or add-credits button. No repeated popups in the same session.
- **Reset:** On the next billing cycle, credits reset to the plan allowance. No surprise; agent knows when they get more.

This **naturally pushes upgrades** because the agent is in the middle of real work (listing, inbox, chatbot) when they hit the limit; the value of “getting my assistant back” is obvious.

### How this protects margins

- Total cost per agent per month is bounded by (credit allowance × max cost per credit) plus any add-on usage. You set allowance and cost per action so that even heavy users stay within target margin.
- Overuse is contained by grace (capped daily use) and soft caps on Millionaire, so cost doesn’t explode. Alerts can trigger when an agent or the whole system exceeds a cost threshold so you can adjust allowances or pricing.

---

## 5. Millionaire Plan Experience (Not Features)

Focus: daily pain removed, “team” feeling, why top agents don’t downgrade.

### What daily pain this plan removes

- **Time:** No rationing AI. They can generate descriptions, translate, reply with AI, and use the chatbot without constantly watching credits. The mental load of “can I use it again?” goes away.
- **Speed:** Priority handling means they don’t wait when the system is busy. They associate the product with reliability.
- **Friction:** No “upgrade to unlock” on features they need. Everything they see, they can use. No daily negotiation with limits.
- **Uncertainty:** They know they won’t run out in the middle of a busy week. That predictability reduces stress and makes the product the default for all listing and lead work.

### How it feels like hiring a team

- **Roles, not tools:** The product speaks in roles: “Your listing assistant,” “Your inbox assistant,” “Your website chat.” Agents don’t think “AI”; they think “someone who does this for me.”
- **One place:** All of that lives where they already work (dashboard, listing form, inbox, website). No separate “AI app.” It feels like one team that’s always in the same room.
- **Predictable cost:** One subscription; no per-use surprise bills. Like a fixed team cost, not a variable tech bill.
- **Outcome language:** Messaging is about results: “Get more leads,” “Close more deals,” “Save 10 hours a week.” That reinforces the feeling of a team that earns its keep.

### Why top-performing agents will never downgrade

- **Habit:** They use the assistant every day. Downgrading means going back to writing every description, translating manually, and losing the chatbot. That feels like losing staff.
- **Attribution:** They believe the product is why they have more listings, more leads, and faster closes. Giving that up feels like giving up revenue.
- **Volume:** They have too many listings and too many leads to handle without AI. Downgrading would force them to do less or work longer; both are unacceptable.
- **Social:** If they have sub-agents or a team, everyone uses the same AI. Downgrading affects the whole team and creates internal friction.
- **Sunk habit:** After months of depending on it, the subscription fee is small compared to the perceived loss of removing it. So they stay.

---

## 6. Upgrade & Downgrade Behavior

### When upgrade prompts appear

- **Credit pressure:** Agent reaches 80% of monthly credits, or enters grace mode. One clear in-app message and one CTA: “Get more credits — upgrade to [Plan] or add a pack.”
- **Locked feature:** Agent hits a locked feature (e.g. “Chatbot is available on Pro and above”). One message: “Upgrade to add the website chatbot” with a link to plans.
- **Power-user nudge (optional):** If the agent is in the top 10–20% of users by usage, show a single message per cycle: “You’re a power user. The Millionaire Plan gives you [X] and priority. Upgrade here.” Not every session; once per cycle.

### What user behavior triggers them

- **80% credits used:** System detects remaining credits ≤ 20% of allowance; show the prompt once per cycle (or once per week until they upgrade or reset).
- **First grace event:** When they first enter grace (e.g. first time they hit 0 credits and get limited daily use), show the upgrade/add-credits CTA.
- **Click on locked feature:** The moment they try to use a locked feature, show what they’re missing and the upgrade path.
- **High usage trend:** If usage is increasing month over month and they’re on a lower plan, that’s when the optional “power user” nudge can run.

### How messaging feels helpful, not salesy

- **Problem–solution:** “You’ve run out of credits” → “Upgrade to get [X] credits so you don’t have to stop.” Tie to their outcome, not to “upgrade for us.”
- **One CTA per moment:** One primary button, one short sentence. No multiple popups or long copy.
- **Reversible:** They can dismiss. They’ll see the CTA again at the next natural moment (e.g. next time they’re low or hit grace).
- **No fake urgency:** No “Only today” or “Offer expires.” Just clear value: “Get your full assistant back” or “Never run out of credits.”
- **Respect limits:** If they’ve just downgraded or said “no,” don’t show the same upgrade prompt again for a set period (e.g. 30 days) except for a new trigger (e.g. they hit grace again).

### Downgrade impact: what slows down, what becomes manual, what remains

- **What slows down:** On a lower plan, AI may be throttled (e.g. slower or lower priority). They may have fewer credits, so they hit grace more often. Speed and “always available” feeling decrease.
- **What becomes manual:** Anything they used AI for must be done by hand again: descriptions, translation, suggested replies, pricing hints, chatbot (if removed), image enhancement. They feel the loss of automation every day.
- **What remains accessible:** All their data: listings, leads, inbox, website content, media. They can still log in and use every non-AI feature their new plan allows. They don’t lose their work or their account; they lose convenience and capacity.

So downgrade = **loss of speed, automation, and capacity**, not loss of data. That creates strong retention (they miss the assistant) without anger (they weren’t locked out of their own content).

---

## 7. Daily Habit Loop

How AI becomes part of the agent’s routine.

### Morning usage

- Agent logs in and lands on the dashboard. Dashboard shows: “You have X credits left this month” and quick actions like “Draft descriptions for your new listings” or “Reply to overnight inquiries with AI.”
- Agent may open the listing form to add a new property. They click “Generate description” and “Suggest price,” then “Translate to Thai” and “Translate to Myanmar.” Listing is ready in minutes instead of an hour.
- **Habit:** The first meaningful work of the day involves the assistant. That sets the pattern for the rest of the day.

### During the day

- Inbox gets new inquiries. For each message, they see “Reply with AI” or “Translate.” They use AI to draft or translate, then send. Response time drops; they attribute faster closes to the product.
- They add or edit another listing. Again: generate description, suggest price, enhance an image or virtually stage one. No separate “AI session”; AI is just the next step in the form.
- If they have the chatbot: they see new chat threads from the website. They let AI handle simple questions and take over for serious leads. They feel the site is “always on.”
- **Habit:** Every listing and every lead touchpoint can use AI. The assistant is the default, not the exception.

### Lead handling

- New lead from website chat or inquiry form. Agent sees the thread; AI may have already replied. Agent uses “Reply with AI” to continue the conversation or to send a follow-up. Translation is used if the lead writes in another language.
- When they’re about to send a proposal or key message, they might use AI to polish the text. So lead handling is consistently “human + assistant,” not “human only.”
- **Habit:** Fast, professional replies become the norm. Agents don’t want to go back to typing everything from scratch.

### End-of-day review

- Dashboard may show: “Today you used the assistant 8 times. You have X credits left this month.” Optional: “Listings you used the assistant on got Y views this week.”
- Agent closes the app knowing that tomorrow they’ll start again with the same workflow. The assistant is part of “how I work,” not “a tool I sometimes use.”
- **Habit:** The loop closes with visibility into usage and results. That reinforces dependence and makes renewal and upgrade the default choice.

---

## 8. Data Dependency & Ethical Lock-In

### What data becomes tightly integrated with AI usage

- **Listing content:** Descriptions, headlines, and translations were generated or edited with AI. The agent doesn’t have a separate “pre-AI” version; the current version is the one they use. If they leave, they keep the content but lose the ability to generate more at the same speed.
- **Inbox and leads:** Reply history and lead threads are in the product. AI-suggested replies and translations are part of that history. Leaving means keeping the data but losing the “reply with AI” and “translate” workflow for new messages.
- **Website and chatbot:** Chat logs and visitor conversations live in the system. The chatbot’s behavior and any tuning the agent did (e.g. FAQs, tone) are tied to the product. Leaving means they keep logs (if exported) but lose the live chatbot and its lead capture.
- **Usage history:** “You used the assistant X times this month” and “Listings created with the assistant” are only meaningful inside the product. That history reinforces the habit; it doesn’t transfer elsewhere.

So the **workflow** and **ongoing generation** are dependent on the product; the **outputs** (text, translations, images) belong to the agent and stay in their account or can be exported.

### Why leaving feels inconvenient

- They would have to rewrite or manually translate new listings, reply to every message by hand, and replace the chatbot with something else (or lose 24/7 capture). That’s time and friction.
- Their team (if any) would lose the same tools, so switching has a coordination cost.
- They’ve built a routine around “draft with AI, edit, send.” Breaking that routine is psychologically and practically costly.

So **convenience and habit** create lock-in, not data captivity.

### Why agents still feel respected and safe

- **Data ownership:** Their listings, leads, and content are theirs. They can export and take them elsewhere. The product doesn’t hold data hostage on downgrade or cancel.
- **Transparency:** They see what they get per plan and what they lose on downgrade. No hidden removal of data or access.
- **Reversible:** They can downgrade and later upgrade again. If they leave, they can come back and resume. The door is open.
- **No dark patterns:** Upgrade prompts are tied to real limits and value, not fake scarcity or confusing flows.

So the system creates **stickiness through value and habit**, not through fear or data lock-in. That is ethical and sustainable.

---

## 9. Risk Control Logic

All of this is handled by system logic (rules, limits, alerts), not by human moderation in the normal flow.

### AI overuse prevention

- **Credits:** Monthly allowance caps total use per agent. When they’re out, grace mode applies (limited daily use) so they can’t run unbounded usage.
- **Soft caps (Millionaire):** If the plan has “unlimited” in spirit, a soft cap (e.g. very high daily or monthly request count) triggers throttle (e.g. slower responses) or a one-time message: “You’re in the top 1% of users; we’re here to help — contact us if you need more.” No hard block for normal use.
- **Per-action cost:** Expensive actions (e.g. image generation) cost more credits, so casual overuse of the most costly features is naturally limited by credit consumption.

### Abuse prevention

- **Rate limits:** Unusually high request rate (e.g. many requests per minute) is detected. First: throttle (e.g. delay or queue). Then: restrict (e.g. cap per hour) or flag for review. Logic applies the step; humans only for edge cases.
- **Pattern detection:** Bulk, scripted-looking use (e.g. same action type, same listing, in a loop) is treated differently from normal one-by-one use. System can throttle or require a short delay between similar actions.
- **Terms:** Use is for the agent’s own business. Resale of AI output or use for other businesses at scale can be restricted by policy; when patterns suggest that, the system can limit access and alert for manual review.

### Cost explosion prevention

- **Per-agent cap:** Credits per plan cap consumption; grace and soft caps cap overuse. So no single agent can unboundedly increase cost.
- **Aggregate alerts:** When total AI cost (system-wide or per agent) crosses a threshold, an alert fires. Optional: auto-throttle the top N heaviest users until reviewed. Parameters (thresholds, N) are configurable; logic runs automatically.
- **Pricing and plans:** If a plan’s average cost consistently exceeds target margin, the business can adjust allowance, price, or add a higher tier and move the heaviest users up. Logic provides the signal; humans decide the change.

### Free plan protection (if you have a free tier)

- **No or minimal AI:** Free plan has no AI, or one very limited action (e.g. 5 description generations per month) so trial users can taste it but cannot abuse it.
- **Clear upgrade path:** When they hit the limit, the only path is upgrade. No grace mode that allows ongoing free use.
- **Separation:** Free users are metered and rate-limited so they cannot consume the same resources as paying agents. Logic enforces; no manual gatekeeping.

---

## 10. Rollout Strategy

How to introduce these AI features to existing users without overwhelming them, and how to test with a small group first.

### Introduce to existing users

- **Announce as “assistant,” not “AI”:** Messaging is “Your listing assistant is here” or “Reply to leads in one click.” Focus on the job (write, translate, suggest, chat), not the technology.
- **Place in existing flows:** Don’t add a new “AI” section. Add “Generate description,” “Translate,” “Reply with AI” where agents already work. So adoption is “use what you already do, with one extra click.”
- **Defaults that teach:** The first time an agent opens the listing form after rollout, an optional short tip: “Generate a description in one click.” One tip per feature, once. No long tutorials.
- **Credits visible early:** From day one, show “X credits this month” on the dashboard or in the header so agents know the model (plan + credits) and don’t feel surprised when they run low.
- **Phased by plan:** Turn on AI for one plan tier first (e.g. Pro or Millionaire), then the next. That limits blast radius and lets you fix issues before everyone is on it.

### Avoid overwhelming agents

- **No big bang:** Don’t launch six features and a new “AI” dashboard on the same day. Roll out one or two features (e.g. description generator + translation) first. Then add pricing, image, inbox, chatbot, search over time.
- **Progressive disclosure:** Show only the features their plan allows. Locked features appear as “Upgrade to unlock,” not as a long list of things they can’t use. So they see a small set of clear actions, not a menu of grayed-out options.
- **One primary CTA:** When they’re low on credits, one upgrade/add-credits message, not several. When they hit a locked feature, one upgrade message. Reduce noise so the product feels calm.
- **Optional onboarding:** For agents who want it, a short “Tour: your new assistant” (e.g. 3 steps: generate a description, translate it, reply with AI). Skip by default. No forced tour.

### Test with a small group before full rollout

- **Pilot segment:** Choose a small set of agents (e.g. 20–50): mix of active and less active, different plans. Invite them: “We’re testing a new assistant for listings and inbox. You’ll get early access; we’d like your feedback.”
- **What to observe:** Usage (which features they use, how often), where they get stuck, where they ask for help, and when they hit credit limits. Also: support tickets and feedback (“too slow,” “ran out of credits,” “confusing”).
- **Pilot duration:** Run for at least one billing cycle so you see credit exhaustion and renewal behavior. Adjust credit costs, grace rules, and messaging based on what you see.
- **Then expand:** Roll out to the next plan tier or the next cohort. Keep the same logic; tune copy and limits from pilot feedback. Full rollout only when you’re confident the loop (use → value → limits → upgrade) works and support load is manageable.

### Small team / solo founder

- **Start with high-impact, low-support features:** Description generator and translation are used often and rarely need support. Chatbot and image generation can have more edge cases; launch after the first two are stable.
- **Use logic, not people:** Credits, grace, rate limits, and alerts do the work. You only step in for abuse or cost spikes. That keeps support load low.
- **Document one playbook:** “When an agent hits grace, we show X. When they contact support about limits, we say Y.” So any team member (or you) can handle it consistently without coding.

---

## Summary Table

| Section | Core idea |
|--------|-----------|
| **1. Feature map** | AI lives in dashboard, listing create/edit, marketing, agent website, lead inbox. Same places agents already work → daily use and revenue. |
| **2. Feature definitions** | Six features: description, translation, image/staging, chatbot, smart search, pricing. For each: trigger, input, output, interaction, why it saves time or increases income. |
| **3. Plan & permission** | Plan tier = access (locked/limited/full). Millionaire = all features, high/soft-unlimited credits, priority. Flow: action → plan check → access decision → outcome. |
| **4. Credits** | Credits protect margin and drive upgrades. Assigned per plan; reset each cycle; exhaustion → grace + one CTA, never mid-request block. |
| **5. Millionaire experience** | Removes daily pain (rationing, friction, uncertainty); feels like a team; top agents don’t downgrade because of habit, attribution, volume, and sunk cost. |
| **6. Upgrade/downgrade** | Upgrade at credit pressure, locked feature, optional power-user nudge. Helpful = problem–solution, one CTA, reversible. Downgrade = lose speed/automation, keep data. |
| **7. Daily habit** | Morning: dashboard + listing AI. Day: inbox + listing + chatbot. Lead handling: reply with AI. End of day: usage summary. AI = default, not extra. |
| **8. Data dependency** | Workflow and generation are tied to product; outputs are agent’s. Leaving = inconvenient, not impossible. Respect = data ownership, transparency, no dark patterns. |
| **9. Risk control** | Overuse: credits + grace + soft caps. Abuse: rate/pattern limits, throttle, restrict. Cost: caps + alerts. Free: no or minimal AI. All by logic. |
| **10. Rollout** | Introduce as assistant in existing flows; phased by plan and feature; pilot with small group for one cycle; then expand. Small team: high-impact features first, logic does the work. |

---

*End of product design document. Use with Millionaire-Plan-Strategy.md and Millionaire-Plan-Docs-Index.md for full strategy and documentation.*
