import Phaser from "phaser";
import {
  FAMILY_COLORS,
  NODE_DEFINITIONS,
  sameCoord,
  type Coord,
  type GameState
} from "@paradox/simulation";
import type { VisualTheme } from "../theme";

const CANVAS_WIDTH = 560;
const CANVAS_HEIGHT = 1025;
const TILE_WIDTH = 86;
const TILE_HEIGHT = 166;
const ORIGIN_X = CANVAS_WIDTH / 2;
const ORIGIN_Y = 174;

interface ArenaPoint {
  x: number;
  y: number;
}

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
      const center = coordToArena(cell.coord);
      const index = cell.coord.row * 5 + cell.coord.col;
      const definition = NODE_DEFINITIONS[cell.node];
      const familyColor = FAMILY_COLORS[definition.family];
      const legal = !cell.void && cell.cooldown === 0;
      const selected = Boolean(this.selected && sameCoord(this.selected, cell.coord));
      const powerStyle = POWER_TILES[index];
      const graphic = this.add.graphics();
      const left = center.x - TILE_WIDTH / 2 + 3;
      const top = center.y - TILE_HEIGHT / 2 + 3;

      // The 25 logical cells cover the complete inner floor. Their restrained
      // outline keeps the detailed steel texture visible while making every
      // valid destination immediately understandable.
      graphic.fillStyle(legal ? 0x2e9bc7 : 0x26313e, legal ? 0.025 : 0.035);
      graphic.fillRoundedRect(left, top, TILE_WIDTH - 6, TILE_HEIGHT - 6, 5);
      graphic.lineStyle(
        selected ? 3 : 1,
        selected ? 0x79e7ff : legal ? 0x7194ad : 0x47515d,
        selected ? 0.96 : legal ? 0.27 : 0.14
      );
      graphic.strokeRoundedRect(left, top, TILE_WIDTH - 6, TILE_HEIGHT - 6, 5);

      if (!cell.void && (powerStyle || selected || cell.warned)) {
        drawPowerTile(
          graphic,
          center,
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
        hover.fillRoundedRect(left + 2, top + 2, TILE_WIDTH - 10, TILE_HEIGHT - 10, 5);
        hover.lineStyle(2, 0x72e5ff, 0.76);
        hover.strokeRoundedRect(left + 2, top + 2, TILE_WIDTH - 10, TILE_HEIGHT - 10, 5);
        hover.setAlpha(0.001);
        hover.setInteractive(
          new Phaser.Geom.Rectangle(left, top, TILE_WIDTH - 6, TILE_HEIGHT - 6),
          Phaser.Geom.Rectangle.Contains
        );
        hover.on("pointerdown", () => this.selectionHandler?.({ ...cell.coord }));
        hover.on("pointerover", () => hover.setAlpha(1));
        hover.on("pointerout", () => hover.setAlpha(0.001));
        this.board.add(hover);
      }

      if (!cell.void && cell.cooldown > 0) {
        const badge = this.add.graphics();
        badge.fillStyle(0x06101b, 0.96);
        badge.fillRoundedRect(center.x + 23, center.y - 39, 27, 23, 6);
        badge.lineStyle(1, familyColor, 0.9);
        badge.strokeRoundedRect(center.x + 23, center.y - 39, 27, 23, 6);
        const cooldown = this.add
          .text(center.x + 36.5, center.y - 27.5, String(cell.cooldown), {
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
    shading.fillRect(0, 0, CANVAS_WIDTH, 74);
    shading.fillStyle(0x01050a, 0.18);
    shading.fillRect(0, 938, CANVAS_WIDTH, CANVAS_HEIGHT - 938);
    this.board.add(shading);
  }
}

function coordToArena(coord: Coord): ArenaPoint {
  return {
    x: ORIGIN_X + (coord.col - 2) * TILE_WIDTH,
    y: ORIGIN_Y + coord.row * TILE_HEIGHT
  };
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
  style: PowerTileStyle,
  legal: boolean,
  selected: boolean
): void {
  const alpha = legal ? 1 : 0.34;
  const size = selected ? 78 : 70;
  const half = size / 2;

  graphic.fillStyle(style.color, 0.055 * alpha);
  graphic.fillRoundedRect(center.x - half - 8, center.y - half - 8, size + 16, size + 16, 12);
  graphic.fillStyle(style.color, 0.12 * alpha);
  graphic.fillRoundedRect(center.x - half, center.y - half, size, size, 7);
  graphic.lineStyle(selected ? 4 : 2, style.color, (selected ? 1 : 0.82) * alpha);
  graphic.strokeRoundedRect(center.x - half, center.y - half, size, size, 7);
  graphic.lineStyle(1, 0xdff8ff, 0.3 * alpha);
  graphic.strokeRoundedRect(center.x - half + 4, center.y - half + 4, size - 8, size - 8, 5);

  drawPowerGlyph(graphic, style.glyph, center, style.color, alpha);
}

function drawPowerGlyph(
  graphic: Phaser.GameObjects.Graphics,
  glyph: PowerTileStyle["glyph"],
  center: ArenaPoint,
  color: number,
  alpha: number
): void {
  graphic.fillStyle(color, 0.95 * alpha);
  graphic.lineStyle(5, color, 0.95 * alpha);

  if (glyph === "arrow") {
    graphic.fillRect(center.x - 5, center.y - 22, 10, 29);
    graphic.fillTriangle(
      center.x - 18,
      center.y + 2,
      center.x + 18,
      center.y + 2,
      center.x,
      center.y + 23
    );
    return;
  }

  if (glyph === "bolt") {
    graphic.fillPoints([
      { x: center.x + 4, y: center.y - 27 },
      { x: center.x - 17, y: center.y + 1 },
      { x: center.x - 4, y: center.y + 1 },
      { x: center.x - 10, y: center.y + 27 },
      { x: center.x + 19, y: center.y - 8 },
      { x: center.x + 5, y: center.y - 8 }
    ], true);
    return;
  }

  if (glyph === "shield") {
    graphic.lineStyle(5, color, 0.95 * alpha);
    graphic.strokePoints([
      { x: center.x, y: center.y - 25 },
      { x: center.x + 20, y: center.y - 14 },
      { x: center.x + 16, y: center.y + 13 },
      { x: center.x, y: center.y + 26 },
      { x: center.x - 16, y: center.y + 13 },
      { x: center.x - 20, y: center.y - 14 }
    ], true);
    return;
  }

  const points: ArenaPoint[] = [];
  for (let index = 0; index < 16; index += 1) {
    const radius = index % 2 === 0 ? 25 : 9;
    const angle = -Math.PI / 2 + (Math.PI * index) / 8;
    points.push({
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius
    });
  }
  graphic.fillPoints(points, true);
  graphic.fillStyle(0xeafcff, 0.8 * alpha);
  graphic.fillCircle(center.x, center.y, 5);
}
