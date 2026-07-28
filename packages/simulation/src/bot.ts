import { getCell, legalCells, sameCoord } from "./arena";
import { NODE_DEFINITIONS } from "./nodes";
import { nextRandom } from "./random";
import type { Coord, GameState, PlayerId } from "./types";

const scoreByNode: Record<string, number> = {
  pulse: 12,
  ripple: 8,
  nova: 7,
  anchor: 9,
  absorb: 7,
  mirror: 8,
  shift: 5,
  warp: 6,
  gravity: 5,
  echo: 7,
  relay: 6,
  prism: 5
};

export function chooseBotIntent(state: GameState, playerId: PlayerId = "p2"): Coord {
  const rivalId = playerId === "p1" ? "p2" : "p1";
  const rivalPosition = state.players[rivalId].position;
  let rng = state.rngState ^ (state.turn * 0x9e3779b9);
  const scored = legalCells(state.cells).map((cell) => {
    const [noise, next] = nextRandom(rng);
    rng = next;
    let score = scoreByNode[cell.node] ?? 0;
    if (cell.unstable) score -= 7;
    if (cell.warned) score -= state.ruleset === "anomaly" ? 1 : 3;
    if (sameCoord(cell.coord, rivalPosition)) score += state.players[rivalId].integrity <= 12 ? 8 : -2;
    if (NODE_DEFINITIONS[cell.node].family === "guard" && state.players[playerId].integrity < 40) score += 5;
    score += noise * 2;
    return { coord: cell.coord, score };
  });
  scored.sort((a, b) => b.score - a.score || a.coord.row - b.coord.row || a.coord.col - b.coord.col);
  return structuredClone(scored[0]?.coord ?? getCell(state.cells, { row: 2, col: 2 })?.coord ?? { row: 2, col: 2 });
}
