import { useEffect, useMemo, useRef, useState } from "react";
import {
  NODE_DEFINITIONS,
  chooseBotIntent,
  createGame,
  getCell,
  resolveTurn,
  safeIntent,
  type Coord,
  type GameEvent,
  type GameState,
  type Replay,
  type Ruleset,
  type TurnIntents
} from "@paradox/simulation";
import { ArenaCanvas } from "../game/ArenaCanvas";
import { LanguageSwitch, useI18n } from "../i18n";

interface Props {
  ruleset: Ruleset;
  tutorial: boolean;
  reducedMotion: boolean;
  onReducedMotionChange: (value: boolean) => void;
  onExit: () => void;
  onRestart: () => void;
  onReplaySaved: (replay: Replay) => void;
}

type Phase = "selecting" | "resolving" | "ended";

export function MatchScreen({
  ruleset,
  tutorial,
  reducedMotion,
  onReducedMotionChange,
  onExit,
  onRestart,
  onReplaySaved
}: Props) {
  const { t, modeName, nodeSummary } = useI18n();
  const seed = useRef((Date.now() ^ Math.floor(performance.now() * 1000)) >>> 0);
  const [game, setGame] = useState<GameState>(() => {
    const initial = createGame(seed.current, ruleset);
    if (tutorial) {
      initial.players.p1.integrity = 48;
      initial.players.p2.integrity = 48;
    }
    return initial;
  });
  const [selected, setSelected] = useState<Coord>();
  const selectedRef = useRef<Coord | undefined>(undefined);
  const [phase, setPhase] = useState<Phase>("selecting");
  const [remaining, setRemaining] = useState(3000);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [turns, setTurns] = useState<TurnIntents[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const saved = useRef(false);

  selectedRef.current = selected;
  const selectedCell = selected ? getCell(game.cells, selected) : undefined;

  useEffect(() => {
    if (phase !== "selecting") return;
    const start = performance.now();
    const deadline = start + 3000;
    setRemaining(3000);
    const ticker = window.setInterval(() => {
      setRemaining(Math.max(0, deadline - performance.now()));
    }, 40);
    const lock = window.setTimeout(() => {
      const intents: TurnIntents = {
        p1: safeIntent(game, selectedRef.current),
        p2: chooseBotIntent(game, "p2")
      };
      const result = resolveTurn(game, intents);
      setTurns((current) => [...current, result.intents]);
      setEvents(result.events);
      setSelected(undefined);
      setGame(result.state);
      setPhase(result.state.winner ? "ended" : "resolving");
    }, 3000);
    return () => {
      window.clearInterval(ticker);
      window.clearTimeout(lock);
    };
  }, [game, phase]);

  useEffect(() => {
    if (phase !== "resolving") return;
    const delay = reducedMotion ? 420 : 1150;
    const next = window.setTimeout(() => setPhase("selecting"), delay);
    return () => window.clearTimeout(next);
  }, [phase, reducedMotion]);

  useEffect(() => {
    if (phase !== "ended" || saved.current) return;
    saved.current = true;
    const replay: Replay = {
      version: 1,
      createdAt: new Date().toISOString(),
      seed: seed.current,
      ruleset,
      intents: turns,
      winner: game.winner
    };
    onReplaySaved(replay);
  }, [game.winner, onReplaySaved, phase, ruleset, turns]);

  const prompt = useMemo(() => tutorialPrompt(game.turn, phase, t), [game.turn, phase, t]);
  const timerRatio = remaining / 3000;
  const canSelect = phase === "selecting";

  const handleSelect = (coord: Coord) => {
    if (!canSelect) return;
    const cell = getCell(game.cells, coord);
    if (!cell || cell.void || cell.cooldown > 0) return;
    setSelected(coord);
  };

  return (
    <main className="match-shell">
      <header className="match-header">
        <button className="icon-button" onClick={onExit} aria-label={t("common.back")}>←</button>
        <div className="match-id">
          <p className="eyebrow">{tutorial ? t("match.training") : t("match.local")}</p>
          <strong>{modeName(ruleset).toUpperCase()} // {t("common.turn")} {String(game.turn).padStart(2, "0")}</strong>
        </div>
        <button className="icon-button" onClick={() => setSettingsOpen(true)} aria-label={t("match.settings")}>⌁</button>
      </header>

      <section className="combat-grid">
        <PlayerPanel side="rival" name={t("match.unitName")} state={game.players.p2} />

        <div className="arena-stage">
          <div className={`pulse-clock ${remaining < 700 ? "urgent" : ""}`}>
            <div>
              <span>{phase === "selecting" ? (remaining / 1000).toFixed(1) : "SYNC"}</span>
              <small>{phase === "selecting" ? t("match.selectWindow") : t("match.resolving")}</small>
            </div>
            <svg viewBox="0 0 44 44" aria-hidden="true">
              <circle cx="22" cy="22" r="19" />
              <circle
                className="clock-progress"
                cx="22"
                cy="22"
                r="19"
                style={{ strokeDashoffset: 119.4 * (1 - timerRatio) }}
              />
            </svg>
          </div>
          <ArenaCanvas
            state={game}
            selected={selected}
            resolving={phase === "resolving"}
            reducedMotion={reducedMotion}
            onSelect={handleSelect}
          />
          {tutorial && prompt && <div className="tutorial-callout"><span>{t("match.guide")}</span>{prompt}</div>}
        </div>

        <PlayerPanel side="player" name={t("match.guestName")} state={game.players.p1} />
      </section>

      <section className="command-deck">
        <div className="node-readout">
          <p className="eyebrow">{t("match.targetNode")}</p>
          {selectedCell ? (
            <>
              <strong>{NODE_DEFINITIONS[selectedCell.node].label}</strong>
              <span>{nodeSummary(selectedCell.node)}</span>
            </>
          ) : (
            <>
              <strong>{t("match.noTarget")}</strong>
              <span>{t("match.tapNode")}</span>
            </>
          )}
        </div>
        <div className={`lock-state ${selected ? "acknowledged" : ""}`}>
          <span className="ack-light" />
          <div>
            <strong>{selected ? t("match.intentAck") : t("match.waiting")}</strong>
            <small>{selected ? `${selected.row + 1}.${selected.col + 1} // ${t("match.changeable")}` : t("match.safeSelect")}</small>
          </div>
        </div>
        <EventFeed events={events} />
      </section>

      {phase === "ended" && (
        <div className="result-overlay" role="dialog" aria-modal="true">
          <div className="result-card">
            <p className="eyebrow">{t("match.complete")}</p>
            <h2>{game.winner === "p1" ? t("match.victory") : game.winner === "p2" ? t("match.defeat") : t("match.draw")}</h2>
            <p>
              {game.endReason === "turn-cap" ? t("match.turnLimit") : t("match.integrityEnd")}
              {" "}{t("match.replaySaved")}
            </p>
            <div className="result-stats">
              <span><small>{t("match.turns")}</small><strong>{game.turn - 1}</strong></span>
              <span><small>{t("match.damage")}</small><strong>{game.players.p1.damageDealt}</strong></span>
              <span><small>{t("match.integrity")}</small><strong>{game.players.p1.integrity}</strong></span>
            </div>
            <button className="primary-button" onClick={onRestart}>{t("match.newMatch")}</button>
            <button className="ghost-button" onClick={onExit}>{t("match.home")}</button>
          </div>
        </div>
      )}

      {settingsOpen && (
        <div className="settings-overlay" role="dialog" aria-modal="true">
          <div className="settings-card">
            <div>
              <p className="eyebrow">{t("match.accessibility")}</p>
              <h2>{t("match.settings")}</h2>
            </div>
            <LanguageSwitch />
            <label className="toggle-row">
              <span><strong>{t("match.reducedMotion")}</strong><small>{t("match.reducedMotionDesc")}</small></span>
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(event) => onReducedMotionChange(event.target.checked)}
              />
            </label>
            <button className="primary-button" onClick={() => setSettingsOpen(false)}>{t("common.done")}</button>
          </div>
        </div>
      )}
    </main>
  );
}

function PlayerPanel({
  side,
  name,
  state
}: {
  side: "player" | "rival";
  name: string;
  state: GameState["players"]["p1"];
}) {
  const { t } = useI18n();
  const ratio = Math.max(0, state.integrity / 100);
  return (
    <aside className={`player-panel ${side}`}>
      <div className="player-label">
        <span className="avatar-chip">{side === "player" ? "P1" : "K7"}</span>
        <div><small>{side === "player" ? t("match.localAvatar") : t("match.tacticalUnit")}</small><strong>{name}</strong></div>
        <b>{state.integrity}</b>
      </div>
      <div className="integrity-track"><i style={{ transform: `scaleX(${ratio})` }} /></div>
      <div className="meter-row">
        <span>{t("match.guard")} <b>{state.guard}</b></span>
        <span>{t("match.resonance")} <b>{state.resonance}/3</b></span>
        <span>{t("match.charge")} <b>{state.charge}/3</b></span>
      </div>
    </aside>
  );
}

function EventFeed({ events }: { events: GameEvent[] }) {
  const { t } = useI18n();
  const items = events
    .filter((event) => event.type === "damage" || event.type === "combo" || event.type === "clash")
    .slice(-3)
    .map((event, index) => {
      if (event.type === "damage") return <li key={index}><b>-{event.amount}</b> {event.target === "p1" ? t("common.you") : t("common.rival")} // {event.source}</li>;
      if (event.type === "combo") return <li key={index}><b>{t("event.combo")}</b> {event.name}</li>;
      return <li key={index}><b>{t("event.clash")}</b> {t("event.nodeSuppressed")}</li>;
    });
  return <ul className="event-feed">{items.length ? items : <li>{t("match.telemetry")}</li>}</ul>;
}

function tutorialPrompt(turn: number, phase: Phase, t: (key: string) => string): string | null {
  if (phase !== "selecting") return t("tutorial.resolve");
  if (turn === 1) return t("tutorial.1");
  if (turn === 2) return t("tutorial.2");
  if (turn === 3) return t("tutorial.3");
  if (turn === 4) return t("tutorial.4");
  return null;
}
