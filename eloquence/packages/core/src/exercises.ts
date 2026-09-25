import type { CategoryId, Dimension } from "./types";

export interface Category {
  id: CategoryId;
  title: string;
  tagline: string;
  icon: string; // lucide icon name, resolved by the UI
}

export interface Exercise {
  id: string;
  category: CategoryId;
  title: string;
  prompt: string;
  instruction: string;
  durationSec: number;
  focus: Dimension;
  /** Short structure the user can lean on, shown before recording. */
  scaffold?: string[];
  premium?: boolean;
  /** Text to read aloud, for pronunciation drills. */
  readText?: string;
  /** Opinion to defend / contradict, for debates. */
  stance?: string;
}

export const CATEGORIES: Category[] = [
  { id: "improvisation", title: "Improvisation", tagline: "Répondre sans préparer", icon: "Sparkles" },
  { id: "entretien", title: "Entretien", tagline: "Face à un recruteur IA", icon: "Briefcase" },
  { id: "pitch", title: "Pitch", tagline: "Vendre une idée en 60 s", icon: "Rocket" },
  { id: "presentation", title: "Présentation", tagline: "Exposer un sujet de 1 à 5 min", icon: "Presentation" },
  { id: "debat", title: "Débat", tagline: "Défendre ou contredire", icon: "Scale" },
  { id: "pro", title: "Communication pro", tagline: "Les situations qui comptent", icon: "Users" },
  { id: "prononciation", title: "Prononciation", tagline: "Diction, articulation, rythme", icon: "AudioLines" },
];

const INSTR = "Parle naturellement. Ne cherche pas la réponse parfaite.";

export const EXERCISES: Exercise[] = [
  // Improvisation
  { id: "impro-passion", category: "improvisation", title: "Un sujet qui te passionne", prompt: "Explique-nous un sujet qui te passionne en 60 secondes.", instruction: INSTR, durationSec: 60, focus: "fluidite", scaffold: ["Le sujet en une phrase", "Pourquoi il te parle", "Un exemple concret", "Ce que tu aimerais transmettre"] },
  { id: "impro-metier", category: "improvisation", title: "Ton métier idéal", prompt: "Quel serait ton métier idéal ?", instruction: INSTR, durationSec: 60, focus: "structure", scaffold: ["Le métier", "Ce qui t'attire", "Ce que tu y apporterais"] },
  { id: "impro-ville", category: "improvisation", title: "Vends ta ville", prompt: "Convaincs-moi de visiter ta ville.", instruction: INSTR, durationSec: 60, focus: "confiance", scaffold: ["Une accroche", "Trois raisons", "Une invitation"] },
  { id: "impro-competence", category: "improvisation", title: "Une compétence pour tous", prompt: "Quelle compétence devrait tout le monde apprendre ?", instruction: INSTR, durationSec: 60, focus: "vocabulaire" },
  { id: "impro-souvenir", category: "improvisation", title: "Un souvenir marquant", prompt: "Raconte un moment qui t'a fait changer d'avis.", instruction: INSTR, durationSec: 90, focus: "clarte", premium: true },
  { id: "impro-objet", category: "improvisation", title: "L'objet du quotidien", prompt: "Choisis un objet autour de toi et fais-en l'éloge pendant une minute.", instruction: INSTR, durationSec: 60, focus: "vocabulaire", premium: true },

  // Entretien
  { id: "entretien-presentation", category: "entretien", title: "Présente-toi en 60 secondes", prompt: "Présentez-vous.", instruction: INSTR, durationSec: 60, focus: "structure", scaffold: ["Qui tu es aujourd'hui", "Ton parcours clé", "Ce que tu cherches", "Pourquoi ici"] },
  { id: "entretien-motivation", category: "entretien", title: "Pourquoi nous ?", prompt: "Pourquoi souhaitez-vous rejoindre notre entreprise ?", instruction: INSTR, durationSec: 90, focus: "confiance", scaffold: ["Ce qui t'attire chez eux", "Le lien avec ton parcours", "Ce que tu apportes"] },
  { id: "entretien-qualite", category: "entretien", title: "Votre principale qualité", prompt: "Quelle est votre principale qualité ?", instruction: INSTR, durationSec: 60, focus: "clarte", scaffold: ["La qualité", "Une preuve concrète", "L'impact pour l'équipe"] },
  { id: "entretien-difficulte", category: "entretien", title: "Une difficulté surmontée", prompt: "Parlez-moi d'une difficulté que vous avez rencontrée.", instruction: "Utilise la méthode STAR : Situation, Tâche, Action, Résultat.", durationSec: 120, focus: "structure", scaffold: ["Situation", "Tâche", "Action", "Résultat"], premium: true },
  { id: "entretien-defaut", category: "entretien", title: "Votre principal défaut", prompt: "Quel est votre principal défaut ?", instruction: INSTR, durationSec: 60, focus: "confiance", premium: true },
  { id: "entretien-5ans", category: "entretien", title: "Dans cinq ans", prompt: "Où vous voyez-vous dans cinq ans ?", instruction: INSTR, durationSec: 60, focus: "clarte", premium: true },

  // Pitch
  { id: "pitch-soi", category: "pitch", title: "Ton pitch personnel", prompt: "Vends-toi en 30 secondes, comme dans un ascenseur.", instruction: "Une idée forte, une preuve, une ouverture.", durationSec: 30, focus: "confiance", scaffold: ["Qui tu es", "Ta valeur unique", "Ce que tu proposes"] },
  { id: "pitch-produit", category: "pitch", title: "Un produit du quotidien", prompt: "Vends-moi ton application préférée comme si tu l'avais créée.", instruction: INSTR, durationSec: 60, focus: "structure", scaffold: ["Le problème", "La solution", "La preuve", "L'appel à l'action"] },
  { id: "pitch-idee", category: "pitch", title: "Une idée à financer", prompt: "Tu as 60 secondes pour convaincre un investisseur de financer ton idée.", instruction: INSTR, durationSec: 60, focus: "confiance", premium: true },

  // Présentation
  { id: "pres-sujet", category: "presentation", title: "Exposé express", prompt: "Présente un sujet que tu maîtrises à quelqu'un qui n'y connaît rien.", instruction: "Annonce ton plan, puis déroule-le.", durationSec: 120, focus: "structure", scaffold: ["Introduction et plan", "Partie 1", "Partie 2", "Conclusion"] },
  { id: "pres-projet", category: "presentation", title: "Ton dernier projet", prompt: "Présente un projet que tu as mené : objectif, démarche, résultat.", instruction: INSTR, durationSec: 180, focus: "clarte", premium: true },
  { id: "pres-livre", category: "presentation", title: "Un livre ou un film", prompt: "Présente un livre ou un film qui t'a marqué, sans divulgâcher la fin.", instruction: INSTR, durationSec: 120, focus: "vocabulaire" },
  { id: "pres-long", category: "presentation", title: "Présentation de 5 minutes", prompt: "Présente un sujet de ton choix pendant 5 minutes, comme devant une salle.", instruction: "Garde un fil conducteur et varie ton rythme.", durationSec: 300, focus: "debit", premium: true },

  // Débat
  { id: "debat-teletravail", category: "debat", title: "Le télétravail", prompt: "Défends ou contredis cette position.", stance: "Le télétravail devrait devenir la norme.", instruction: "Prends position dès la première phrase.", durationSec: 90, focus: "structure", scaffold: ["Ta position", "Argument 1 + exemple", "Argument 2 + exemple", "Réponse à l'objection"] },
  { id: "debat-reseaux", category: "debat", title: "Les réseaux sociaux", prompt: "Défends ou contredis cette position.", stance: "Les réseaux sociaux font plus de mal que de bien.", instruction: "Prends position dès la première phrase.", durationSec: 90, focus: "confiance" },
  { id: "debat-notes", category: "debat", title: "Les notes à l'école", prompt: "Défends ou contredis cette position.", stance: "Il faudrait supprimer les notes à l'école.", instruction: "Prends position dès la première phrase.", durationSec: 90, focus: "structure", premium: true },
  { id: "debat-ia", category: "debat", title: "L'IA au travail", prompt: "Défends ou contredis cette position.", stance: "L'IA va rendre le travail plus humain.", instruction: "Prends position dès la première phrase.", durationSec: 90, focus: "vocabulaire", premium: true },

  // Communication pro
  { id: "pro-augmentation", category: "pro", title: "Demander une augmentation", prompt: "Ton manager t'accorde 90 secondes. Demande une augmentation.", instruction: "Appuie-toi sur des faits, reste calme et précis.", durationSec: 90, focus: "confiance", scaffold: ["Le contexte", "Tes résultats chiffrés", "Ta demande claire", "Ouverture au dialogue"] },
  { id: "pro-reunion", category: "pro", title: "Prendre la parole en réunion", prompt: "Interviens en réunion pour proposer une nouvelle façon de travailler.", instruction: INSTR, durationSec: 60, focus: "clarte" },
  { id: "pro-client", category: "pro", title: "Convaincre un client", prompt: "Un client hésite à signer. Convaincs-le en une minute.", instruction: INSTR, durationSec: 60, focus: "confiance", premium: true },
  { id: "pro-mauvaise-nouvelle", category: "pro", title: "Annoncer une mauvaise nouvelle", prompt: "Annonce à ton équipe que le projet prend un mois de retard.", instruction: "Sois direct, factuel et propose une suite.", durationSec: 60, focus: "clarte", premium: true },
  { id: "pro-objection", category: "pro", title: "Répondre à une objection", prompt: "« C'est trop cher. » Réponds à cette objection.", instruction: INSTR, durationSec: 45, focus: "structure", premium: true },
  { id: "pro-projet", category: "pro", title: "Présenter un projet", prompt: "Présente un projet à ta direction en une minute et demie.", instruction: INSTR, durationSec: 90, focus: "structure" },

  // Prononciation
  { id: "pron-articulation", category: "prononciation", title: "Articulation", prompt: "Lis ce texte en articulant chaque syllabe.", instruction: "Lentement d'abord. La vitesse viendra ensuite.", durationSec: 45, focus: "debit", readText: "Un chasseur sachant chasser doit savoir chasser sans son chien. Les chaussettes de l'archiduchesse sont-elles sèches, archi-sèches ? Si six scies scient six cyprès, six cent six scies scient six cent six cyprès." },
  { id: "pron-rythme", category: "prononciation", title: "Rythme et pauses", prompt: "Lis ce passage en marquant une vraie pause à chaque point.", instruction: "Une pause d'une seconde vaut mieux qu'un « euh ».", durationSec: 60, focus: "debit", readText: "La parole est une respiration. On inspire avant l'idée. On la pose. Puis on laisse le silence faire son travail. Celui qui écoute a besoin de ce temps pour comprendre. Parler moins vite, c'est être mieux entendu." },
  { id: "pron-intonation", category: "prononciation", title: "Intonation", prompt: "Lis ce texte en faisant varier ton intonation.", instruction: "Monte sur les questions, descends sur les affirmations.", durationSec: 45, focus: "confiance", readText: "Vous pensez que c'est impossible ? Moi aussi, au début. Puis j'ai essayé. Une fois. Deux fois. Et un matin, tout est devenu simple. Alors, qu'est-ce qui vous retient ?", premium: true },
];

export function getExercise(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}

export function exercisesByCategory(category: CategoryId): Exercise[] {
  return EXERCISES.filter((e) => e.category === category);
}

export function getCategory(id: CategoryId): Category {
  return CATEGORIES.find((c) => c.id === id)!;
}

/** The first oral test offered during onboarding. */
export const ONBOARDING_EXERCISE_ID = "impro-passion";

const DAILY_POOL = [
  "impro-passion", "impro-metier", "entretien-presentation", "impro-ville",
  "pitch-soi", "debat-teletravail", "pro-reunion", "impro-competence",
  "entretien-qualite", "pres-livre", "debat-reseaux", "pitch-produit",
];

/** Deterministic "session du jour", nudged towards the user's weakest skill. */
export function dailyExercise(date: Date, weakest?: Dimension): Exercise {
  const dayIndex = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  if (weakest && dayIndex % 3 === 0) {
    const match = EXERCISES.find((e) => !e.premium && e.focus === weakest && DAILY_POOL.includes(e.id));
    if (match) return match;
  }
  return getExercise(DAILY_POOL[dayIndex % DAILY_POOL.length])!;
}

export function formatDuration(sec: number): string {
  if (sec < 60) return `${sec} s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s ? `${m} min ${s}` : `${m} min`;
}
