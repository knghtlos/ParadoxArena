# Balance Specification

## 1. Balance goals

- Average match: 35–45 turns and 120–180 seconds.
- A player at 40 Integrity should normally have at least two meaningful recovery lines.
- No single first-turn selection provides more than a 54% simulated win rate under symmetric play.
- Direct damage is reliable; denial, routing, and timing create mastery.
- No hard lock may prevent a player from selecting a meaningful cell for two consecutive turns.
- Every effect has at least one board-state counter or opportunity cost.

## 2. Baseline values

| Parameter | Initial value | Test range |
|---|---:|---:|
| Integrity | 100 | 80–120 |
| Decision timer | 3.0 s | 2.5–4.0 s |
| Base Clash damage | 6 each | 4–8 |
| Resonance threshold | 3 segments | 3–4 |
| Resonance Strike bonus | +6 | +4–8 |
| Charge capacity | 3 | 2–4 |
| Chain depth | 4 | 3–5 |
| Hard turn cap | 50 | 42–56 |
| Mutation warning | 1 turn | 1–2 turns |

The values are configuration, not constants embedded in client code.

## 3. Power budget

One **impact point (IP)** is approximately one prevented or inflicted Integrity point. Utility receives an estimated IP based on simulation.

| Cooldown | Normal single-use budget |
|---:|---:|
| 1 | 6–9 IP |
| 2 | 10–14 IP |
| 3 | 14–18 IP |

Additional constraints:

- guaranteed direct damage pays no uncertainty discount;
- self-damage reduces cost only when it creates a real risk;
- a flexible effect pays a 15–25% flexibility premium;
- a chain enabler is budgeted across its expected follow-up, not as zero immediate damage;
- denial of a high-value cell cannot exceed three turns;
- symmetric effects are evaluated for board asymmetry, not assumed fair.

## 4. Initial node budgets

| Node | Immediate IP | Conditional IP | Risk/cost | Assessment |
|---|---:|---:|---|---|
| Pulse | 12 | 0 | CD 2 | baseline |
| Ripple | 7 | up to 6 | setup required | baseline |
| Nova | 8 | Resonance progress | 8 self-damage | tempo tool |
| Anchor | 14 | 0 | expires | baseline |
| Absorb | up to 10 | Charge value | CD 3 | requires incoming hit |
| Mirror | 0 | expected 7–12 | can be played around | control |
| Shift | 0 | 8–14 estimated | positional symmetry | simulation-heavy |
| Warp | 0 | 12–18 estimated | valid cell required | simulation-heavy |
| Gravity | 0 | 8–14 estimated | needs follow-up | setup |
| Echo | 0 | 6–9 expected | consumes future tempo | setup |
| Relay | varies | 5–10 expected | topology dependent | combo |
| Prism | 0 | 10–16 estimated | warned cells only | transformation |

Vector and Circuit values cannot be finalized analytically; bot simulation and human playtests are mandatory.

## 5. Counterplay matrix

| Pressure | Primary counter | Secondary counter |
|---|---|---|
| Pulse | Anchor | Mirror, deny through cooldown |
| Echo prime | Clash on likely Strike | Force low-value release |
| Anchor | Delay damage | Shift into instability |
| Absorb | Non-damage utility | Small hit before large hit |
| Mirror | Self-affecting Nova | Wait until status expires |
| Warp | Anchor position with Gravity | Select symmetric safe destination |
| Relay chain | Occupy sparse topology | Cool down adjacent nodes |
| Full Resonance | Visible defense setup | Clash to suppress Node |

There are no invisible counters or paid counter options.

## 6. Matchmaking and rating

### Hidden skill value

Use a Glicko-2-style rating or equivalent uncertainty-aware system:

- initial rating 1500;
- high initial deviation;
- provisional placement for first 10 Ranked matches;
- rating confidence grows through play;
- visible rank derives from rating bands but does not replace the numerical model.

### Search expansion

Search begins with close rating and latency, then expands gradually. Ruleset and balance version never expand. Region may expand only under a configured latency ceiling.

### Seasonal rank

Provisional tiers:

- Circuit
- Vector
- Pulse
- Prism
- Nova
- Apex

Names are thematic and must be tested for clarity. At season reset, visible progression compresses; hidden skill soft-resets rather than returning experts to true beginner matches.

## 7. Ranked integrity

- one published Precision ruleset per queue;
- identical gameplay access for all accounts;
- server-authoritative simulation;
- no bots;
- reconnect grace without pausing the shared timer;
- deterministic safe selection after timeout;
- repeated intentional disconnects incur queue restrictions;
- draw and no-contest are distinct;
- suspicious match patterns are reviewed before punitive automation.

## 8. Safe selection

If no acknowledged intent exists at lock:

1. preserve a previously acknowledged valid intent if still legal;
2. otherwise select the ready cell with lowest immediate predicted self-damage;
3. break ties by shortest cooldown, then canonical seeded choice.

Safe selection never tries to predict or counter the rival. This avoids turning inactivity into an AI advantage.

## 9. Telemetry required for balance

Per match:

- ruleset and balance version;
- board seed;
- per-turn available cells and chosen intents;
- decision time and intent replacements;
- Node activation, damage, prevention, routes, and combo depth;
- HP, Charge, and Resonance curves;
- Clash frequency;
- disconnects and safe selections;
- match duration and result;
- player rating and platform class, pseudonymized.

## 10. Balance review cadence

- Vertical slice: adjust as often as tests require.
- Closed alpha: weekly analysis, biweekly configuration releases.
- Live Ranked: scheduled balance windows; emergency changes only for exploits.
- Replays retain their historical balance version.
- A/B tests never give different combat numbers to players in the same competitive queue.

## 11. Validation tests

### Automated

- millions of seeded bot simulations;
- mirror-board fairness;
- each spawn side win rate within 49–51% for symmetric bots;
- deterministic replay produces identical hashes;
- no chain exceeds depth;
- every generated board has legal moves;
- no forced no-input state;
- hard turn cap always terminates.

### Human

- first-time comprehension after 30-second explanation;
- choice confidence and regret;
- perceived fairness after loss;
- ability to explain why damage occurred;
- phone target accuracy;
- fatigue after five consecutive matches;
- spectating readability without narration.

## 12. Go/no-go targets

The balance model advances beyond vertical slice only if:

- at least 80% of testers correctly explain the core after one guided match;
- at least 70% can identify why they lost a tested turn;
- median match time is 120–180 seconds;
- fewer than 5% of matches hit the hard cap;
- fewer than 3% of turns miss input for interface reasons;
- no launch Node exceeds 58% win association after controlling for player skill and selection frequency;
- perceived fairness averages at least 4/5 in structured testing.
