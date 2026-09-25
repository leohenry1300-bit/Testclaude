import { Link } from "react-router-dom";
import { CalendarCheck, ChevronRight, Clock, Flame, Mic, Sparkles, Target, Timer, TrendingUp } from "lucide-react";
import {
  DIMENSION_POSSESSIVE, FREE_DAILY_EXERCISES, dailyExercise, getCategory, isPremium, nextProgramDay,
  weakestDimension, formatDuration,
} from "@eloquence/core";
import { useAccount } from "../lib/store";
import { greeting, relativeDay, spokenTime } from "../lib/format";
import { Avatar, DimensionBars, EmptyState, Icon, ScoreRing } from "../components/ui";

export function Home() {
  const { account, summary, mode } = useAccount();
  const { user, sessions, program } = account;
  const weak = weakestDimension(summary.current);
  const today = dailyExercise(new Date(), weak);
  const programDay = nextProgramDay(program);
  const premium = isPremium(user);
  const doneToday = summary.todayCount > 0;
  const remaining = Math.max(0, FREE_DAILY_EXERCISES - summary.todayCount);

  return (
    <div className="page">
      <header className="row-between">
        <div>
          <h1 className="page-title">{greeting()} {user.firstName}</h1>
          <p className="page-sub">{doneToday ? "Belle séance. Une autre pour ancrer le progrès ?" : "Prêt à t'entraîner ?"}</p>
        </div>
        <Link to="/profil" aria-label="Mon profil"><Avatar name={user.firstName} src={user.avatar} /></Link>
      </header>

      <section className="hero-card" aria-labelledby="today-title">
        <div className="row-between">
          <span className="eyebrow">Session du jour</span>
          <span className="pill glass"><Icon name={getCategory(today.category).icon} size={13} />{getCategory(today.category).title}</span>
        </div>
        <h2 id="today-title">« {today.prompt === "Défends ou contredis cette position." ? today.stance : today.prompt} »</h2>
        <div className="meta">
          <span><Clock size={15} aria-hidden="true" />{formatDuration(today.durationSec)}</span>
          {weak && today.focus === weak && <span><Target size={15} aria-hidden="true" />Cible {DIMENSION_POSSESSIVE[weak]}</span>}
        </div>
        <Link to={`/exercice/${today.id}`} className="btn btn-light btn-lg btn-block"><Mic size={18} />Commencer</Link>
      </section>

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

      {!premium && mode !== "demo" && (
        <p className="small muted center">{remaining > 0 ? `${remaining} exercice${remaining > 1 ? "s" : ""} gratuit${remaining > 1 ? "s" : ""} restant${remaining > 1 ? "s" : ""} aujourd'hui` : "Exercices gratuits du jour terminés. À demain !"}</p>
      )}

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
            <DimensionBars scores={summary.current} />
          </div>
        ) : (
          <EmptyState icon={<Sparkles size={24} />} title="Ton tableau de bord t'attend"
            action={<Link to={`/exercice/${today.id}`} className="btn btn-primary">Faire ma première session</Link>}>
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
