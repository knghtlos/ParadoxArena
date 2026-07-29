import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import type { Replay, Ruleset } from "@paradox/simulation";
import { Home } from "./components/Home";
import { clearReplays, loadReplays, saveReplay } from "./storage";
import { useI18n } from "./i18n";
import {
  VISUAL_THEME_STORAGE_KEY,
  applyVisualTheme,
  getInitialVisualTheme,
  type VisualTheme
} from "./theme";

const MatchScreen = lazy(() =>
  import("./components/MatchScreen").then((module) => ({ default: module.MatchScreen }))
);
const ReplayScreen = lazy(() =>
  import("./components/ReplayScreen").then((module) => ({ default: module.ReplayScreen }))
);

type Screen =
  | { name: "home" }
  | { name: "match"; ruleset: Ruleset; tutorial: boolean }
  | { name: "replays" };

function initialScreen(): Screen {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");
  if (mode === "precision" || mode === "flow" || mode === "anomaly") {
    return { name: "match", ruleset: mode, tutorial: params.get("tutorial") === "1" };
  }
  return { name: "home" };
}

export function App() {
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [matchInstance, setMatchInstance] = useState(0);
  const [replays, setReplays] = useState<Replay[]>(loadReplays);
  const [visualTheme, setVisualTheme] = useState<VisualTheme>(getInitialVisualTheme);
  const [reducedMotion, setReducedMotion] = useState(
    () => localStorage.getItem("paradox-arena:reduced-motion") === "true"
      || window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  const handleSave = useCallback((replay: Replay) => {
    saveReplay(replay);
    setReplays(loadReplays());
  }, []);

  const handleMotion = (value: boolean) => {
    setReducedMotion(value);
    localStorage.setItem("paradox-arena:reduced-motion", String(value));
  };

  const handleVisualTheme = (value: VisualTheme) => {
    setVisualTheme(value);
    localStorage.setItem(VISUAL_THEME_STORAGE_KEY, value);
    applyVisualTheme(value);
  };

  useEffect(() => {
    applyVisualTheme(visualTheme);
  }, [visualTheme]);

  if (screen.name === "match") {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <MatchScreen
          key={`${screen.ruleset}-${screen.tutorial}-${matchInstance}`}
          ruleset={screen.ruleset}
          tutorial={screen.tutorial}
          visualTheme={visualTheme}
          reducedMotion={reducedMotion}
          onReducedMotionChange={handleMotion}
          onVisualThemeChange={handleVisualTheme}
          onExit={() => setScreen({ name: "home" })}
          onRestart={() => setMatchInstance((value) => value + 1)}
          onReplaySaved={handleSave}
        />
      </Suspense>
    );
  }

  if (screen.name === "replays") {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <ReplayScreen
          replays={replays}
          visualTheme={visualTheme}
          reducedMotion={reducedMotion}
          onBack={() => setScreen({ name: "home" })}
          onClear={() => {
            clearReplays();
            setReplays([]);
          }}
        />
      </Suspense>
    );
  }

  return (
    <Home
      replayCount={replays.length}
      visualTheme={visualTheme}
      onVisualThemeChange={handleVisualTheme}
      onPlay={(ruleset, tutorial = false) => setScreen({ name: "match", ruleset, tutorial })}
      onReplays={() => setScreen({ name: "replays" })}
    />
  );
}

function LoadingScreen() {
  const { t } = useI18n();
  return (
    <main className="loading-screen">
      <div className="loading-glyph" />
      <p className="eyebrow">{t("loading")}</p>
    </main>
  );
}
