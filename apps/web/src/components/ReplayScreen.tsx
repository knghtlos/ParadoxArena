import { useEffect, useMemo, useState } from "react";
import { createGame, runReplay, type Replay } from "@paradox/simulation";
import { ArenaCanvas } from "../game/ArenaCanvas";
import { useI18n } from "../i18n";
import type { VisualTheme } from "../theme";

interface Props {
  replays: Replay[];
  visualTheme: VisualTheme;
  reducedMotion: boolean;
  onBack: () => void;
  onClear: () => void;
}

export function ReplayScreen({ replays, visualTheme, reducedMotion, onBack, onClear }: Props) {
  const { t, language, modeName } = useI18n();
  const [active, setActive] = useState<Replay>();
  const [index, setIndex] = useState(0);
  const simulation = useMemo(() => (active ? runReplay(active) : null), [active]);
  const states = useMemo(
    () => active && simulation ? [createGame(active.seed, active.ruleset), ...simulation.turns.map((turn) => turn.state)] : [],
    [active, simulation]
  );

  useEffect(() => {
    if (!active || index >= states.length - 1) return;
    const timer = window.setTimeout(() => setIndex((value) => value + 1), reducedMotion ? 500 : 1200);
    return () => window.clearTimeout(timer);
  }, [active, index, reducedMotion, states.length]);

  if (active && states[index]) {
    return (
      <main className="replay-viewer">
        <header className="match-header">
          <button className="icon-button" onClick={() => { setActive(undefined); setIndex(0); }}>←</button>
          <div className="match-id"><p className="eyebrow">{t("replay.local")}</p><strong>{t("common.turn")} {index} / {states.length - 1}</strong></div>
          <span className="hash-chip">{simulation?.hash}</span>
        </header>
        <div className="replay-arena">
          <ArenaCanvas
            state={states[index]}
            resolving={index > 0}
            reducedMotion={reducedMotion}
            visualTheme={visualTheme}
          />
        </div>
        <div className="replay-controls">
          <button className="ghost-button" disabled={index === 0} onClick={() => setIndex((value) => value - 1)}>{t("replay.previous")}</button>
          <input
            aria-label={t("replay.turnSlider")}
            type="range"
            min="0"
            max={states.length - 1}
            value={index}
            onChange={(event) => setIndex(Number(event.target.value))}
          />
          <button className="ghost-button" disabled={index === states.length - 1} onClick={() => setIndex((value) => value + 1)}>{t("replay.next")}</button>
        </div>
      </main>
    );
  }

  return (
    <main className="replay-library">
      <header className="library-header">
        <button className="icon-button" onClick={onBack}>←</button>
        <div><p className="eyebrow">{t("replay.archive")}</p><h1>{t("replay.title")}</h1></div>
        {replays.length > 0 && <button className="ghost-button danger" onClick={onClear}>{t("replay.clear")}</button>}
      </header>
      {replays.length === 0 ? (
        <section className="empty-state">
          <span>◇</span><h2>{t("replay.empty")}</h2>
          <p>{t("replay.emptyDesc")}</p>
          <button className="primary-button" onClick={onBack}>{t("replay.backArena")}</button>
        </section>
      ) : (
        <section className="replay-list">
          {replays.map((replay, replayIndex) => (
            <button key={`${replay.createdAt}-${replayIndex}`} onClick={() => { setActive(replay); setIndex(0); }}>
              <span className={`replay-result ${replay.winner === "p1" ? "win" : replay.winner === "draw" ? "draw" : "loss"}`}>
                {replay.winner === "p1" ? "W" : replay.winner === "draw" ? "D" : "L"}
              </span>
              <span><small>{new Date(replay.createdAt).toLocaleString(language === "it" ? "it-IT" : "en-US")}</small><strong>{modeName(replay.ruleset).toUpperCase()}</strong></span>
              <span><small>{t("match.turns")}</small><strong>{replay.intents.length}</strong></span>
              <b>{t("replay.open")}</b>
            </button>
          ))}
        </section>
      )}
    </main>
  );
}
