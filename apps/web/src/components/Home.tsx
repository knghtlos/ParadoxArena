import type { Ruleset } from "@paradox/simulation";
import { LanguageSwitch, useI18n } from "../i18n";
import type { VisualTheme } from "../theme";
import { ThemeSwitch } from "./ThemeSwitch";

interface Props {
  onPlay: (ruleset: Ruleset, tutorial?: boolean) => void;
  onReplays: () => void;
  replayCount: number;
  visualTheme: VisualTheme;
  onVisualThemeChange: (theme: VisualTheme) => void;
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

export function Home({ onPlay, onReplays, replayCount, visualTheme, onVisualThemeChange }: Props) {
  const { t } = useI18n();
  return (
    <main className="home-shell">
      <header className="brand-header">
        <LogoMark />
        <div className="brand-copy">
          <h1>PARADOX<br /><span>ARENA</span></h1>
          <p className="tagline">{t("home.tagline")}</p>
        </div>
        <div className="home-actions">
          <ThemeSwitch value={visualTheme} onChange={onVisualThemeChange} />
          <LanguageSwitch />
        </div>
        <button className="ghost-button replay-button" onClick={onReplays}>
          {t("home.replay")} <span>{replayCount}</span>
        </button>
      </header>

      <section className="mobile-hero">
        <div className="hero-copy">
          <p className="eyebrow">{t("home.prototype")}</p>
          <h2>{t("home.heroTitle")} <span>{t("home.heroAccent")}</span></h2>
          <p>{t("home.heroBody")}</p>
          <div className="hero-actions">
            <a className="primary-button hero-play" href="?mode=flow">
              <span>{t("home.start")}</span>
              <small>{t("home.vsBot")}</small>
            </a>
            <button type="button" className="icon-button menu-button" onClick={onReplays} aria-label={t("home.replay")}>☰</button>
          </div>
        </div>
        <BotCluster />
      </section>

      <section className="home-feature-panel" aria-label={t("home.why")}>
        <p className="eyebrow split-label">{t("home.why")}</p>
        <div className="feature-list">
          <FeatureItem icon="⚡" title={t("home.feature.fast")} text={t("home.feature.fastText")} />
          <FeatureItem icon="★" title={t("home.feature.powers")} text={t("home.feature.powersText")} />
          <FeatureItem icon="♛" title={t("home.feature.events")} text={t("home.feature.eventsText")} />
          <FeatureItem icon="✦" title={t("home.feature.style")} text={t("home.feature.styleText")} />
        </div>
      </section>

      <section className="gameplay-preview" aria-label={t("home.gameplay")}>
        <div>
          <p className="eyebrow">{t("home.gameplay")}</p>
          <h2>{t("home.previewTitle")}</h2>
        </div>
        <a className="preview-card" href="?mode=flow&tutorial=1">
          <MiniArena />
          <span className="play-disc">▶</span>
        </a>
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
            <a
              className={`mode-card mode-${mode.ruleset}`}
              key={mode.ruleset}
              href={`?mode=${mode.ruleset}`}
            >
              <div className="mode-index">0{index + 1}</div>
              <p className="eyebrow">{t(mode.eyebrowKey)}</p>
              <h3>{t(`mode.${mode.ruleset}`)}</h3>
              <p>{t(`mode.${mode.ruleset}.desc`)}</p>
              <span className="mode-badge">{t(`mode.${mode.ruleset}.badge`)}</span>
              <span className="mode-arrow">↗</span>
            </a>
          ))}
        </div>
      </section>

      <footer className="home-footer">
        <span>{t("home.social")}</span><i />
        <span>DISCORD</span><i />
        <span>TIKTOK</span><i />
        <span>YOUTUBE</span><i />
        <span>INSTAGRAM</span>
      </footer>
    </main>
  );
}

function LogoMark() {
  return (
    <div className="logo-lockup" aria-label="Paradox Arena">
      <strong>PARADOX</strong>
      <span>ARENA</span>
    </div>
  );
}

function FeatureItem({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <article className="feature-item">
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </article>
  );
}

function BotCluster() {
  return (
    <div className="bot-cluster" aria-hidden="true">
      <div className="bot bot-main">
        <span className="antenna" />
        <span className="face"><i /><i /></span>
        <span className="thruster" />
      </div>
      <div className="bot bot-yellow"><span className="antenna" /><span className="face"><i /><i /></span></div>
      <div className="bot bot-red"><span className="antenna" /><span className="face"><i /><i /></span></div>
      <div className="bot bot-green"><span className="antenna" /><span className="face"><i /><i /></span></div>
      <div className="arena-pad"><span /></div>
    </div>
  );
}

function MiniArena() {
  return (
    <div className="mini-arena" aria-hidden="true">
      {Array.from({ length: 18 }).map((_, index) => (
        <span key={index} className={index === 2 || index === 8 || index === 14 ? "special" : ""} />
      ))}
      <b className="mini-bot one" />
      <b className="mini-bot two" />
    </div>
  );
}
