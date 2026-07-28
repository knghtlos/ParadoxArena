import type { Replay } from "@paradox/simulation";

const REPLAY_KEY = "paradox-arena:replays:v1";

export function loadReplays(): Replay[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(REPLAY_KEY) ?? "[]") as Replay[];
    return Array.isArray(parsed) ? parsed.slice(0, 12) : [];
  } catch {
    return [];
  }
}

export function saveReplay(replay: Replay): void {
  const replays = [replay, ...loadReplays()].slice(0, 12);
  localStorage.setItem(REPLAY_KEY, JSON.stringify(replays));
}

export function clearReplays(): void {
  localStorage.removeItem(REPLAY_KEY);
}
