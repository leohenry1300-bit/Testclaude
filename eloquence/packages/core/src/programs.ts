import type { Dimension, Goal, Program, ProgramDay } from "./types";
import { uid } from "./pipeline";

type Template = { title: string; focus: string; exerciseId: string }[];

const FOUNDATION: Template = [
  { title: "Se présenter", focus: "Poser une première impression claire", exerciseId: "entretien-presentation" },
  { title: "Parler spontanément", focus: "Lancer sa parole sans préparation", exerciseId: "impro-passion" },
  { title: "Réduire les hésitations", focus: "Remplacer les « euh » par des pauses", exerciseId: "pron-rythme" },
  { title: "Structurer une réponse", focus: "Annonce, développement, conclusion", exerciseId: "pres-sujet" },
  { title: "Pitch de 60 secondes", focus: "Aller à l'essentiel", exerciseId: "pitch-soi" },
];

const TRACKS: Record<string, Template> = {
  entretiens: [
    { title: "Pourquoi nous ?", focus: "Relier ton parcours à l'entreprise", exerciseId: "entretien-motivation" },
    { title: "Ta principale qualité", focus: "Prouver avec un exemple concret", exerciseId: "entretien-qualite" },
    { title: "Une difficulté surmontée", focus: "Méthode STAR", exerciseId: "entretien-difficulte" },
    { title: "Ton principal défaut", focus: "Rester honnête et constructif", exerciseId: "entretien-defaut" },
    { title: "Dans cinq ans", focus: "Montrer une vision", exerciseId: "entretien-5ans" },
    { title: "Répondre à une objection", focus: "Garder son calme sous la pression", exerciseId: "pro-objection" },
    { title: "Articulation", focus: "Une diction nette sous le stress", exerciseId: "pron-articulation" },
    { title: "Pitch personnel", focus: "La version 30 secondes", exerciseId: "pitch-soi" },
    { title: "Simulation complète", focus: "Te présenter comme le jour J", exerciseId: "entretien-presentation" },
  ],
  presentations: [
    { title: "Un livre ou un film", focus: "Captiver dès l'introduction", exerciseId: "pres-livre" },
    { title: "Ton dernier projet", focus: "Objectif, démarche, résultat", exerciseId: "pres-projet" },
    { title: "Rythme et pauses", focus: "Laisser respirer ton propos", exerciseId: "pron-rythme" },
    { title: "Présenter un projet", focus: "Parler à une direction", exerciseId: "pro-projet" },
    { title: "Intonation", focus: "Varier pour garder l'attention", exerciseId: "pron-intonation" },
    { title: "Prendre la parole en réunion", focus: "Être entendu du premier coup", exerciseId: "pro-reunion" },
    { title: "Exposé express", focus: "Plan annoncé, plan tenu", exerciseId: "pres-sujet" },
    { title: "Présentation de 5 minutes", focus: "Tenir la distance", exerciseId: "pres-long" },
    { title: "Répéter la présentation", focus: "Mesurer tes progrès", exerciseId: "pres-sujet" },
  ],
  convaincre: [
    { title: "Vends ta ville", focus: "Des arguments qui donnent envie", exerciseId: "impro-ville" },
    { title: "Un produit du quotidien", focus: "Problème, solution, preuve", exerciseId: "pitch-produit" },
    { title: "Convaincre un client", focus: "Rassurer et conclure", exerciseId: "pro-client" },
    { title: "Répondre à une objection", focus: "Transformer un non en peut-être", exerciseId: "pro-objection" },
    { title: "Le télétravail", focus: "Prendre position nettement", exerciseId: "debat-teletravail" },
    { title: "Une idée à financer", focus: "Convaincre un investisseur", exerciseId: "pitch-idee" },
    { title: "Demander une augmentation", focus: "S'appuyer sur des faits", exerciseId: "pro-augmentation" },
    { title: "Intonation", focus: "Une voix qui affirme", exerciseId: "pron-intonation" },
    { title: "Pitch final", focus: "Mesurer tes progrès", exerciseId: "pitch-produit" },
  ],
  improviser: [
    { title: "Ton métier idéal", focus: "Démarrer sans réfléchir", exerciseId: "impro-metier" },
    { title: "L'objet du quotidien", focus: "Trouver quoi dire sur tout", exerciseId: "impro-objet" },
    { title: "Une compétence pour tous", focus: "Argumenter à chaud", exerciseId: "impro-competence" },
    { title: "Les réseaux sociaux", focus: "Choisir un camp vite", exerciseId: "debat-reseaux" },
    { title: "Un souvenir marquant", focus: "Raconter une histoire", exerciseId: "impro-souvenir" },
    { title: "L'IA au travail", focus: "Construire en parlant", exerciseId: "debat-ia" },
    { title: "Vends ta ville", focus: "L'enthousiasme spontané", exerciseId: "impro-ville" },
    { title: "Répondre à une objection", focus: "Rebondir sans préparation", exerciseId: "pro-objection" },
    { title: "Improvisation libre", focus: "Mesurer tes progrès", exerciseId: "impro-passion" },
  ],
  parasites: [
    { title: "Rythme et pauses", focus: "Le silence remplace le « euh »", exerciseId: "pron-rythme" },
    { title: "Un sujet qui te passionne", focus: "Zéro « du coup »", exerciseId: "impro-passion" },
    { title: "Articulation", focus: "Ralentir pour mieux contrôler", exerciseId: "pron-articulation" },
    { title: "Ton métier idéal", focus: "Des phrases courtes et nettes", exerciseId: "impro-metier" },
    { title: "Prendre la parole en réunion", focus: "Des attaques de phrase propres", exerciseId: "pro-reunion" },
    { title: "Une compétence pour tous", focus: "Remplacer « en fait » par rien", exerciseId: "impro-competence" },
    { title: "Pitch personnel", focus: "30 secondes sans parasite", exerciseId: "pitch-soi" },
    { title: "Le télétravail", focus: "Argumenter sans tic", exerciseId: "debat-teletravail" },
    { title: "Bilan", focus: "Compare avec le jour 2", exerciseId: "impro-passion" },
  ],
};

const GOAL_TRACK: Record<Goal, string> = {
  aisance: "improviser",
  entretiens: "entretiens",
  presentations: "presentations",
  convaincre: "convaincre",
  improviser: "improviser",
  concours: "presentations",
};

export function trackForGoalText(text: string, fallback: Goal): string {
  const t = text.toLowerCase();
  if (/entretien|recrut|embauche|stage|alternance|job/.test(t)) return "entretiens";
  if (/parasite|euh|tic|du coup|hésit/.test(t)) return "parasites";
  if (/présent|classe|exposé|oral|soutenance|concours|examen|réunion|conférence/.test(t)) return "presentations";
  if (/convain|vendre|pitch|client|négoci|commercial/.test(t)) return "convaincre";
  if (/improvis|spontan|aisance|timid|stress|confiance|à l'aise/.test(t)) return "improviser";
  return GOAL_TRACK[fallback];
}

export const GOAL_SUGGESTIONS = [
  "Je veux réussir mon prochain entretien.",
  "Je veux être plus à l'aise devant une classe.",
  "Je veux améliorer mes présentations professionnelles.",
  "Je veux réduire mes mots parasites.",
];

/** A 14-day program: foundations, a goal-specific track, and a final check. */
export function generateProgram(goalText: string, goal: Goal, weakest?: Dimension, now = new Date()): Program {
  const track = TRACKS[trackForGoalText(goalText, goal)];
  const days: Template = [...FOUNDATION, ...track].slice(0, 14);
  // Front-load a drill for the weakest skill on day 3.
  if (weakest === "debit" || weakest === "parasites" || weakest === "fluidite") {
    days[2] = { title: "Réduire les hésitations", focus: "Ton point faible actuel", exerciseId: "pron-rythme" };
  } else if (weakest === "structure") {
    days[2] = { title: "Structurer une réponse", focus: "Ton point faible actuel", exerciseId: "pres-sujet" };
  }
  const program: ProgramDay[] = days.map((d, i) => ({ day: i + 1, ...d, done: false }));
  return { id: uid("p_"), goalText, createdAt: now.toISOString(), days: program };
}

/** Marks the first open day matching the exercise (or the current day) as done. */
export function markProgramProgress(program: Program, exerciseId: string): Program {
  const days = program.days.map((d) => ({ ...d }));
  const target = days.find((d) => !d.done && d.exerciseId === exerciseId);
  if (target) target.done = true;
  return { ...program, days };
}

export function nextProgramDay(program: Program | null): ProgramDay | null {
  return program?.days.find((d) => !d.done) ?? null;
}
