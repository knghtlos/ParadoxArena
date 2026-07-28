# UX, UI, and Art Direction

## 1. Experience goals

- A new player understands the next action without reading a manual.
- The arena remains the visual priority on a small phone.
- Every state has icon, shape, motion, and optional sound reinforcement.
- A player can enter a new match within two taps after results.
- Store and progression surfaces never interrupt the first-session match flow.

## 2. Information hierarchy during play

1. Selectable cells and current selection.
2. Opponent location, Integrity, and visible statuses.
3. Mutation warnings and dangerous cells.
4. Node identity and cooldown.
5. Own Integrity, Charge, Resonance, and statuses.
6. Turn timer.
7. Combo preview and contextual explanation.

Persistent social, currency, mission, and store information is removed from combat.

## 3. Screen map

```text
Boot
└─ Guest session
   ├─ First-time tutorial
   └─ Home
      ├─ Play
      │  ├─ Quick / Flow
      │  ├─ Ranked / Precision
      │  ├─ Daily Challenge
      │  ├─ Training
      │  └─ Private Match
      ├─ Collection
      ├─ Season
      ├─ Missions
      ├─ Social
      ├─ Profile / Replays
      ├─ Shop
      └─ Settings
```

Tournament, Clan, and Spectator entry points appear only when those features exist. Empty “coming soon” navigation is avoided.

## 4. First-session flow

1. Load minimal client shell and core arena assets.
2. Create local guest identity.
3. Ask only age/terms confirmations legally required for the selected region.
4. Start interactive tutorial; no account wall.
5. Award one choice among three free visual accents.
6. Offer Quick Match against protected matchmaking.
7. After the first complete match, introduce Home and account linking.

Google and Apple linking preserve guest progress. Account linking is optional until cross-device or purchase functionality requires it.

## 5. Home

The primary panel contains one large **Play** action and current recommended ruleset. Secondary cards show at most:

- current season objective;
- one daily mission;
- one friend/social event;
- newly earned cosmetic.

Currencies remain visible only on economy-relevant screens. Notifications aggregate into a single inbox and never produce multiple modal interruptions.

## 6. Mode selection

Each ruleset uses plain-language descriptions:

- **Precision:** “No random outcomes. The arena plan is fixed and fully warned.”
- **Flow:** “The arena adapts, and every change is shown before it happens.”
- **Anomaly:** “Bigger disclosed twists for events and private play.”

Ranked always shows Precision. A player cannot silently change the competitive model with a personal setting.

Private Match exposes presets first; advanced individual parameters remain behind a clearly marked custom panel.

## 7. Combat layout

### Desktop

- arena centered;
- own state bottom-left;
- opponent state top-right;
- timer and turn number top-center;
- selected Node summary in a compact bottom panel;
- event log collapsed at right, expandable after resolution.

### Mobile portrait

- state bars at top;
- arena occupies central 65–72% of usable height;
- thumb-zone selection card at bottom;
- timer wraps the arena as a shrinking perimeter rather than consuming space;
- safe-area insets respected.

### Mobile landscape/tablet

- arena left/center;
- state and node explanation in a right rail;
- no gameplay advantage from additional space; all information exists in portrait.

## 8. Selection feedback

A tap performs:

1. immediate local highlight and haptic tick;
2. intent submission;
3. acknowledged state uses a solid border;
4. unacknowledged state remains pulsing;
5. replacement tap moves the highlight;
6. final 500 ms increases timer urgency without disabling valid changes.

The opponent never sees the selection before reveal.

## 9. Resolution presentation

Visual order:

1. both destination markers reveal;
2. camera settles;
3. both Avatars compress and launch;
4. landing impacts on the same canonical frame;
5. primary Node family color flashes;
6. combo links travel across cells;
7. damage/Guard numbers appear near state bars, not over grid symbols;
8. changed cells settle into their next selectable state.

The sequence supports 9:16 vertical clip cropping with Avatars, destinations, and state bars inside the safe composition.

## 10. Node visual language

Each family has redundant coding:

| Family | Geometry | Motion | Default hue |
|---|---|---|---|
| Strike | outward chevrons | expanding pulse | coral |
| Guard | closed hexagon | inward lock | cyan |
| Vector | offset arrows | directional drift | violet |
| Circuit | linked rings | sequential current | amber |

Hue can change with themes, but geometry and motion grammar remain stable. Cooldown uses a numeric center label plus a radial mask. Instability uses fractured cell edges and a countdown marker.

## 11. Accessibility settings

- reduced motion;
- camera shake off/low/standard;
- haptics off/low/standard;
- four color-vision presets;
- high contrast;
- text scaling;
- effect flash reduction;
- separate music, effects, ambience, and timer audio;
- left/right-handed bottom controls;
- safe auto-selection;
- data-saving mode;
- replay spoilers hidden.

Settings are available before the tutorial begins.

## 12. Results

Results lead with:

- win, loss, or draw;
- decisive final interaction;
- rating change when applicable;
- one meaningful progression summary;
- Rematch/Play Again primary action.

Detailed telemetry, mission progress, and replay controls are secondary. Store offers never cover the result or replace the rematch action.

## 13. Three original art directions

### A. Signal Foundry — recommended

A clean post-industrial simulation sport: dark ceramic arenas, luminous conductive inlays, floating engineered Avatars, and precise waveform effects. It is futuristic without spaceships, magic, or conventional combat gear. Cosmetics can vary materials, signal patterns, fabrication marks, and motion trails.

Strengths: high readability, feasible with procedural geometry and inexpensive assets, strong esports presentation.

### B. Chromatic Infrastructure

An optimistic megacity utility network where public-energy mascots compete inside modular civic reactors. Rounded forms, bright environmental color, kinetic signage, and playful industrial design.

Strengths: broad appeal and expressive cosmetics. Risk: can feel toy-like if materials lack sophistication.

### C. Impossible Instrument

The arena is a vast abstract scientific instrument folding through impossible spatial layers. Avatars are calibration entities; Nodes are physical controls with refractive, moiré, and magnetic effects.

Strengths: distinctive short-form visuals. Risk: harder mobile readability and higher VFX production cost.

## 14. Selected visual thesis

Proceed with **Signal Foundry** for prototype direction:

- near-black graphite background;
- off-white typography;
- standardized family accents;
- emissive but restrained Nodes;
- simple low-poly or vector-like Avatar shells;
- procedural particles;
- no copyrighted asset dependency;
- system fonts during prototype, followed by an open-license display typeface if needed.

All prototype visual/audio assets must be original, generated in-house, public domain, or compatible with commercial use. Licenses are recorded in an asset manifest.

## 15. UX acceptance criteria

- first legal selection within 10 seconds of entering a match;
- 44 CSS-pixel minimum touch target where layout permits;
- no essential text below accessible minimum sizing;
- selection acknowledgement distinguishable in grayscale;
- arena remains fully usable at 320 CSS-pixel width;
- reduced-motion mode avoids large camera translation and high-frequency flashes;
- results-to-rematch action in one tap;
- tutorial core completion median under four minutes.
