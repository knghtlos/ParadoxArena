import type { NodeFamily, NodeKind } from "./types";

export interface NodeDefinition {
  kind: NodeKind;
  label: string;
  family: NodeFamily;
  cooldown: number;
  summary: string;
}

export const NODE_DEFINITIONS: Record<NodeKind, NodeDefinition> = {
  pulse: { kind: "pulse", label: "PULSE", family: "strike", cooldown: 2, summary: "12 danni" },
  ripple: { kind: "ripple", label: "RIPPLE", family: "strike", cooldown: 1, summary: "7 danni · eco +3" },
  nova: { kind: "nova", label: "NOVA", family: "strike", cooldown: 2, summary: "8 danni a entrambi" },
  anchor: { kind: "anchor", label: "ANCHOR", family: "guard", cooldown: 2, summary: "+14 scudo" },
  absorb: { kind: "absorb", label: "ABSORB", family: "guard", cooldown: 3, summary: "converte fino a 10 danni" },
  mirror: { kind: "mirror", label: "MIRROR", family: "guard", cooldown: 3, summary: "riflette il 60%" },
  shift: { kind: "shift", label: "SHIFT", family: "vector", cooldown: 2, summary: "scambia le posizioni" },
  warp: { kind: "warp", label: "WARP", family: "vector", cooldown: 3, summary: "sposta il rivale" },
  gravity: { kind: "gravity", label: "GRAVITY", family: "vector", cooldown: 2, summary: "prepara Warp centrale" },
  echo: { kind: "echo", label: "ECHO", family: "circuit", cooldown: 3, summary: "ripete il prossimo Strike" },
  relay: { kind: "relay", label: "RELAY", family: "circuit", cooldown: 2, summary: "attiva il Nodo adiacente" },
  prism: { kind: "prism", label: "PRISM", family: "circuit", cooldown: 3, summary: "trasforma Nodi avvisati" }
};

export const NODE_KINDS = Object.keys(NODE_DEFINITIONS) as NodeKind[];

export const FAMILY_COLORS: Record<NodeFamily, number> = {
  strike: 0xff5f69,
  guard: 0x3ce6db,
  vector: 0xa982ff,
  circuit: 0xffc857
};
