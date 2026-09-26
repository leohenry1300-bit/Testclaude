import { useMemo } from "react";
import { Check, Ear, Flame, MessageSquareText, Repeat2, Users } from "lucide-react";
import {
  CHALLENGE_CATEGORY_LABELS, dailyChallenges, dayKey, realLifeStreak, type ChallengeCategory,
} from "@eloquence/core";
import { useAccount } from "../lib/store";
import { TopBar } from "../components/ui";

const CATEGORY_ICON: Record<ChallengeCategory, typeof Users> = {
  contact: Users,
  audace: Flame,
  expression: MessageSquareText,
  ecoute: Ear,
  quotidien: Repeat2,
};

export function Defis() {
  const { account, completeChallenge, uncompleteChallenge } = useAccount();
  const today = useMemo(() => dailyChallenges(new Date(), 3), []);
  const todayKey = dayKey(new Date());
  const doneToday = new Set(account.completedChallenges.filter((c) => c.date === todayKey).map((c) => c.challengeId));
  const { current, best } = realLifeStreak(account.completedChallenges);
  const totalDone = new Set(account.completedChallenges.map((c) => `${c.challengeId}:${c.date}`)).size;

  const toggle = async (id: string) => {
    if (doneToday.has(id)) await uncompleteChallenge(id, todayKey);
    else await completeChallenge(id, todayKey);
  };

  return (
    <div className="page no-nav">
      <TopBar title="Défis vie réelle" />
      <p className="muted" style={{ marginTop: -8 }}>
        Pas d'analyse, pas de score : juste des actions à faire avec de vraies personnes, pour t'habituer à parler
        et te sentir moins seul·e face à ça au quotidien.
      </p>

      <div className="grid-3">
        <div className="stat-tile">
          <span className="icon tone-warning"><Flame size={18} /></span>
          <div className="stat"><span className="v">{current} {current > 1 ? "jours" : "jour"}</span><span className="l">Série actuelle</span></div>
        </div>
        <div className="stat-tile">
          <span className="icon tone-primary"><Check size={18} /></span>
          <div className="stat"><span className="v">{totalDone}</span><span className="l">Défis relevés</span></div>
        </div>
        <div className="stat-tile">
          <span className="icon tone-success"><Repeat2 size={18} /></span>
          <div className="stat"><span className="v">{best}</span><span className="l">Meilleure série</span></div>
        </div>
      </div>

      <section className="stack" aria-labelledby="today-defis">
        <h2 id="today-defis" className="section-title">Aujourd'hui</h2>
        <div className="stack" style={{ gap: 10 }}>
          {today.map((ch) => {
            const done = doneToday.has(ch.id);
            const Ic = CATEGORY_ICON[ch.category];
            return (
              <button key={ch.id} className="card card-link" style={{ width: "100%", textAlign: "left", border: 0 }} onClick={() => void toggle(ch.id)}>
                <div className="row">
                  <span className="stat-tile" style={{ padding: 0, boxShadow: "none", background: "transparent" }}>
                    <span className={`icon ${done ? "tone-success" : "tone-primary"}`} style={{ width: 44, height: 44, borderRadius: 14 }}>
                      {done ? <Check size={20} /> : <Ic size={20} />}
                    </span>
                  </span>
                  <div className="grow">
                    <div className="tiny faint strong">{CHALLENGE_CATEGORY_LABELS[ch.category].toUpperCase()}</div>
                    <div className="strong" style={done ? { textDecoration: "line-through", opacity: 0.6 } : undefined}>{ch.title}</div>
                    <div className="small muted">{ch.description}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
