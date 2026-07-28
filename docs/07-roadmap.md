# Roadmap and Validation Gates

## 1. Delivery principle

The full journey is authorized, but each phase has an evidence gate. Passing a phase authorizes the next planned implementation scope; it does not justify building every live-service system simultaneously.

No paid infrastructure is activated without explicit approval.

## Phase 0 — Pre-production

### Deliverables

- concept audit and improvements;
- complete GDD;
- initial node/combo catalogue;
- numerical balance model;
- economy, progression, monetization, and retention design;
- UX flows and art directions;
- software, data, and networking architecture;
- scope and validation gates.

### Exit gate

- internal consistency review complete;
- no unresolved rule blocks deterministic simulation;
- product owner accepts core rules and selected visual direction;
- vertical-slice backlog is estimable.

## Phase 1 — Offline vertical slice

### Scope

- React/TypeScript/Phaser PWA shell;
- responsive desktop/mobile arena;
- pure deterministic simulation;
- 5×5 board;
- 12 initial Nodes;
- Precision and Flow configurations;
- local player versus deterministic bot;
- tutorial;
- game-feel baseline;
- local replay;
- accessibility essentials;
- automated rule tests.

### Explicit exclusions

Accounts, public matchmaking, database, Redis, payments, Battle Pass, shop, friends, clans, and tournaments.

### Exit gate

- build installs as PWA and runs on representative desktop/mobile browsers;
- deterministic tests pass;
- median match is 120–180 seconds;
- comprehension and fairness targets from the balance document are met;
- performance target: stable 60 FPS on supported mid-range devices, graceful 30 FPS floor;
- at least 20 structured external playtest sessions or a documented equivalent evidence set.

## Phase 2 — Online technical alpha

### Scope

- NestJS API;
- Colyseus authoritative rooms;
- PostgreSQL and Redis;
- guest accounts;
- Flow Quick Match;
- private invite match;
- reconnect/safe selection;
- match history and server replay;
- basic telemetry, rate limiting, moderation/reporting;
- production-like staging;
- limited public deployment on free tiers where viable.

### Exit gate

- two-client tests under latency/loss pass;
- >99% server-side match completion in controlled load;
- no known state divergence;
- restore and deployment runbooks tested;
- capacity and cost thresholds documented;
- privacy/terms baseline prepared before external users.

## Phase 3 — Competitive MVP

### Scope

- Precision Ranked;
- rating and seasonal tiers;
- leaderboard;
- account linking with Google/Apple as platform access permits;
- profile and statistics;
- spectator delay;
- replay sharing;
- first free cosmetic collection;
- Capacitor Android/iOS wrappers;
- store submission readiness checks.

### Exit gate

- side fairness 49–51% in symmetric simulation;
- stable rating behavior;
- cheat threat review complete;
- native packages pass real-device QA;
- store fees/accounts explicitly approved and supplied;
- crash-free and latency targets met in supported launch regions.

## Phase 4 — Ethical economy and Season 0

### Scope

- Signals and immutable ledger;
- missions, achievements, activity path;
- collection/loadouts;
- direct-purchase cosmetic catalogue;
- platform purchase validation;
- free/Premium Pass;
- event Shards;
- refunds, restoration, customer-support tooling;
- economy dashboards.

### Exit gate

- zero lost or duplicated purchase test cases;
- economy simulation and abuse tests pass;
- no combat power can enter catalog schemas;
- legal, tax, privacy, and platform commerce review complete;
- Pass completion is achievable at designed playtime;
- monetization fairness testing passes.

## Phase 5 — Social live service

### Scope

- friend list and invites;
- referrals with fraud controls;
- public profiles and privacy;
- clans;
- richer spectator experience;
- shareable vertical clips;
- weekend events;
- moderation and social safety expansion.

### Exit gate

- sufficient concurrent population to avoid empty social features;
- moderation capacity and escalation process exist;
- referral abuse remains within threshold;
- sharing does not leak private identity or hidden competitive information.

## Phase 6 — Tournament and scale

### Scope

- brackets and tournament operations;
- season events;
- additional tested Nodes;
- regional capacity expansion;
- advanced observability;
- disaster-recovery refinement;
- creator/broadcast tools.

### Exit gate

- competitive ruleset stability;
- tournament admin and dispute tools;
- load/cost forecast approved;
- replay audit supports competitive disputes;
- live-ops team capacity matches cadence.

## 2. Vertical-slice backlog order

1. Monorepo and quality tooling.
2. Shared protocol/config types.
3. Deterministic grid state and legal selections.
4. Turn clock and simultaneous resolver.
5. Damage, Guard, cooldown, Clash.
6. Twelve Nodes and combo rules.
7. Seeded arena generation/mutation.
8. Automated replay vectors and property tests.
9. Phaser arena renderer.
10. React match shell and responsive overlays.
11. Selection acknowledgement and resolution timeline.
12. Bot policies.
13. Tutorial.
14. Accessibility/settings.
15. Local match results/replay.
16. PWA installation/offline shell.
17. Performance and structured playtest build.

## 3. Decision log

| Decision | Status |
|---|---|
| Full journey, built in gated phases | Accepted |
| Web desktop plus store-portable app | Accepted |
| PWA + Capacitor single codebase | Proposed implementation |
| HP/Integrity depletion is victory condition | Accepted |
| All Avatars mechanically equal | Accepted |
| Cosmetics introduced later | Accepted |
| Shared arena; no personal power loadout | Accepted |
| Multiple disclosed competition rulesets | Accepted |
| Precision for Ranked | Design decision |
| Flow for default Quick Match | Design decision |
| Signal Foundry visual direction | Recommended, pending review |
| 5×5 for vertical slice | Design decision, validate against 6×6 |
| Zero-cost tooling/free-tier start | Accepted |
| No paid service without approval | Accepted |

## 4. Primary product risks

| Risk | Early mitigation |
|---|---|
| Core choice lacks depth | paper simulation, bots, early human testing |
| Three seconds is inaccessible | replaceable intents, UI testing, safe selection |
| Simultaneous chains are confusing | strict effect grammar and animation beats |
| Dynamic arena feels unfair | ruleset separation and telegraphing |
| Match pacing stalls | endgame collapse and hard cap |
| Mobile rendering/input underperforms | 5×5, asset budgets, real-device testing |
| Free-tier realtime cannot sustain users | capacity gates and provider-neutral migration |
| Live-service scope overwhelms project | phase exclusions and exit gates |
| Cosmetics hurt readability | canonical geometry and accessibility review |
| Store launch assumed free | web-first release; account fees require approval |

## 5. Phase 1 definition of done

The vertical slice is done only when it:

- starts from a documented command on a clean checkout;
- runs a complete match without developer tools;
- supports desktop mouse and mobile touch;
- exposes Precision and Flow clearly;
- produces the same result from the same seed and intents;
- has tests for every Node and listed combo;
- handles same-cell Clash, timeout, simultaneous lethal, and turn cap;
- records/replays a local match;
- meets baseline accessibility and performance checks;
- has no paid dependency or proprietary required asset;
- is usable by a tester unfamiliar with the repository.

## 6. Immediate approval checkpoint

Before Phase 1 code begins, review these product choices:

1. **Clash:** same cell deals 6 neutral damage to both and suppresses that Node.
2. **Node set:** the 12 Nodes and 10 initial combos in the GDD.
3. **Endgame:** progressive arena collapse from turn 31 and hard end at turn 50.
4. **Visual direction:** Signal Foundry.
5. **Rulesets:** Precision Ranked, Flow Quick, Anomaly events/private.

Numerical values remain adjustable through configuration and playtests.
