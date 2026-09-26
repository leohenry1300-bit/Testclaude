import type { Dimension, Goal, Program, ProgramDay, ProgramTemplate, RecurringChallenge } from "./types";
import { uid } from "./pipeline";

type DayDef = { title: string; focus: string; activityId: string; kind: ProgramDay["kind"] };

function days(defs: DayDef[]): ProgramDay[] {
  return defs.map((d, i) => ({ day: i + 1, ...d, done: false }));
}

// ---------------------------------------------------------------------------
// Named, ready-to-start programs. Each references real catalogue ids
// (exercises, games, simulations, lessons) so every day is truly runnable.

export const PROGRAM_TEMPLATES: ProgramTemplate[] = [
  { id: "tpl-general", title: "Devenir meilleur à l'oral", tagline: "Le parcours généraliste complet", days: 30, icon: "Sparkles" },
  { id: "tpl-eloquence", title: "Éloquence", tagline: "Captiver, raconter, marquer", days: 30, icon: "Wand2" },
  { id: "tpl-impro", title: "Improvisation", tagline: "Parler sans jamais te préparer", days: 21, icon: "Zap" },
  { id: "tpl-entretien", title: "Entretien d'embauche", tagline: "Prêt·e pour le jour J", days: 14, icon: "Briefcase" },
  { id: "tpl-debat", title: "Débat", tagline: "Argumenter et convaincre", days: 30, icon: "Scale" },
  { id: "tpl-presentation", title: "Présentation", tagline: "Structurer et captiver un auditoire", days: 21, icon: "Presentation" },
  { id: "tpl-vocabulaire", title: "Vocabulaire", tagline: "Un mot juste plutôt que dix vagues", days: 30, icon: "BookOpen" },
  { id: "tpl-culture", title: "Culture générale", tagline: "Pouvoir parler de presque tout", days: 30, icon: "Globe" },
  { id: "tpl-pro", title: "Communication professionnelle", tagline: "Réunions, projets, difficultés", days: 30, icon: "Users" },
  { id: "tpl-commercial", title: "Commercial", tagline: "Vendre, négocier, convaincre", days: 30, icon: "Handshake" },
  { id: "tpl-confiance", title: "Confiance dans la prise de parole", tagline: "Oser, poser sa voix, assumer", days: 30, icon: "ShieldCheck" },
];

function buildGeneral(): ProgramDay[] {
  const core: DayDef[] = [
    { title: "Se présenter", focus: "Poser une première impression claire", activityId: "entretien-presentation", kind: "exercise" },
    { title: "Parler spontanément", focus: "Lancer sa parole sans préparation", activityId: "impro-passion", kind: "exercise" },
    { title: "Réduire les hésitations", focus: "Remplacer les « euh » par des pauses", activityId: "g-sans-euh", kind: "game" },
    { title: "Structurer une réponse", focus: "Annonce, développement, conclusion", activityId: "pres-sujet", kind: "exercise" },
    { title: "Pitch de 30 secondes", focus: "Aller à l'essentiel", activityId: "pitch-soi", kind: "exercise" },
    { title: "Débattre", focus: "Prendre position et argumenter", activityId: "debat-teletravail", kind: "exercise" },
    { title: "Raconter une histoire", focus: "La Story Spine, structure Pixar", activityId: "elo-histoire", kind: "lesson" },
  ];
  const rest: DayDef[] = [
    { title: "Improviser", focus: "Sujet aléatoire, zéro préparation", activityId: "g-roulette", kind: "game" },
    { title: "Entretien simulé", focus: "Répondre à un recruteur", activityId: "sim-entretien", kind: "simulation" },
    { title: "Culture générale", focus: "Sortir de ta zone de confort", activityId: "culture-libre", kind: "exercise" },
    { title: "Trois mots", focus: "Créativité et structure narrative", activityId: "g-trois-mots", kind: "game" },
    { title: "Communication pro", focus: "Une situation professionnelle réelle", activityId: "pro-reunion", kind: "exercise" },
    { title: "Argumenter", focus: "Construire un argument avec preuve", activityId: "arg-construire", kind: "lesson" },
    { title: "Prononciation", focus: "Articulation et rythme", activityId: "pron-rythme", kind: "exercise" },
    { title: "Pitch express", focus: "Convaincre en 30 secondes", activityId: "g-pitch-express", kind: "game" },
    { title: "Débat inversé", focus: "Défendre l'avis contraire au tien", activityId: "g-debat-inverse", kind: "game" },
    { title: "Présentation longue", focus: "Tenir 3 minutes", activityId: "g-3min", kind: "game" },
    { title: "Vocabulaire", focus: "Ne jamais répéter le même mot", activityId: "g-synonymes", kind: "game" },
    { title: "Question piège", focus: "Répondre sans filet", activityId: "g-question-piege", kind: "game" },
    { title: "Storytelling", focus: "Un échec transformé en leçon", activityId: "story-echec", kind: "exercise" },
    { title: "Simulation client difficile", focus: "Garder son calme sous pression", activityId: "sim-client-difficile", kind: "simulation" },
    { title: "Explique-moi comme à un expert", focus: "Précision du vocabulaire", activityId: "g-eli-expert", kind: "game" },
    { title: "Présentation projet", focus: "Structurer un compte-rendu", activityId: "pro-projet", kind: "exercise" },
    { title: "Négociation", focus: "Défendre un prix, un délai", activityId: "pro-negociation", kind: "exercise" },
    { title: "5 pourquoi", focus: "Approfondir une réflexion", activityId: "g-cinq-pourquoi", kind: "game" },
    { title: "Networking", focus: "Engager une conversation professionnelle", activityId: "sim-networking", kind: "simulation" },
    { title: "Sans mot parasite", focus: "Défi à zéro tolérance", activityId: "g-sans-euh", kind: "game" },
    { title: "Présentation 5 minutes", focus: "Tenir la distance", activityId: "pres-long", kind: "exercise" },
    { title: "Débat express", focus: "30 secondes pour convaincre", activityId: "g-debat-express", kind: "game" },
    { title: "Bilan", focus: "Refais le test du premier jour", activityId: "entretien-presentation", kind: "exercise" },
  ];
  return days([...core, ...rest].slice(0, 30));
}

function buildTrack(defs: DayDef[], targetLen: number): ProgramDay[] {
  const out = [...defs];
  while (out.length < targetLen) out.push(defs[out.length % defs.length]);
  return days(out.slice(0, targetLen));
}

const TRACKS: Record<string, DayDef[]> = {
  "tpl-eloquence": [
    { title: "Captiver dès la première phrase", focus: "L'ouverture", activityId: "elo-captiver", kind: "lesson" },
    { title: "Une introduction qui marque", focus: "Annonce ton plan", activityId: "pres-sujet", kind: "exercise" },
    { title: "Raconter une histoire", focus: "Story Spine", activityId: "story-experience", kind: "exercise" },
    { title: "Analogies", focus: "Rendre l'abstrait concret", activityId: "g-eli5", kind: "game" },
    { title: "Une conclusion qui marque", focus: "Résume, ouvre", activityId: "pres-long", kind: "exercise" },
    { title: "Métaphores", focus: "Filer une image", activityId: "elo-metaphore", kind: "lesson" },
    { title: "Présentation captivante", focus: "Tout combiner", activityId: "pres-conference", kind: "exercise" },
  ],
  "tpl-impro": [
    { title: "Roulette des sujets", focus: "Parler de n'importe quoi", activityId: "g-roulette", kind: "game" },
    { title: "60 secondes", focus: "Tenir le temps", activityId: "g-60s", kind: "game" },
    { title: "Sans préparation", focus: "Zéro filet", activityId: "g-sans-preparation", kind: "game" },
    { title: "Trois mots", focus: "Créativité imposée", activityId: "g-trois-mots", kind: "game" },
    { title: "Question piège", focus: "Répondre à chaud", activityId: "g-question-piege", kind: "game" },
    { title: "Histoire impossible", focus: "Contraintes absurdes", activityId: "g-histoire-impossible", kind: "game" },
    { title: "30 secondes chrono", focus: "Aller à l'essentiel", activityId: "g-30s", kind: "game" },
  ],
  "tpl-entretien": [
    { title: "Se présenter", focus: "STAR", activityId: "entretien-presentation", kind: "exercise" },
    { title: "Parler de soi", focus: "Méthode STAR", activityId: "ent-parler-de-soi", kind: "lesson" },
    { title: "Pourquoi nous ?", focus: "Relier ton parcours", activityId: "entretien-motivation", kind: "exercise" },
    { title: "Tes qualités", focus: "Une preuve concrète", activityId: "entretien-qualite", kind: "exercise" },
    { title: "Tes défauts", focus: "Honnêteté et solution", activityId: "entretien-defaut", kind: "exercise" },
    { title: "Une difficulté surmontée", focus: "STAR complet", activityId: "entretien-difficulte", kind: "exercise" },
    { title: "Simulation complète", focus: "Mise en situation", activityId: "sim-entretien", kind: "simulation" },
  ],
  "tpl-debat": [
    { title: "Construire un argument", focus: "Modèle de Toulmin", activityId: "arg-construire", kind: "lesson" },
    { title: "Le télétravail", focus: "Prendre position", activityId: "debat-teletravail", kind: "exercise" },
    { title: "Anticiper une objection", focus: "« Certes… mais »", activityId: "arg-objection", kind: "lesson" },
    { title: "Contre-argument", focus: "Réfuter", activityId: "g-contre-argument", kind: "game" },
    { title: "Débat inversé", focus: "Défendre l'avis contraire", activityId: "g-debat-inverse", kind: "game" },
    { title: "Avocat du diable", focus: "Argumenter sans conviction", activityId: "g-avocat-diable", kind: "game" },
    { title: "Débat express", focus: "30 secondes", activityId: "g-debat-express", kind: "game" },
  ],
  "tpl-presentation": [
    { title: "Structurer une présentation", focus: "Grille Toastmasters", activityId: "pres-structure", kind: "lesson" },
    { title: "Exposé express", focus: "Plan annoncé, plan tenu", activityId: "pres-sujet", kind: "exercise" },
    { title: "Storytelling en présentation", focus: "Ouvrir par une histoire", activityId: "pres-storytelling", kind: "lesson" },
    { title: "Présenter un projet", focus: "Objectif, démarche, résultat", activityId: "pres-projet", kind: "exercise" },
    { title: "3 minutes", focus: "Développer en profondeur", activityId: "g-3min", kind: "game" },
    { title: "Conférence", focus: "Capter l'attention", activityId: "pres-conference", kind: "exercise" },
    { title: "5 minutes", focus: "Tenir la distance", activityId: "pres-long", kind: "exercise" },
  ],
  "tpl-vocabulaire": [
    { title: "Synonymes", focus: "Ne jamais répéter", activityId: "g-synonymes", kind: "game" },
    { title: "Connecteurs logiques", focus: "Les panneaux du discours", activityId: "voc-connecteurs", kind: "lesson" },
    { title: "Reformulation", focus: "Trois façons de le dire", activityId: "g-reformulation", kind: "game" },
    { title: "Mot du jour", focus: "L'utiliser naturellement", activityId: "g-mot-du-jour", kind: "game" },
    { title: "Explique à un expert", focus: "Précision", activityId: "g-eli-expert", kind: "game" },
    { title: "Expressions précises", focus: "Éviter les mots flous", activityId: "voc-expressions", kind: "lesson" },
    { title: "Vocabulaire professionnel", focus: "Installer sa crédibilité", activityId: "sim-reunion", kind: "simulation" },
  ],
  "tpl-culture": [
    { title: "Question du jour", focus: "Sortir de ta zone de confort", activityId: "culture-libre", kind: "exercise" },
    { title: "Philosophie", focus: "Prendre position, nuancer", activityId: "culture-philo", kind: "exercise" },
    { title: "Économie", focus: "Vulgariser sans trahir", activityId: "culture-eco", kind: "exercise" },
    { title: "Explique comme à un enfant", focus: "Vulgarisation", activityId: "g-eli5", kind: "game" },
    { title: "5 pourquoi", focus: "Creuser un sujet", activityId: "g-cinq-pourquoi", kind: "game" },
    { title: "Question impossible", focus: "Raisonner à voix haute", activityId: "g-question-impossible", kind: "game" },
    { title: "Question socratique", focus: "Questionner ses propres avis", activityId: "g-socratique", kind: "game" },
  ],
  "tpl-pro": [
    { title: "Prendre la parole en réunion", focus: "Être entendu du premier coup", activityId: "pro-reunion", kind: "exercise" },
    { title: "Réunion difficile", focus: "Défendre une proposition", activityId: "sim-reunion", kind: "simulation" },
    { title: "Annoncer une mauvaise nouvelle", focus: "Direct et factuel", activityId: "pro-mauvaise-nouvelle", kind: "exercise" },
    { title: "Écoute active", focus: "Reformuler avant de répondre", activityId: "com-ecouter", kind: "lesson" },
    { title: "Présenter un projet", focus: "Structure claire", activityId: "pro-projet", kind: "exercise" },
    { title: "Demander une augmentation", focus: "Faits et assurance", activityId: "pro-augmentation", kind: "exercise" },
    { title: "Situation conflictuelle", focus: "Rester factuel", activityId: "sim-conflit", kind: "simulation" },
  ],
  "tpl-commercial": [
    { title: "Pitch produit", focus: "Problème, solution, preuve", activityId: "pitch-produit", kind: "exercise" },
    { title: "Découvrir le besoin", focus: "Bonnes questions", activityId: "sim-vente", kind: "simulation" },
    { title: "Répondre à une objection", focus: "Reformuler, prouver", activityId: "pro-objection", kind: "exercise" },
    { title: "Objection", focus: "Sous pression", activityId: "g-objection", kind: "game" },
    { title: "Négociation salariale", focus: "Argumenter un montant", activityId: "sim-negociation-salaire", kind: "simulation" },
    { title: "Négocier un délai", focus: "Trouver un compromis", activityId: "pro-negociation", kind: "exercise" },
    { title: "Pitch express", focus: "30 secondes pour convaincre", activityId: "g-pitch-express", kind: "game" },
  ],
  "tpl-confiance": [
    { title: "Pitch personnel", focus: "Affirmer sans se justifier", activityId: "pitch-soi", kind: "exercise" },
    { title: "Intonation", focus: "Une voix qui affirme", activityId: "pron-intonation", kind: "exercise" },
    { title: "Vends ta ville", focus: "Enthousiasme assumé", activityId: "impro-ville", kind: "exercise" },
    { title: "Question piège", focus: "Répondre sans se démonter", activityId: "g-question-piege", kind: "game" },
    { title: "Client difficile", focus: "Garder son calme", activityId: "sim-client-difficile", kind: "simulation" },
    { title: "Networking", focus: "Aller vers l'inconnu", activityId: "sim-networking", kind: "simulation" },
    { title: "Bilan", focus: "Mesurer le chemin parcouru", activityId: "pitch-soi", kind: "exercise" },
  ],
};

export function buildTemplateProgram(templateId: string): Program | null {
  const tpl = PROGRAM_TEMPLATES.find((t) => t.id === templateId);
  if (!tpl) return null;
  const days_ = tpl.id === "tpl-general" ? buildGeneral() : buildTrack(TRACKS[tpl.id], tpl.days);
  return { id: uid("p_"), templateId: tpl.id, title: tpl.title, goalText: tpl.tagline, createdAt: new Date().toISOString(), days: days_ };
}

// ---------------------------------------------------------------------------
// Personalised generator — considers multiple goals, the diagnostic, and any
// recurring issue detected in recent sessions.

const GOAL_TO_TRACK: Partial<Record<Goal, string>> = {
  entretiens: "tpl-entretien",
  presentations: "tpl-presentation",
  convaincre: "tpl-commercial",
  improviser: "tpl-impro",
  concours: "tpl-presentation",
  parasites: "tpl-impro",
  vocabulaire: "tpl-vocabulaire",
  structure: "tpl-presentation",
  debat: "tpl-debat",
  storytelling: "tpl-eloquence",
  culture: "tpl-culture",
  commercial: "tpl-commercial",
  confiance: "tpl-confiance",
  aisance: "tpl-general",
};

export function trackForGoalText(text: string, fallbackGoals: Goal[]): string {
  const t = text.toLowerCase();
  if (/entretien|recrut|embauche|stage|alternance|job/.test(t)) return "tpl-entretien";
  if (/parasite|euh|tic|du coup|hésit/.test(t)) return "tpl-impro";
  if (/présent|classe|exposé|oral|soutenance|concours|examen|conférence/.test(t)) return "tpl-presentation";
  if (/convain|vendre|pitch|client|négoci|commercial|vente/.test(t)) return "tpl-commercial";
  if (/débat|argument|convaincre/.test(t)) return "tpl-debat";
  if (/histoire|raconter|storytelling/.test(t)) return "tpl-eloquence";
  if (/culture|savoir|connaissance/.test(t)) return "tpl-culture";
  if (/improvis|spontan|aisance|timid|stress|confiance|à l'aise/.test(t)) return "tpl-impro";
  for (const g of fallbackGoals) if (GOAL_TO_TRACK[g]) return GOAL_TO_TRACK[g]!;
  return "tpl-general";
}

export const GOAL_SUGGESTIONS = [
  "Je veux réussir mon prochain entretien.",
  "Je veux être plus à l'aise devant une classe.",
  "Je veux améliorer mes présentations professionnelles.",
  "Je veux réduire mes mots parasites.",
  "Je veux mieux argumenter et débattre.",
  "Je veux développer ma culture générale à l'oral.",
];

/** A 14-30 day program built from a free-text goal, the declared goals, and
 * whatever the app already knows about the user's weak point. */
export function generateProgram(
  goalText: string,
  goals: Goal[],
  weakest?: Dimension,
  recurring?: RecurringChallenge | null,
  length: 14 | 21 | 30 = 21,
  now = new Date(),
): Program {
  const trackId = trackForGoalText(goalText, goals);
  const base = trackId === "tpl-general" ? buildGeneral() : buildTrack(TRACKS[trackId] ?? TRACKS["tpl-general"] ?? [], length);
  const dayList = base.slice(0, length);
  // Front-load the detected weak point or recurring issue on day 3.
  if (recurring) {
    dayList[2] = { day: 3, title: `Défi anti-« ${recurring.label} »`, focus: "Ton point faible le plus fréquent en ce moment", activityId: recurring.suggestedGameId, kind: "game", done: false };
  } else if (weakest === "debit" || weakest === "parasites" || weakest === "fluidite") {
    dayList[2] = { day: 3, title: "Réduire les hésitations", focus: "Ton point faible actuel", activityId: "g-sans-euh", kind: "game", done: false };
  } else if (weakest === "structure") {
    dayList[2] = { day: 3, title: "Structurer une réponse", focus: "Ton point faible actuel", activityId: "pres-sujet", kind: "exercise", done: false };
  } else if (weakest === "argumentation") {
    dayList[2] = { day: 3, title: "Construire un argument", focus: "Ton point faible actuel", activityId: "arg-construire", kind: "lesson", done: false };
  }
  return { id: uid("p_"), templateId: null, title: "Programme personnalisé", goalText, createdAt: now.toISOString(), days: dayList.map((d, i) => ({ ...d, day: i + 1 })) };
}

/** Marks the first open day matching the activity (or the current day) as done. */
export function markProgramProgress(program: Program, activityId: string): Program {
  const days_ = program.days.map((d) => ({ ...d }));
  const target = days_.find((d) => !d.done && d.activityId === activityId);
  if (target) target.done = true;
  return { ...program, days: days_ };
}

export function nextProgramDay(program: Program | null): ProgramDay | null {
  return program?.days.find((d) => !d.done) ?? null;
}

export function programCompleted(program: Program | null): boolean {
  return !!program && program.days.every((d) => d.done);
}
