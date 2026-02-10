# Millionaire Plan — Documentation Index

This index points to the strategy document and explains how to use it across product, growth, and engineering.

---

## Documents

| Document | Purpose | Audience |
|----------|---------|----------|
| **Millionaire-Plan-Strategy.md** | Full strategy: AI positioning, plan integration, credit economy, daily loop, upsell, risk control, downgrade, wealth logic, execution. | Product, growth, engineering leadership |
| **Millionaire-Features-Product-Design.md** | Product integration: where AI features live, feature definitions (process only), plan/permission logic, credits, Millionaire experience, upgrade/downgrade, daily habit, data dependency, risk control, rollout. | Product, design, engineering |
| **Millionaire-Plan-Docs-Index.md** (this file) | Index and usage guide for the strategy and product design. | Anyone implementing or referencing the plan |

---

## How to Use the Strategy Doc

### Product

- **Positioning:** Use Section 1 (AI Feature Positioning) for naming, UX copy, and how to present AI (assistant roles, not “AI tools”).
- **Plans and credits:** Use Section 2 (AI + Plan Integration) and Section 4 (Credit Economy) for: what each plan allows, how credits work, and behavior when credits run out or plan expires/downgrades.
- **Millionaire Plan:** Use Section 3 for: who it’s for, what’s included (writing, translation, image, chat, insights), and fair-use / soft limits / priority.

### Growth / GTM

- **Daily loop:** Use Section 5 to align messaging and flows so agents use AI daily, attribute results to it, and stay in the pay → use → upgrade loop.
- **Upsell:** Use Section 6 for: when to show upgrade (power users, friction), when not to, and how to make it feel helpful.
- **Churn and downgrade:** Use Section 8 (Downgrade Pain) for ethical retention and Section 7 (Churn Risk) for signals and responses.

### Engineering (Logic Only)

- **Access vs usage:** Plan = access (on/off, capabilities, base allowance, priority). Credits = usage (consumption, reset, overuse).
- **Decisions:** Implement the flows in Section 2 (credits exhausted, plan expired, downgrade) and Section 4 (allocation, reset, grace, no hard block mid-task).
- **Risks:** Section 7 gives logic for cost (credits, throttle, alerts), abuse (rate/pattern, warn/throttle/restrict), and churn (value, grace, downgrade path). No code in the doc — use it to derive rules and alerts.
- **Feature placement and flows:** Use **Millionaire-Features-Product-Design.md** for where each AI feature lives (dashboard, listing, inbox, website), trigger → input → output per feature, and plan/credit interaction. Use it to derive UX and API behavior, not implementation details.

### Leadership

- **Wealth and scale:** Section 9 explains why the Millionaire Plan and top-20% focus drive long-term revenue.
- **Execution:** Section 10 explains launch-imperfect, manual checks early, speed over perfection.

---

## Quick Reference: Decision Flows

### Credits exhausted

1. Don’t block mid-task; finish current action.
2. Switch to grace (e.g. limited uses/day or reduced speed).
3. Show one clear CTA: upgrade or add credits.
4. Reset credits on billing cycle.

### Plan expires

1. Turn off AI access at plan level.
2. Keep all data and history; only new AI use disabled.
3. Restore access when plan is active again.

### Agent downgrades

1. Effective next billing cycle; current period unchanged.
2. Before cycle end: show what they’ll lose (speed, automation, convenience, priority).
3. On downgrade: remove capabilities and set credits to new plan; never delete data.

### Upsell moment

- Show when: power user (volume/frequency/breadth) or friction (e.g. 80% credits, grace, limit events).
- Don’t show: right after signup, when they’re failing/churning, or repeatedly in one session.
- One CTA, problem–solution framing, reversible (dismissible).

---

## Where This Lives in the Repo

- **Strategy:** `docs/Millionaire-Plan-Strategy.md`
- **Product design (AI features, flows, rollout):** `docs/Millionaire-Features-Product-Design.md`
- **Index:** `docs/Millionaire-Plan-Docs-Index.md`

To expose this in **docs-app** (optional later): add a “Strategy” or “Millionaire Plan” section that links to or embeds these docs (e.g. under User Guide or a new top-level section). The source of truth remains the markdown files in `docs/`.

---

## Version and Updates

- **Version:** 1.0
- **Last updated:** With initial strategy.
- **Change log:** Document any material changes to positioning, plan rules, or decision logic here or in the strategy doc header.

---

*Use this index to navigate the Millionaire Plan strategy and apply it consistently across product, growth, and engineering.*
