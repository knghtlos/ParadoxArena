# Concept Audit

## Executive assessment

The concept has a strong and explainable interaction: every three seconds, both players secretly select one available cell, then land simultaneously and resolve the grid. That creates readable tension, short-form-video moments, and a useful mobile input constraint.

The current brief is a direction rather than a complete game. Its largest risks are unresolved collision rules, excessive node complexity, match duration variance, randomness undermining competition, and live-service scope arriving before the core interaction is proven.

## Product pillars

1. **Read, predict, commit.** The main skill is anticipating the opponent and the arena.
2. **One input, layered consequences.** Selecting a cell is simple; node state, positioning, cooldowns, and combos make it deep.
3. **Simultaneous spectacle.** Every resolution produces a clear anticipation, jump, impact, and consequence.
4. **Fair competition.** Equal base statistics, server authority, visible information, and no purchasable power.
5. **Short rematchable sessions.** A match targets 150 seconds, excluding matchmaking and rewards.

## Weak points in the initial concept

### 1. Same-cell collision is undefined

Both players will often choose the same cell. Without a strong rule this produces ambiguity, animation problems, or arbitrary priority.

**Resolution:** a contested landing activates a **Clash**. Both remain on the cell, its node is locked for that resolution, and each emits a 6-damage neutral shock. Some nodes explicitly modify Clash behavior. This creates a prediction tool without punches, kicks, or initiative advantage.

### 2. Victory pacing is not guaranteed

HP-only victory can create extremely short bursts or defensive stalls.

**Resolution:** combine 100 HP with escalating arena pressure. From turn 31, the outer ring destabilizes progressively. A hard limit at turn 50 resolves by HP percentage, then stored Charge, then total damage dealt.

### 3. “Dynamic every turn” can become visual noise

If many nodes change every three seconds, players cannot form plans.

**Resolution:** dynamic changes occur on a predictable cadence, are telegraphed one full turn ahead in competitive rulesets, and affect at most 12% of selectable cells per mutation.

### 4. Nine node categories are too many for onboarding

Players cannot learn dozens of symbols within a 2–3 minute match.

**Resolution:** launch onboarding uses four player-facing families: **Strike, Guard, Vector, Circuit**. Energy, Chaos, Movement, Transformation, and Chain remain mechanical tags rather than nine equal menu categories.

### 5. Combo discovery could feel arbitrary

Memorizing hidden recipes is not tactical depth.

**Resolution:** combos follow three consistent verbs—**Prime, Route, Release**—and the UI previews confirmed interactions before commitment. Discovery rewards exist, but rules are inferable.

### 6. Cooldown ownership is ambiguous

A node exists on a shared arena: it is unclear whether use disables it for one player or everyone.

**Resolution:** cooldown belongs to the physical node and is shared. An activated node visibly dims and cannot be selected by either player until ready. This makes denial and timing central.

### 7. Avatar statistics conflict with competitive fairness

Unlockable statistical differences create meta pressure and potential pay-to-win perception.

**Resolution:** all Avatars have 100 HP, 3 maximum Charge, identical timing, and identical system access. Cosmetics never alter collision, silhouette bounds, or effect readability.

### 8. Critical chance conflicts with deterministic play

Random damage spikes can decide a 150-second match.

**Resolution:** remove random critical chance. Replace it with **Resonance**, a public meter. Three offensive activations empower the next eligible Strike by a fixed amount.

### 9. Loadouts can undermine a shared-grid identity

If players bring strong personal abilities, the game becomes deck selection rather than arena reading.

**Resolution:** the arena supplies all nodes. Pre-match choices are limited to equal-access, non-upgradable **Protocols** that alter information or timing, not raw damage. Protocols are disabled from the initial vertical slice until the core is validated.

### 10. Simultaneous resolution can be unreadable

Multiple chains, teleports, damage, and transformations can occur at once.

**Resolution:** effects calculate instantly on the server but play through ordered visual beats: reveal, flight, landing, primary activation, chain wave, state recap. Total resolution animation must remain under 1.4 seconds.

### 11. Three-second selection may punish latency and accessibility

Slow devices, motor limitations, or network jitter could cause missed turns.

**Resolution:** clients submit replaceable intents throughout the window; the last acknowledged valid intent wins. A configurable accessibility mode can select a safe suggested cell if no intent is submitted. Ranked timing remains identical for everyone.

### 12. The requested feature list is much larger than an MVP

Clan, replay, tournament, live events, store, and three authentication providers create high cost before fun is established.

**Resolution:** use gated phases. No progression or live-service system advances until retention and match-quality thresholds are met.

## Improvements adopted

1. Three explicit rulesets: Precision, Flow, and Anomaly.
2. A deterministic Clash rule for contested cells.
3. Telegraphing for arena mutations.
4. Progressive endgame pressure and a hard match cap.
5. Shared physical-node cooldowns.
6. A grammar-based combo system.
7. Equal Avatar gameplay properties.
8. Deterministic Resonance instead of random critical hits.
9. Four readable player-facing node families.
10. Ordered resolution beats and a strict animation budget.
11. Replaceable server-acknowledged intents.
12. Seeded simulations for replay and anti-dispute auditing.
13. Vertical-slice gates before live-service expansion.
14. A PWA-first client with store wrappers from one codebase.
15. Cosmetic-only commerce with no statistical upgrades.

## Ruleset matrix

| Ruleset | Arena mutation | Effect randomness | Telegraphing | Intended use |
|---|---|---|---|---|
| Precision | Seeded schedule | None after match start | Full | Ranked, tournaments |
| Flow | Seeded controlled variation | Bounded and shown | One turn ahead | Default Quick Match |
| Anomaly | Frequent controlled variation | Wider but disclosed outcome set | Partial/full per event | Private matches, events |
| Training | User configurable | User configurable | Debug overlays | Learning and testing |

Players never enter the same matchmaking pool under different rules. Ranked seasons use a versioned Precision ruleset so balance changes cannot alter an ongoing replay.

## Thirty-second explanation

> Choose one active cell before the three-second pulse ends. Both Avatars jump together, activate their landing Nodes, and trigger any connected combo. Used Nodes cool down for everyone, so read the grid and predict your rival. Reduce their Integrity from 100 to zero before they do the same to you.

## Open hypotheses to validate

- Three seconds is long enough for mobile selection but short enough to create pressure.
- A 5×5 grid is more readable than 6×6 without becoming solved.
- Clash is satisfying and not overly dominant.
- Twelve launch nodes support depth without excessive learning load.
- Telegraphing one turn ahead provides agency without eliminating surprise.
- 100 HP and the proposed damage bands produce 35–45 turns per average match.
