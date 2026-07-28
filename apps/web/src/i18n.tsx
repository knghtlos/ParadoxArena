import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { NodeKind, Ruleset } from "@paradox/simulation";

export type Language = "it" | "en";
type Dictionary = Record<string, string>;

const it: Dictionary = {
  "common.back": "Indietro",
  "common.done": "FATTO",
  "common.turn": "TURNO",
  "common.you": "TU",
  "common.rival": "RIVALE",
  "home.prototype": "SIGNAL FOUNDRY // PROTOTIPO 01",
  "home.tagline": "Leggi la griglia. Prevedi il rivale. Scegli prima del Pulse.",
  "home.replay": "REPLAY",
  "home.ready": "SIMULAZIONE LOCALE PRONTA",
  "home.start": "AVVIA MATCH",
  "home.vsBot": "contro unità tattica",
  "home.tutorialCta": "Prima partita? Avvia il tutorial guidato →",
  "home.protocols": "PROTOCOLLI ARENA",
  "home.choose": "Scegli il livello di imprevedibilità",
  "home.equalRules": "Ogni coda usa regole uguali per entrambi i giocatori.",
  "home.quick": "QUICK MATCH",
  "home.competitive": "COMPETITIVO",
  "home.laboratory": "LABORATORIO",
  "mode.flow": "Flusso",
  "mode.flow.desc": "L'arena cambia, ma ogni variazione viene annunciata prima di accadere.",
  "mode.flow.badge": "CONSIGLIATA",
  "mode.precision": "Precisione",
  "mode.precision.desc": "Nessun esito casuale durante il match. Leggi, prevedi, esegui.",
  "mode.precision.badge": "DETERMINISTICA",
  "mode.anomaly": "Anomalia",
  "mode.anomaly.desc": "Mutazioni più frequenti e spettacolari, sempre visibili.",
  "mode.anomaly.badge": "SPERIMENTALE",
  "match.training": "CONNESSIONE TRAINING",
  "match.local": "SCONTRO LOCALE",
  "match.selectWindow": "FINESTRA SCELTA",
  "match.resolving": "RISOLUZIONE",
  "match.targetNode": "NODO OBIETTIVO",
  "match.noTarget": "NESSUN OBIETTIVO",
  "match.tapNode": "Tocca un Nodo attivo. Puoi cambiare fino al lock.",
  "match.intentAck": "INTENTO CONFERMATO",
  "match.waiting": "IN ATTESA DI INPUT",
  "match.changeable": "modificabile",
  "match.safeSelect": "selezione sicura allo scadere",
  "match.telemetry": "La telemetria apparirà al Pulse.",
  "match.localAvatar": "AVATAR LOCALE",
  "match.tacticalUnit": "UNITÀ TATTICA",
  "match.guestName": "TU // OSPITE",
  "match.unitName": "UNITÀ // K-17",
  "match.guard": "SCUDO",
  "match.resonance": "RISONANZA",
  "match.charge": "CARICA",
  "match.guide": "GUIDA",
  "match.settings": "Impostazioni",
  "match.accessibility": "ACCESSIBILITÀ",
  "match.reducedMotion": "Movimento ridotto",
  "match.reducedMotionDesc": "Riduce shake e transizioni arena.",
  "match.complete": "SIMULAZIONE COMPLETA",
  "match.victory": "VITTORIA",
  "match.defeat": "SCONFITTA",
  "match.draw": "PARITÀ",
  "match.turnLimit": "Risoluzione al limite dei turni.",
  "match.integrityEnd": "Integrità avversaria esaurita.",
  "match.replaySaved": "Replay salvato sul dispositivo.",
  "match.turns": "TURNI",
  "match.damage": "DANNI",
  "match.integrity": "INTEGRITÀ",
  "match.newMatch": "NUOVO MATCH",
  "match.home": "TORNA ALLA HOME",
  "event.combo": "COMBO",
  "event.clash": "CLASH",
  "event.nodeSuppressed": "nodo soppresso",
  "tutorial.1": "Scegli una casella luminosa. Il bordo pieno conferma l'intento.",
  "tutorial.2": "I Nodi usati entrano in cooldown per entrambi: cambia percorso.",
  "tutorial.3": "Prova a prevedere il rivale: la stessa casella crea un Clash.",
  "tutorial.4": "Echo prepara il prossimo Nodo Strike e ne ripete parte dell'effetto.",
  "tutorial.resolve": "Entrambi gli Avatar saltano e gli effetti si risolvono insieme.",
  "replay.archive": "ARCHIVIO LOCALE",
  "replay.title": "Replay",
  "replay.clear": "CANCELLA TUTTI",
  "replay.empty": "Nessun segnale registrato",
  "replay.emptyDesc": "Completa una partita: seed e scelte verranno salvati su questo dispositivo.",
  "replay.backArena": "TORNA ALL'ARENA",
  "replay.local": "REPLAY LOCALE",
  "replay.open": "APRI →",
  "replay.previous": "← TURNO",
  "replay.next": "TURNO →",
  "replay.turnSlider": "Turno del replay",
  "arena.label": "Arena di gioco 5 per 5 con Avatar 3D",
  "loading": "SINCRONIZZAZIONE ARENA",
  "node.pulse": "12 danni",
  "node.ripple": "7 danni · eco +3",
  "node.nova": "8 danni a entrambi",
  "node.anchor": "+14 scudo",
  "node.absorb": "converte fino a 10 danni",
  "node.mirror": "riflette il 60%",
  "node.shift": "scambia le posizioni",
  "node.warp": "sposta il rivale",
  "node.gravity": "prepara Warp centrale",
  "node.echo": "ripete il prossimo Strike",
  "node.relay": "attiva il Nodo adiacente",
  "node.prism": "trasforma Nodi avvisati"
};

const en: Dictionary = {
  "common.back": "Back",
  "common.done": "DONE",
  "common.turn": "TURN",
  "common.you": "YOU",
  "common.rival": "RIVAL",
  "home.prototype": "SIGNAL FOUNDRY // PROTOTYPE 01",
  "home.tagline": "Read the grid. Predict your rival. Choose before the Pulse.",
  "home.replay": "REPLAYS",
  "home.ready": "LOCAL SIMULATION READY",
  "home.start": "START MATCH",
  "home.vsBot": "versus tactical unit",
  "home.tutorialCta": "First match? Start the guided tutorial →",
  "home.protocols": "ARENA PROTOCOLS",
  "home.choose": "Choose the level of unpredictability",
  "home.equalRules": "Every queue applies the same rules to both players.",
  "home.quick": "QUICK MATCH",
  "home.competitive": "COMPETITIVE",
  "home.laboratory": "LABORATORY",
  "mode.flow": "Flow",
  "mode.flow.desc": "The arena changes, but every variation is announced before it happens.",
  "mode.flow.badge": "RECOMMENDED",
  "mode.precision": "Precision",
  "mode.precision.desc": "No random outcomes during the match. Read, predict, execute.",
  "mode.precision.badge": "DETERMINISTIC",
  "mode.anomaly": "Anomaly",
  "mode.anomaly.desc": "More frequent, spectacular mutations that remain visible.",
  "mode.anomaly.badge": "EXPERIMENTAL",
  "match.training": "TRAINING LINK",
  "match.local": "LOCAL SKIRMISH",
  "match.selectWindow": "SELECT WINDOW",
  "match.resolving": "RESOLVING",
  "match.targetNode": "TARGET NODE",
  "match.noTarget": "NO TARGET",
  "match.tapNode": "Tap an active Node. You can change it until lock.",
  "match.intentAck": "INTENT ACKNOWLEDGED",
  "match.waiting": "WAITING FOR INPUT",
  "match.changeable": "changeable",
  "match.safeSelect": "safe selection on timeout",
  "match.telemetry": "Telemetry appears on the Pulse.",
  "match.localAvatar": "LOCAL AVATAR",
  "match.tacticalUnit": "TACTICAL UNIT",
  "match.guestName": "YOU // GUEST",
  "match.unitName": "UNIT // K-17",
  "match.guard": "GUARD",
  "match.resonance": "RESONANCE",
  "match.charge": "CHARGE",
  "match.guide": "GUIDE",
  "match.settings": "Settings",
  "match.accessibility": "ACCESSIBILITY",
  "match.reducedMotion": "Reduced motion",
  "match.reducedMotionDesc": "Reduces camera shake and arena transitions.",
  "match.complete": "SIMULATION COMPLETE",
  "match.victory": "VICTORY",
  "match.defeat": "DEFEAT",
  "match.draw": "DRAW",
  "match.turnLimit": "Resolved at the turn limit.",
  "match.integrityEnd": "Rival integrity depleted.",
  "match.replaySaved": "Replay saved on this device.",
  "match.turns": "TURNS",
  "match.damage": "DAMAGE",
  "match.integrity": "INTEGRITY",
  "match.newMatch": "NEW MATCH",
  "match.home": "BACK TO HOME",
  "event.combo": "COMBO",
  "event.clash": "CLASH",
  "event.nodeSuppressed": "node suppressed",
  "tutorial.1": "Choose a glowing cell. The solid border confirms your intent.",
  "tutorial.2": "Used Nodes cool down for both players: change your route.",
  "tutorial.3": "Predict the rival: choosing the same cell creates a Clash.",
  "tutorial.4": "Echo primes the next Strike Node and repeats part of its effect.",
  "tutorial.resolve": "Both Avatars jump and all effects resolve simultaneously.",
  "replay.archive": "LOCAL ARCHIVE",
  "replay.title": "Replays",
  "replay.clear": "CLEAR ALL",
  "replay.empty": "No signal recorded",
  "replay.emptyDesc": "Complete a match: its seed and choices will be stored on this device.",
  "replay.backArena": "BACK TO ARENA",
  "replay.local": "LOCAL REPLAY",
  "replay.open": "OPEN →",
  "replay.previous": "← TURN",
  "replay.next": "TURN →",
  "replay.turnSlider": "Replay turn",
  "arena.label": "5 by 5 game arena with 3D Avatars",
  "loading": "SYNCHRONIZING ARENA",
  "node.pulse": "12 damage",
  "node.ripple": "7 damage · echo +3",
  "node.nova": "8 damage to both",
  "node.anchor": "+14 guard",
  "node.absorb": "converts up to 10 damage",
  "node.mirror": "reflects 60%",
  "node.shift": "swaps positions",
  "node.warp": "moves the rival",
  "node.gravity": "primes a central Warp",
  "node.echo": "repeats the next Strike",
  "node.relay": "activates an adjacent Node",
  "node.prism": "transforms warned Nodes"
};

interface I18nValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  modeName: (ruleset: Ruleset) => string;
  nodeSummary: (kind: NodeKind) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

function initialLanguage(): Language {
  const stored = localStorage.getItem("paradox-arena:language");
  if (stored === "it" || stored === "en") return stored;
  return navigator.language.toLowerCase().startsWith("it") ? "it" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, updateLanguage] = useState<Language>(initialLanguage);
  const value = useMemo<I18nValue>(() => {
    const dictionary = language === "it" ? it : en;
    const t = (key: string) => dictionary[key] ?? it[key] ?? key;
    return {
      language,
      setLanguage: (next) => {
        localStorage.setItem("paradox-arena:language", next);
        document.documentElement.lang = next;
        updateLanguage(next);
      },
      t,
      modeName: (ruleset) => t(`mode.${ruleset}`),
      nodeSummary: (kind) => t(`node.${kind}`)
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside I18nProvider");
  return context;
}

export function LanguageSwitch() {
  const { language, setLanguage } = useI18n();
  return (
    <div className="language-switch" aria-label="Language">
      <button className={language === "it" ? "active" : ""} onClick={() => setLanguage("it")}>IT</button>
      <button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>EN</button>
    </div>
  );
}
