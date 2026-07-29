export type VisualTheme = "dark" | "light";

export interface ArenaTheme {
  key: VisualTheme;
  background: number;
  platformTop: number;
  platformLeft: number;
  platformRight: number;
  tileBase: number;
  tileUnstable: number;
  voidCell: number;
  text: string;
  mutedText: string;
  playerAccent: number;
  rivalAccent: number;
  botShell: number;
  rivalShell: number;
}

export const VISUAL_THEME_STORAGE_KEY = "paradox-arena:visual-theme";

export const ARENA_THEMES: Record<VisualTheme, ArenaTheme> = {
  dark: {
    key: "dark",
    background: 0x071018,
    platformTop: 0x0c1b2a,
    platformLeft: 0x06101a,
    platformRight: 0x0a1622,
    tileBase: 0x102236,
    tileUnstable: 0x281829,
    voidCell: 0x05090f,
    text: "#eaf7f5",
    mutedText: "#60717c",
    playerAccent: 0x51f0dc,
    rivalAccent: 0xff6275,
    botShell: 0xd8e6ef,
    rivalShell: 0xff725f
  },
  light: {
    key: "light",
    background: 0xf9eff8,
    platformTop: 0xfff7fb,
    platformLeft: 0xf6dced,
    platformRight: 0xeadff8,
    tileBase: 0xfff4fb,
    tileUnstable: 0xffd5ee,
    voidCell: 0xf1e5ef,
    text: "#20224f",
    mutedText: "#7a6d8c",
    playerAccent: 0xff55a7,
    rivalAccent: 0x8f78ff,
    botShell: 0xffffff,
    rivalShell: 0xff8cbf
  }
};

export function getInitialVisualTheme(): VisualTheme {
  const stored = localStorage.getItem(VISUAL_THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "dark";
}

export function applyVisualTheme(theme: VisualTheme): void {
  document.documentElement.dataset.visualTheme = theme;
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = theme === "dark" ? "#071018" : "#fff7fb";
}
