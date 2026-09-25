import { Link, useSearchParams } from "react-router-dom";
import { ChevronRight, Clock, Lock, RotateCcw } from "lucide-react";
import { CATEGORIES, EXERCISES, formatDuration, isPremium, type CategoryId } from "@eloquence/core";
import { useAccount } from "../lib/store";
import { Icon } from "../components/ui";

export function Train() {
  const { account } = useAccount();
  const [params, setParams] = useSearchParams();
  const active = (params.get("c") as CategoryId | null) ?? null;
  const premium = isPremium(account.user);
  const list = active ? EXERCISES.filter((e) => e.category === active) : EXERCISES;
  const best = new Map<string, number>();
  for (const s of account.sessions) best.set(s.exerciseId, Math.max(best.get(s.exerciseId) ?? 0, s.score));

  return (
    <div className="page">
      <header>
        <h1 className="page-title">S'entraîner</h1>
        <p className="page-sub">Choisis une situation. Chaque exercice est analysé en détail.</p>
      </header>

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
          const locked = e.premium && !premium;
          const score = best.get(e.id);
          return (
            <Link key={e.id} to={`/exercice/${e.id}`} className="list-item" aria-label={`${e.title}${locked ? " (Premium)" : ""}`}>
              <span className="li-icon"><Icon name={CATEGORIES.find((c) => c.id === e.category)!.icon} size={18} /></span>
              <span className="grow">
                <span className="li-title">{e.title}</span><br />
                <span className="li-sub"><Clock size={12} style={{ verticalAlign: -1 }} /> {formatDuration(e.durationSec)}{score !== undefined ? <> · <RotateCcw size={12} style={{ verticalAlign: -1 }} /> meilleur score {score}</> : null}</span>
              </span>
              <span className="li-end">
                {locked ? <span className="pill primary"><Lock size={12} />Premium</span> : <ChevronRight size={18} />}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
