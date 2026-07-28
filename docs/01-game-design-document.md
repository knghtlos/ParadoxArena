# Game Design Document

## 1. Product definition

**Working title:** Paradox Arena  
**Genre:** simultaneous-turn competitive arena strategy  
**Platforms:** desktop web, installable PWA, Android, iOS  
**Match size:** 1v1  
**Target match time:** 120–180 seconds  
**Business model:** free-to-play, cosmetic-only monetization  
**Camera:** fixed three-quarter arena view with optional reduced-motion top-down mode

The working title must pass trademark, store-name, domain, and cultural checks before public branding.

## 2. Core loop

1. Read current node states, cooldowns, hazards, player positions, HP, and meters.
2. Select one legal cell during a three-second commitment window.
3. Receive a subtle acknowledgement; change the selection until lock.
4. Reveal both selections.
5. Jump simultaneously.
6. Resolve landing, Clash, nodes, chains, damage, movement, and state changes.
7. Present a compact state recap.
8. Repeat until an Avatar reaches 0 Integrity or the turn cap resolves.

## 3. Arena

### Initial format

The vertical slice uses a **5×5 grid**. It gives 25 readable targets on a phone, preserves opponent prediction, and lowers simulation and content complexity. A 6×6 experimental variant is retained for later playtests.

Each cell has:

- coordinate;
- stable, warned, unstable, or void terrain state;
- zero or one physical Node;
- Node cooldown;
- optional Prime effect;
- visual ownership only when an effect requires it;
- mutation warning and resolution turn.

### Starting state

- Avatars spawn on mirrored edge cells.
- The generated board is rotationally symmetric in Precision.
- At least 18 cells are selectable.
- At least two legal Strike, two Guard, two Vector, and two Circuit nodes exist.
- No starting position is within a one-turn forced-loss sequence.

### Cell legality

A cell is selectable when it exists, is not void, contains a ready Node or is an explicitly selectable neutral cell, and is not prohibited by a temporary effect. Distance does not normally restrict selection: Avatars jump through the arena rather than walk.

## 4. Timing

| Beat | Target duration |
|---|---:|
| Decision window | 3.0 s |
| Intent reveal | 0.20 s |
| Jump anticipation + flight | 0.45 s |
| Landing impact | 0.15 s |
| Effect presentation | 0.35–0.75 s |
| State recap | 0.15 s |

The next decision window begins no later than 4.7 seconds after the prior one began. Long chains are visually compressed, never allowed to stall interaction.

## 5. Avatar state

All Avatars are mechanically equal:

- **Integrity (HP):** 100;
- **Charge:** 0–3;
- **Resonance:** 0–3 segments;
- **statuses:** short, public, icon-based;
- **position:** current cell;
- **selection:** private until reveal.

There is no random critical chance, movement speed statistic, paid cooldown reduction, or purchasable resistance. Apparent jump speed is cosmetic only and must land on the canonical frame.

## 6. Damage and defeat

Damage reduces Integrity and cannot be negative. Guard is consumed before Integrity unless an effect states otherwise. Simultaneous lethal damage produces a tie-break resolution rather than giving priority to network arrival or animation order.

### Tie-break order

1. Higher Integrity percentage after the complete simultaneous resolution.
2. Higher stored Charge.
3. More damage dealt during the match.
4. If still equal, declared draw; Ranked rating change is near-zero.

## 7. Shared cooldown

After a Node activates, its cooldown is placed on that physical arena cell for both players.

- Short: 1 turn.
- Standard: 2 turns.
- Long: 3 turns.
- Ultimate arena effects are not part of launch balance.

Cooldown decrements after the complete resolution. A node at cooldown 1 during selection is unavailable and becomes ready for the following selection.

## 8. Clash

When both players select the same cell:

1. both land;
2. the cell Node does not activate normally;
3. both take 6 neutral damage, simultaneously;
4. the Node gains one additional cooldown turn, capped at 3;
5. both remain associated with the cell for adjacency effects;
6. a Clash-specific modifier, if present, resolves after neutral damage.

Clash damage ignores temporary Guard in the first prototype so choosing the same cell remains meaningful. This is a testable parameter, not a final commitment.

## 9. Node grammar

Player-facing families:

- **Strike:** applies pressure or direct damage.
- **Guard:** prevents, redirects, or converts pressure.
- **Vector:** changes position, selection topology, or cell state.
- **Circuit:** primes, routes, copies, or transforms other Nodes.

Mechanical verbs:

- **Prime:** place a temporary state on a Node, cell, or Avatar.
- **Route:** redirect an effect or change its target.
- **Release:** consume a Prime to produce a combo.

Mechanical tags include Attack, Defense, Utility, Control, Chain, Energy, Chaos, Movement, and Transformation for internal balancing and missions.

## 10. Launch node set

Names are provisional and deliberately avoid conventional spell or martial vocabulary.

| Node | Family | Base effect | Cooldown |
|---|---|---|---:|
| Pulse | Strike | Deal 12 damage to rival | 2 |
| Ripple | Strike | Deal 7; adjacent primed cells echo 3 | 1 |
| Nova | Strike | Deal 8 to both; user gains 1 Resonance | 2 |
| Anchor | Guard | Gain 14 Guard until next landing | 2 |
| Absorb | Guard | Convert up to 10 incoming Node damage into Charge | 3 |
| Mirror | Guard/Circuit | Route the next single-target Strike back at 60% | 3 |
| Shift | Vector | Swap positions after effects | 2 |
| Warp | Vector | Move rival to the opposite mirrored cell if valid | 3 |
| Gravity | Vector | Prime current row and column toward center | 2 |
| Echo | Circuit | Prime the next activated Strike to repeat at 50% | 3 |
| Relay | Circuit | Route the current primary effect to one adjacent ready Node | 2 |
| Prism | Circuit | Transform two warned adjacent nodes within their family | 3 |

No node effect may require paragraph-length reading during a match. The selection panel uses a verb, a number, and at most two status icons.

## 11. Initial combo catalogue

Combos arise from states and ordering, not secret recipes.

| Sequence | Result |
|---|---|
| Echo Prime → Pulse | Pulse deals 12, then repeats for 6 |
| Echo Prime → Ripple | Ripple repeats its base 7 at 50%; secondary echoes do not repeat |
| Gravity Prime → Warp | Warp sends the target toward the center-most valid cell |
| Prism → warned node | Transformation resolves before scheduled mutation |
| Relay → Anchor | Guard routes to both adjacent occupants at 50% |
| Relay → Pulse | Pulse also strikes an occupant adjacent to the rival for 6 |
| Mirror → Pulse | 7 damage returns to Pulse user; rounding favors defender |
| Absorb → Nova | Each Avatar resolves independently; user can convert up to 10 |
| Shift → unstable cell | Instability follows the cell, not the Avatar |
| Resonance full → Strike | Next eligible base Strike gains +6, then Resonance resets |

Infinite loops are prohibited. An effect instance can activate a given Node at most once per turn, Echo cannot copy Echo, and chain depth is capped at four.

## 12. Resolution order

The authoritative order is:

1. validate locked intents;
2. reveal destinations;
3. apply pre-flight statuses;
4. assign landing positions;
5. detect Clash;
6. resolve landing terrain;
7. resolve primary Nodes simultaneously into an effect queue;
8. resolve redirects and prevention;
9. resolve chains by priority then coordinate canonical order;
10. apply the resulting simultaneous damage batch;
11. apply movement and transformations;
12. process defeat;
13. decrement cooldowns and statuses;
14. execute scheduled arena mutation;
15. generate next-turn legal state and warnings.

Canonical coordinate ordering is an implementation detail for reproducibility; it must never create gameplay initiative. Effects that would differ by order use snapshot inputs and batched outputs.

## 13. Arena dynamics

### Precision

The server generates the complete mutation schedule from a committed seed before turn 1. Players see warnings one turn before changes. Symmetry and family quotas are enforced.

### Flow

The same seeded system reacts to board state within bounded rules. The server can select among valid mutations, publishes the chosen warning, then locks it. It cannot change the announced outcome.

### Anomaly

Event configuration increases mutation frequency or offers multiple disclosed outcomes. Anomaly never affects the primary Ranked ladder.

### Mutation types

- cycle a ready Node to another Node in the same family;
- restore a void cell;
- warn then destabilize a cell;
- create a temporary neutral cell;
- rotate a symmetric node pair;
- reduce a long cooldown by one.

Mutations never deal unannounced direct damage.

## 14. Endgame pressure

- Turns 1–30: normal arena.
- Turns 31–34: outer ring receives warnings.
- Turns 35–38: two mirrored outer cells become void each turn.
- Turns 39–42: remaining outer cells collapse in pairs.
- Turns 43–49: inner non-center cells destabilize.
- Turn 50: match ends after resolution and tie-break applies.

The pressure schedule is visible from turn 25.

## 15. Game modes

### Quick Match

Default ruleset: Flow. Hidden skill matchmaking is loose, bots can fill only during the protected onboarding period, and bot matches are labeled in match history.

### Ranked

Precision ruleset, version-locked balance, no bots, seasonal rating, reconnect protection, and server-verified replay.

### Private Match

Invite code, spectators optionally disabled, ruleset selection, safe parameter presets, and no progression farming.

### Training

Pause, node inspector, undo against bot, predicted resolution overlay, and configurable ruleset.

### Daily Challenge

Identical seeded puzzle or score scenario for all players. It rewards participation and mastery without affecting rating.

### Tournament

Bracket orchestration is a later phase. Matches use Precision and locked versions.

### Seasonal Events

Curated Flow or Anomaly configurations with cosmetic rewards and Season Tokens.

## 16. Protocols

Protocols are a post-validation system, disabled at launch of the vertical slice. If introduced:

- all competitive Protocols are immediately available to everyone;
- selection happens before matchmaking lock or is mirrored;
- effects provide information or tradeoffs, not upgrades;
- no levels, rarity power, duplicates, or paid acquisition;
- each Ranked season publishes its allowed set.

Examples: preview one additional cooldown, highlight the safest neutral cell, or trade one initial Charge for earlier mutation visibility.

## 17. Onboarding

The first session teaches by playing:

1. tap a highlighted Pulse;
2. watch simultaneous landing;
3. use Anchor against a telegraphed Pulse;
4. create Echo + Pulse;
5. predict a bot into a Clash;
6. complete a short match starting at 35 HP.

Tooltips unlock progressively. The complete tutorial target is under four minutes; the basic interaction explanation is under 30 seconds.

## 18. Spectating and replay

Replays store ruleset version, initial seed, both acknowledged intents, and authoritative event hashes rather than video. The simulation reconstructs the match. Spectators receive delayed authoritative events in Ranked to reduce live coaching.

Clip sharing renders selected turns into a short vertical-friendly sequence with a score strip, both selections, impact, and optional player-safe handles.

## 19. Accessibility

- color-blind-safe icons and palettes;
- reduced motion and screen shake sliders;
- haptics toggle and intensity;
- scalable text;
- high-contrast cooldown display;
- audio-independent warnings;
- one-handed mobile layout;
- safe auto-selection when no input is submitted;
- no gameplay information conveyed only through cosmetics.

## 20. Game-feel requirements

Every jump follows anticipation, launch, arc, squash, impact, and recovery. Camera shake is brief and intensity-scaled. Damage numbers never obscure cell state. Audio layers separate timer, selection lock, flight, Node family, combo escalation, and Integrity danger.

Cosmetic jump animations must share the same total duration, landing frame, hitbox, and reveal timing.

## 21. Content governance

Every new Node requires:

- plain-language description;
- family and tags;
- interaction table with every existing Prime/Route effect;
- deterministic test vectors;
- mobile readability review;
- balance budget;
- replay compatibility version;
- accessibility-safe VFX;
- Ranked approval or event-only flag.

## 22. Non-goals for the vertical slice

- real-money purchasing;
- Battle Pass;
- clans;
- public tournament system;
- Apple/Google login;
- referral rewards;
- user-generated content;
- 6×6 Ranked;
- Protocols;
- production-scale social graph.

These are deliberately sequenced after core-fun validation, not removed from the product roadmap.
