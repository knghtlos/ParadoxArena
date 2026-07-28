export function normalizeSeed(seed: number): number {
  const value = seed >>> 0;
  return value === 0 ? 0x6d2b79f5 : value;
}

export function nextRandom(state: number): [number, number] {
  let next = state >>> 0;
  next ^= next << 13;
  next ^= next >>> 17;
  next ^= next << 5;
  next >>>= 0;
  return [next / 0x1_0000_0000, next];
}

export function randomIndex(state: number, length: number): [number, number] {
  const [value, next] = nextRandom(state);
  return [Math.floor(value * length), next];
}
