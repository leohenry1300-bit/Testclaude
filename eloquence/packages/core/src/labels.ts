import type { Frequency, Goal, Level } from "./types";

export const GOAL_LABELS: Record<Goal, string> = {
  aisance: "Être plus à l'aise à l'oral",
  entretiens: "Réussir mes entretiens",
  presentations: "Améliorer mes présentations",
  convaincre: "Être plus convaincant",
  improviser: "Mieux improviser",
  concours: "Préparer un concours ou un examen",
  parasites: "Supprimer mes mots parasites",
  vocabulaire: "Améliorer mon vocabulaire",
  grammaire: "Améliorer ma grammaire à l'oral",
  structure: "Mieux structurer mes réponses",
  debat: "Être meilleur en débat",
  storytelling: "Mieux raconter des histoires",
  culture: "Développer ma culture générale",
  diction: "Améliorer ma diction et ma prononciation",
  commercial: "Améliorer ma communication commerciale",
  confiance: "Gagner en confiance à l'oral",
};

export const GOAL_GROUPS: { title: string; goals: Goal[] }[] = [
  { title: "Bases", goals: ["aisance", "confiance", "parasites", "diction"] },
  { title: "Fond", goals: ["structure", "vocabulaire", "grammaire", "culture"] },
  { title: "Situations", goals: ["entretiens", "presentations", "concours"] },
  { title: "Persuasion", goals: ["convaincre", "debat", "commercial"] },
  { title: "Créativité", goals: ["improviser", "storytelling"] },
];

export const LEVEL_LABELS: Record<Level, string> = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  a_l_aise: "À l'aise",
  tres_a_l_aise: "Très à l'aise",
};

export const LEVEL_HINTS: Record<Level, string> = {
  debutant: "Je redoute de prendre la parole",
  intermediaire: "Je me débrouille, avec du stress",
  a_l_aise: "Je parle volontiers, je veux m'affiner",
  tres_a_l_aise: "Je cherche l'excellence",
};

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  "5": "5 min / jour",
  "10": "10 min / jour",
  "15": "15 min / jour",
  semaine: "Quelques fois par semaine",
};

export const FREQUENCY_HINTS: Record<Frequency, string> = {
  "5": "Une session rapide, chaque jour",
  "10": "Le bon équilibre pour progresser",
  "15": "Pour un objectif proche",
  semaine: "À ton rythme",
};
