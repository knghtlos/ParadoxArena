import { useEffect, useRef } from "react";
import Phaser from "phaser";
import type { Coord, GameState } from "@paradox/simulation";
import { ArenaScene } from "./ArenaScene";
import { CharacterStage } from "./CharacterStage";
import { useI18n } from "../i18n";
import type { VisualTheme } from "../theme";

interface Props {
  state: GameState;
  selected?: Coord;
  resolving: boolean;
  reducedMotion: boolean;
  visualTheme: VisualTheme;
  onSelect?: (coord: Coord) => void;
}

export function ArenaCanvas({ state, selected, resolving, reducedMotion, visualTheme, onSelect }: Props) {
  const { language, t } = useI18n();
  const parentRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<ArenaScene | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!parentRef.current || gameRef.current) return;
    const scene = new ArenaScene();
    scene.setSelectionHandler((coord) => onSelectRef.current?.(coord));
    const game = new Phaser.Game({
      type: Phaser.CANVAS,
      parent: parentRef.current,
      width: 900,
      height: 620,
      transparent: false,
      backgroundColor: "#071018",
      antialias: true,
      render: { pixelArt: false, roundPixels: false },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      scene
    });
    gameRef.current = game;
    sceneRef.current = scene;
    return () => {
      game.destroy(true);
      gameRef.current = null;
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    sceneRef.current?.setReducedMotion(reducedMotion);
    sceneRef.current?.setLanguage(language);
    sceneRef.current?.setVisualTheme(visualTheme);
    sceneRef.current?.updateState(state, selected, resolving);
  }, [state, selected, resolving, reducedMotion, visualTheme, language]);

  return (
    <div className={`arena-shell ${resolving ? "resolving" : ""}`}>
      <div className="arena-canvas" ref={parentRef} aria-label={t("arena.label")} />
      <CharacterStage state={state} reducedMotion={reducedMotion} visualTheme={visualTheme} />
    </div>
  );
}
