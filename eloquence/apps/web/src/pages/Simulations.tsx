import { useNavigate } from "react-router-dom";
import { SIMULATIONS } from "@eloquence/core";
import { Icon, TopBar } from "../components/ui";

export function Simulations() {
  const nav = useNavigate();
  return (
    <div className="page no-nav">
      <TopBar title="Simulations" />
      <p className="muted center">Le coach incarne un personnage sur plusieurs répliques. Réponds comme tu le ferais à l'oral.</p>
      <div className="list">
        {SIMULATIONS.map((sim) => (
          <button key={sim.id} className="list-item" onClick={() => nav(`/coach?start=${sim.id}`)}>
            <span className="li-icon"><Icon name={sim.icon} size={18} /></span>
            <span className="grow">
              <span className="li-title">{sim.title}</span><br />
              <span className="li-sub">{sim.persona} · {sim.questions.length} répliques</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
