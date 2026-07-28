import { adjacentCells, createArena, getCell, GRID_SIZE, legalCells, mirrorCoord, sameCoord } from "./arena";
import { NODE_DEFINITIONS, NODE_KINDS } from "./nodes";
import { randomIndex } from "./random";
import type {
  Cell,
  Coord,
  GameEvent,
  GameState,
  NodeKind,
  PlayerId,
  PlayerState,
  Ruleset,
  TurnIntents,
  TurnResult
} from "./types";

const other = (player: PlayerId): PlayerId => (player === "p1" ? "p2" : "p1");
const clone = <T>(value: T): T => structuredClone(value);

export function createGame(seed = Date.now(), ruleset: Ruleset = "flow"): GameState {
  const normalized = seed >>> 0;
  const arena = createArena(normalized, ruleset);
  return {
    version: 1,
    seed: normalized,
    rngState: arena.rngState,
    ruleset,
    turn: 1,
    players: {
      p1: createPlayer("p1", { row: 4, col: 1 }),
      p2: createPlayer("p2", { row: 0, col: 3 })
    },
    cells: arena.cells,
    winner: null,
    endReason: null
  };
}

function createPlayer(id: PlayerId, position: Coord): PlayerState {
  return {
    id,
    integrity: 100,
    guard: 0,
    charge: 0,
    resonance: 0,
    position,
    echoPrime: false,
    mirrorReady: false,
    absorbReady: false,
    gravityPrime: false,
    damageDealt: 0
  };
}

export function safeIntent(state: GameState, preferred?: Coord): Coord {
  const preferredCell = preferred ? getCell(state.cells, preferred) : undefined;
  if (preferredCell && !preferredCell.void && preferredCell.cooldown === 0) return clone(preferredCell.coord);
  const legal = legalCells(state.cells).sort(
    (a, b) => a.cooldown - b.cooldown || a.coord.row - b.coord.row || a.coord.col - b.coord.col
  );
  return clone(legal[0]?.coord ?? { row: 2, col: 2 });
}

interface Pending {
  damage: Record<PlayerId, { amount: number; source: NodeKind | "clash" | "instability" }[]>;
  guard: Record<PlayerId, number>;
  move: Partial<Record<PlayerId, { to: Coord; cause: NodeKind }>>;
  nodeKinds: Partial<Record<PlayerId, NodeKind>>;
}

export function resolveTurn(input: GameState, requested: TurnIntents): TurnResult {
  if (input.winner) return { state: clone(input), intents: clone(requested), events: [] };

  const state = clone(input);
  const events: GameEvent[] = [];
  const intents: TurnIntents = {
    p1: safeIntent(state, requested.p1),
    p2: safeIntent(state, requested.p2)
  };
  const pending: Pending = {
    damage: { p1: [], p2: [] },
    guard: { p1: 0, p2: 0 },
    move: {},
    nodeKinds: {}
  };

  state.players.p1.position = clone(intents.p1);
  state.players.p2.position = clone(intents.p2);
  events.push({ type: "land", player: "p1", at: clone(intents.p1) });
  events.push({ type: "land", player: "p2", at: clone(intents.p2) });

  if (sameCoord(intents.p1, intents.p2)) {
    events.push({ type: "clash", at: clone(intents.p1) });
    pending.damage.p1.push({ amount: 6, source: "clash" });
    pending.damage.p2.push({ amount: 6, source: "clash" });
    const cell = getCell(state.cells, intents.p1);
    if (cell) {
      cell.cooldown = Math.min(3, Math.max(cell.cooldown, NODE_DEFINITIONS[cell.node].cooldown + 1));
      events.push({ type: "cooldown", at: clone(cell.coord), turns: cell.cooldown });
    }
  } else {
    activatePrimary(state, "p1", intents.p1, pending, events);
    activatePrimary(state, "p2", intents.p2, pending, events);
  }

  applyGuards(state, pending, events);
  applyDamage(state, pending, events);
  applyMoves(state, pending, events);
  applyInstability(state, events);
  tickCooldowns(state);
  scheduleMutation(state, events);
  state.turn += 1;
  determineWinner(state, events);

  return { state, intents, events };
}

function activatePrimary(
  state: GameState,
  playerId: PlayerId,
  at: Coord,
  pending: Pending,
  events: GameEvent[]
): void {
  const cell = getCell(state.cells, at);
  if (!cell) return;
  const kind = cell.node;
  const player = state.players[playerId];
  const rivalId = other(playerId);
  const rival = state.players[rivalId];
  pending.nodeKinds[playerId] = kind;
  events.push({ type: "activate", player: playerId, node: kind, at: clone(at) });
  cell.cooldown = NODE_DEFINITIONS[kind].cooldown + 1;
  events.push({ type: "cooldown", at: clone(at), turns: NODE_DEFINITIONS[kind].cooldown });

  let strikeDamage = 0;
  switch (kind) {
    case "pulse":
      strikeDamage = 12;
      break;
    case "ripple": {
      strikeDamage = 7;
      const warnedAdjacent = adjacentCells(state.cells, at).filter((candidate) => candidate.warned).length;
      if (warnedAdjacent > 0) {
        const echoDamage = Math.min(6, warnedAdjacent * 3);
        strikeDamage += echoDamage;
        events.push({ type: "combo", player: playerId, name: `Ripple +${echoDamage}` });
      }
      break;
    }
    case "nova":
      pending.damage[playerId].push({ amount: 8, source: "nova" });
      strikeDamage = 8;
      player.resonance = Math.min(3, player.resonance + 1);
      break;
    case "anchor":
      pending.guard[playerId] += 14;
      break;
    case "absorb":
      player.absorbReady = true;
      break;
    case "mirror":
      player.mirrorReady = true;
      break;
    case "shift": {
      pending.move[playerId] = { to: clone(rival.position), cause: "shift" };
      pending.move[rivalId] = { to: clone(player.position), cause: "shift" };
      break;
    }
    case "warp": {
      const destination = player.gravityPrime ? { row: 2, col: 2 } : mirrorCoord(rival.position);
      const target = getCell(state.cells, destination);
      if (target && !target.void) {
        pending.move[rivalId] = { to: destination, cause: "warp" };
        if (player.gravityPrime) {
          events.push({ type: "combo", player: playerId, name: "Gravity × Warp" });
          player.gravityPrime = false;
        }
      }
      break;
    }
    case "gravity":
      player.gravityPrime = true;
      break;
    case "echo":
      player.echoPrime = true;
      break;
    case "relay":
      activateRelay(state, playerId, at, pending, events);
      break;
    case "prism":
      transformWarnedAdjacent(state, playerId, at, events);
      break;
  }

  if (strikeDamage > 0) {
    if (player.resonance >= 3) {
      strikeDamage += 6;
      player.resonance = 0;
      events.push({ type: "combo", player: playerId, name: "Resonance" });
    } else if (kind !== "nova") {
      player.resonance = Math.min(3, player.resonance + 1);
    }
    pending.damage[rivalId].push({ amount: strikeDamage, source: kind });
    if (player.echoPrime && kind !== "nova") {
      const echo = Math.ceil(strikeDamage * 0.5);
      pending.damage[rivalId].push({ amount: echo, source: kind });
      player.echoPrime = false;
      events.push({ type: "combo", player: playerId, name: `Echo × ${NODE_DEFINITIONS[kind].label}` });
    }
  }
}

function activateRelay(
  state: GameState,
  playerId: PlayerId,
  at: Coord,
  pending: Pending,
  events: GameEvent[]
): void {
  const candidate = adjacentCells(state.cells, at)
    .filter((cell) => !cell.void && cell.cooldown === 0 && cell.node !== "relay")
    .sort((a, b) => a.coord.row - b.coord.row || a.coord.col - b.coord.col)[0];
  if (!candidate) return;
  candidate.cooldown = NODE_DEFINITIONS[candidate.node].cooldown + 1;
  events.push({ type: "combo", player: playerId, name: `Relay × ${NODE_DEFINITIONS[candidate.node].label}` });
  if (candidate.node === "pulse") pending.damage[other(playerId)].push({ amount: 6, source: "pulse" });
  if (candidate.node === "anchor") pending.guard[playerId] += 7;
  if (candidate.node === "ripple") pending.damage[other(playerId)].push({ amount: 4, source: "ripple" });
}

function transformWarnedAdjacent(state: GameState, playerId: PlayerId, at: Coord, events: GameEvent[]): void {
  for (const cell of adjacentCells(state.cells, at).filter((candidate) => candidate.warned).slice(0, 2)) {
    const currentIndex = NODE_KINDS.indexOf(cell.node);
    cell.node = NODE_KINDS[(currentIndex + 4) % NODE_KINDS.length];
    cell.warned = false;
    cell.unstable = false;
    events.push({ type: "mutation", at: clone(cell.coord), node: cell.node, state: "changed" });
    events.push({ type: "combo", player: playerId, name: "Prism Shift" });
  }
}

function applyGuards(state: GameState, pending: Pending, events: GameEvent[]): void {
  for (const id of ["p1", "p2"] as PlayerId[]) {
    if (pending.guard[id] > 0) {
      state.players[id].guard += pending.guard[id];
      events.push({ type: "guard", player: id, amount: pending.guard[id] });
    }
  }
}

function applyDamage(state: GameState, pending: Pending, events: GameEvent[]): void {
  for (const targetId of ["p1", "p2"] as PlayerId[]) {
    const target = state.players[targetId];
    const attacker = state.players[other(targetId)];
    for (const packet of pending.damage[targetId]) {
      let amount = packet.amount;
      if (packet.source !== "clash" && packet.source !== "instability" && target.mirrorReady) {
        const reflected = Math.ceil(amount * 0.6);
        target.mirrorReady = false;
        attacker.integrity = Math.max(0, attacker.integrity - reflected);
        target.damageDealt += reflected;
        events.push({ type: "combo", player: targetId, name: "Mirror Route" });
        events.push({ type: "damage", target: other(targetId), amount: reflected, source: "mirror" });
        amount = 0;
      }
      if (amount > 0 && packet.source !== "clash" && target.absorbReady) {
        const absorbed = Math.min(10, amount);
        amount -= absorbed;
        target.charge = Math.min(3, target.charge + 1);
        target.absorbReady = false;
        events.push({ type: "combo", player: targetId, name: `Absorb ${absorbed}` });
      }
      if (amount > 0 && packet.source !== "clash") {
        const blocked = Math.min(target.guard, amount);
        target.guard -= blocked;
        amount -= blocked;
      }
      if (amount > 0) {
        target.integrity = Math.max(0, target.integrity - amount);
        attacker.damageDealt += amount;
        events.push({ type: "damage", target: targetId, amount, source: packet.source });
      }
    }
  }
}

function applyMoves(state: GameState, pending: Pending, events: GameEvent[]): void {
  for (const id of ["p1", "p2"] as PlayerId[]) {
    const movement = pending.move[id];
    if (!movement) continue;
    state.players[id].position = clone(movement.to);
    events.push({ type: "move", player: id, to: clone(movement.to), cause: movement.cause });
  }
}

function applyInstability(state: GameState, events: GameEvent[]): void {
  for (const id of ["p1", "p2"] as PlayerId[]) {
    const cell = getCell(state.cells, state.players[id].position);
    if (!cell?.unstable) continue;
    state.players[id].integrity = Math.max(0, state.players[id].integrity - 5);
    state.players[other(id)].damageDealt += 5;
    events.push({ type: "damage", target: id, amount: 5, source: "instability" });
  }
}

function tickCooldowns(state: GameState): void {
  for (const cell of state.cells) cell.cooldown = Math.max(0, cell.cooldown - 1);
}

function scheduleMutation(state: GameState, events: GameEvent[]): void {
  // Resolve warnings first.
  for (const cell of state.cells.filter((candidate) => candidate.warned)) {
    cell.warned = false;
    if (state.turn >= 34 && isOuter(cell.coord)) {
      cell.void = true;
      cell.unstable = false;
      events.push({ type: "mutation", at: clone(cell.coord), state: "void" });
    } else {
      cell.unstable = !cell.unstable;
      const [index, next] = randomIndex(state.rngState, NODE_KINDS.length);
      state.rngState = next;
      cell.node = NODE_KINDS[index];
      events.push({ type: "mutation", at: clone(cell.coord), node: cell.node, state: "changed" });
    }
  }

  const cadence = state.ruleset === "precision" ? 4 : state.ruleset === "flow" ? 3 : 2;
  if (state.turn % cadence !== 0 && state.turn < 31) return;

  const candidates = state.cells.filter((cell) => !cell.void && !cell.warned);
  if (candidates.length === 0) return;
  const count = state.ruleset === "anomaly" ? 2 : 1;
  for (let i = 0; i < count && candidates.length > 0; i += 1) {
    const [index, next] = randomIndex(state.rngState, candidates.length);
    state.rngState = next;
    const [cell] = candidates.splice(index, 1);
    cell.warned = true;
    events.push({ type: "mutation", at: clone(cell.coord), state: "warned" });
  }
}

function isOuter(coord: Coord): boolean {
  return coord.row === 0 || coord.col === 0 || coord.row === GRID_SIZE - 1 || coord.col === GRID_SIZE - 1;
}

function determineWinner(state: GameState, events: GameEvent[]): void {
  const p1 = state.players.p1;
  const p2 = state.players.p2;
  let winner: PlayerId | "draw" | null = null;
  let reason: "integrity" | "turn-cap" | null = null;
  if (p1.integrity <= 0 || p2.integrity <= 0) {
    reason = "integrity";
    if (p1.integrity === p2.integrity) winner = tieBreak(state);
    else winner = p1.integrity > p2.integrity ? "p1" : "p2";
  } else if (state.turn > 50) {
    reason = "turn-cap";
    winner = tieBreak(state);
  }
  if (!winner || !reason) return;
  state.winner = winner;
  state.endReason = reason;
  events.push({ type: "end", winner, reason });
}

function tieBreak(state: GameState): PlayerId | "draw" {
  const p1 = state.players.p1;
  const p2 = state.players.p2;
  if (p1.integrity !== p2.integrity) return p1.integrity > p2.integrity ? "p1" : "p2";
  if (p1.charge !== p2.charge) return p1.charge > p2.charge ? "p1" : "p2";
  if (p1.damageDealt !== p2.damageDealt) return p1.damageDealt > p2.damageDealt ? "p1" : "p2";
  return "draw";
}

export function stateHash(state: GameState): string {
  const source = JSON.stringify(state);
  let hash = 2166136261;
  for (let i = 0; i < source.length; i += 1) {
    hash ^= source.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
