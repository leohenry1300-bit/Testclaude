import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Check, Lightbulb, Lock, Pause, RotateCcw, Sparkles, Target, TrendingUp, Volume2,
} from "lucide-react";
import type { Analysis, Issue, Session } from "@eloquence/core";
import { DIMENSION_HINTS, DIMENSION_LABELS, DIMENSIONS } from "@eloquence/core";
import { loadClip } from "../lib/audioStore";
import { DimensionBars } from "./ui";
import { PaceChart } from "./charts";

const KIND_LABEL: Record<string, string> = {
  filler: "Mot parasite",
  repetition: "Répétition",
  hedge: "Formule d'excuse",
  vague: "Mot flou",
};

export function Transcript({ analysis }: { analysis: Analysis }) {
  const issues = analysis.issues;
  return (
    <div className="stack">
      <p className="transcript">
        {analysis.sentences.map((s, si) => (
          <span key={si}>
            <span className={`sent${s.tooLong ? " long" : ""}`} title={s.tooLong ? `Phrase longue : ${s.wordCount} mots` : undefined}>
              {s.tokens.map((t, ti) => {
                const space = ti < s.tokens.length - 1 ? " " : "";
                if (!t.kind) return <span key={ti}>{t.text}{space}</span>;
                const issue: Issue | undefined = t.issue !== undefined ? issues[t.issue] : undefined;
                const tip = `${KIND_LABEL[t.kind] ?? ""}${issue ? ` — ${issue.detail}` : ""}`;
                return (
                  <span key={ti}>
                    <mark className={t.kind} title={tip}>
                      {t.text}
                      <span className="sr-only"> ({KIND_LABEL[t.kind]})</span>
                    </mark>{space}
                  </span>
                );
              })}
            </span>
            {s.pauseAfter ? (
              <span className="pause" title={`Pause de ${s.pauseAfter} s`}>
                <Pause size={10} aria-hidden="true" />{s.pauseAfter.toString().replace(".", ",")} s
                <span className="sr-only"> de pause</span>
              </span>
            ) : null}
            {si < analysis.sentences.length - 1 ? " " : ""}
          </span>
        ))}
      </p>
      <div className="hl-legend" aria-label="Légende">
        <span><i style={{ background: "var(--hl-filler-bg)" }} />Mots parasites</span>
        <span><i style={{ background: "var(--hl-rep-bg)" }} />Répétitions</span>
        <span><i style={{ background: "var(--hl-hedge-bg)" }} />Formulations floues</span>
        <span><i style={{ background: "transparent", borderBottom: "2px dotted var(--hl-long)", borderRadius: 0 }} />Phrases trop longues</span>
        <span><Pause size={12} aria-hidden="true" />Longues pauses</span>
      </div>
    </div>
  );
}

export function IssueList({ issues, limit }: { issues: Issue[]; limit?: number }) {
  const list = limit ? issues.slice(0, limit) : issues;
  if (!list.length) {
    return <p className="muted">Rien de notable à corriger. Ton propos est propre.</p>;
  }
  return (
    <div>
      {list.map((i, idx) => (
        <div className="issue" key={idx}>
          <span className={`count ${i.kind === "filler" ? "tone-danger" : i.kind === "repetition" ? "tone-warning" : "tone-primary"}`}>×{i.count}</span>
          <div className="grow">
            <div className="strong">{i.detail}</div>
            <div className="small muted" style={{ marginTop: 2 }}>{i.suggestion}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CoachFeedback({ analysis, onRetry }: { analysis: Analysis; onRetry?: () => void }) {
  const f = analysis.feedback;
  return (
    <section className="card" aria-labelledby="fb-title">
      <div className="row-between" style={{ marginBottom: 16 }}>
        <h2 id="fb-title" style={{ fontSize: 18 }}>Le retour de ton coach</h2>
        {analysis.engine === "llm" && <span className="pill primary"><Sparkles size={13} />IA</span>}
      </div>
      <div className="stack" style={{ gap: 16 }}>
        <div className="feedback-block">
          <span className="fb-icon tone-success"><Check size={18} /></span>
          <div><h3>Ce que tu fais bien</h3><p>{f.strengths}</p></div>
        </div>
        <div className="feedback-block">
          <span className="fb-icon tone-warning"><TrendingUp size={18} /></span>
          <div><h3>Ce qui peut être amélioré</h3><p>{f.improvements}</p></div>
        </div>
        <div className="feedback-block">
          <span className="fb-icon tone-primary"><Lightbulb size={18} /></span>
          <div><h3>Ton conseil du jour</h3><p>{f.tip}</p></div>
        </div>
        <div className="feedback-block">
          <span className="fb-icon tone-neutral"><Target size={18} /></span>
          <div><h3>À refaire</h3><p>{f.retry}</p></div>
        </div>
      </div>
      {onRetry && (
        <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 20 }} onClick={onRetry}>
          <RotateCcw size={18} />Refaire l'exercice
        </button>
      )}
    </section>
  );
}

export function ScoresCard({ analysis, deltas }: { analysis: Analysis; deltas?: Partial<Record<(typeof DIMENSIONS)[number], number>> }) {
  return (
    <section className="card" aria-labelledby="scores-title">
      <h2 id="scores-title" style={{ fontSize: 18, marginBottom: 16 }}>Détail par compétence</h2>
      <DimensionBars scores={analysis.scores} deltas={deltas} unmeasured={analysis.metrics.typed ? ["debit"] : undefined} />
      <details style={{ marginTop: 16 }}>
        <summary className="small muted" style={{ cursor: "pointer" }}>Comment sont calculés ces scores ?</summary>
        <ul className="small muted" style={{ paddingLeft: 18, marginTop: 8, display: "grid", gap: 4 }}>
          {DIMENSIONS.map((d) => <li key={d}><strong>{DIMENSION_LABELS[d]}</strong> : {DIMENSION_HINTS[d]}</li>)}
        </ul>
      </details>
    </section>
  );
}

export function AdvancedMetrics({ analysis, locked, onUnlock }: { analysis: Analysis; locked: boolean; onUnlock: () => void }) {
  const m = analysis.metrics;
  const content = (
    <div className="stack-lg">
      <div className="grid-3">
        <div className="stat"><span className="v">{m.typed ? "—" : m.wpm}</span><span className="l">mots / min</span></div>
        <div className="stat"><span className="v">{m.wordCount}</span><span className="l">mots</span></div>
        <div className="stat"><span className="v">{m.fillerPer100.toString().replace(".", ",")}</span><span className="l">parasites / 100 mots</span></div>
        <div className="stat"><span className="v">{m.pauseCount}</span><span className="l">pauses notables</span></div>
        <div className="stat"><span className="v">{m.avgSentenceWords.toString().replace(".", ",")}</span><span className="l">mots / phrase</span></div>
        <div className="stat"><span className="v">{Math.round(m.lexicalDiversity * 100)} %</span><span className="l">diversité lexicale</span></div>
      </div>
      {m.pace.length >= 2 && (
        <div className="stack" style={{ gap: 8 }}>
          <div className="row-between"><span className="strong small">Débit au fil de ta réponse</span><span className="tiny faint">zone verte : 130–160</span></div>
          <PaceChart samples={m.pace} />
        </div>
      )}
      {m.connectors.length > 0 && (
        <div className="stack" style={{ gap: 8 }}>
          <span className="strong small">Mots de liaison utilisés</span>
          <div className="row" style={{ flexWrap: "wrap", gap: 6 }}>{m.connectors.map((c) => <span key={c} className="pill">{c}</span>)}</div>
        </div>
      )}
      <div className="stack" style={{ gap: 4 }}>
        <span className="strong small">Tous les points relevés</span>
        <IssueList issues={analysis.issues} />
      </div>
    </div>
  );
  return (
    <section className="card" aria-labelledby="adv-title">
      <div className="row-between" style={{ marginBottom: 16 }}>
        <h2 id="adv-title" style={{ fontSize: 18 }}>Analyse avancée</h2>
        {locked && <span className="pill primary"><Lock size={12} />Premium</span>}
      </div>
      {locked ? (
        <div className="locked">
          <div className="locked-content" aria-hidden="true">{content}</div>
          <div className="locked-cta">
            <button className="btn btn-primary" onClick={onUnlock}><Lock size={16} />Débloquer l'analyse avancée</button>
          </div>
        </div>
      ) : content}
    </section>
  );
}

export function AudioPlayer({ session }: { session: Session }) {
  const [src, setSrc] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    let url: string | null = null;
    let alive = true;
    if (!session.audioUrl) { setMissing(true); return; }
    if (session.audioUrl.startsWith("idb:")) {
      void loadClip(session.audioUrl.slice(4)).then((blob) => {
        if (!alive) return;
        if (!blob) { setMissing(true); return; }
        url = URL.createObjectURL(blob);
        setSrc(url);
      });
    } else setSrc(session.audioUrl);
    return () => { alive = false; if (url) URL.revokeObjectURL(url); };
  }, [session.audioUrl]);
  if (missing) return null;
  return (
    <section className="card tight" aria-label="Réécouter ta réponse">
      <div className="row" style={{ marginBottom: 10 }}>
        <Volume2 size={18} className="faint" aria-hidden="true" />
        <span className="strong small">Réécoute-toi</span>
        <span className="tiny faint" style={{ marginLeft: "auto" }}>C'est là qu'on progresse le plus</span>
      </div>
      {src ? <audio controls src={src} style={{ width: "100%" }} preload="metadata" /> : <div className="skeleton" style={{ height: 40 }} />}
    </section>
  );
}

export function RetryLink({ exerciseId }: { exerciseId: string }) {
  return <Link to={`/exercice/${exerciseId}`} className="btn btn-outline btn-block"><RotateCcw size={16} />Refaire cet exercice</Link>;
}
