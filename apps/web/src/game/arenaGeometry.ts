import { GRID_SIZE, type Coord } from "@paradox/simulation";

export interface ArenaPoint {
  x: number;
  y: number;
}

export interface ArenaCellShape {
  topLeft: ArenaPoint;
  topRight: ArenaPoint;
  bottomRight: ArenaPoint;
  bottomLeft: ArenaPoint;
  center: ArenaPoint;
  points: ArenaPoint[];
}

export const ARENA_VIEWPORT = {
  width: 560,
  height: 1025
} as const;

const FLOOR_TOP_LEFT: ArenaPoint = { x: 102, y: 91 };
const FLOOR_TOP_RIGHT: ArenaPoint = { x: 458, y: 91 };
const FLOOR_BOTTOM_LEFT: ArenaPoint = { x: 65, y: 921 };
const FLOOR_BOTTOM_RIGHT: ArenaPoint = { x: 495, y: 921 };

export function coordToArenaPoint(coord: Coord): ArenaPoint {
  return interpolateFloor((coord.row + 0.5) / GRID_SIZE, (coord.col + 0.5) / GRID_SIZE);
}

export function coordToArenaCell(coord: Coord): ArenaCellShape {
  const top = coord.row / GRID_SIZE;
  const bottom = (coord.row + 1) / GRID_SIZE;
  const left = coord.col / GRID_SIZE;
  const right = (coord.col + 1) / GRID_SIZE;
  const topLeft = interpolateFloor(top, left);
  const topRight = interpolateFloor(top, right);
  const bottomRight = interpolateFloor(bottom, right);
  const bottomLeft = interpolateFloor(bottom, left);

  return {
    topLeft,
    topRight,
    bottomRight,
    bottomLeft,
    center: coordToArenaPoint(coord),
    points: [topLeft, topRight, bottomRight, bottomLeft]
  };
}

export function arenaPointToPercent(point: ArenaPoint): { left: number; top: number } {
  return {
    left: (point.x / ARENA_VIEWPORT.width) * 100,
    top: (point.y / ARENA_VIEWPORT.height) * 100
  };
}

function interpolateFloor(rowProgress: number, colProgress: number): ArenaPoint {
  const left = lerpPoint(FLOOR_TOP_LEFT, FLOOR_BOTTOM_LEFT, rowProgress);
  const right = lerpPoint(FLOOR_TOP_RIGHT, FLOOR_BOTTOM_RIGHT, rowProgress);
  return lerpPoint(left, right, colProgress);
}

function lerpPoint(from: ArenaPoint, to: ArenaPoint, progress: number): ArenaPoint {
  return {
    x: lerp(from.x, to.x, progress),
    y: lerp(from.y, to.y, progress)
  };
}

function lerp(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}
