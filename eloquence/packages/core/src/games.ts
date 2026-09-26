import type { CategoryId, Dimension, GameConstraint } from "./types";
import type { Exercise } from "./exercises";
import { uid } from "./pipeline";
import { allSubjects, generateTopicActivity } from "./topics";

// A large library of short, self-contained training games. Each one is a
// data definition that the runner turns into an Exercise-shaped activity at
// launch time — so adding a new game never requires touching the UI.

export type GameGroup = "parasites" | "debit" | "improvisation" | "argumentation" | "vocabulaire" | "persuasion" | "storytelling" | "structure";

interface BuiltGame {
  prompt: string;
  instruction: string;
  stance?: string;
  constraint?: GameConstraint;
  category: CategoryId;
  focus: Dimension;
}

export interface Game {
  id: string;
  title: string;
  tagline: string;
  icon: string;
  group: GameGroup;
  durationSec: number;
  build: () => BuiltGame;
}

const FORBIDDABLE = ["euh", "du coup", "en fait", "genre", "voilà", "quoi", "donc"];
const THREE_WORD_POOL = [
  "valise", "orage", "clavier", "pont", "miroir", "sirène", "carnet", "boussole", "lanterne", "escalier",
  "aquarium", "trompette", "cactus", "tunnel", "marée", "grenier", "étincelle", "labyrinthe", "cerf-volant", "horloge",
];

function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  return out;
}

function randomTopicLabel(): string {
  const all = allSubjects();
  return all[Math.floor(Math.random() * all.length)].label;
}

function randomStance(): string {
  const label = randomTopicLabel();
  const c = label.charAt(0).toUpperCase() + label.slice(1);
  return /[.!?]$/.test(c) ? c : c + ".";
}

function randomPrompt(): { prompt: string; instruction: string } {
  const t = allSubjects()[Math.floor(Math.random() * allSubjects().length)];
  const a = generateTopicActivity(t);
  return { prompt: a.prompt, instruction: a.instruction };
}

export const GAMES: Game[] = [
  {
    id: "g-roulette", title: "Roulette des sujets", tagline: "Un sujet totalement aléatoire", icon: "Dices", group: "improvisation", durationSec: 60,
    build: () => ({ ...randomPrompt(), category: "improvisation", focus: "fluidite" }),
  },
  {
    id: "g-60s", title: "60 secondes", tagline: "Parler exactement une minute", icon: "Timer", group: "improvisation", durationSec: 60,
    build: () => { const p = randomPrompt(); return { prompt: p.prompt, instruction: "Tiens exactement 60 secondes, ni plus ni moins.", category: "improvisation", focus: "debit" }; },
  },
  {
    id: "g-30s", title: "30 secondes chrono", tagline: "Très rapide, va à l'essentiel", icon: "Zap", group: "improvisation", durationSec: 30,
    build: () => { const p = randomPrompt(); return { prompt: p.prompt, instruction: "30 secondes seulement : une idée, un exemple, c'est tout.", category: "improvisation", focus: "concision" }; },
  },
  {
    id: "g-3min", title: "3 minutes", tagline: "Développer un sujet en profondeur", icon: "Hourglass", group: "improvisation", durationSec: 180,
    build: () => { const p = randomPrompt(); return { prompt: p.prompt, instruction: "Développe : introduis, illustre par deux exemples, conclus.", category: "presentation", focus: "structure" }; },
  },
  {
    id: "g-mot-interdit", title: "Mot interdit", tagline: "Parler sans utiliser certains mots", icon: "Ban", group: "parasites", durationSec: 60,
    build: () => {
      const words = pickN(["truc", "chose", "genre", "quoi", "bien", "très"], 2);
      const p = randomPrompt();
      return { prompt: p.prompt, instruction: `Interdit de dire : ${words.map((w) => `« ${w} »`).join(", ")}.`, constraint: { type: "forbidden_words", words }, category: "improvisation", focus: "vocabulaire" };
    },
  },
  {
    id: "g-sans-euh", title: "Sans « euh »", tagline: "Zéro mot parasite", icon: "VolumeX", group: "parasites", durationSec: 60,
    build: () => { const p = randomPrompt(); return { prompt: p.prompt, instruction: "Défi à zéro tolérance : aucun « euh », « du coup », « en fait »… Remplace par un silence.", constraint: { type: "forbidden_words", words: FORBIDDABLE }, category: "improvisation", focus: "parasites" }; },
  },
  {
    id: "g-debit-controle", title: "Débit contrôlé", tagline: "Respecter une vitesse précise", icon: "Gauge", group: "debit", durationSec: 60,
    build: () => { const p = randomPrompt(); return { prompt: p.prompt, instruction: "Vise 130 à 150 mots par minute, ni plus vite ni plus lentement.", constraint: { type: "pace_target", min: 125, max: 155 }, category: "improvisation", focus: "debit" }; },
  },
  {
    id: "g-trois-mots", title: "Trois mots", tagline: "Invente une histoire avec 3 mots imposés", icon: "Shuffle", group: "storytelling", durationSec: 75,
    build: () => { const words = pickN(THREE_WORD_POOL, 3); return { prompt: `Invente une histoire en 75 secondes en utilisant ces trois mots : ${words.join(", ")}.`, instruction: "Utilise chaque mot au moins une fois. Une histoire a un début, un problème, une fin.", constraint: { type: "must_include", words }, category: "storytelling", focus: "structure" }; },
  },
  {
    id: "g-histoire-impossible", title: "Histoire impossible", tagline: "Contraintes absurdes imposées", icon: "Wand2", group: "storytelling", durationSec: 75,
    build: () => {
      const constraint = pickN(["sans jamais utiliser le mot « et »", "en commençant par la fin", "du point de vue d'un objet", "sans aucun nom propre"], 1)[0];
      const character = pickN(["astronaute retraité", "chat détective", "boulanger insomniaque", "pirate végétarien"], 1)[0];
      return { prompt: `Invente une histoire complètement improbable, avec ce personnage : un ${character}.`, instruction: `Contrainte supplémentaire : ${constraint}.`, category: "storytelling", focus: "structure" };
    },
  },
  {
    id: "g-eli5", title: "Explique-moi comme si j'avais 5 ans", tagline: "Vulgarisation totale", icon: "Baby", group: "vocabulaire", durationSec: 60,
    build: () => ({ prompt: `Explique « ${randomTopicLabel()} » à un enfant de 5 ans.`, instruction: "Aucun mot compliqué. Utilise une image simple.", category: "culture", focus: "clarte" }),
  },
  {
    id: "g-eli-expert", title: "Explique-moi comme à un expert", tagline: "Même sujet, niveau complexe", icon: "GraduationCap", group: "vocabulaire", durationSec: 75,
    build: () => ({ prompt: `Explique « ${randomTopicLabel()} » à un expert du domaine.`, instruction: "Vocabulaire précis, pas de simplification excessive.", category: "culture", focus: "vocabulaire" }),
  },
  {
    id: "g-avocat-diable", title: "Avocat du diable", tagline: "Défendre une position imposée", icon: "Swords", group: "argumentation", durationSec: 60,
    build: () => ({ prompt: "Défends cette position, même si elle ne te convainc pas.", stance: randomStance(), instruction: "L'objectif : trouver les meilleurs arguments possibles, quelle que soit ton opinion réelle.", category: "debat", focus: "argumentation" }),
  },
  {
    id: "g-contre-argument", title: "Contre-argument", tagline: "Réfuter un argument imposé", icon: "ShieldAlert", group: "argumentation", durationSec: 45,
    build: () => ({ prompt: `Voici un argument : « ${randomStance()} » Réfute-le.`, instruction: "Trouve la faille, puis propose une meilleure vision.", category: "debat", focus: "argumentation" }),
  },
  {
    id: "g-debat-express", title: "Débat express", tagline: "30 secondes pour défendre une position", icon: "Flame", group: "argumentation", durationSec: 30,
    build: () => ({ prompt: "Défends cette position en 30 secondes.", stance: randomStance(), instruction: "Va droit à l'argument le plus fort.", category: "debat", focus: "persuasion" }),
  },
  {
    id: "g-debat-inverse", title: "Débat inversé", tagline: "Défendre l'avis contraire au tien", icon: "RefreshCcw", group: "argumentation", durationSec: 60,
    build: () => ({ prompt: "Choisis un sujet sur lequel tu as un avis tranché, puis défends l'avis inverse pendant 60 secondes.", instruction: "L'objectif : sortir de ta zone de confort argumentative.", category: "debat", focus: "argumentation" }),
  },
  {
    id: "g-question-piege", title: "Question piège", tagline: "Une question inattendue", icon: "HelpCircle", group: "improvisation", durationSec: 45,
    build: () => ({ prompt: pickN(["Si tu devais renoncer à un sens, lequel choisirais-tu ?", "Quel est le pire conseil qu'on t'ait donné ?", "Que ferais-tu si tu ne pouvais plus jamais mentir ?", "Quelle règle absurde aimerais-tu abolir ?"], 1)[0], instruction: "Pas de temps pour préparer : réponds tout de suite.", category: "improvisation", focus: "confiance" }),
  },
  {
    id: "g-question-impossible", title: "Question impossible", tagline: "Répondre sans préparation à une question très difficile", icon: "Puzzle", group: "argumentation", durationSec: 60,
    build: () => ({ prompt: pickN(["Combien de dentistes y a-t-il en France, et comment le sait-on ?", "Pourquoi le ciel est-il bleu, en une minute ?", "Comment estimer le nombre de pianos accordés dans ta ville ?"], 1)[0], instruction: "Réfléchis à voix haute, montre ton raisonnement plutôt qu'une réponse toute faite.", category: "culture", focus: "argumentation" }),
  },
  {
    id: "g-pitch-express", title: "Pitch express", tagline: "Vendre quelque chose en 30 secondes", icon: "Rocket", group: "persuasion", durationSec: 30,
    build: () => ({ prompt: `Vends « ${pickN(["un parapluie sur la lune", "un abonnement à un journal papier", "une brosse à dents connectée", "un cours de macramé"], 1)[0]} » en 30 secondes.`, instruction: "Un problème, une solution, un appel à l'action.", category: "pitch", focus: "persuasion" }),
  },
  {
    id: "g-objection", title: "Objection", tagline: "Le client formule une objection, tu réponds", icon: "MessageSquareWarning", group: "persuasion", durationSec: 45,
    build: () => ({ prompt: `Le client dit : ${pickN(["« C'est trop cher. »", "« Je vais réfléchir. »", "« Votre concurrent est moins cher. »", "« Je n'en ai pas besoin maintenant. »"], 1)[0]} Réponds.`, instruction: "Reformule l'objection, puis apporte une preuve concrète.", category: "pro", focus: "persuasion" }),
  },
  {
    id: "g-resume", title: "Résumé", tagline: "Résume ce que tu viens de lire en 30 secondes", icon: "FileText", group: "structure", durationSec: 30,
    build: () => ({ prompt: "Résume en 30 secondes le dernier article, livre ou vidéo que tu as consulté.", instruction: "L'essentiel seulement : de quoi ça parle, et pourquoi c'est intéressant.", category: "presentation", focus: "concision" }),
  },
  {
    id: "g-reformulation", title: "Reformulation", tagline: "Dire la même chose de trois façons différentes", icon: "Repeat", group: "vocabulaire", durationSec: 60,
    build: () => ({ prompt: `Explique « ${randomTopicLabel()} » de trois manières différentes : simple, professionnelle, puis imagée.`, instruction: "Marque une courte pause entre chaque version.", category: "culture", focus: "vocabulaire" }),
  },
  {
    id: "g-synonymes", title: "Synonymes", tagline: "Ne jamais répéter le même mot important", icon: "SpellCheck", group: "vocabulaire", durationSec: 60,
    build: () => { const p = randomPrompt(); return { prompt: p.prompt, instruction: "Interdiction de répéter deux fois le même mot important : varie sans cesse.", constraint: { type: "no_repeat_word" }, category: "improvisation", focus: "vocabulaire" }; },
  },
  {
    id: "g-mot-du-jour", title: "Mot du jour", tagline: "Utiliser un mot imposé naturellement", icon: "Type", group: "vocabulaire", durationSec: 60,
    build: () => { const word = pickN(["néanmoins", "singulier", "foisonnant", "in fine", "à contre-courant", "tangible", "inéluctable"], 1); const p = randomPrompt(); return { prompt: p.prompt, instruction: `Place le mot « ${word[0]} » naturellement dans ta réponse.`, constraint: { type: "must_include", words: word }, category: "improvisation", focus: "vocabulaire" }; },
  },
  {
    id: "g-sans-preparation", title: "Sans préparation", tagline: "Sujet aléatoire, zéro seconde de réflexion", icon: "Shuffle", group: "improvisation", durationSec: 60,
    build: () => { const p = randomPrompt(); return { prompt: p.prompt, instruction: "Démarre l'enregistrement immédiatement, sans réfléchir avant.", category: "improvisation", focus: "fluidite" }; },
  },
  {
    id: "g-cinq-pourquoi", title: "5 pourquoi", tagline: "Creuser une réflexion progressivement", icon: "ListTree", group: "argumentation", durationSec: 90,
    build: () => ({ prompt: `Pars de ce constat : « ${randomTopicLabel()} ». Demande-toi « pourquoi » cinq fois de suite, à voix haute, et développe chaque réponse.`, instruction: "Chaque « pourquoi » doit creuser plus profond que le précédent.", category: "culture", focus: "argumentation" }),
  },
  {
    id: "g-socratique", title: "Question socratique", tagline: "Approfondir ta pensée par questionnement", icon: "MessageCircleQuestion", group: "argumentation", durationSec: 90,
    build: () => ({ prompt: "Choisis une opinion que tu tiens pour évidente, puis mets-la à l'épreuve : qu'est-ce qui la justifie vraiment ? Quelle serait la meilleure objection possible ?", instruction: "Parle comme si tu te questionnais toi-même à voix haute.", category: "culture", focus: "argumentation" }),
  },
];

export function getGame(id: string): Game | undefined {
  return GAMES.find((g) => g.id === id);
}

export function gamesByGroup(group: GameGroup): Game[] {
  return GAMES.filter((g) => g.group === group);
}

export const GAME_GROUPS: { id: GameGroup; title: string }[] = [
  { id: "parasites", title: "Anti mots parasites" },
  { id: "debit", title: "Rythme & débit" },
  { id: "improvisation", title: "Improvisation" },
  { id: "argumentation", title: "Argumentation & débat" },
  { id: "vocabulaire", title: "Vocabulaire" },
  { id: "persuasion", title: "Persuasion & vente" },
  { id: "storytelling", title: "Storytelling" },
  { id: "structure", title: "Structure" },
];

/** Turns a Game into a launchable, Exercise-shaped activity plus its
 * constraint (built exactly once, so both stay consistent). */
export function buildGameActivity(game: Game): { exercise: Exercise; constraint?: GameConstraint } {
  const built = game.build();
  const exercise: Exercise = {
    id: uid(`jeu_${game.id}_`),
    category: built.category,
    title: game.title,
    prompt: built.prompt,
    instruction: built.instruction,
    stance: built.stance,
    durationSec: game.durationSec,
    focus: built.focus,
  };
  return { exercise, constraint: built.constraint };
}
