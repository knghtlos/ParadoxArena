import { createGame, resolveTurn, stateHash } from "./simulation";
import type { GameState, Replay, TurnResult } from "./types";

export function runReplay(replay: Replay): { state: GameState; turns: TurnResult[]; hash: string } {
  let state = createGame(replay.seed, replay.ruleset);
  const turns: TurnResult[] = [];
  for (const intents of replay.intents) {
    if (state.winner) break;
    const result = resolveTurn(state, intents);
    turns.push(result);
    state = result.state;
  }
  return { state, turns, hash: stateHash(state) };
}
