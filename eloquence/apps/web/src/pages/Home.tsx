import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, ChevronRight, Clock, ClipboardCheck, Flame, Mic, Repeat, Sparkles, Target, Timer, TrendingUp } from "lucide-react";
import {
  DIMENSION_POSSESSIVE, dailyExercise, getCategory, getGame, nextProgramDay, weakestDimension,
  buildQuickSession, buildGameActivity, getExercise, formatDuration, type WeeklyGoals,
} from "@eloquence/core";
import { useAccount } from "../lib/store";
import { useLaunchActivity } from "../lib/launch";
import { greeting, relativeDay, spokenTime } from "../lib/format";
import { Avatar, DimensionBars, EmptyState, Icon, ScoreRing } from "../components/ui";

export function Home() {
  const { account, summary, weeklyGoals } = useAccount();
  const { user, sessions, program } = account;
  const launch = useLaunchActivity();
  const weak = weakestDimension(summary.current);
  const today = dailyExercise(new Date(), weak);
  const programDay = nextProgramDay(program);
  const doneToday = summary.todayCount > 0;
  const recurring = summary.recurringIssue;
  const [weekly, setWeekly] = useState<WeeklyGoals | null>(null);

  useEffect(() => { void weeklyGoals().then(setWeekly).catch(() => setWeekly(null)); }, [weeklyGoals, sessions.length]);

  const startQuick = (minutes: 5 | 15 | 30) => {
    const queue = buildQuickSession(minutes, weak, recurring);
    const first = queue[0];
    if (!first) return;
    if (first.kind === "game") { const g = getGame(first.id); if (g) { const built = buildGameActivity(g); launch(built.exercise, { source: "jeu", constraint: built.constraint }); } }
    else { const ex = getExercise(first.id); if (ex) launch(ex, { source: "catalogue" }); }
  };

  return (
    <div className="page">
      <header className="row-between">
        <div>
          <h1 className="page-title">{greeting()} {user.firstName}</h1>
          <p className="page-sub">{doneToday ? "Belle séance. Une autre pour ancrer le progrès ?" : "Prêt à t'entraîner ?"}</p>
        </div>
        <Link to="/profil" aria-label="Mon profil"><Avatar name={user.firstName} src={user.avatar} /></Link>
      </header>

      {!user.diagnosticDone && (
        <Link to="/diagnostic" className="card card-link" style={{ background: "var(--primary-soft)", boxShadow: "none" }}>
          <div className="row">
            <span className="stat-tile" style={{ padding: 0, boxShadow: "none", background: "transparent" }}><span className="icon tone-primary" style={{ width: 44, height: 44, borderRadius: 14 }}><ClipboardCheck size={20} /></span></span>
            <div className="grow">
              <div className="strong">Fais ton diagnostic complet</div>
              <div className="small muted">8 tests courts pour un bilan précis de ton niveau de départ</div>
            </div>
            <ChevronRight size={20} className="faint" />
          </div>
        </Link>
      )}

      <section className="hero-card" aria-labelledby="today-title">
        <div className="row-between">
          <span className="eyebrow">Session du jour</span>
          <span className="pill glass"><Icon name={getCategory(today.category).icon} size={13} />{getCategory(today.category).title}</span>
        </div>
        <h2 id="today-title">« {today.stance ?? today.prompt} »</h2>
        <div className="meta">
          <span><Clock size={15} aria-hidden="true" />{formatDuration(today.durationSec)}</span>
          {weak && today.focus === weak && <span><Target size={15} aria-hidden="true" />Cible {DIMENSION_POSSESSIVE[weak]}</span>}
        </div>
        <button className="btn btn-light btn-lg btn-block" onClick={() => launch(today, { source: "catalogue" })}><Mic size={18} />Commencer</button>
      </section>

      <div className="grid-3">
        {([5, 15, 30] as const).map((m) => (
          <button key={m} className="stat-tile" style={{ cursor: "pointer", textAlign: "left" }} onClick={() => startQuick(m)}>
            <span className="icon tone-primary"><Timer size={18} /></span>
            <div className="stat"><span className="v">{m} min</span><span className="l">Session rapide</span></div>
          </button>
        ))}
      </div>

      {recurring && (
        <button className="card card-link" style={{ width: "100%", textAlign: "left", border: 0, background: "var(--warning-soft)", boxShadow: "none" }}
          onClick={() => { const g = getGame(recurring.suggestedGameId); if (g) { const built = buildGameActivity(g); launch(built.exercise, { source: "jeu", constraint: built.constraint }); } }}>
          <div className="row">
            <Repeat size={20} />
            <div className="grow"><div className="strong">{recurring.label} revient souvent</div><div className="small muted">Sur {recurring.sessionsAffected} sessions récentes — un défi ciblé peut le faire disparaître</div></div>
            <ChevronRight size={20} className="faint" />
          </div>
        </button>
      )}

      {weekly && (
        <section className="card" aria-labelledby="weekly-title">
          <div className="row-between" style={{ marginBottom: 12 }}>
            <h2 id="weekly-title" style={{ fontSize: 18 }}>Cette semaine</h2>
            {weekly.recap && <span className={`pill ${weekly.recap.scoreDelta >= 0 ? "success" : "warning"}`}>{weekly.recap.scoreDelta >= 0 ? "+" : ""}{weekly.recap.scoreDelta} pts</span>}
          </div>
          <div className="stack" style={{ gap: 10 }}>
            <div className="row"><Target size={16} className="faint" /><span className="small"><strong>Objectif principal :</strong> {weekly.principal.label}</span></div>
            {weekly.secondary && <div className="row"><Target size={16} className="faint" /><span className="small"><strong>Objectif secondaire :</strong> {weekly.secondary.label}</span></div>}
            <div className="row"><Sparkles size={16} className="faint" /><span className="small"><strong>Culturel :</strong> {weekly.culturel.done}/{weekly.culturel.target} nouveaux sujets</span></div>
          </div>
          {weekly.recap && <p className="small muted" style={{ marginTop: 10 }}>{weekly.recap.message}</p>}
        </section>
      )}

      <div className="grid-2">
        <div className="stat-tile">
          <span className="icon tone-warning"><Flame size={18} /></span>
          <div className="stat"><span className="v">{summary.streak} {summary.streak > 1 ? "jours" : "jour"}</span><span className="l">Série actuelle</span></div>
        </div>
        <div className="stat-tile">
          <span className="icon tone-primary"><Timer size={18} /></span>
          <div className="stat"><span className="v">{spokenTime(summary.weekSec)}</span><span className="l">Cette semaine</span></div>
        </div>
      </div>

      {programDay && program && (
        <Link to="/programme" className="card card-link">
          <div className="row">
            <span className="stat-tile" style={{ padding: 0, boxShadow: "none" }}><span className="icon tone-success" style={{ width: 44, height: 44, borderRadius: 14 }}><CalendarCheck size={20} /></span></span>
            <div className="grow">
              <div className="tiny faint strong">PROGRAMME · JOUR {programDay.day}/{program.days.length}</div>
              <div className="strong">{programDay.title}</div>
              <div className="small muted">{programDay.focus}</div>
            </div>
            <ChevronRight size={20} className="faint" />
          </div>
        </Link>
      )}

      <section className="card" aria-labelledby="prog-title">
        <div className="row-between" style={{ marginBottom: 18 }}>
          <h2 id="prog-title" style={{ fontSize: 18 }}>Progression</h2>
          <Link to="/progression" className="small strong" style={{ textDecoration: "none" }}>Tout voir</Link>
        </div>
        {summary.current ? (
          <div className="stack-lg">
            <div className="row" style={{ gap: 20 }}>
              <ScoreRing score={summary.current.global} size={112} />
              <div className="stack" style={{ gap: 6 }}>
                <span className="strong">Score global</span>
                <span className="small muted">Moyenne de tes 5 dernières sessions</span>
                {summary.trend30 !== null && (
                  <span className={`small ${summary.trend30 >= 0 ? "delta-up" : "delta-down"}`}>
                    <TrendingUp size={14} style={{ verticalAlign: -2 }} /> {summary.trend30 >= 0 ? "+" : "−"}{Math.abs(summary.trend30)} pts sur 30 jours
                  </span>
                )}
              </div>
            </div>
            <DimensionBars scores={summary.current} dims={["clarte", "fluidite", "structure", "argumentation", "vocabulaire", "parasites"]} />
          </div>
        ) : (
          <EmptyState icon={<Sparkles size={24} />} title="Ton tableau de bord t'attend"
            action={<button className="btn btn-primary" onClick={() => launch(today, { source: "catalogue" })}>Faire ma première session</button>}>
            Après ta première session, tu verras ici tes scores de clarté, fluidité, confiance et plus encore.
          </EmptyState>
        )}
      </section>

      {sessions.length > 0 && (
        <section className="stack" aria-labelledby="recent-title">
          <div className="row-between">
            <h2 id="recent-title" className="section-title">Dernières sessions</h2>
            <Link to="/historique" className="small strong" style={{ textDecoration: "none" }}>Historique</Link>
          </div>
          <div className="list">
            {sessions.slice(0, 3).map((s) => (
              <Link key={s.id} to={`/session/${s.id}`} className="list-item">
                <span className="li-icon"><Icon name={getCategory(s.category).icon} size={18} /></span>
                <span className="grow">
                  <span className="li-title">{s.exerciseTitle}</span><br />
                  <span className="li-sub">{relativeDay(s.createdAt)}</span>
                </span>
                <span className="li-end"><span className="strong tabular" style={{ color: "var(--text)" }}>{s.score}</span><ChevronRight size={18} /></span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
