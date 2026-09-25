import type { CoachMessage, Dimension, ProgressSummary, Session, User } from "./types";
import { DIMENSION_LABELS, DIMENSION_POSSESSIVE, analyzeSpeech } from "./analysis";
import { weakestDimension, strongestDimension } from "./progress";
import { uid } from "./pipeline";

// Rule-based coach used when no LLM provider is configured (and offline).
// It is deliberately opinionated: short, concrete, always ends on an action.

export interface CoachContext {
  user: Pick<User, "firstName" | "goal" | "goalText" | "level">;
  summary: ProgressSummary | null;
  lastSession: Session | null;
  history: CoachMessage[];
}

export const COACH_SUGGESTIONS = [
  "Comment améliorer ma confiance à l'oral ?",
  "Pourquoi je parle trop vite ?",
  "Donne-moi un exercice pour travailler mon improvisation.",
  "Fais-moi passer un entretien d'embauche.",
];

export const INTERVIEW_QUESTIONS = [
  "Présentez-vous en quelques phrases.",
  "Pourquoi souhaitez-vous rejoindre notre entreprise ?",
  "Parlez-moi d'une difficulté que vous avez rencontrée et de la façon dont vous l'avez gérée.",
  "Pourquoi devrions-nous vous choisir plutôt qu'un autre candidat ?",
];

const EXERCISE_FOR: Record<Dimension, { id: string; label: string }> = {
  clarte: { id: "entretien-qualite", label: "Exercice clarté · 60 s" },
  fluidite: { id: "impro-passion", label: "Improvisation · 60 s" },
  confiance: { id: "pitch-soi", label: "Pitch personnel · 30 s" },
  structure: { id: "pres-sujet", label: "Exposé structuré · 2 min" },
  vocabulaire: { id: "impro-competence", label: "Improvisation · 60 s" },
  debit: { id: "pron-rythme", label: "Rythme et pauses · 60 s" },
  parasites: { id: "pron-rythme", label: "Rythme et pauses · 60 s" },
};

function fold(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function msg(text: string, extra: Partial<CoachMessage> = {}): CoachMessage {
  return { id: uid("m_"), role: "coach", text, createdAt: new Date().toISOString(), ...extra };
}

function activeInterview(history: CoachMessage[]): { step: number; total: number } | null {
  const lastCoach = [...history].reverse().find((m) => m.role === "coach");
  if (!lastCoach?.interview) return null;
  return lastCoach.interview.step < lastCoach.interview.total ? lastCoach.interview : null;
}

function quickAnswerFeedback(answer: string): string {
  const a = analyzeSpeech({ transcript: answer, durationSec: 0, source: "text" });
  const m = a.metrics;
  const notes: string[] = [];
  if (m.wordCount < 25) notes.push("C'est un peu court : un recruteur attend 3 ou 4 phrases, avec un exemple.");
  else if (m.wordCount > 220) notes.push("C'est long. Vise 45 secondes à l'oral, soit environ 110 mots.");
  if (m.fillerCount >= 2) notes.push(`J'ai relevé ${m.fillerCount} mots parasites (${Object.keys(m.fillers).slice(0, 2).map((f) => `« ${f} »`).join(", ")}). À l'oral, ils s'entendent encore plus.`);
  if (m.hedges) notes.push("Tu nuances trop : remplace « je pense que » par une affirmation.");
  if (m.connectors.length === 0 && m.wordCount >= 25) notes.push("Ajoute des repères (« d'abord », « par exemple ») pour guider l'écoute.");
  if (!/\d|par exemple|exemple|quand j|lorsque j|j'ai /i.test(answer) && m.wordCount >= 25) notes.push("Il manque une preuve concrète : un chiffre, une situation vécue.");
  if (notes.length === 0) return "Réponse nette et bien construite. Rien à redire sur le fond.";
  return notes.slice(0, 2).join(" ");
}

export function ruleBasedCoachReply(userText: string, ctx: CoachContext): CoachMessage {
  const t = fold(userText);
  const name = ctx.user.firstName;
  const current = ctx.summary?.current ?? null;
  const weak = weakestDimension(current);
  const strong = strongestDimension(current);

  // --- Mock interview flow ------------------------------------------------
  const interview = activeInterview(ctx.history);
  if (interview) {
    if (/^(stop|arrete|fin|termine|j'arrete)/.test(t.trim())) {
      return msg("On s'arrête là. Tu peux relancer une simulation quand tu veux, ou passer à l'oral pour une analyse complète de ta voix.", {
        action: { label: "Entretien oral · 60 s", exerciseId: "entretien-presentation" },
      });
    }
    const feedback = quickAnswerFeedback(userText);
    const next = interview.step + 1;
    if (next < interview.total) {
      return msg(`${feedback}\n\nQuestion ${next + 1}/${interview.total} — ${INTERVIEW_QUESTIONS[next]}`, {
        interview: { step: next, total: interview.total },
      });
    }
    return msg(
      `${feedback}\n\nFin de la simulation. Tu as tenu les ${interview.total} questions : c'est exactement l'endurance qu'il faut le jour J. Prochaine étape : refaire la première question à voix haute, pour travailler ta voix et ton rythme.`,
      { interview: { step: next, total: interview.total }, action: { label: "Présente-toi à l'oral · 60 s", exerciseId: "entretien-presentation" } },
    );
  }

  if (/entretien|recruteur|fais[- ]?moi passer|simul/.test(t)) {
    return msg(
      `C'est parti. Je joue le recruteur, tu réponds par écrit comme tu le dirais à l'oral. Tape « stop » pour arrêter.\n\nQuestion 1/${INTERVIEW_QUESTIONS.length} — ${INTERVIEW_QUESTIONS[0]}`,
      { interview: { step: 0, total: INTERVIEW_QUESTIONS.length } },
    );
  }

  // --- Topics ---------------------------------------------------------------
  if (/vite|rapide|debit|lent|rythme|precipit/.test(t)) {
    const wpm = ctx.lastSession?.analysis.metrics.wpm;
    const measured = wpm ? ` Sur ta dernière session, tu étais à ${wpm} mots/min${wpm > 160 ? ", au-dessus de la zone idéale (130–160)" : wpm < 125 ? ", un peu sous la zone idéale (130–160)" : ", dans la zone idéale"}.` : "";
    return msg(
      `On parle vite pour trois raisons : le stress, l'envie d'en finir, ou parce qu'on connaît trop bien son sujet.${measured}\n\nCe qui marche : une pause complète après chaque idée importante. Pas un ralentissement général, une vraie respiration. Ton auditoire a besoin de ce temps pour comprendre.`,
      { action: { label: EXERCISE_FOR.debit.label, exerciseId: EXERCISE_FOR.debit.id } },
    );
  }
  if (/confian|stress|trac|timid|peur|angoiss|assurance|legitim/.test(t)) {
    const strongLine = strong ? ` Ton point fort actuel, c'est ${DIMENSION_POSSESSIVE[strong]} : appuie-toi dessus.` : "";
    return msg(
      `La confiance à l'oral se construit par la répétition, pas par la motivation.${strongLine}\n\nTrois leviers concrets :\n1. Prépare ta première phrase mot pour mot. Les 10 premières secondes fixent tout le reste.\n2. Supprime « un peu », « je pense », « peut-être » : ils affaiblissent ce que tu dis.\n3. Termine tes phrases vers le bas, comme une affirmation.\n\nFais un pitch de 30 secondes maintenant, on mesure ta confiance.`,
      { action: { label: EXERCISE_FOR.confiance.label, exerciseId: EXERCISE_FOR.confiance.id } },
    );
  }
  if (/improvis|spontan|exercice|entrain|pratiqu/.test(t)) {
    return msg(
      "Exercice « Trois mots » : choisis trois mots au hasard autour de toi et relie-les dans une histoire de 60 secondes. Le but n'est pas d'être brillant, c'est de ne jamais t'arrêter.\n\nRègle d'or : si tu bloques, décris ce que tu vois. Ça relance toujours la parole.\n\nTu peux aussi lancer une improvisation guidée, analysée par l'app.",
      { action: { label: "Improvisation · 60 s", exerciseId: "impro-metier" } },
    );
  }
  if (/euh|du coup|parasite|en fait|tic|hesit/.test(t)) {
    const last = ctx.lastSession?.analysis.metrics;
    const top = last ? Object.entries(last.fillers).sort((a, b) => b[1] - a[1])[0] : undefined;
    const measured = top ? ` Chez toi, le plus fréquent en ce moment, c'est « ${top[0]} » (${top[1]} fois sur ta dernière session).` : "";
    return msg(
      `Les mots parasites remplissent un silence que tu crois gênant. Il ne l'est pas : une pause d'une seconde passe pour de la réflexion.${measured}\n\nMéthode : ne cherche pas à tout supprimer d'un coup. Cible un seul mot par session, et remplace-le par une respiration.`,
      { action: { label: EXERCISE_FOR.parasites.label, exerciseId: EXERCISE_FOR.parasites.id } },
    );
  }
  if (/structur|plan|organis|perd|fil|brouillon/.test(t)) {
    return msg(
      "Structure de base, valable presque partout :\n1. Annonce : « Je vois deux raisons. »\n2. Développe chaque point avec un exemple.\n3. Conclus en une phrase qui répond à la question.\n\nAnnoncer ton plan t'oblige à le tenir, et ton auditoire sait où il va.",
      { action: { label: EXERCISE_FOR.structure.label, exerciseId: EXERCISE_FOR.structure.id } },
    );
  }
  if (/voix|monoton|intonation|articul|diction|prononc/.test(t)) {
    return msg(
      "Une voix monotone vient souvent d'une respiration haute et rapide. Deux réglages : respire par le ventre avant de commencer, et exagère légèrement tes intonations. Ce qui te paraît excessif sonne juste pour l'auditoire.",
      { action: { label: "Articulation · 45 s", exerciseId: "pron-articulation" } },
    );
  }
  if (/presentation|expose|oral|concours|examen|soutenance|classe|jury/.test(t)) {
    return msg(
      "Pour un oral qui compte :\n1. Répète à voix haute, pas dans ta tête. Au moins trois fois.\n2. Chronomètre-toi : on dépasse presque toujours.\n3. Prépare mot pour mot ton introduction et ta conclusion, le reste en mots-clés.\n\nL'exposé express te fait travailler ces trois points.",
      { action: { label: "Exposé express · 2 min", exerciseId: "pres-sujet" } },
    );
  }
  if (/progres|score|niveau|resultat|ou j'en suis|bilan|stat/.test(t)) {
    const s = ctx.summary;
    if (!s || s.sessionCount === 0) {
      return msg("Tu n'as pas encore de session analysée. Fais un premier exercice et je te donne un bilan précis.", {
        action: { label: "Premier exercice · 60 s", exerciseId: "impro-passion" },
      });
    }
    const trend = s.trend30 !== null ? (s.trend30 >= 0 ? `+${s.trend30} points sur 30 jours` : `${s.trend30} points sur 30 jours`) : "pas encore assez de recul sur 30 jours";
    return msg(
      `${name}, voici où tu en es : ${s.sessionCount} sessions, score moyen de ${s.averageScore}/100, ${trend}.${strong ? ` Point fort : ${DIMENSION_LABELS[strong].toLowerCase()} (${current![strong]}).` : ""}${weak ? ` À travailler : ${DIMENSION_LABELS[weak].toLowerCase()} (${current![weak]}).` : ""}\n\nPriorité de la semaine : ${weak ? DIMENSION_LABELS[weak].toLowerCase() : "la régularité"}.`,
      weak ? { action: { label: EXERCISE_FOR[weak].label, exerciseId: EXERCISE_FOR[weak].id } } : {},
    );
  }
  if (/^(salut|bonjour|hello|coucou|hey|bonsoir)/.test(t.trim())) {
    return msg(`Bonjour ${name}. Sur quoi veux-tu travailler aujourd'hui ? Je peux t'expliquer un point précis, te proposer un exercice ou te faire passer un entretien.`);
  }
  if (/merci|super|top|genial|parfait/.test(t)) {
    return msg("Avec plaisir. Le plus utile maintenant : mettre ça en pratique à voix haute.", weak ? {
      action: { label: EXERCISE_FOR[weak].label, exerciseId: EXERCISE_FOR[weak].id },
    } : {});
  }

  // --- Default: personalised nudge -----------------------------------------
  const focus = weak
    ? `D'après tes dernières sessions, ton levier principal est ${DIMENSION_POSSESSIVE[weak]} (${current![weak]}/100).`
    : "Je n'ai pas encore assez de sessions pour cibler ton point faible.";
  return msg(
    `${focus} Dis-m'en un peu plus sur la situation que tu prépares (entretien, réunion, oral, pitch…) et je te propose un plan précis.`,
    weak ? { action: { label: EXERCISE_FOR[weak].label, exerciseId: EXERCISE_FOR[weak].id } } : {},
  );
}

/** Compact, factual context for an LLM coach prompt. */
export function coachContextText(ctx: CoachContext): string {
  const lines = [
    `Prénom : ${ctx.user.firstName}`,
    `Objectif : ${ctx.user.goalText ?? ctx.user.goal}`,
    `Niveau déclaré : ${ctx.user.level}`,
  ];
  const s = ctx.summary;
  if (s && s.current) {
    lines.push(`Sessions : ${s.sessionCount}, score moyen ${s.averageScore}/100, série ${s.streak} jours`);
    lines.push(
      "Scores récents : " +
        (Object.keys(DIMENSION_LABELS) as Dimension[]).map((d) => `${DIMENSION_LABELS[d]} ${s.current![d]}`).join(", "),
    );
  }
  if (ctx.lastSession) {
    const m = ctx.lastSession.analysis.metrics;
    lines.push(
      `Dernière session : « ${ctx.lastSession.exerciseTitle} », ${ctx.lastSession.score}/100, ${m.wpm} mots/min, ${m.fillerCount} mots parasites (${Object.keys(m.fillers).slice(0, 3).join(", ") || "aucun"})`,
    );
  }
  return lines.join("\n");
}
