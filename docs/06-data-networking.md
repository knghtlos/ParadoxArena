# Data and Networking Specification

## 1. Data rules

- UUIDs or equivalent non-enumerable identifiers for public entities.
- UTC timestamps in storage; localized display at the edge.
- Monetary/currency amounts stored as integers in smallest units.
- Immutable ledger and purchase records.
- Soft deletion only where audit/legal needs require it; privacy deletion anonymizes or removes personal data according to policy.
- Database migrations are forward-reviewed and backed up before destructive production changes.
- No raw authentication provider token stored in gameplay tables.

## 2. Core relational model

### Identity and profile

**players**

- id;
- created_at, updated_at;
- status;
- locale, region;
- guest flag;
- public_handle and normalized handle;
- progression level and XP;
- onboarding state;
- consent version fields;
- last_seen_at.

**auth_identities**

- id, player_id;
- provider (`guest`, `google`, `apple`);
- provider_subject;
- created_at, last_used_at;
- unique(provider, provider_subject).

**sessions**

- id, player_id;
- refresh_token_hash;
- device label/risk metadata;
- created_at, expires_at, revoked_at;
- rotation family.

**player_settings**

- player_id;
- accessibility and audiovisual JSON validated against a versioned schema;
- updated_at.

### Competitive play

**ruleset_versions**

- id/version;
- name (`precision`, `flow`, `anomaly`, `training`);
- simulation version;
- balance version;
- configuration JSON;
- content hash;
- published_at, retired_at;
- immutable after publication.

**matches**

- id;
- mode and ruleset_version_id;
- status;
- region and room identifier;
- seed commitment and revealed seed;
- started_at, ended_at;
- turn_count;
- result reason;
- winner player id nullable;
- final authoritative hash.

**match_players**

- match_id, player_id, seat;
- rating before/after and deviation;
- final Integrity, Charge, damage;
- disconnect/safe-selection counters;
- result;
- equipped cosmetic snapshot;
- unique(match_id, seat).

**match_turns**

- match_id, turn_number;
- deadline_at;
- player intent coordinates and acknowledgement sequence;
- compact authoritative event payload;
- resulting state hash;
- unique(match_id, turn_number).

For scale, turn payloads may move to compressed object storage while indexed metadata remains in PostgreSQL. The initial version keeps compact records in PostgreSQL.

**ratings**

- player_id, queue/ruleset key, season_id;
- rating, deviation, volatility;
- wins, losses, draws;
- updated_at.

**matchmaking_entries**

Primarily Redis-based and short-lived. Durable audit records store only accepted match formation, not every polling heartbeat.

### Replay and social

**replays**

- id, match_id;
- visibility;
- version metadata;
- checksum;
- storage pointer if externalized;
- created_at, expires_at nullable.

**friendships**

- canonical lower_player_id, higher_player_id;
- status and initiator;
- created_at, updated_at;
- unique pair.

**blocks**

- blocker_id, blocked_id;
- created_at;
- unique pair.

**invites**

- id, inviter_id;
- type, opaque code hash;
- target player nullable;
- expires_at, accepted_at;
- fraud/risk state.

**clans**, **clan_members**, **clan_invites**

Added only in the relevant roadmap phase. Roles are explicit and every membership mutation is audited.

### Cosmetics and economy

**catalog_items**

- id, stable key;
- type;
- cosmetic metadata and asset manifest reference;
- rarity label used only for presentation;
- available_from/to;
- active flag.

**player_inventory**

- player_id, catalog_item_id;
- acquisition source;
- acquired_at;
- purchase/ledger reference;
- unique ownership.

**player_loadouts**

- player_id, slot/type;
- catalog_item_id;
- updated_at;
- constraints prevent gameplay-affecting items.

**currency_accounts**

- player_id, currency;
- cached balance;
- updated_at;
- unique(player_id, currency).

**currency_ledger**

- id;
- player_id, currency;
- signed amount;
- balance_after;
- reason code;
- idempotency key;
- reference type/id;
- created_at;
- unique idempotency scope.

The cached account balance is updated in the same transaction as the immutable ledger entry.

**store_offers**

- id and version;
- availability;
- localized presentation key;
- contents;
- price currency/amount;
- platform eligibility;
- purchase limits.

**purchases**

- id, player_id;
- platform;
- external transaction identifier;
- offer/version;
- paid amount/currency where permitted;
- validation state;
- receipt hash/reference;
- created_at, finalized_at, refunded_at;
- unique(platform, external transaction identifier).

Purchase fulfillment is idempotent and reversible through compensating ledger/inventory records, never record deletion.

### Progression/live operations

**seasons**, **pass_tiers**, **player_season_progress**

Store versioned season dates, XP, claimed rewards, and Premium entitlement.

**mission_definitions**, **player_missions**

Definitions are versioned. Player records store assigned parameters, progress, completion, claim, and expiration.

**achievements**, **player_achievements**

Progress and unlock timestamps; reward claiming is idempotent.

**events**, **event_progress**

Event schedule, ruleset, Shard economy, progress, and reward state.

### Safety and operations

**reports**

- reporter, target, match/replay context;
- category and sanitized description;
- status and moderation timestamps.

**admin_audit_log**

- actor;
- action and target;
- reason;
- redacted before/after payload;
- timestamp and request correlation.

**idempotency_records**

Short/medium-lived records for API mutation deduplication.

## 3. Indexing priorities

- unique normalized public handle;
- identity provider + subject;
- matches by player through match_players and started_at;
- ratings by season/queue/rating descending;
- ledger by player/currency/created_at;
- purchases by platform/external transaction;
- missions by player/status/expiration;
- friendships and blocks in both lookup directions;
- audit entries by target and timestamp.

Indexes are measured against real query plans; redundant indexes are avoided because they increase write cost.

## 4. Redis key domains

Illustrative, versioned prefixes:

- session/revocation cache;
- presence by player;
- matchmaking sorted sets by region/ruleset/rating band;
- room seat reservations;
- room discovery/presence;
- rate-limit buckets;
- leaderboard snapshots;
- live configuration cache;
- short reconnect snapshots;
- distributed idempotency locks where database uniqueness is insufficient.

Every key has an owner and TTL policy. Paid balances and inventory are never Redis-only.

## 5. Client/API protocol

HTTP APIs use a versioned prefix and typed schemas. Mutation requests include:

- authentication;
- request/correlation id;
- idempotency key where repeat is possible;
- client protocol version;
- strictly validated body.

Responses use stable machine codes separate from localized messages.

## 6. Realtime connection lifecycle

1. Client requests matchmaking ticket via authenticated API.
2. Matchmaker validates account, queue access, ruleset, region, and current session.
3. A compatible pair is reserved into a Colyseus room.
4. API returns short-lived, single-use seat reservation.
5. Client joins room and negotiates protocol/content versions.
6. Room sends public initial state plus seed commitment.
7. Both clients acknowledge readiness.
8. Room begins synchronized turn deadlines.
9. Final result is committed idempotently to PostgreSQL.
10. Room reveals required seed material and sends signed/hashed replay summary.

## 7. Turn message model

### Client to room

**SubmitIntent**

- match id;
- turn number;
- monotonically increasing client sequence;
- target coordinate;
- client observed state hash;
- optional client send timestamp for diagnostics only.

The client may replace intent multiple times. Network arrival before the authoritative deadline determines acceptance; client clock never determines legality.

### Room to client

- `TurnOpened`: turn, deadline, public state/hash;
- `IntentAck`: turn, sequence, legal/illegal reason;
- `TurnLocked`: no destination information;
- `IntentReveal`: both canonical targets;
- `ResolutionEvents`: ordered presentation events;
- `StateCommitted`: resulting public state/hash;
- `MatchEnded`: complete result and commit identifier;
- `Error`: stable error code and recoverability.

## 8. Clock synchronization

- Server sends authoritative deadline and server timestamp.
- Client estimates offset with periodic ping/pong samples.
- UI timer includes uncertainty styling near lock.
- Server accepts no intent after deadline.
- A small transport grace must not extend strategic time differently per player; if used, it is applied through a consistent buffered-resolution policy and measured.

Initial recommendation: collect intents until deadline, resolve after a fixed 100 ms ingestion buffer, and never reveal until the buffer ends. Only messages received by the deadline according to server monotonic time are valid.

## 9. Disconnect and reconnect

- Room keeps the player seat for a short reconnect window.
- Turns continue; safe selection applies when no valid intent exists.
- Reconnecting client supplies a one-time resume token.
- Room sends latest snapshot plus events after the snapshot sequence.
- A replaced connection invalidates the older transport.
- If the room process fails, recovery uses the latest snapshot and intent log where supported; early alpha may declare no-contest instead, clearly recorded.

Repeated disconnect behavior is separated from ordinary network instability using pattern and quality signals.

## 10. Deterministic replay

Replay input contains:

- simulation/ruleset/balance/content versions;
- seed;
- initial state;
- accepted final intent per player/turn;
- server-generated mutation choices where not derivable;
- final hash and optional intermediate hashes.

Playback re-simulates and verifies hashes. If a required historical runtime cannot be safely retained, the replay is rendered from stored authoritative events instead of silently changing outcome.

## 11. Match privacy

- hidden intent is sent only to the room, not opponent-facing state;
- spectators receive delayed reveals in Ranked;
- invite codes are opaque and rate-limited;
- public profiles use handles, never provider identity;
- replay visibility defaults according to clear player settings;
- block relationships prevent direct invitations and appropriate social visibility.

## 12. Failure semantics

- Invalid intent: reject with reason; preserve last valid acknowledged intent.
- Temporary API timeout: retry only with same idempotency key.
- Final match commit timeout: room retries; player sees pending result, never duplicate rewards.
- Currency mutation conflict: transaction rolls back entirely.
- Purchase verification pending: show pending state; do not grant twice.
- Ruleset mismatch: refuse room join and force safe client refresh.

## 13. Backup and retention

Before paid launch:

- encrypted automated PostgreSQL backups;
- point-in-time recovery where provider supports it;
- tested restore procedure;
- separate retention for audit, gameplay telemetry, support, and personal data;
- deletion/export jobs;
- secrets excluded from backups and logs;
- replay retention communicated to users.

Exact retention periods require legal/privacy review for launch regions and age rating.
