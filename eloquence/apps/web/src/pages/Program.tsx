import { useState } from "react";
import { Check, ChevronRight, Mic, Sparkles } from "lucide-react";
import { GOAL_SUGGESTIONS, PROGRAM_TEMPLATES, nextProgramDay, getExercise, getGame, buildGameActivity, getLesson } from "@eloquence/core";
import { useAccount } from "../lib/store";
import { useLaunchActivity } from "../lib/launch";
import { Icon, TopBar } from "../components/ui";

export function Program() {
  const { account, createProgramFromGoal, createProgramFromTemplate, deleteProgram, toast } = useAccount();
  const launch = useLaunchActivity();
  const [goal, setGoal] = useState(account.user.goalText ?? "");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(!account.program);
  const program = account.program;
  const next = nextProgramDay(program);
  const done = program?.days.filter((d) => d.done).length ?? 0;

  const buildFromGoal = async () => {
    setBusy(true);
    try {
      await createProgramFromGoal(goal.trim());
      setEditing(false);
      toast("Ton programme est prêt.", "success");
    } catch (e) { toast((e as Error).message, "error"); } finally { setBusy(false); }
  };

  const buildFromTemplate = async (id: string) => {
    setBusy(true);
    try {
      await createProgramFromTemplate(id);
      setEditing(false);
      toast("Programme lancé.", "success");
    } catch (e) { toast((e as Error).message, "error"); } finally { setBusy(false); }
  };

  const launchDay = () => {
    if (!next) return;
    if (next.kind === "exercise") { const ex = getExercise(next.activityId); if (ex) launch(ex, { source: "programme" }); }
    else if (next.kind === "game") { const g = getGame(next.activityId); if (g) { const built = buildGameActivity(g); launch(built.exercise, { source: "jeu", constraint: built.constraint }); } }
    else if (next.kind === "lesson") window.location.assign(`/bibliotheque/lecon/${next.activityId}`);
  };

  return (
    <div className="page no-nav">
      <TopBar title="Mon programme" />

      {editing || !program ? (
        <section className="stack-lg">
          <div>
            <h1 className="page-title">Choisis un programme</h1>
            <p className="page-sub">Un parcours prêt à l'emploi, ou un programme construit pour ton objectif précis.</p>
          </div>

          <div className="stack" style={{ gap: 8 }}>
            <span className="section-title">Parcours prêts à l'emploi</span>
            {PROGRAM_TEMPLATES.map((t) => (
              <button key={t.id} className="choice" style={{ padding: "14px" }} onClick={() => void buildFromTemplate(t.id)} disabled={busy}>
                <span className="choice-icon"><Icon name={t.icon} size={20} /></span>
                <span><span className="choice-title">{t.title}</span><br /><span className="choice-sub">{t.tagline} · {t.days} jours</span></span>
                <ChevronRight size={18} className="check" style={{ opacity: 1 }} />
              </button>
            ))}
          </div>

          <div className="stack" style={{ gap: 10 }}>
            <span className="section-title">Ou décris ton objectif</span>
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
            <button className="btn btn-primary btn-lg btn-block" onClick={() => void buildFromGoal()} disabled={busy || goal.trim().length < 3}>
              {busy ? <span className="spinner" /> : <Sparkles size={18} />}Construire mon programme
            </button>
          </div>
          {program && <button className="btn btn-ghost btn-block" onClick={() => setEditing(false)}>Annuler</button>}
        </section>
      ) : (
        <>
          <section className="card">
            <div className="eyebrow">{program.templateId ? "Programme" : "Programme personnalisé"}</div>
            <h1 className="display" style={{ fontSize: 24, margin: "6px 0 10px" }}>{program.title !== "Programme personnalisé" ? program.title : `« ${program.goalText} »`}</h1>
            <div className="row-between small muted" style={{ marginBottom: 8 }}><span>{done} jour{done > 1 ? "s" : ""} sur {program.days.length}</span><span>{Math.round((done / program.days.length) * 100)} %</span></div>
            <div className="progress" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={program.days.length} aria-label="Avancement du programme"><div style={{ width: `${(done / program.days.length) * 100}%` }} /></div>
            {next ? (
              <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 18 }} onClick={launchDay}><Mic size={18} />Jour {next.day} : {next.title}</button>
            ) : (
              <p className="form-info" style={{ marginTop: 18 }}>Programme terminé. Compare ta dernière session avec celle du jour 1 : c'est ton vrai progrès.</p>
            )}
          </section>

          <ol className="list" style={{ padding: 0, margin: 0, listStyle: "none" }}>
            {program.days.map((d) => (
              <li key={d.day}>
                <button className="list-item" style={{ width: "100%", textAlign: "left" }} aria-label={`Jour ${d.day} : ${d.title}${d.done ? ", terminé" : ""}`}
                  onClick={() => {
                    if (d.kind === "exercise") { const ex = getExercise(d.activityId); if (ex) launch(ex, { source: "programme" }); }
                    else if (d.kind === "game") { const g = getGame(d.activityId); if (g) { const built = buildGameActivity(g); launch(built.exercise, { source: "jeu", constraint: built.constraint }); } }
                    else if (d.kind === "lesson") { const l = getLesson(d.activityId); if (l) window.location.assign(`/bibliotheque/lecon/${l.id}`); }
                  }}>
                  <span className={`day-cell${d.done ? " done" : next?.day === d.day ? " today" : ""}`} style={{ width: 40, aspectRatio: "1", flexShrink: 0 }}>
                    {d.done ? <Check size={18} /> : d.day}
                  </span>
                  <span className="grow">
                    <span className="li-title">Jour {d.day} — {d.title}</span><br />
                    <span className="li-sub">{d.focus}</span>
                  </span>
                  <ChevronRight size={18} className="li-end" />
                </button>
              </li>
            ))}
          </ol>

          <div className="row" style={{ justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>Changer de programme</button>
            <button className="btn btn-ghost btn-sm" onClick={async () => { if (window.confirm("Supprimer ce programme ?")) await deleteProgram(); }}>Supprimer</button>
          </div>
        </>
      )}
    </div>
  );
}
