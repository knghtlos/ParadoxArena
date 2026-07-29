import Phaser from "phaser";
import {
  FAMILY_COLORS,
  NODE_DEFINITIONS,
  sameCoord,
  type Coord,
  type GameState
} from "@paradox/simulation";
import { ARENA_THEMES, type ArenaTheme, type VisualTheme } from "../theme";

const SIZE = 5;
const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 620;
const TILE_WIDTH = 144;
const TILE_HEIGHT = 78;
const TILE_DEPTH = 18;
const ORIGIN_X = CANVAS_WIDTH / 2;
const ORIGIN_Y = 138;

interface IsoPoint {
  x: number;
  y: number;
}

export class ArenaScene extends Phaser.Scene {
  private state?: GameState;
  private selected?: Coord;
  private board?: Phaser.GameObjects.Container;
  private selectionHandler?: (coord: Coord) => void;
  private reducedMotion = false;
  private language: "it" | "en" = "it";
  private visualTheme: VisualTheme = "dark";

  constructor() {
    super("arena");
  }

  create(): void {
    this.cameras.main.setBackgroundColor(toHexNumber(ARENA_THEMES[this.visualTheme].background));
    this.board = this.add.container(0, 0);
    if (this.state) this.renderBoard();
  }

  setSelectionHandler(handler: (coord: Coord) => void): void {
    this.selectionHandler = handler;
  }

  setReducedMotion(value: boolean): void {
    this.reducedMotion = value;
  }

  setLanguage(language: "it" | "en"): void {
    this.language = language;
    if (this.board && this.state) this.renderBoard();
  }

  setVisualTheme(theme: VisualTheme): void {
    this.visualTheme = theme;
    this.cameras.main.setBackgroundColor(toHexNumber(ARENA_THEMES[theme].background));
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
        scaleX: { from: 0.985, to: 1 },
        scaleY: { from: 0.985, to: 1 },
        duration: 260,
        ease: "Back.Out"
      });
      this.cameras.main.shake(80, 0.0025);
    }
  }

  private renderBoard(): void {
    if (!this.board || !this.state) return;
    this.board.removeAll(true);

    this.drawStageBackdrop();

    const orderedCells = [...this.state.cells].sort((a, b) => {
      const aDepth = a.coord.row + a.coord.col;
      const bDepth = b.coord.row + b.coord.col;
      return aDepth - bDepth || a.coord.row - b.coord.row;
    });

    for (const cell of orderedCells) {
      const center = coordToIso(cell.coord);
      const points = tilePoints(center);
      const definition = NODE_DEFINITIONS[cell.node];
      const color = FAMILY_COLORS[definition.family];
      const legal = !cell.void && cell.cooldown === 0;
      const isSelected = Boolean(this.selected && sameCoord(this.selected, cell.coord));
      const graphic = this.add.graphics();
      const theme = ARENA_THEMES[this.visualTheme];
      const topColor = tileTopColor(cell.void, cell.unstable, color, theme);
      const leftFace = [points[3], points[2], offset(points[2], 0, TILE_DEPTH), offset(points[3], 0, TILE_DEPTH)];
      const rightFace = [points[2], points[1], offset(points[1], 0, TILE_DEPTH), offset(points[2], 0, TILE_DEPTH)];

      graphic.fillStyle(shadeColor(topColor, cell.void ? 0.48 : 0.58), cell.void ? 0.5 : 0.9);
      graphic.fillPoints(leftFace, true);
      graphic.fillStyle(shadeColor(topColor, cell.void ? 0.38 : 0.48), cell.void ? 0.45 : 0.95);
      graphic.fillPoints(rightFace, true);
      graphic.fillStyle(topColor, cell.void ? 0.55 : 1);
      graphic.fillPoints(points, true);

      graphic.lineStyle(
        isSelected ? 6 : cell.warned ? 4 : 2,
        isSelected ? (theme.key === "dark" ? 0xf2ffff : 0xff4fa3) : cell.warned ? 0xffd166 : color,
        legal ? 0.9 : 0.22
      );
      graphic.strokePoints(points, true);
      graphic.lineStyle(1, mixColor(color, 0xffffff, 0.38), legal ? 0.2 : 0.08);
      graphic.lineBetween(points[0].x, points[0].y, points[1].x, points[1].y);

      drawFamilyGlyph(graphic, definition.family, center, color, legal ? 0.54 : 0.18);

      if (isSelected) {
        graphic.lineStyle(3, theme.playerAccent, 0.38);
        graphic.strokeEllipse(center.x, center.y + 2, TILE_WIDTH * 0.86, TILE_HEIGHT * 0.66);
      }
      if (cell.warned) {
        graphic.lineStyle(2, 0xffd166, 0.5);
        graphic.strokeEllipse(center.x, center.y + 2, TILE_WIDTH * 0.74, TILE_HEIGHT * 0.56);
      }
      if (cell.unstable) {
        graphic.lineStyle(2, 0xff7f9a, 0.72);
        graphic.lineBetween(center.x - 28, center.y - 8, center.x - 4, center.y + 4);
        graphic.lineBetween(center.x - 4, center.y + 4, center.x - 18, center.y + 28);
        graphic.lineBetween(center.x - 4, center.y + 4, center.x + 36, center.y + 12);
      }
      if (legal) {
        graphic.setInteractive(new Phaser.Geom.Polygon(points), Phaser.Geom.Polygon.Contains);
        graphic.on("pointerdown", () => this.selectionHandler?.({ ...cell.coord }));
        graphic.on("pointerover", () => graphic.setAlpha(0.86));
        graphic.on("pointerout", () => graphic.setAlpha(1));
      }
      this.board.add(graphic);

      if (!cell.void) {
        const label = this.add
          .text(center.x, center.y - 7, definition.label, {
            fontFamily: "Chakra Petch, Arial, sans-serif",
            fontSize: "14px",
            fontStyle: "bold",
            color: legal ? theme.text : theme.mutedText,
            align: "center"
          })
          .setOrigin(0.5);
        label.setShadow(0, 2, theme.key === "dark" ? "#02060a" : "#ffffff", 5, true, true);

        const family = this.add
          .text(center.x, center.y + 13, this.familyLabel(definition.family), {
            fontFamily: "Chakra Petch, Arial, sans-serif",
            fontSize: "8px",
            color: toHex(color),
            letterSpacing: 1.4
          })
          .setOrigin(0.5);
        this.board.add([label, family]);

        if (cell.cooldown > 0) {
          const badge = this.add.graphics();
          badge.fillStyle(theme.key === "dark" ? 0xf2ffff : 0xfff7fb, 0.92);
          badge.fillRoundedRect(center.x + 34, center.y - 34, 28, 22, 6);
          badge.lineStyle(1, color, 0.62);
          badge.strokeRoundedRect(center.x + 34, center.y - 34, 28, 22, 6);
          const cooldown = this.add
            .text(center.x + 48, center.y - 23, String(cell.cooldown), {
              fontFamily: "Chakra Petch, Arial, sans-serif",
              fontSize: "13px",
              fontStyle: "bold",
              color: "#081019"
            })
            .setOrigin(0.5);
          this.board.add([badge, cooldown]);
        }
      }
    }
  }

  private drawStageBackdrop(): void {
    if (!this.board) return;
    const theme = ARENA_THEMES[this.visualTheme];

    const backdrop = this.add.graphics();
    backdrop.fillStyle(theme.background, 1);
    backdrop.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    backdrop.lineStyle(1, theme.key === "dark" ? 0x183040 : 0xe7cfe4, 0.42);
    for (let index = -7; index <= 7; index += 1) {
      const x = ORIGIN_X + index * (TILE_WIDTH / 2);
      backdrop.lineBetween(x - 220, 72, x + 260, 548);
      backdrop.lineBetween(x + 220, 72, x - 260, 548);
    }

    const platformTop = [
      { x: ORIGIN_X, y: 70 },
      { x: ORIGIN_X + 382, y: 286 },
      { x: ORIGIN_X, y: 542 },
      { x: ORIGIN_X - 382, y: 286 }
    ];
    const platformBottom = platformTop.map((point) => offset(point, 0, 34));

    backdrop.fillStyle(theme.platformLeft, 0.96);
    backdrop.fillPoints([platformTop[3], platformTop[2], platformBottom[2], platformBottom[3]], true);
    backdrop.fillStyle(theme.platformRight, 0.98);
    backdrop.fillPoints([platformTop[2], platformTop[1], platformBottom[1], platformBottom[2]], true);
    backdrop.fillStyle(theme.platformTop, 0.98);
    backdrop.fillPoints(platformTop, true);

    backdrop.lineStyle(3, theme.playerAccent, 0.5);
    backdrop.lineBetween(platformTop[3].x, platformTop[3].y, platformTop[0].x, platformTop[0].y);
    backdrop.lineStyle(3, theme.rivalAccent, 0.48);
    backdrop.lineBetween(platformTop[0].x, platformTop[0].y, platformTop[1].x, platformTop[1].y);
    backdrop.lineStyle(2, 0xffc857, 0.32);
    backdrop.lineBetween(platformTop[2].x, platformTop[2].y, platformTop[1].x, platformTop[1].y);
    backdrop.lineStyle(2, 0xa982ff, 0.34);
    backdrop.lineBetween(platformTop[3].x, platformTop[3].y, platformTop[2].x, platformTop[2].y);

    backdrop.lineStyle(1, theme.key === "dark" ? 0xeaf7f5 : 0x7c6e9e, theme.key === "dark" ? 0.08 : 0.16);
    for (let index = 1; index < SIZE; index += 1) {
      const left = coordToIso({ row: index, col: 0 });
      const right = coordToIso({ row: index, col: SIZE - 1 });
      const top = coordToIso({ row: 0, col: index });
      const bottom = coordToIso({ row: SIZE - 1, col: index });
      backdrop.lineBetween(left.x - TILE_WIDTH / 2, left.y, right.x + TILE_WIDTH / 2, right.y);
      backdrop.lineBetween(top.x + TILE_WIDTH / 2, top.y, bottom.x - TILE_WIDTH / 2, bottom.y);
    }

    this.board.add(backdrop);
  }

  private familyLabel(family: "strike" | "guard" | "vector" | "circuit"): string {
    if (this.language === "en") return family.toUpperCase();
    return {
      strike: "OFFESA",
      guard: "DIFESA",
      vector: "VETTORE",
      circuit: "CIRCUITO"
    }[family];
  }
}

function coordToIso(coord: Coord): IsoPoint {
  return {
    x: ORIGIN_X + (coord.col - coord.row) * (TILE_WIDTH / 2),
    y: ORIGIN_Y + (coord.col + coord.row) * (TILE_HEIGHT / 2)
  };
}

function tilePoints(center: IsoPoint): IsoPoint[] {
  return [
    { x: center.x, y: center.y - TILE_HEIGHT / 2 },
    { x: center.x + TILE_WIDTH / 2, y: center.y },
    { x: center.x, y: center.y + TILE_HEIGHT / 2 },
    { x: center.x - TILE_WIDTH / 2, y: center.y }
  ];
}

function offset(point: IsoPoint, x: number, y: number): IsoPoint {
  return { x: point.x + x, y: point.y + y };
}

function tileTopColor(
  voidCell: boolean,
  unstable: boolean,
  familyColor: number,
  theme: ArenaTheme
): number {
  if (voidCell) return theme.voidCell;
  const base = unstable ? theme.tileUnstable : theme.tileBase;
  return mixColor(base, familyColor, theme.key === "dark" ? (unstable ? 0.28 : 0.18) : (unstable ? 0.18 : 0.1));
}

function drawFamilyGlyph(
  graphic: Phaser.GameObjects.Graphics,
  family: "strike" | "guard" | "vector" | "circuit",
  center: IsoPoint,
  color: number,
  alpha: number
): void {
  graphic.lineStyle(3, color, alpha);
  graphic.fillStyle(color, alpha);
  if (family === "strike") {
    graphic.lineBetween(center.x - 33, center.y + 20, center.x - 8, center.y + 3);
    graphic.lineBetween(center.x - 8, center.y + 3, center.x - 22, center.y + 27);
    graphic.lineBetween(center.x - 8, center.y + 3, center.x + 26, center.y - 10);
    return;
  }
  if (family === "guard") {
    graphic.strokeEllipse(center.x - 28, center.y + 14, 24, 14);
    graphic.lineBetween(center.x - 40, center.y + 14, center.x - 16, center.y + 14);
    return;
  }
  if (family === "vector") {
    graphic.strokePoints([
      { x: center.x - 37, y: center.y + 17 },
      { x: center.x - 20, y: center.y + 8 },
      { x: center.x - 3, y: center.y + 17 }
    ], false);
    graphic.strokePoints([
      { x: center.x - 28, y: center.y + 27 },
      { x: center.x - 11, y: center.y + 18 },
      { x: center.x + 6, y: center.y + 27 }
    ], false);
    return;
  }
  graphic.fillCircle(center.x - 34, center.y + 14, 3);
  graphic.fillCircle(center.x - 16, center.y + 8, 3);
  graphic.fillCircle(center.x + 2, center.y + 18, 3);
  graphic.lineBetween(center.x - 34, center.y + 14, center.x - 16, center.y + 8);
  graphic.lineBetween(center.x - 16, center.y + 8, center.x + 2, center.y + 18);
}

function mixColor(base: number, overlay: number, amount: number): number {
  const inverse = 1 - amount;
  const red = Math.round(((base >> 16) & 0xff) * inverse + ((overlay >> 16) & 0xff) * amount);
  const green = Math.round(((base >> 8) & 0xff) * inverse + ((overlay >> 8) & 0xff) * amount);
  const blue = Math.round((base & 0xff) * inverse + (overlay & 0xff) * amount);
  return (red << 16) | (green << 8) | blue;
}

function shadeColor(color: number, factor: number): number {
  const red = Math.max(0, Math.min(255, Math.round(((color >> 16) & 0xff) * factor)));
  const green = Math.max(0, Math.min(255, Math.round(((color >> 8) & 0xff) * factor)));
  const blue = Math.max(0, Math.min(255, Math.round((color & 0xff) * factor)));
  return (red << 16) | (green << 8) | blue;
}

function toHex(color: number): string {
  return `#${color.toString(16).padStart(6, "0")}`;
}

function toHexNumber(color: number): string {
  return `#${color.toString(16).padStart(6, "0")}`;
}
