import { useState } from "react";
import { NODE_KINDS, type NodeKind, type Ruleset } from "@paradox/simulation";
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

const MODES: Ruleset[] = ["flow", "precision", "anomaly"];

export function Home({ onReplays, replayCount, visualTheme, onVisualThemeChange }: Props) {
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
        <a className="mobile-home-menu" href="#rules" aria-label={t("rules.eyebrow")}>
          <i /><i /><i />
        </a>
      </header>

      <div className="home-dashboard">
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
              <a className="icon-button menu-button" href="#rules" aria-label={t("rules.eyebrow")}>?</a>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <img src="/assets/paradox-hero-arena.png" alt="" />
          </div>
        </section>

        <aside className="home-info-rail">
          <section className="home-feature-panel" aria-label={t("home.why")}>
            <p className="eyebrow split-label">{t("home.why")}</p>
            <div className="feature-list">
              <FeatureItem icon="⚡" title={t("home.feature.fast")} text={t("home.feature.fastText")} />
              <FeatureItem icon="★" title={t("home.feature.powers")} text={t("home.feature.powersText")} />
              <FeatureItem icon="♛" title={t("home.feature.events")} text={t("home.feature.eventsText")} />
              <FeatureItem icon="✦" title={t("home.feature.style")} text={t("home.feature.styleText")} />
            </div>
          </section>

          <RulesSection />

          <section className="mode-section" aria-labelledby="mode-heading">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{t("home.protocols")}</p>
                <h2 id="mode-heading">{t("home.choose")}</h2>
              </div>
            </div>
            <div className="mode-grid">
              {MODES.map((mode, index) => (
                <a className={`mode-card mode-${mode}`} key={mode} href={`?mode=${mode}`}>
                  <div className="mode-index">0{index + 1}</div>
                  <h3>{t(`mode.${mode}`)}</h3>
                  <span className="mode-badge">{t(`mode.${mode}.badge`)}</span>
                  <span className="mode-arrow">↗</span>
                </a>
              ))}
            </div>
          </section>
        </aside>
      </div>

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

const NODE_FAMILIES: Record<NodeKind, "strike" | "guard" | "vector" | "circuit"> = {
  pulse: "strike",
  ripple: "strike",
  nova: "strike",
  anchor: "guard",
  absorb: "guard",
  mirror: "guard",
  shift: "vector",
  warp: "vector",
  gravity: "vector",
  echo: "circuit",
  relay: "circuit",
  prism: "circuit"
};

function RulesSection() {
  const { t } = useI18n();
  const [playing, setPlaying] = useState(true);
  return (
    <section className="rules-section" id="rules" aria-labelledby="rules-title">
      <div className="rules-heading">
        <div>
          <p className="eyebrow">{t("rules.eyebrow")}</p>
          <h2 id="rules-title">{t("rules.title")}</h2>
        </div>
        <a href="?mode=flow&tutorial=1">{t("rules.tutorial")} →</a>
      </div>
      <div className="rules-layout">
        <div className={`rules-video ${playing ? "is-playing" : "is-paused"}`} aria-label={t("rules.title")}>
          <div className="rules-video-grid" aria-hidden="true">
            {Array.from({ length: 25 }).map((_, index) => <i key={index} className={index === 7 ? "target" : ""} />)}
            <span className="video-bot player" />
            <span className="video-bot rival" />
            <b className="video-pulse" />
          </div>
          <div className="rules-video-controls">
            <button type="button" onClick={() => setPlaying((value) => !value)}>
              {playing ? "Ⅱ" : "▶"} <span>{t(playing ? "rules.pause" : "rules.play")}</span>
            </button>
            <i><span /></i>
          </div>
        </div>
        <div className="rules-copy">
          <p>{t("rules.intro")}</p>
          <ol>
            {["select", "resolve", "cooldown", "win"].map((step) => (
              <li key={step}><strong>{t(`rules.${step}`)}</strong><span>{t(`rules.${step}Text`)}</span></li>
            ))}
          </ol>
        </div>
      </div>
      <div className="symbol-legend">
        <strong>{t("rules.symbols")}</strong>
        <span className="symbol-strike"><i>ϟ</i>{t("rules.strike")}</span>
        <span className="symbol-guard"><i>⬡</i>{t("rules.guard")}</span>
        <span className="symbol-vector"><i>➜</i>{t("rules.vector")}</span>
        <span className="symbol-circuit"><i>⌘</i>{t("rules.circuit")}</span>
      </div>
      <div className="node-reference" aria-label={t("rules.nodes")}>
        {NODE_KINDS.map((kind) => (
          <span className={`node-${NODE_FAMILIES[kind]}`} key={kind} title={t(`node.${kind}`)}>
            {t(`nodeName.${kind}`)}
          </span>
        ))}
      </div>
    </section>
  );
}
