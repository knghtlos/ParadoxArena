# Paradox Arena

Working repository for an original, competitive grid-arena game for Web, Android, and iOS.

The project is currently in **Phase 0 — pre-production**. In accordance with the product brief, implementation starts only after the design, economy, UX, technical architecture, networking, and validation criteria are defined and reviewed.

## Product principles

- One choice every three seconds.
- Simultaneous resolution: no first-player advantage.
- Easy to explain, difficult to master.
- Base Avatars have identical gameplay statistics.
- Ranked play is deterministic.
- Monetization sells expression, never power.
- One web codebase, installable as a PWA and packageable for Android/iOS.
- Zero-cost tooling and a free-tier launch path; infrastructure scales only when usage requires it.

## Pre-production documents

1. [Concept audit](docs/00-concept-audit.md)
2. [Game Design Document](docs/01-game-design-document.md)
3. [Balance specification](docs/02-balance.md)
4. [Economy, progression, and monetization](docs/03-economy-progression.md)
5. [UX, UI, and art direction](docs/04-ux-art.md)
6. [Software architecture](docs/05-technical-architecture.md)
7. [Data and networking](docs/06-data-networking.md)
8. [Roadmap and validation gates](docs/07-roadmap.md)

All names and numerical values are provisional until playtesting validates them.

## Vertical slice

Phase 1 now includes an offline playable prototype:

- responsive React + Phaser PWA;
- original procedural 3D Avatars rendered with Three.js;
- Italian and English UI with persistent language selection;
- Precision, Flow, and Anomaly rulesets;
- deterministic 5×5 simulation and local tactical bot;
- 12 Nodes, shared cooldowns, Clash, combos, arena mutations, and turn cap;
- guided tutorial, reduced-motion option, animated jumps/landings/damage reactions,
  and deterministic local replays.

### Local setup

```powershell
npm install --prefix packages/simulation --workspaces=false
npm install --prefix apps/web --workspaces=false
npm run dev --prefix apps/web --workspaces=false
```

Open `http://localhost:7319`. Direct test links are available through
`?mode=precision`, `?mode=flow`, or `?mode=anomaly`; append `&tutorial=1`
to enable the guided overlay.

### Validation

```powershell
packages\simulation\node_modules\.bin\vitest.cmd run --root packages\simulation
apps\web\node_modules\.bin\tsc.cmd -b apps\web\tsconfig.json
```

The production PWA is generated in `apps/web/dist`.
