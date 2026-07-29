import { useLayoutEffect, useRef, type CSSProperties } from "react";
import type { Coord, GameState, PlayerId } from "@paradox/simulation";
import type { VisualTheme } from "../theme";

interface Props {
  state: GameState;
  reducedMotion: boolean;
  visualTheme: VisualTheme;
}

interface BotProps {
  id: PlayerId;
  position: Coord;
  horizontalOffset: number;
  reducedMotion: boolean;
}

const VIRTUAL_WIDTH = 560;
const VIRTUAL_HEIGHT = 1025;
const TILE_WIDTH = 86;
const TILE_HEIGHT = 166;
const ORIGIN_X = VIRTUAL_WIDTH / 2;
const ORIGIN_Y = 174;

const BOT_ASSETS: Record<PlayerId, string> = {
  p1: "/assets/player-bot-v2.png",
  p2: "/assets/rival-bot-v2.png"
};

export function CharacterStage({ state, reducedMotion, visualTheme }: Props) {
  const sameDestination =
    state.players.p1.position.row === state.players.p2.position.row
    && state.players.p1.position.col === state.players.p2.position.col;

  return (
    <div
      className="character-stage sprite-character-stage"
      data-reduced-motion={reducedMotion ? "true" : "false"}
      data-theme={visualTheme}
      aria-hidden="true"
    >
      {(["p1", "p2"] as PlayerId[]).map((id) => (
        <ArenaBot
          id={id}
          position={state.players[id].position}
          horizontalOffset={sameDestination ? (id === "p1" ? -2.5 : 2.5) : 0}
          reducedMotion={reducedMotion}
          key={id}
        />
      ))}
    </div>
  );
}

function ArenaBot({ id, position, horizontalOffset, reducedMotion }: BotProps) {
  const actorRef = useRef<HTMLDivElement>(null);
  const flightRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const impactRef = useRef<HTMLSpanElement>(null);
  const previousRef = useRef({ coord: { ...position }, horizontalOffset });
  const destination = coordToPercent(position, horizontalOffset);

  useLayoutEffect(() => {
    const previous = previousRef.current;
    const moved = previous.coord.row !== position.row || previous.coord.col !== position.col;
    const shifted = previous.horizontalOffset !== horizontalOffset;
    previousRef.current = { coord: { ...position }, horizontalOffset };

    const actor = actorRef.current;
    const flight = flightRef.current;
    if (!actor || !flight || (!moved && !shifted)) return;

    const start = coordToPercent(previous.coord, previous.horizontalOffset);
    const end = coordToPercent(position, horizontalOffset);
    const stageBounds = actor.offsetParent?.getBoundingClientRect();
    if (!stageBounds) return;

    const deltaX = ((start.left - end.left) / 100) * stageBounds.width;
    const deltaY = ((start.top - end.top) / 100) * stageBounds.height;
    flight.getAnimations().forEach((animation) => animation.cancel());

    if (!moved) {
      flight.animate(
        [
          { transform: `translate3d(${deltaX}px, ${deltaY}px, 0)` },
          { transform: "translate3d(0, 0, 0)" }
        ],
        { duration: 240, easing: "ease-out" }
      );
      return;
    }

    const distance = Math.hypot(
      position.col - previous.coord.col,
      position.row - previous.coord.row
    );
    const duration = reducedMotion ? 420 : Math.min(1100, 820 + distance * 90);
    const arcHeight = (
      reducedMotion ? 0.035 : Math.min(0.13, 0.075 + distance * 0.0135)
    ) * stageBounds.height;
    const flightStart = 0.1;
    const landing = 0.84;
    const flightFrames: Keyframe[] = [
      { offset: 0, transform: `translate3d(${deltaX}px, ${deltaY}px, 0)` },
      { offset: flightStart, transform: `translate3d(${deltaX}px, ${deltaY}px, 0)` }
    ];

    // Sample the complete parabola so horizontal travel and vertical lift are
    // rendered as one continuous path instead of two competing transitions.
    for (let index = 1; index <= 18; index += 1) {
      const progress = index / 18;
      const eased = smoothstep(progress);
      const offset = flightStart + (landing - flightStart) * progress;
      const x = lerp(deltaX, 0, eased);
      const baselineY = lerp(deltaY, 0, eased);
      const lift = 4 * arcHeight * progress * (1 - progress);
      flightFrames.push({
        offset,
        transform: `translate3d(${x}px, ${baselineY - lift}px, 0)`
      });
    }
    flightFrames.push({ offset: 1, transform: "translate3d(0, 0, 0)" });

    flight.animate(flightFrames, {
      duration,
      easing: "linear"
    });

    bodyRef.current?.animate(
      [
        { offset: 0, transform: "translateY(0) scale(1, 1)" },
        { offset: 0.08, transform: "translateY(3%) scale(1.12, .8)" },
        { offset: 0.15, transform: "translateY(-4%) scale(.9, 1.14)" },
        { offset: 0.48, transform: "translateY(-2%) scale(.96, 1.06)" },
        { offset: 0.76, transform: "translateY(0) scale(1.02, .98)" },
        { offset: landing, transform: "translateY(4%) scale(1.18, .76)" },
        { offset: 0.92, transform: "translateY(-4%) scale(.94, 1.09)" },
        { offset: 1, transform: "translateY(0) scale(1, 1)" }
      ],
      { duration, easing: "linear" }
    );

    impactRef.current?.animate(
      [
        { offset: 0, opacity: 0, transform: "translateX(-50%) scale(.25)" },
        { offset: landing - 0.01, opacity: 0, transform: "translateX(-50%) scale(.25)" },
        { offset: landing + 0.03, opacity: 0.9, transform: "translateX(-50%) scale(.7)" },
        { offset: 1, opacity: 0, transform: "translateX(-50%) scale(2.4, 1.55)" }
      ],
      { duration, easing: "linear" }
    );
  }, [horizontalOffset, position.col, position.row, reducedMotion]);

  return (
    <div
      ref={actorRef}
      className={`arena-bot-actor ${id === "p1" ? "player-bot-actor" : "rival-bot-actor"}`}
      style={{
        "--bot-left": `${destination.left}%`,
        "--bot-top": `${destination.top}%`,
        zIndex: 20 + position.row
      } as CSSProperties}
    >
      <div ref={flightRef} className="arena-bot-flight">
        <div ref={bodyRef} className="arena-bot-body">
          <img src={BOT_ASSETS[id]} alt="" draggable={false} />
        </div>
        <span ref={impactRef} className="arena-bot-impact" />
      </div>
    </div>
  );
}

function coordToPercent(coord: Coord, horizontalOffset: number) {
  const x = ORIGIN_X + (coord.col - 2) * TILE_WIDTH;
  const y = ORIGIN_Y + coord.row * TILE_HEIGHT;
  return {
    left: (x / VIRTUAL_WIDTH) * 100 + horizontalOffset,
    top: (y / VIRTUAL_HEIGHT) * 100
  };
}

function lerp(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}

function smoothstep(progress: number) {
  return progress * progress * (3 - 2 * progress);
}
