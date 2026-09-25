import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronRight, Lock, Mic, Sparkles } from "lucide-react";
import { GOAL_SUGGESTIONS, isPremium, nextProgramDay } from "@eloquence/core";
import { useAccount } from "../lib/store";
import { TopBar } from "../components/ui";

export function Program() {
  const { account, mode, createProgram, deleteProgram, openPaywall, toast } = useAccount();
  const [goal, setGoal] = useState(account.user.goalText ?? "");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(!account.program);
  const program = account.program;
  const premium = isPremium(account.user) || mode === "demo";
  const next = nextProgramDay(program);
  const done = program?.days.filter((d) => d.done).length ?? 0;

  const build = async () => {
    if (!premium) { openPaywall("program"); return; }
    setBusy(true);
    try {
      await createProgram(goal.trim());
      setEditing(false);
      toast("Ton programme de 14 jours est prêt.", "success");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page no-nav">
      <TopBar title="Mon programme" />

      {editing || !program ? (
        <section className="stack-lg">
          <div>
            <h1 className="page-title">Quel est ton objectif ?</h1>
            <p className="page-sub">Ton coach construit un programme de 14 jours adapté à ton objectif et à tes derniers résultats.</p>
          </div>
          <div className="field">
            <label htmlFor="goal">Mon objectif</label>
            <textarea id="goal" className="textarea" rows={3} maxLength={300} value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Je veux…" />
          </div>
          <div className="stack" style={{ gap: 8 }}>
            {GOAL_SUGGESTIONS.map((g) => (
              <button key={g} className="choice" aria-pressed={goal === g} style={{ padding: "12px 14px" }} onClick={() => setGoal(g)}>
                <span className="small">{g}</span>
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-lg btn-block" onClick={build} disabled={busy || goal.trim().length < 3}>
            {busy ? <span className="spinner" /> : premium ? <Sparkles size={18} /> : <Lock size={18} />}Construire mon programme
          </button>
          {program && <button className="btn btn-ghost btn-block" onClick={() => setEditing(false)}>Annuler</button>}
        </section>
      ) : (
        <>
          <section className="card">
            <div className="eyebrow">Programme 14 jours</div>
            <h1 className="display" style={{ fontSize: 24, margin: "6px 0 10px" }}>« {program.goalText} »</h1>
            <div className="row-between small muted" style={{ marginBottom: 8 }}><span>{done} jour{done > 1 ? "s" : ""} sur {program.days.length}</span><span>{Math.round((done / program.days.length) * 100)} %</span></div>
            <div className="progress" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={program.days.length} aria-label="Avancement du programme"><div style={{ width: `${(done / program.days.length) * 100}%` }} /></div>
            {next ? (
              <Link to={`/exercice/${next.exerciseId}`} className="btn btn-primary btn-lg btn-block" style={{ marginTop: 18 }}><Mic size={18} />Jour {next.day} : {next.title}</Link>
            ) : (
              <p className="form-info" style={{ marginTop: 18 }}>Programme terminé. Compare ta dernière session avec celle du jour 1 : c'est ton vrai progrès.</p>
            )}
          </section>

          <ol className="list" style={{ padding: 0, margin: 0, listStyle: "none" }}>
            {program.days.map((d) => (
              <li key={d.day}>
                <Link to={`/exercice/${d.exerciseId}`} className="list-item" aria-label={`Jour ${d.day} : ${d.title}${d.done ? ", terminé" : ""}`}>
                  <span className={`day-cell${d.done ? " done" : next?.day === d.day ? " today" : ""}`} style={{ width: 40, aspectRatio: "1", flexShrink: 0 }}>
                    {d.done ? <Check size={18} /> : d.day}
                  </span>
                  <span className="grow">
                    <span className="li-title">Jour {d.day} — {d.title}</span><br />
                    <span className="li-sub">{d.focus}</span>
                  </span>
                  <ChevronRight size={18} className="li-end" />
                </Link>
              </li>
            ))}
          </ol>

          <div className="row" style={{ justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>Changer d'objectif</button>
            <button className="btn btn-ghost btn-sm" onClick={async () => { if (window.confirm("Supprimer ce programme ?")) await deleteProgram(); }}>Supprimer</button>
          </div>
        </>
      )}
    </div>
  );
}
