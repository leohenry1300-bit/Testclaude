import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, History as HistoryIcon, Search, X } from "lucide-react";
import { BADGES, CATEGORIES, getCategory, searchSessions, type CategoryId } from "@eloquence/core";
import { useAccount } from "../lib/store";
import { relativeDay, spokenTime } from "../lib/format";
import { EmptyState, Icon, TopBar } from "../components/ui";

export function History() {
  const { account } = useAccount();
  const [cat, setCat] = useState<CategoryId | null>(null);
  const [q, setQ] = useState("");
  const byCat = cat ? account.sessions.filter((s) => s.category === cat) : account.sessions;
  const visible = useMemo(() => searchSessions(byCat, q), [byCat, q]);

  return (
    <div className="page no-nav">
      <TopBar title="Historique" />
      {account.sessions.length === 0 ? (
        <EmptyState icon={<HistoryIcon size={24} />} title="Pas encore de session" action={<Link to="/entrainement" className="btn btn-primary">S'entraîner</Link>}>
          Tes sessions analysées apparaîtront ici, avec leur transcription et leur score.
        </EmptyState>
      ) : (
        <>
          <div className="field">
            <label htmlFor="search" className="sr-only">Rechercher</label>
            <div style={{ position: "relative" }}>
              <Search size={18} className="faint" style={{ position: "absolute", left: 14, top: 15 }} />
              <input id="search" className="input" style={{ paddingLeft: 42, paddingRight: q ? 42 : 14 }} placeholder="Rechercher dans tes sessions…" value={q} onChange={(e) => setQ(e.target.value)} />
              {q && <button className="icon-btn" style={{ position: "absolute", right: 3, top: 3 }} onClick={() => setQ("")} aria-label="Effacer"><X size={18} /></button>}
            </div>
          </div>
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
          ) : <p className="muted center">Aucun résultat.</p>}
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
              <span className="b-ic"><Icon name={b.icon} /></span>
              <span className="b-title">{b.title}</span>
              <span className="b-desc">{at ? `Obtenu ${relativeDay(at).toLowerCase().replace(/, \d\d:\d\d$/, "")}` : b.description}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
