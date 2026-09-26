import { useState } from "react";
import { Dices } from "lucide-react";
import { TOPIC_CATEGORIES, TOPIC_COUNT, allSubjects, generateTopicActivity, pickTopic, type TopicCategory } from "@eloquence/core";
import { useLaunchActivity } from "../lib/launch";
import { Icon, TopBar } from "../components/ui";

export function Topics() {
  const launch = useLaunchActivity();
  const [category, setCategory] = useState<TopicCategory | null>(null);
  const subjects = allSubjects(category ?? undefined).slice(0, 60);

  const roulette = () => {
    const { activity } = pickTopic({ category: category ?? undefined });
    launch(activity, { source: "sujet" });
  };

  return (
    <div className="page no-nav">
      <TopBar title="Sujets" />
      <p className="muted center">{TOPIC_COUNT}+ sujets, combinés à plusieurs façons d'y répondre : jamais deux fois pareil.</p>

      <button className="hero-card" style={{ border: 0, cursor: "pointer", width: "100%", textAlign: "left" }} onClick={roulette}>
        <span className="eyebrow">Roulette</span>
        <h2 style={{ fontSize: 22 }}><Dices size={22} style={{ verticalAlign: -3, marginRight: 6 }} />Sujet au hasard{category ? ` · ${TOPIC_CATEGORIES.find((c) => c.id === category)?.title}` : ""}</h2>
        <span className="btn btn-light" style={{ marginTop: 12, pointerEvents: "none" }}>Tirer un sujet</span>
      </button>

      <div className="chips" role="group" aria-label="Catégories">
        <button className="chip" aria-pressed={!category} onClick={() => setCategory(null)}>Tout</button>
        {TOPIC_CATEGORIES.map((c) => (
          <button key={c.id} className="chip" aria-pressed={category === c.id} onClick={() => setCategory(c.id)}>{c.title}</button>
        ))}
      </div>

      <div className="list">
        {subjects.map((t) => (
          <button key={t.id} className="list-item" onClick={() => launch(generateTopicActivity(t), { source: "sujet" })}>
            <span className="li-icon"><Icon name={TOPIC_CATEGORIES.find((c) => c.id === t.category)!.icon} size={18} /></span>
            <span className="grow li-title" style={{ textTransform: "capitalize" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
