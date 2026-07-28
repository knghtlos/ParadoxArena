import Phaser from "phaser";
import {
  FAMILY_COLORS,
  NODE_DEFINITIONS,
  sameCoord,
  type Coord,
  type GameState
} from "@paradox/simulation";

const SIZE = 5;
const CELL = 112;
const GAP = 10;
const START = 50;

export class ArenaScene extends Phaser.Scene {
  private state?: GameState;
  private selected?: Coord;
  private board?: Phaser.GameObjects.Container;
  private selectionHandler?: (coord: Coord) => void;
  private reducedMotion = false;
  private language: "it" | "en" = "it";

  constructor() {
    super("arena");
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#070b12");
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

    const plate = this.add.graphics();
    plate.fillStyle(0x0d1520, 1);
    plate.fillRoundedRect(22, 22, 656, 656, 38);
    plate.lineStyle(2, 0x263648, 0.75);
    plate.strokeRoundedRect(22, 22, 656, 656, 38);
    this.board.add(plate);

    for (const cell of this.state.cells) {
      const x = START + cell.coord.col * (CELL + GAP);
      const y = START + cell.coord.row * (CELL + GAP);
      const definition = NODE_DEFINITIONS[cell.node];
      const color = FAMILY_COLORS[definition.family];
      const legal = !cell.void && cell.cooldown === 0;
      const isSelected = this.selected && sameCoord(this.selected, cell.coord);
      const graphic = this.add.graphics();

      graphic.fillStyle(cell.void ? 0x05080c : cell.unstable ? 0x231625 : 0x111d28, cell.void ? 0.55 : 1);
      graphic.fillRoundedRect(x, y, CELL, CELL, 18);
      graphic.lineStyle(
        isSelected ? 5 : cell.warned ? 4 : 2,
        isSelected ? 0xf2ffff : cell.warned ? 0xffc857 : color,
        legal ? 0.9 : 0.22
      );
      graphic.strokeRoundedRect(x, y, CELL, CELL, 18);
      if (cell.warned) {
        graphic.lineStyle(2, 0xffc857, 0.35);
        graphic.strokeCircle(x + CELL / 2, y + CELL / 2, 47);
      }
      if (cell.unstable) {
        graphic.lineStyle(2, 0xff6b8a, 0.65);
        graphic.lineBetween(x + 18, y + 18, x + 48, y + 50);
        graphic.lineBetween(x + 48, y + 50, x + 36, y + 94);
        graphic.lineBetween(x + 48, y + 50, x + 94, y + 64);
      }
      if (legal) {
        graphic.setInteractive(new Phaser.Geom.Rectangle(x, y, CELL, CELL), Phaser.Geom.Rectangle.Contains);
        graphic.on("pointerdown", () => this.selectionHandler?.({ ...cell.coord }));
        graphic.on("pointerover", () => graphic.setAlpha(0.82));
        graphic.on("pointerout", () => graphic.setAlpha(1));
      }
      this.board.add(graphic);

      if (!cell.void) {
        const label = this.add
          .text(x + CELL / 2, y + CELL / 2 - 5, definition.label, {
            fontFamily: "Arial, sans-serif",
            fontSize: "17px",
            fontStyle: "bold",
            color: legal ? "#eaf7f5" : "#60717c",
            align: "center"
          })
          .setOrigin(0.5);
        const family = this.add
            .text(x + CELL / 2, y + CELL / 2 + 22, this.familyLabel(definition.family), {
            fontFamily: "Arial, sans-serif",
            fontSize: "9px",
            color: `#${color.toString(16).padStart(6, "0")}`,
            letterSpacing: 1.8
          })
          .setOrigin(0.5);
        this.board.add([label, family]);
        if (cell.cooldown > 0) {
          const cooldown = this.add
            .text(x + CELL - 17, y + 17, String(cell.cooldown), {
              fontFamily: "Arial, sans-serif",
              fontSize: "15px",
              fontStyle: "bold",
              color: "#081019",
              backgroundColor: "#748793",
              padding: { x: 6, y: 3 }
            })
            .setOrigin(0.5);
          this.board.add(cooldown);
        }
      }
    }

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
