import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Flame, History, Lock, Mic, Trophy } from "lucide-react";
import {
  BADGES, DIMENSION_POSSESSIVE, FREE_HISTORY_DAYS, LEVELS, isPremium, scoreSeries, strongestDimension,
  weakestDimension, weekActivity,
} from "@eloquence/core";
import { useAccount } from "../lib/store";
import { nf, relativeDay, spokenTime } from "../lib/format";
import { DimensionBars, EmptyState, Icon } from "../components/ui";
import { ScoreLineChart, WeekBars } from "../components/charts";

const RANGES = [
  { id: 7, label: "7 jours" },
  { id: 30, label: "30 jours" },
  { id: 90, label: "3 mois" },
] as const;

export function Progress() {
  const { account, summary, mode, openPaywall } = useAccount();
  const [range, setRange] = useState<7 | 30 | 90>(30);
  const premium = isPremium(account.user) || mode === "demo";
  const series = scoreSeries(account.sessions, range);
  const week = weekActivity(account.sessions);
  const strong = strongestDimension(summary.current);
  const weak = weakestDimension(summary.current);
  const earned = new Set(summary.badges.map((b) => b.id));

  if (account.sessions.length === 0) {
    return (
      <div className="page">
        <header><h1 className="page-title">Ma progression</h1></header>
        <div className="card">
          <EmptyState icon={<Mic size={24} />} title="Ta courbe commence ici"
            action={<Link to="/entrainement" className="btn btn-primary">Faire un exercice</Link>}>
            Chaque session alimente tes statistiques : score, temps parlé, série de jours. Lance-toi, 60 secondes suffisent.
          </EmptyState>
        </div>
        <LevelsCard xp={0} />
      </div>
    );
  }

  const trendText = summary.trend30 !== null
    ? summary.trend30 > 0
      ? `Tu progresses : +${summary.trend30} points sur 30 jours.`
      : summary.trend30 < 0 ? `Léger recul de ${Math.abs(summary.trend30)} points sur 30 jours. La régularité va inverser la tendance.` : "Score stable sur 30 jours."
    : "Encore quelques sessions et on mesure ta tendance.";

  return (
    <div className="page">
      <header>
        <h1 className="page-title">Ma progression</h1>
        <p className="page-sub">{trendText}</p>
      </header>

      <section className="card" aria-labelledby="curve-title">
        <div className="row-between" style={{ marginBottom: 14, flexWrap: "wrap" }}>
          <h2 id="curve-title" style={{ fontSize: 18 }}>Score global</h2>
          <div className="segmented" role="group" aria-label="Période" style={{ flex: "1 1 240px", maxWidth: 320 }}>
            {RANGES.map((r) => (
              <button key={r.id} aria-pressed={range === r.id}
                onClick={() => (r.id === 90 && !premium ? openPaywall("history") : setRange(r.id))}>
                {r.label}{r.id === 90 && !premium ? <Lock size={11} style={{ marginLeft: 4, verticalAlign: -1 }} /> : null}
              </button>
            ))}
          </div>
        </div>
        {series.length > 0 ? <ScoreLineChart points={series} /> : (
          <p className="muted small center" style={{ padding: "40px 0" }}>Aucune session sur cette période.</p>
        )}
        <details style={{ marginTop: 12 }}>
          <summary className="small muted" style={{ cursor: "pointer" }}>Voir les données</summary>
          <table className="compare" style={{ marginTop: 8 }}>
            <thead><tr><th>Jour</th><th>Score</th><th>Sessions</th></tr></thead>
            <tbody>{series.map((p) => <tr key={p.date}><td>{relativeDay(p.date + "T12:00:00").replace(/, \d\d:\d\d$/, "")}</td><td>{p.score}</td><td>{p.sessions}</td></tr>)}</tbody>
          </table>
        </details>
      </section>

      <div className="grid-2">
        <Stat label="Temps total parlé" value={spokenTime(summary.totalSec)} />
        <Stat label="Sessions" value={nf.format(summary.sessionCount)} />
        <Stat label="Mots prononcés" value={nf.format(summary.totalWords)} />
        <Stat label="Score moyen" value={`${summary.averageScore}`} />
        <Stat label="Meilleur score" value={`${summary.bestScore}`} />
        <Stat label="Série actuelle" value={`${summary.streak} j`} icon={<Flame size={16} color="var(--warning)" />} />
        <Stat label="Série record" value={`${summary.bestStreak} j`} icon={<Trophy size={16} color="var(--primary-ink)" />} />
        <Stat label="Parasites évités" value={nf.format(summary.fillersRemoved)} />
      </div>

      <section className="card" aria-labelledby="week-title">
        <div className="row-between" style={{ marginBottom: 16 }}>
          <h2 id="week-title" style={{ fontSize: 18 }}>Cette semaine</h2>
          <span className="small muted">{spokenTime(summary.weekSec)} · {summary.weekSessions} session{summary.weekSessions > 1 ? "s" : ""}</span>
        </div>
        <WeekBars days={week} />
      </section>

      {summary.current && (
        <section className="card" aria-labelledby="skills-title">
          <h2 id="skills-title" style={{ fontSize: 18 }}>Tes compétences</h2>
          <p className="small muted" style={{ margin: "4px 0 18px" }}>
            {strong && weak ? `Point fort : ${DIMENSION_POSSESSIVE[strong]}. Levier principal : ${DIMENSION_POSSESSIVE[weak]}.` : ""}
          </p>
          <DimensionBars scores={summary.current} />
        </section>
      )}

      <LevelsCard xp={summary.xp} />

      <section className="stack" aria-labelledby="badges-title">
        <div className="row-between">
          <h2 id="badges-title" className="section-title">Badges · {earned.size}/{BADGES.length}</h2>
          <Link to="/badges" className="small strong" style={{ textDecoration: "none" }}>Tout voir</Link>
        </div>
        <div className="badge-grid">
          {BADGES.filter((b) => earned.has(b.id)).slice(0, 4).map((b) => (
            <div key={b.id} className="badge-tile">
              <span className="b-ic"><Icon name={b.icon} /></span>
              <span className="b-title">{b.title}</span>
            </div>
          ))}
        </div>
      </section>

      <Link to="/historique" className="list card" style={{ textDecoration: "none", color: "inherit" }}>
        <span className="list-item">
          <span className="li-icon"><History size={18} /></span>
          <span className="grow"><span className="li-title">Historique des sessions</span><br /><span className="li-sub">{premium ? "Toutes tes sessions" : `${FREE_HISTORY_DAYS} derniers jours en version gratuite`}</span></span>
          <ChevronRight size={18} className="li-end" />
        </span>
      </Link>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="stat-tile" style={{ gap: 4 }}>
      <div className="stat"><span className="v row" style={{ gap: 6 }}>{value}{icon}</span><span className="l">{label}</span></div>
    </div>
  );
}

export function LevelsCard({ xp }: { xp: number }) {
  let idx = 0;
  while (idx + 1 < LEVELS.length && xp >= LEVELS[idx + 1].minXp) idx++;
  const next = LEVELS[idx + 1];
  const pct = next ? Math.round(((xp - LEVELS[idx].minXp) / (next.minXp - LEVELS[idx].minXp)) * 100) : 100;
  return (
    <section className="card" aria-labelledby="lvl-title">
      <div className="row-between">
        <div>
          <div className="eyebrow">Niveau {idx + 1}</div>
          <h2 id="lvl-title" className="display" style={{ fontSize: 26, marginTop: 2 }}>{LEVELS[idx].name}</h2>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="strong tabular">{nf.format(xp)} XP</div>
          <div className="tiny faint">{next ? `${nf.format(next.minXp - xp)} XP avant ${next.name}` : "Niveau maximal"}</div>
        </div>
      </div>
      <div className="progress" style={{ margin: "16px 0" }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progression vers le niveau suivant">
        <div style={{ width: `${pct}%` }} />
      </div>
      <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
        {LEVELS.map((l, i) => (
          <li key={l.name} className="row small" style={{ color: i <= idx ? "var(--text)" : "var(--text-3)" }}>
            <span className="pill" style={i <= idx ? { background: "var(--primary)", color: "var(--on-primary)" } : undefined}>{i + 1}</span>
            <span className={i === idx ? "strong" : ""}>{l.name}</span>
            <span className="faint tiny" style={{ marginLeft: "auto" }}>{nf.format(l.minXp)} XP</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
