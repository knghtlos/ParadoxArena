import Phaser from "phaser";
import {
  FAMILY_COLORS,
  GRID_SIZE,
  NODE_DEFINITIONS,
  sameCoord,
  type Coord,
  type GameState
} from "@paradox/simulation";
import type { VisualTheme } from "../theme";
import { ARENA_VIEWPORT, coordToArenaCell, type ArenaCellShape, type ArenaPoint } from "./arenaGeometry";

interface PowerTileStyle {
  color: number;
  glyph: "arrow" | "bolt" | "shield" | "star";
}

const POWER_TILES: Record<number, PowerTileStyle> = {
  2: { color: 0x42b9ff, glyph: "arrow" },
  6: { color: 0xffbd43, glyph: "bolt" },
  13: { color: 0x55c9ff, glyph: "shield" },
  18: { color: 0xd75cff, glyph: "star" },
  22: { color: 0x4db8ff, glyph: "star" }
};

export class ArenaScene extends Phaser.Scene {
  private state?: GameState;
  private selected?: Coord;
  private board?: Phaser.GameObjects.Container;
  private selectionHandler?: (coord: Coord) => void;
  private reducedMotion = false;

  constructor() {
    super("arena");
  }

  create(): void {
    this.board = this.add.container(0, 0);
    if (this.state) this.renderBoard();
  }

  setSelectionHandler(handler: (coord: Coord) => void): void {
    this.selectionHandler = handler;
  }

  setReducedMotion(value: boolean): void {
    this.reducedMotion = value;
  }

  setLanguage(_language: "it" | "en"): void {
    // The reference arena intentionally contains no written labels.
  }

  setVisualTheme(_theme: VisualTheme): void {
    if (this.board && this.state) this.renderBoard();
  }

  updateState(state: GameState, selected?: Coord, animate = false): void {
    this.state = state;
    this.selected = selected;
    if (!this.board) return;
    this.renderBoard();
    if (animate && !this.reducedMotion) {
      this.tweens.add({
        targets: this.board,
        scaleX: { from: 0.992, to: 1 },
        scaleY: { from: 0.992, to: 1 },
        duration: 220,
        ease: "Sine.Out"
      });
      this.cameras.main.shake(70, 0.0015);
    }
  }

  private renderBoard(): void {
    if (!this.board || !this.state) return;
    this.board.removeAll(true);
    this.drawEdgeShading();

    for (const cell of this.state.cells) {
      const shape = coordToArenaCell(cell.coord);
      const center = shape.center;
      const index = cell.coord.row * GRID_SIZE + cell.coord.col;
      const definition = NODE_DEFINITIONS[cell.node];
      const familyColor = FAMILY_COLORS[definition.family];
      const legal = !cell.void && cell.cooldown === 0;
      const selected = Boolean(this.selected && sameCoord(this.selected, cell.coord));
      const powerStyle = POWER_TILES[index];
      const graphic = this.add.graphics();

      // The logical grid is projected onto the trapezoid floor so every strip
      // of the arena remains covered by a selectable cell.
      graphic.fillStyle(
        selected ? 0x46d9ff : legal ? 0x2e9bc7 : 0x26313e,
        selected ? 0.34 : legal ? 0.025 : 0.035
      );
      graphic.fillPoints(shape.points, true);
      graphic.lineStyle(
        selected ? 4 : 1,
        selected ? 0x79e7ff : legal ? 0x7194ad : 0x47515d,
        selected ? 0.96 : legal ? 0.27 : 0.14
      );
      graphic.strokePoints(shape.points, true, true);

      if (selected) {
        graphic.lineStyle(2, 0xecfbff, 0.72);
        graphic.strokePoints(insetCellPoints(shape, 6), true, true);
      }

      if (!cell.void && (powerStyle || selected || cell.warned)) {
        drawPowerTile(
          graphic,
          center,
          shape,
          powerStyle ?? { color: familyColor, glyph: familyGlyph(definition.family) },
          legal,
          selected
        );
      }

      if (cell.unstable) {
        graphic.lineStyle(2, 0xff8b77, 0.76);
        graphic.lineBetween(center.x - 21, center.y - 13, center.x - 4, center.y + 1);
        graphic.lineBetween(center.x - 4, center.y + 1, center.x - 14, center.y + 24);
        graphic.lineBetween(center.x - 4, center.y + 1, center.x + 25, center.y + 11);
      }

      this.board.add(graphic);

      if (legal) {
        const hover = this.add.graphics();
        hover.fillStyle(0x51cfff, 0.13);
        hover.fillPoints(shape.points, true);
        hover.lineStyle(2, 0x72e5ff, 0.76);
        hover.strokePoints(shape.points, true, true);
        hover.setAlpha(0.001);
        hover.setInteractive(
          new Phaser.Geom.Polygon(shape.points),
          Phaser.Geom.Polygon.Contains
        );
        hover.on("pointerdown", () => this.selectionHandler?.({ ...cell.coord }));
        hover.on("pointerover", () => hover.setAlpha(1));
        hover.on("pointerout", () => hover.setAlpha(0.001));
        this.board.add(hover);
      }

      if (!cell.void && cell.cooldown > 0) {
        const badgeCenter = topRightBadgePosition(shape);
        const badgeWidth = 27;
        const badgeHeight = 23;
        const badgeLeft = badgeCenter.x - badgeWidth / 2;
        const badgeTop = badgeCenter.y - badgeHeight / 2;
        const badge = this.add.graphics();
        badge.fillStyle(0x06101b, 0.96);
        badge.fillRoundedRect(badgeLeft, badgeTop, badgeWidth, badgeHeight, 6);
        badge.lineStyle(1, familyColor, 0.9);
        badge.strokeRoundedRect(badgeLeft, badgeTop, badgeWidth, badgeHeight, 6);
        const cooldown = this.add
          .text(badgeCenter.x, badgeCenter.y, String(cell.cooldown), {
            fontFamily: "Chakra Petch, Arial, sans-serif",
            fontSize: "12px",
            fontStyle: "bold",
            color: "#ecfbff"
          })
          .setOrigin(0.5);
        this.board.add([badge, cooldown]);
      }
    }
  }

  private drawEdgeShading(): void {
    if (!this.board) return;
    const shading = this.add.graphics();
    shading.fillStyle(0x01050a, 0.28);
    shading.fillRect(0, 0, ARENA_VIEWPORT.width, 74);
    shading.fillStyle(0x01050a, 0.18);
    shading.fillRect(0, 938, ARENA_VIEWPORT.width, ARENA_VIEWPORT.height - 938);
    this.board.add(shading);
  }
}

function familyGlyph(
  family: "strike" | "guard" | "vector" | "circuit"
): PowerTileStyle["glyph"] {
  if (family === "strike") return "bolt";
  if (family === "guard") return "shield";
  if (family === "vector") return "arrow";
  return "star";
}

function drawPowerTile(
  graphic: Phaser.GameObjects.Graphics,
  center: ArenaPoint,
  shape: ArenaCellShape,
  style: PowerTileStyle,
  legal: boolean,
  selected: boolean
): void {
  const alpha = legal ? 1 : 0.34;
  const selectedColor = 0x46d9ff;
  const narrowestWidth = Math.min(
    distance(shape.topLeft, shape.topRight),
    distance(shape.bottomLeft, shape.bottomRight)
  );
  const overlayColor = selected ? selectedColor : style.color;
  const overlayAlpha = selected ? 0.3 : 0.12;
  const borderAlpha = selected ? 0.98 : 0.72;
  const innerBorderAlpha = selected ? 0.64 : 0.26;
  const innerPoints = insetCellPoints(shape, selected ? 7 : 8);
  const glyphScale = Math.min(1.28, Math.max(0.86, narrowestWidth / 76));

  graphic.fillStyle(overlayColor, overlayAlpha * alpha);
  graphic.fillPoints(shape.points, true);
  graphic.lineStyle(selected ? 4 : 2, overlayColor, borderAlpha * alpha);
  graphic.strokePoints(shape.points, true, true);
  graphic.lineStyle(1, 0xdff8ff, innerBorderAlpha * alpha);
  graphic.strokePoints(innerPoints, true, true);
  drawPowerGlyph(graphic, style.glyph, center, overlayColor, alpha, glyphScale);
}

function drawPowerGlyph(
  graphic: Phaser.GameObjects.Graphics,
  glyph: PowerTileStyle["glyph"],
  center: ArenaPoint,
  color: number,
  alpha: number,
  scale: number
): void {
  graphic.fillStyle(color, 0.95 * alpha);
  graphic.lineStyle(Math.max(3, 5 * scale), color, 0.95 * alpha);

  if (glyph === "arrow") {
    graphic.fillRect(center.x - 5 * scale, center.y - 22 * scale, 10 * scale, 29 * scale);
    graphic.fillTriangle(
      center.x - 18 * scale,
      center.y + 2 * scale,
      center.x + 18 * scale,
      center.y + 2 * scale,
      center.x,
      center.y + 23 * scale
    );
    return;
  }

  if (glyph === "bolt") {
    graphic.fillPoints([
      { x: center.x + 4 * scale, y: center.y - 27 * scale },
      { x: center.x - 17 * scale, y: center.y + 1 * scale },
      { x: center.x - 4 * scale, y: center.y + 1 * scale },
      { x: center.x - 10 * scale, y: center.y + 27 * scale },
      { x: center.x + 19 * scale, y: center.y - 8 * scale },
      { x: center.x + 5 * scale, y: center.y - 8 * scale }
    ], true);
    return;
  }

  if (glyph === "shield") {
    graphic.lineStyle(Math.max(3, 5 * scale), color, 0.95 * alpha);
    graphic.strokePoints([
      { x: center.x, y: center.y - 25 * scale },
      { x: center.x + 20 * scale, y: center.y - 14 * scale },
      { x: center.x + 16 * scale, y: center.y + 13 * scale },
      { x: center.x, y: center.y + 26 * scale },
      { x: center.x - 16 * scale, y: center.y + 13 * scale },
      { x: center.x - 20 * scale, y: center.y - 14 * scale }
    ], true);
    return;
  }

  const points: ArenaPoint[] = [];
  for (let index = 0; index < 16; index += 1) {
    const radius = (index % 2 === 0 ? 25 : 9) * scale;
    const angle = -Math.PI / 2 + (Math.PI * index) / 8;
    points.push({
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius
    });
  }
  graphic.fillPoints(points, true);
  graphic.fillStyle(0xeafcff, 0.8 * alpha);
  graphic.fillCircle(center.x, center.y, 5 * scale);
}

function distance(a: ArenaPoint, b: ArenaPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function topRightBadgePosition(shape: ArenaCellShape): ArenaPoint {
  const inward = unitVector(shape.topRight, shape.topLeft);
  const downward = unitVector(shape.topRight, shape.bottomRight);
  return {
    x: shape.topRight.x + inward.x * 20 + downward.x * 17,
    y: shape.topRight.y + inward.y * 20 + downward.y * 17
  };
}

function insetCellPoints(shape: ArenaCellShape, amount: number): ArenaPoint[] {
  return shape.points.map((point) => ({
    x: point.x + (shape.center.x - point.x) * (amount / Math.max(amount, distance(point, shape.center))),
    y: point.y + (shape.center.y - point.y) * (amount / Math.max(amount, distance(point, shape.center)))
  }));
}

function unitVector(from: ArenaPoint, to: ArenaPoint): ArenaPoint {
  const length = distance(from, to);
  if (length === 0) return { x: 0, y: 0 };
  return {
    x: (to.x - from.x) / length,
    y: (to.y - from.y) / length
  };
}
