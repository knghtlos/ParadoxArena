# Software Architecture

## 1. Goals

- One TypeScript monorepo.
- Browser-first delivery with installable PWA.
- Android and iOS packages reuse the web client through Capacitor.
- Server-authoritative deterministic matches.
- Local development requires no paid service.
- Production components can begin on free tiers and migrate without rewriting game rules.
- The vertical slice stays smaller than the final live-service topology.

## 2. Proposed stack

### Client

- React + TypeScript for application UI;
- Phaser for arena rendering, animation, input, and effects;
- Vite for development/build;
- a lightweight state store for client UI state;
- PWA manifest and service worker;
- Capacitor wrappers for Android/iOS after web validation;
- Web Audio with graceful fallback;
- CSS safe-area and responsive layout.

### Server

- NestJS for HTTP APIs, authentication, social/economy services, and administration boundaries;
- Colyseus for authoritative realtime rooms;
- shared pure TypeScript simulation package;
- PostgreSQL for durable state;
- Redis for ephemeral sessions, presence, queues, rate limits, and room coordination;
- object storage later for exported clips and large artifacts;
- OpenTelemetry-compatible logs, metrics, and traces.

## 3. Repository layout

```text
apps/
  web/                 React + Phaser + PWA
  api/                 NestJS HTTP API
  realtime/            Colyseus process
  mobile/              Capacitor configuration/wrappers (later)
packages/
  simulation/          deterministic rules engine
  protocol/            network schemas and event types
  config/              versioned balance/ruleset data
  ui/                  shared React UI components
  test-fixtures/       seeds, intents, replay vectors
infra/
  containers/          local PostgreSQL/Redis definitions
  deployment/          provider-neutral templates
docs/
```

The vertical slice can run API and realtime in one process locally while preserving module boundaries.

## 4. Client boundaries

### React owns

- navigation;
- authentication;
- matchmaking state;
- collection, missions, season, shop, profile;
- accessible DOM overlays;
- settings;
- error and reconnect presentation.

### Phaser owns

- arena world;
- cell and Node rendering;
- Avatar movement;
- combat VFX;
- camera and animation timeline;
- pointer hit testing mapped to canonical cells.

React and Phaser communicate through typed commands/events. Neither reads the other’s internal state directly.

## 5. Simulation package

The simulation is a pure deterministic state machine:

```text
nextState, events = resolve(currentState, intents, rulesetConfig)
```

Requirements:

- no wall-clock access;
- no `Math.random`;
- explicit seeded pseudo-random generator where rules allow it;
- integers or fixed-point values for combat math;
- stable canonical ordering;
- serializable input/output;
- identical server and test behavior;
- clients may use it only for non-authoritative previews and replay.

The server alone accepts legal intent and commits match state.

## 6. Configuration

Every match references immutable:

- protocol version;
- simulation version;
- ruleset version;
- balance version;
- content manifest hash.

Published configurations are append-only. A new balance release creates a new version. In-progress matches and replays retain their original version.

## 7. Authentication

### Phase 1

- anonymous local identity for vertical slice;
- server-issued guest account and rotating session tokens for online alpha.

### Later

- Apple and Google OpenID Connect;
- account linking rather than account replacement;
- short-lived access token and rotating refresh token;
- hashed refresh-token records;
- recovery and conflict resolution;
- age/region consent state.

The client never stores provider secrets. Native wrappers use platform-appropriate secure storage when available.

## 8. API modules

- Auth;
- Player/Profile;
- Matchmaking;
- Match History/Replay;
- Inventory/Loadout;
- Economy/Ledger;
- Missions/Achievements;
- Season/Pass;
- Friends/Invites;
- Clan;
- Leaderboard;
- Store/Catalog;
- Purchase validation;
- Moderation/Reports;
- Live Configuration;
- Admin/Audit.

Only modules needed for the current phase are implemented.

## 9. Realtime deployment

Realtime rooms are stateful during a match. A room:

- accepts authenticated seat reservations;
- validates protocol/config versions;
- owns the authoritative turn clock;
- acknowledges replaceable intents;
- resolves at the deadline;
- broadcasts compact events and state hashes;
- snapshots for recovery;
- commits the final result idempotently.

Horizontal scale uses a room presence/driver layer via Redis. Sticky connection routing or room-aware ingress is required. Completed rooms do not keep memory state.

## 10. Persistence strategy

- PostgreSQL is the source of truth for accounts, ownership, currency ledger, purchases, results, rating, and replay metadata.
- Redis is disposable acceleration/state coordination, never the sole source of paid ownership or balances.
- Match snapshots are short-lived and recoverable.
- Economy mutations use database transactions and idempotency keys.
- Leaderboards can be cached in Redis and rebuilt from durable records.

## 11. Production environments

```text
local -> preview -> staging -> production
```

- Local: free, containers or locally installed services.
- Preview: per-change web build and isolated/mock services where possible.
- Staging: production-like schema with synthetic accounts and no real purchases.
- Production: protected secrets, backups, monitoring, rate limits, and controlled migrations.

Free-tier hosting is acceptable for a limited alpha, but capacity, sleeping services, connection duration, geographic latency, database quotas, and egress must be measured before public launch.

## 12. CI/CD

On each change:

- format/lint;
- type-check;
- unit tests;
- deterministic replay vectors;
- protocol compatibility checks;
- web build;
- dependency and secret scanning.

On controlled release:

- build immutable artifacts;
- run database migration checks;
- deploy staging;
- smoke test HTTP and realtime match;
- approve production;
- deploy;
- verify health and rollback readiness.

Store submissions remain separate from web deployment and require developer accounts.

## 13. Security

- TLS everywhere outside local development;
- strict input schemas and size limits;
- server-authoritative economy and matches;
- rate limits by account, session, IP/risk bucket;
- CSRF protection where cookie authentication is used;
- secure headers and constrained asset origins;
- encrypted secrets in deployment platform;
- least-privilege database users;
- purchase receipt validation server-side;
- append-only audit events for administrative/economy actions;
- dependency updates and vulnerability review;
- privacy deletion/export workflow;
- no sensitive data in telemetry or logs.

## 14. Anti-cheat

- client sends intent, never resulting damage;
- server validates cell legality and timing;
- state hashes detect divergent clients/replays;
- hidden selections remain server-side until reveal;
- monotonically increasing turn/sequence numbers;
- replayable intent record;
- anomaly detection for impossible timing, collusion, farming, and disconnect patterns;
- penalties are evidence-based and appealable.

The client is treated as untrusted even when packaged as a native app.

## 15. Reliability targets

Initial production objectives, refined with budget:

- API availability target: 99.5% for limited launch;
- match completion excluding client abandonment: >99%;
- acknowledged intent p95 within 250 ms in supported regions;
- reconnect recovery within 5 seconds where transport allows;
- zero lost confirmed purchases;
- point-in-time database recovery when paid economy launches;
- graceful read-only degradation for non-match social surfaces.

## 16. Testing

- unit tests for rules and services;
- property tests for generated arenas;
- golden deterministic replay tests;
- integration tests with PostgreSQL and Redis;
- two-client realtime tests with simulated latency, reorder, duplication, and disconnect;
- end-to-end browser tests;
- responsive and accessibility checks;
- mobile wrapper smoke tests on real devices before submission;
- load tests that model websocket concurrency and synchronized turn bursts.

## 17. Cost discipline

- start as a modular monolith plus realtime process;
- avoid Kubernetes and premature microservices;
- cache only demonstrated hotspots;
- replay as compact intents/events rather than video;
- static web assets on CDN-capable hosting;
- provider-neutral PostgreSQL and Redis interfaces;
- publish capacity thresholds and expected upgrade costs before exceeding free tiers;
- require explicit approval before activating paid infrastructure.
