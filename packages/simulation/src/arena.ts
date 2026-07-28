import { NODE_KINDS } from "./nodes";
import { normalizeSeed, randomIndex } from "./random";
import type { Cell, Coord, NodeKind, Ruleset } from "./types";

export const GRID_SIZE = 5;

export const coordKey = (coord: Coord): string => `${coord.row}:${coord.col}`;
export const sameCoord = (a: Coord, b: Coord): boolean => a.row === b.row && a.col === b.col;
export const mirrorCoord = (coord: Coord): Coord => ({
  row: GRID_SIZE - 1 - coord.row,
  col: GRID_SIZE - 1 - coord.col
});

export function isInBounds(coord: Coord): boolean {
  return coord.row >= 0 && coord.row < GRID_SIZE && coord.col >= 0 && coord.col < GRID_SIZE;
}

export function createArena(seed: number, ruleset: Ruleset): { cells: Cell[]; rngState: number } {
  let rngState = normalizeSeed(seed);
  const assigned = new Map<string, NodeKind>();
  const coords: Coord[] = [];
  const shuffledKinds = [...NODE_KINDS];

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) coords.push({ row, col });
  }

  for (let index = shuffledKinds.length - 1; index > 0; index -= 1) {
    const [swapIndex, next] = randomIndex(rngState, index + 1);
    rngState = next;
    [shuffledKinds[index], shuffledKinds[swapIndex]] = [shuffledKinds[swapIndex], shuffledKinds[index]];
  }

  let pairIndex = 0;
  for (const coord of coords) {
    const key = coordKey(coord);
    if (assigned.has(key)) continue;
    const mirrored = mirrorCoord(coord);
    if (sameCoord(coord, mirrored)) continue;
    const kind = shuffledKinds[pairIndex % shuffledKinds.length];
    pairIndex += 1;
    assigned.set(key, kind);
    assigned.set(coordKey(mirrored), kind);
  }

  // The centre is a reliable tactical landmark.
  assigned.set(coordKey({ row: 2, col: 2 }), ruleset === "anomaly" ? "prism" : "relay");

  return {
    rngState,
    cells: coords.map((coord) => ({
      coord,
      node: assigned.get(coordKey(coord)) ?? "pulse",
      cooldown: 0,
      void: false,
      unstable: false,
      warned: false
    }))
  };
}

export function legalCells(cells: Cell[]): Cell[] {
  return cells.filter((cell) => !cell.void && cell.cooldown === 0);
}

export function getCell(cells: Cell[], coord: Coord): Cell | undefined {
  return cells.find((cell) => sameCoord(cell.coord, coord));
}

export function adjacentCells(cells: Cell[], coord: Coord): Cell[] {
  return cells.filter((cell) => {
    const distance = Math.abs(cell.coord.row - coord.row) + Math.abs(cell.coord.col - coord.col);
    return distance === 1;
  });
}
