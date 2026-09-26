import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Flame, History, Mic, Trophy } from "lucide-react";
import { BADGES, CATEGORY_LABELS, DIMENSION_POSSESSIVE, LEVELS, scoreSeries, strongestDimension, weakestDimension, weekActivity } from "@eloquence/core";
import { useAccount } from "../lib/store";
import { nf, spokenTime } from "../lib/format";
import { DimensionBars, EmptyState, Icon } from "../components/ui";
import { ScoreLineChart, WeekBars } from "../components/charts";

const RANGES = [
  { id: 7, label: "7 jours" },
  { id: 30, label: "30 jours" },
  { id: 90, label: "3 mois" },
] as const;

export function Progress() {
  const { account, summary } = useAccount();
  const [range, setRange] = useState<7 | 30 | 90>(30);
  const series = scoreSeries(account.sessions, range);
  const week = weekActivity(account.sessions);
  const strong = strongestDimension(summary.current);
  const weak = weakestDimension(summary.current);
  const earned = new Set(summary.badges.map((b) => b.id));
  const categories = Object.entries(summary.byCategory).sort((a, b) => (b[1]?.count ?? 0) - (a[1]?.count ?? 0));

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
            {RANGES.map((r) => <button key={r.id} aria-pressed={range === r.id} onClick={() => setRange(r.id)}>{r.label}</button>)}
          </div>
        </div>
        {series.length > 0 ? <ScoreLineChart points={series} /> : (
          <p className="muted small center" style={{ padding: "40px 0" }}>Aucune session sur cette période.</p>
        )}
      </section>

      <div className="grid-2">
        <Stat label="Temps total parlé" value={spokenTime(summary.totalSec)} />
        <Stat label="Sessions" value={nf.format(summary.sessionCount)} />
        <Stat label="Mots prononcés" value={nf.format(summary.totalWords)} />
        <Stat label="Score moyen" value={`${summary.averageScore}`} />
        <Stat label="Meilleur score" value={`${summary.bestScore}`} />
        <Stat label="Sujets distincts" value={nf.format(summary.distinctTopics)} />
        <Stat label="Série actuelle" value={`${summary.streak} j`} icon={<Flame size={16} color="var(--warning)" />} />
        <Stat label="Série record" value={`${summary.bestStreak} j`} icon={<Trophy size={16} color="var(--primary-ink)" />} />
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

      {categories.length > 0 && (
        <section className="card" aria-labelledby="cat-title">
          <h2 id="cat-title" style={{ fontSize: 18, marginBottom: 4 }}>Profil par catégorie</h2>
          <p className="small muted" style={{ marginBottom: 16 }}>Ta moyenne réelle dans chaque type d'exercice — pas un score inventé.</p>
          <div className="stack" style={{ gap: 10 }}>
            {categories.map(([cat, v]) => (
              <div key={cat} className="row-between small">
                <span>{CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat} <span className="faint">· {v?.count} session{(v?.count ?? 0) > 1 ? "s" : ""}</span></span>
                <span className="strong tabular">{v?.average}</span>
              </div>
            ))}
          </div>
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
          <span className="grow"><span className="li-title">Historique des sessions</span><br /><span className="li-sub">Recherche dans toutes tes sessions</span></span>
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
