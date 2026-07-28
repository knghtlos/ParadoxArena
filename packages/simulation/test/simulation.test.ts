import { describe, expect, it } from "vitest";
import {
  createGame,
  legalCells,
  NODE_DEFINITIONS,
  NODE_KINDS,
  resolveTurn,
  runReplay,
  stateHash,
  type Replay
} from "../src";

describe("simulation", () => {
  const setNode = (
    game: ReturnType<typeof createGame>,
    coord: { row: number; col: number },
    node: keyof typeof NODE_DEFINITIONS
  ) => {
    const cell = game.cells.find((candidate) => candidate.coord.row === coord.row && candidate.coord.col === coord.col);
    if (!cell) throw new Error("Missing test cell");
    cell.node = node;
    cell.cooldown = 0;
    cell.void = false;
  };

  it("creates a symmetric, legal 5×5 arena", () => {
    const game = createGame(42, "precision");
    expect(game.cells).toHaveLength(25);
    expect(legalCells(game.cells)).toHaveLength(25);
    expect(new Set(game.cells.map((cell) => cell.node))).toEqual(new Set(NODE_KINDS));
    for (const cell of game.cells) {
      const mirrored = game.cells.find(
        (candidate) => candidate.coord.row === 4 - cell.coord.row && candidate.coord.col === 4 - cell.coord.col
      );
      if (cell.coord.row === 2 && cell.coord.col === 2) continue;
      expect(mirrored?.node).toBe(cell.node);
    }
  });

  it("resolves a same-cell Clash symmetrically", () => {
    const game = createGame(42, "precision");
    const result = resolveTurn(game, {
      p1: { row: 2, col: 2 },
      p2: { row: 2, col: 2 }
    });
    expect(result.state.players.p1.integrity).toBe(94);
    expect(result.state.players.p2.integrity).toBe(94);
    expect(result.events.some((event) => event.type === "clash")).toBe(true);
  });

  it("supports every configured node", () => {
    expect(NODE_KINDS).toHaveLength(12);
    for (const kind of NODE_KINDS) {
      expect(NODE_DEFINITIONS[kind].summary.length).toBeGreaterThan(2);
      expect(NODE_DEFINITIONS[kind].cooldown).toBeGreaterThan(0);
    }
  });

  it("is deterministic for identical seed and intents", () => {
    const initialA = createGame(777, "flow");
    const initialB = createGame(777, "flow");
    const intents = {
      p1: legalCells(initialA.cells)[3].coord,
      p2: legalCells(initialA.cells)[18].coord
    };
    const a = resolveTurn(initialA, intents);
    const b = resolveTurn(initialB, intents);
    expect(stateHash(a.state)).toBe(stateHash(b.state));
    expect(a.events).toEqual(b.events);
  });

  it("reconstructs a replay exactly", () => {
    const replay: Replay = {
      version: 1,
      createdAt: new Date(0).toISOString(),
      seed: 123,
      ruleset: "precision",
      intents: [
        { p1: { row: 1, col: 1 }, p2: { row: 3, col: 3 } },
        { p1: { row: 2, col: 1 }, p2: { row: 2, col: 3 } }
      ],
      winner: null
    };
    const first = runReplay(replay);
    const second = runReplay(replay);
    expect(first.hash).toBe(second.hash);
  });

  it("applies Pulse damage and a shared cooldown", () => {
    const game = createGame(9, "precision");
    setNode(game, { row: 1, col: 1 }, "pulse");
    setNode(game, { row: 3, col: 3 }, "gravity");
    const result = resolveTurn(game, {
      p1: { row: 1, col: 1 },
      p2: { row: 3, col: 3 }
    });
    expect(result.state.players.p2.integrity).toBe(88);
    expect(result.state.cells.find((cell) => cell.coord.row === 1 && cell.coord.col === 1)?.cooldown).toBe(2);
  });

  it("lets Anchor absorb simultaneous Pulse damage", () => {
    const game = createGame(10, "precision");
    setNode(game, { row: 1, col: 1 }, "anchor");
    setNode(game, { row: 3, col: 3 }, "pulse");
    const result = resolveTurn(game, {
      p1: { row: 1, col: 1 },
      p2: { row: 3, col: 3 }
    });
    expect(result.state.players.p1.integrity).toBe(100);
    expect(result.state.players.p1.guard).toBe(2);
  });

  it("routes a simultaneous Strike through Mirror", () => {
    const game = createGame(11, "precision");
    setNode(game, { row: 1, col: 1 }, "mirror");
    setNode(game, { row: 3, col: 3 }, "pulse");
    const result = resolveTurn(game, {
      p1: { row: 1, col: 1 },
      p2: { row: 3, col: 3 }
    });
    expect(result.state.players.p1.integrity).toBe(100);
    expect(result.state.players.p2.integrity).toBe(92);
  });

  it("uses the last valid state to finish on lethal damage", () => {
    const game = createGame(12, "precision");
    game.players.p2.integrity = 12;
    setNode(game, { row: 1, col: 1 }, "pulse");
    setNode(game, { row: 3, col: 3 }, "gravity");
    const result = resolveTurn(game, {
      p1: { row: 1, col: 1 },
      p2: { row: 3, col: 3 }
    });
    expect(result.state.winner).toBe("p1");
    expect(result.state.endReason).toBe("integrity");
  });
});
