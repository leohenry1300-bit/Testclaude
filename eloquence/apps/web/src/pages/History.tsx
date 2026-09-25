import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, History as HistoryIcon, Lock } from "lucide-react";
import { CATEGORIES, FREE_HISTORY_DAYS, BADGES, getCategory, isPremium, type CategoryId } from "@eloquence/core";
import { useAccount } from "../lib/store";
import { relativeDay, spokenTime } from "../lib/format";
import { EmptyState, Icon, TopBar } from "../components/ui";

export function History() {
  const { account, mode, openPaywall } = useAccount();
  const [cat, setCat] = useState<CategoryId | null>(null);
  const premium = isPremium(account.user) || mode === "demo";
  const cutoff = Date.now() - FREE_HISTORY_DAYS * 86_400_000;
  const list = account.sessions.filter((s) => !cat || s.category === cat);
  const visible = premium ? list : list.filter((s) => new Date(s.createdAt).getTime() >= cutoff);
  const hidden = list.length - visible.length;

  return (
    <div className="page no-nav">
      <TopBar title="Historique" />
      {account.sessions.length === 0 ? (
        <EmptyState icon={<HistoryIcon size={24} />} title="Pas encore de session" action={<Link to="/entrainement" className="btn btn-primary">S'entraîner</Link>}>
          Tes sessions analysées apparaîtront ici, avec leur transcription et leur score.
        </EmptyState>
      ) : (
        <>
          <div className="chips" role="group" aria-label="Filtrer par catégorie">
            <button className="chip" aria-pressed={!cat} onClick={() => setCat(null)}>Tout</button>
            {CATEGORIES.filter((c) => account.sessions.some((s) => s.category === c.id)).map((c) => (
              <button key={c.id} className="chip" aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>{c.title}</button>
            ))}
          </div>
          {visible.length > 0 ? (
            <div className="list">
              {visible.map((s) => (
                <Link key={s.id} to={`/session/${s.id}`} className="list-item">
                  <span className="li-icon"><Icon name={getCategory(s.category).icon} size={18} /></span>
                  <span className="grow">
                    <span className="li-title">{s.exerciseTitle}</span><br />
                    <span className="li-sub">{relativeDay(s.createdAt)} · {spokenTime(s.durationSec)}</span>
                  </span>
                  <span className="li-end"><span className="strong tabular" style={{ color: "var(--text)" }}>{s.score}</span><ChevronRight size={18} /></span>
                </Link>
              ))}
            </div>
          ) : <p className="muted center">Aucune session récente dans cette catégorie.</p>}
          {hidden > 0 && (
            <button className="card flat center stack" style={{ alignItems: "center", cursor: "pointer", width: "100%" }} onClick={() => openPaywall("history")}>
              <Lock size={20} className="faint" />
              <span className="strong">{hidden} session{hidden > 1 ? "s" : ""} plus ancienne{hidden > 1 ? "s" : ""}</span>
              <span className="small muted">Premium conserve tout ton historique.</span>
            </button>
          )}
        </>
      )}
    </div>
  );
}

export function Badges() {
  const { summary } = useAccount();
  const earned = new Map(summary.badges.map((b) => [b.id, b.earnedAt]));
  return (
    <div className="page no-nav">
      <TopBar title="Badges" />
      <p className="muted center">{earned.size} sur {BADGES.length} débloqués</p>
      <div className="badge-grid">
        {BADGES.map((b) => {
          const at = earned.get(b.id);
          return (
            <div key={b.id} className={`badge-tile${at ? "" : " off"}`}>
              <span className="b-ic">{at ? <Icon name={b.icon} /> : <Lock size={18} />}</span>
              <span className="b-title">{b.title}</span>
              <span className="b-desc">{at ? `Obtenu ${relativeDay(at).toLowerCase().replace(/, \d\d:\d\d$/, "")}` : b.description}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
