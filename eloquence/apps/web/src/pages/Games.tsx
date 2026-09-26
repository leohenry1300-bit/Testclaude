import { Dices } from "lucide-react";
import { GAME_GROUPS, gamesByGroup, buildGameActivity, formatDuration } from "@eloquence/core";
import { useLaunchActivity } from "../lib/launch";
import { Icon, TopBar } from "../components/ui";

export function Games() {
  const launch = useLaunchActivity();
  return (
    <div className="page no-nav">
      <TopBar title="Jeux" />
      <p className="muted center"><Dices size={16} style={{ verticalAlign: -2 }} /> Chaque partie tire un nouveau sujet ou une nouvelle contrainte.</p>
      {GAME_GROUPS.map((grp) => {
        const games = gamesByGroup(grp.id);
        if (!games.length) return null;
        return (
          <section key={grp.id} className="stack" aria-labelledby={`grp-${grp.id}`}>
            <h2 id={`grp-${grp.id}`} className="section-title">{grp.title}</h2>
            <div className="list">
              {games.map((game) => (
                <button key={game.id} className="list-item" onClick={() => { const built = buildGameActivity(game); launch(built.exercise, { source: "jeu", constraint: built.constraint }); }}>
                  <span className="li-icon"><Icon name={game.icon} size={18} /></span>
                  <span className="grow">
                    <span className="li-title">{game.title}</span><br />
                    <span className="li-sub">{game.tagline} · {formatDuration(game.durationSec)}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
