import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Check, ClipboardCheck, Mic } from "lucide-react";
import { DIAGNOSTIC_STEPS, diagnosticActivity, DIMENSION_LABELS, type DiagnosticStepResult } from "@eloquence/core";
import { useAccount } from "../lib/store";
import { useLaunchActivity } from "../lib/launch";
import { TopBar } from "../components/ui";

const KEY = "eloquence:diagnostic:progress";

function load(): DiagnosticStepResult[] {
  try { return JSON.parse(sessionStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}
function save(steps: DiagnosticStepResult[]) {
  try { sessionStorage.setItem(KEY, JSON.stringify(steps)); } catch { /* ignore */ }
}
function clear() {
  try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
}

export function Diagnostic() {
  const location = useLocation() as { state?: { stepResult?: DiagnosticStepResult } };
  const { account, finalizeDiagnostic, toast } = useAccount();
  const launch = useLaunchActivity();
  const nav = useNavigate();
  const [steps, setSteps] = useState<DiagnosticStepResult[]>(load);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const r = location.state?.stepResult;
    if (r && !steps.some((s) => s.stepId === r.stepId)) {
      const next = [...steps, r];
      setSteps(next);
      save(next);
      window.history.replaceState({}, "");
    }
  }, [location.state, steps]);

  const total = DIAGNOSTIC_STEPS.length;
  const done = steps.length;
  const current = DIAGNOSTIC_STEPS[done];

  const start = () => {
    if (!current) return;
    const activity = diagnosticActivity(current.id);
    launch(activity, { source: "diagnostic", diagnostic: { stepId: current.id, title: current.title, index: done + 1, total } });
  };

  const finish = async () => {
    setBusy(true);
    try {
      await finalizeDiagnostic(steps);
      clear();
      setSteps([]);
      toast("Diagnostic terminé. Ton bilan est prêt.", "success");
      nav("/diagnostic/bilan", { replace: true });
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy(false);
    }
  };

  if (account.user.diagnosticDone && done === 0) {
    return (
      <div className="page no-nav">
        <TopBar title="Diagnostic" />
        <div className="card center stack" style={{ alignItems: "center" }}>
          <ClipboardCheck size={28} className="faint" />
          <p className="muted">Tu as déjà fait ton diagnostic initial.</p>
          <button className="btn btn-outline" onClick={() => { clear(); setSteps([]); }}>Refaire le diagnostic</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page no-nav">
      <TopBar title="Diagnostic initial" />
      <p className="muted center">8 tests courts et variés pour établir ton niveau de départ, réellement mesuré — pas deviné.</p>
      <div className="progress"><div style={{ width: `${(done / total) * 100}%` }} /></div>
      <div className="list">
        {DIAGNOSTIC_STEPS.map((s, i) => (
          <div key={s.id} className="list-item" style={{ cursor: "default" }}>
            <span className={`day-cell${i < done ? " done" : i === done ? " today" : ""}`} style={{ width: 36, aspectRatio: "1", flexShrink: 0 }}>
              {i < done ? <Check size={16} /> : i + 1}
            </span>
            <span className="grow"><span className="li-title">{s.title}</span><br /><span className="li-sub">{s.description}</span></span>
          </div>
        ))}
      </div>
      {current ? (
        <button className="btn btn-primary btn-lg btn-block" onClick={start}><Mic size={18} />{done === 0 ? "Commencer le diagnostic" : `Continuer — étape ${done + 1}/${total}`}</button>
      ) : (
        <button className="btn btn-primary btn-lg btn-block" onClick={() => void finish()} disabled={busy}>{busy && <span className="spinner" />}Voir mon bilan</button>
      )}
    </div>
  );
}

export function DiagnosticReportPage() {
  const { account } = useAccount();
  const r = account.diagnostic;
  if (!r) return <div className="page no-nav"><TopBar title="Bilan" /><p className="muted center">Aucun diagnostic pour l'instant.</p></div>;
  return (
    <div className="page no-nav">
      <TopBar title="Ton bilan initial" />
      <section className="card center">
        <div className="eyebrow">Score global de départ</div>
        <div className="display" style={{ fontSize: 44, margin: "10px 0" }}>{r.averageScores.global}<span className="faint" style={{ fontSize: 20 }}>/100</span></div>
        <p>{r.summary}</p>
      </section>
      <section className="card">
        <h2 style={{ fontSize: 18, marginBottom: 14 }}>Détail par compétence</h2>
        <div className="dim-bars">
          {Object.entries(r.averageScores).filter(([k]) => k !== "global").map(([k, v]) => (
            <div className="dim-bar" key={k}>
              <span className="name">{DIMENSION_LABELS[k as keyof typeof DIMENSION_LABELS]}</span>
              <span className="val">{v}<small>/100</small></span>
              <div className="track"><div className="fill" style={{ width: `${v}%` }} /></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
