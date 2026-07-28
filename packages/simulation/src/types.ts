export type Ruleset = "precision" | "flow" | "anomaly";
export type PlayerId = "p1" | "p2";
export type NodeFamily = "strike" | "guard" | "vector" | "circuit";
export type NodeKind =
  | "pulse"
  | "ripple"
  | "nova"
  | "anchor"
  | "absorb"
  | "mirror"
  | "shift"
  | "warp"
  | "gravity"
  | "echo"
  | "relay"
  | "prism";

export interface Coord {
  row: number;
  col: number;
}

export interface Cell {
  coord: Coord;
  node: NodeKind;
  cooldown: number;
  void: boolean;
  unstable: boolean;
  warned: boolean;
}

export interface PlayerState {
  id: PlayerId;
  integrity: number;
  guard: number;
  charge: number;
  resonance: number;
  position: Coord;
  echoPrime: boolean;
  mirrorReady: boolean;
  absorbReady: boolean;
  gravityPrime: boolean;
  damageDealt: number;
}

export interface GameState {
  version: 1;
  seed: number;
  rngState: number;
  ruleset: Ruleset;
  turn: number;
  players: Record<PlayerId, PlayerState>;
  cells: Cell[];
  winner: PlayerId | "draw" | null;
  endReason: "integrity" | "turn-cap" | null;
}

export interface TurnIntents {
  p1: Coord;
  p2: Coord;
}

export type GameEvent =
  | { type: "land"; player: PlayerId; at: Coord }
  | { type: "activate"; player: PlayerId; node: NodeKind; at: Coord }
  | { type: "damage"; target: PlayerId; amount: number; source: NodeKind | "clash" | "instability" }
  | { type: "guard"; player: PlayerId; amount: number }
  | { type: "clash"; at: Coord }
  | { type: "combo"; player: PlayerId; name: string }
  | { type: "move"; player: PlayerId; to: Coord; cause: NodeKind }
  | { type: "mutation"; at: Coord; node?: NodeKind; state: "warned" | "changed" | "void" }
  | { type: "cooldown"; at: Coord; turns: number }
  | { type: "end"; winner: PlayerId | "draw"; reason: "integrity" | "turn-cap" };

export interface TurnResult {
  state: GameState;
  intents: TurnIntents;
  events: GameEvent[];
}

export interface Replay {
  version: 1;
  createdAt: string;
  seed: number;
  ruleset: Ruleset;
  intents: TurnIntents[];
  winner: PlayerId | "draw" | null;
}
