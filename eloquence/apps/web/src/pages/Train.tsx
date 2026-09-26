import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronRight, Clock, Dices, Gamepad2, Mic, RotateCcw, Users as UsersIcon } from "lucide-react";
import {
  CATEGORIES, EXERCISES, EXERCISES_ALL, formatDuration, GAME_GROUPS, GAMES, uid, type CategoryId, type Exercise,
} from "@eloquence/core";
import { useAccount } from "../lib/store";
import { useLaunchActivity } from "../lib/launch";
import { Icon } from "../components/ui";

const CUSTOM_DURATIONS = [30, 60, 90, 120, 180];

function CustomTopicCard() {
  const launch = useLaunchActivity();
  const [text, setText] = useState("");
  const [category, setCategory] = useState<CategoryId>("improvisation");
  const [durationSec, setDurationSec] = useState(60);

  const start = () => {
    const prompt = text.trim();
    if (!prompt) return;
    const exercise: Exercise = {
      id: uid("perso_"),
      category,
      title: prompt.length > 60 ? `${prompt.slice(0, 57)}…` : prompt,
      prompt,
      instruction: "Réponds comme tu le ferais vraiment dans cette situation précise.",
      durationSec,
      focus: "clarte",
    };
    launch(exercise, { source: "libre" });
  };

  return (
    <section className="card stack" aria-labelledby="custom-topic-title">
      <div>
        <h2 id="custom-topic-title" style={{ fontSize: 17 }}>Entraîne-toi sur ta situation</h2>
        <p className="small muted" style={{ marginTop: 4 }}>Une vraie question qu'on va te poser, un sujet précis à préparer : écris-le et entraîne-toi dessus, avec la même analyse que le reste.</p>
      </div>
      <textarea
        className="textarea"
        rows={3}
        maxLength={2000}
        placeholder="Ex : « Pourquoi voulez-vous nous rejoindre alors que vous n'avez jamais travaillé dans ce secteur ? »"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
        <select className="select" style={{ minHeight: 40, flex: "1 1 160px" }} value={category} onChange={(e) => setCategory(e.target.value as CategoryId)} aria-label="Catégorie">
          {CATEGORIES.filter((c) => c.id !== "libre").map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <select className="select" style={{ minHeight: 40, width: 110 }} value={durationSec} onChange={(e) => setDurationSec(Number(e.target.value))} aria-label="Durée">
          {CUSTOM_DURATIONS.map((s) => <option key={s} value={s}>{formatDuration(s)}</option>)}
        </select>
      </div>
      <button className="btn btn-primary btn-block" disabled={!text.trim()} onClick={start}><Mic size={16} />S'entraîner sur ce sujet</button>
    </section>
  );
}

export function Train() {
  const { account } = useAccount();
  const [params, setParams] = useSearchParams();
  const active = (params.get("c") as CategoryId | null) ?? null;
  // The full generated catalogue runs into the hundreds per category —
  // great once you've picked a category, but far too many DOM nodes to
  // dump on screen at once. "Tout" (no filter) shows the curated highlights
  // instead; picking a category reveals its full depth.
  const list = active ? EXERCISES_ALL.filter((e) => e.category === active) : EXERCISES;
  const best = new Map<string, number>();
  for (const s of account.sessions) best.set(s.exerciseId, Math.max(best.get(s.exerciseId) ?? 0, s.score));

  return (
    <div className="page">
      <header>
        <h1 className="page-title">S'entraîner</h1>
        <p className="page-sub">Exercices, jeux, sujets, simulations. Tout est ouvert, tout de suite.</p>
      </header>

      <CustomTopicCard />

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
            const count = EXERCISES_ALL.filter((e) => e.category === c.id).length;
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
