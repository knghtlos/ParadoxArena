import type { Ruleset } from "@paradox/simulation";
import { LanguageSwitch, useI18n } from "../i18n";

interface Props {
  onPlay: (ruleset: Ruleset, tutorial?: boolean) => void;
  onReplays: () => void;
  replayCount: number;
}

const MODES: {
  ruleset: Ruleset;
  eyebrowKey: string;
}[] = [
  {
    ruleset: "flow",
    eyebrowKey: "home.quick"
  },
  {
    ruleset: "precision",
    eyebrowKey: "home.competitive"
  },
  {
    ruleset: "anomaly",
    eyebrowKey: "home.laboratory"
  }
];

export function Home({ onPlay, onReplays, replayCount }: Props) {
  const { t } = useI18n();
  return (
    <main className="home-shell">
      <header className="brand-header">
        <div className="brand-mark" aria-hidden="true">
          <span />
          <span />
        </div>
        <div className="brand-copy">
          <p className="eyebrow">{t("home.prototype")}</p>
          <h1>PARADOX<br />ARENA</h1>
          <p className="tagline">{t("home.tagline")}</p>
        </div>
        <LanguageSwitch />
        <button className="ghost-button replay-button" onClick={onReplays}>
          {t("home.replay")} <span>{replayCount}</span>
        </button>
      </header>

      <section className="launch-panel">
        <div className="launch-copy">
          <span className="status-dot" /> {t("home.ready")}
        </div>
        <button className="primary-button hero-play" onClick={() => onPlay("flow")}>
          <span>{t("home.start")}</span>
          <small>{t("home.vsBot")}</small>
        </button>
        <button className="text-button" onClick={() => onPlay("flow", true)}>
          {t("home.tutorialCta")}
        </button>
      </section>

      <section className="mode-section" aria-labelledby="mode-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t("home.protocols")}</p>
            <h2 id="mode-heading">{t("home.choose")}</h2>
          </div>
          <p>{t("home.equalRules")}</p>
        </div>
        <div className="mode-grid">
          {MODES.map((mode, index) => (
            <button
              className={`mode-card mode-${mode.ruleset}`}
              key={mode.ruleset}
              onClick={() => onPlay(mode.ruleset)}
            >
              <div className="mode-index">0{index + 1}</div>
              <p className="eyebrow">{t(mode.eyebrowKey)}</p>
              <h3>{t(`mode.${mode.ruleset}`)}</h3>
              <p>{t(`mode.${mode.ruleset}.desc`)}</p>
              <span className="mode-badge">{t(`mode.${mode.ruleset}.badge`)}</span>
              <span className="mode-arrow">↗</span>
            </button>
          ))}
        </div>
      </section>

      <footer className="home-footer">
        <span>5×5 GRID</span><i />
        <span>3 SEC PULSE</span><i />
        <span>12 NODES</span><i />
        <span>ZERO POWER SALES</span>
      </footer>
    </main>
  );
}
