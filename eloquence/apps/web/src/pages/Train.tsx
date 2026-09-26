import { Link, useSearchParams } from "react-router-dom";
import { ChevronRight, Clock, Dices, Gamepad2, RotateCcw, Users as UsersIcon } from "lucide-react";
import { CATEGORIES, EXERCISES, formatDuration, GAME_GROUPS, GAMES, type CategoryId } from "@eloquence/core";
import { useAccount } from "../lib/store";
import { Icon } from "../components/ui";

export function Train() {
  const { account } = useAccount();
  const [params, setParams] = useSearchParams();
  const active = (params.get("c") as CategoryId | null) ?? null;
  const list = active ? EXERCISES.filter((e) => e.category === active) : EXERCISES;
  const best = new Map<string, number>();
  for (const s of account.sessions) best.set(s.exerciseId, Math.max(best.get(s.exerciseId) ?? 0, s.score));

  return (
    <div className="page">
      <header>
        <h1 className="page-title">S'entraîner</h1>
        <p className="page-sub">Exercices, jeux, sujets, simulations. Tout est ouvert, tout de suite.</p>
      </header>

      <div className="grid-2">
        <Link to="/jeux" className="cat-tile">
          <span className="c-ic"><Gamepad2 size={20} /></span>
          <span><span className="c-title">Jeux</span><br /><span className="c-sub">{GAMES.length} mini-jeux · {GAME_GROUPS.length} familles</span></span>
        </Link>
        <Link to="/sujets" className="cat-tile">
          <span className="c-ic"><Dices size={20} /></span>
          <span><span className="c-title">Sujets</span><br /><span className="c-sub">Bibliothèque massive, générée</span></span>
        </Link>
        <Link to="/simulations" className="cat-tile">
          <span className="c-ic"><UsersIcon size={20} /></span>
          <span><span className="c-title">Simulations</span><br /><span className="c-sub">Entretien, vente, jury, réunion…</span></span>
        </Link>
        <Link to="/bibliotheque" className="cat-tile">
          <span className="c-ic"><Icon name="BookOpen" /></span>
          <span><span className="c-title">Bibliothèque</span><br /><span className="c-sub">Mini-cours et méthodes</span></span>
        </Link>
      </div>

      <div className="row-between">
        <h2 className="section-title">Exercices du catalogue</h2>
        <Link to="/programme" className="small strong" style={{ textDecoration: "none" }}>Programmes</Link>
      </div>

      {!active && (
        <div className="cat-grid">
          {CATEGORIES.map((c) => {
            const count = EXERCISES.filter((e) => e.category === c.id).length;
            return (
              <button key={c.id} className="cat-tile" onClick={() => setParams({ c: c.id })}>
                <span className="c-ic"><Icon name={c.icon} /></span>
                <span>
                  <span className="c-title">{c.title}</span><br />
                  <span className="c-sub">{c.tagline} · {count}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="chips" role="group" aria-label="Catégories">
        <button className="chip" aria-pressed={!active} onClick={() => setParams({})}>Tout</button>
        {CATEGORIES.map((c) => (
          <button key={c.id} className="chip" aria-pressed={active === c.id} onClick={() => setParams({ c: c.id })}>{c.title}</button>
        ))}
      </div>

      <div className="list">
        {list.map((e) => {
          const score = best.get(e.id);
          return (
            <Link key={e.id} to={`/exercice/${e.id}`} className="list-item" aria-label={e.title}>
              <span className="li-icon"><Icon name={CATEGORIES.find((c) => c.id === e.category)!.icon} size={18} /></span>
              <span className="grow">
                <span className="li-title">{e.title}</span><br />
                <span className="li-sub"><Clock size={12} style={{ verticalAlign: -1 }} /> {formatDuration(e.durationSec)}{score !== undefined ? <> · <RotateCcw size={12} style={{ verticalAlign: -1 }} /> meilleur score {score}</> : null}</span>
              </span>
              <ChevronRight size={18} className="li-end" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
