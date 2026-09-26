import type { CoachMessage, Dimension, ProgressSummary, Session, User } from "./types";
import { DIMENSION_LABELS, DIMENSION_POSSESSIVE, analyzeSpeech } from "./analysis";
import { weakestDimension, strongestDimension } from "./progress";
import { uid } from "./pipeline";
import { getSimulation, SIMULATIONS } from "./simulations";
import { allSubjects, type TopicCategory } from "./topics";
import { CATEGORY_LABELS } from "./coaching";

// Rule-based coach used when no LLM provider is configured (and offline).
// It is deliberately opinionated, direct and never inflates a mediocre
// answer — a demanding coach, not a cheerleader.

export interface CoachContext {
  user: Pick<User, "firstName" | "goals" | "goalText" | "level">;
  summary: ProgressSummary | null;
  lastSession: Session | null;
  history: CoachMessage[];
}

export const COACH_SUGGESTIONS = [
  "Comment améliorer ma confiance à l'oral ?",
  "Pourquoi je parle trop vite ?",
  "Donne-moi un exercice pour travailler mon improvisation.",
  "Fais-moi passer un entretien d'embauche.",
  "Quelle est ma principale faiblesse ?",
  "Pose-moi des questions de culture générale.",
];

const EXERCISE_FOR: Record<Dimension, { id: string; label: string }> = {
  clarte: { id: "entretien-qualite", label: "Exercice clarté · 60 s" },
  fluidite: { id: "impro-passion", label: "Improvisation · 60 s" },
  confiance: { id: "pitch-soi", label: "Pitch personnel · 30 s" },
  structure: { id: "pres-sujet", label: "Exposé structuré · 2 min" },
  vocabulaire: { id: "impro-competence", label: "Improvisation · 60 s" },
  debit: { id: "pron-rythme", label: "Rythme et pauses · 60 s" },
  parasites: { id: "pron-rythme", label: "Rythme et pauses · 60 s" },
  argumentation: { id: "debat-teletravail", label: "Débat · 90 s" },
  grammaire: { id: "pron-articulation", label: "Articulation · 45 s" },
  persuasion: { id: "pro-client", label: "Convaincre un client · 60 s" },
  concision: { id: "pitch-soi", label: "Pitch personnel · 30 s" },
};

const TOPIC_CATEGORY_KEYWORDS: [RegExp, TopicCategory][] = [
  [/histoire/, "histoire"], [/finance|econom/, "economie"], [/philo/, "philosophie"],
  [/geo/, "geographie"], [/sciences?\b/, "sciences"], [/techno|ia\b|intelligence artificielle/, "technologie"],
  [/entreprise|business|management/, "entreprise"], [/societe|social/, "societe"], [/politi|institution/, "politique"],
  [/art|culture(?!.*generale)/, "arts"],
];

function fold(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function msg(text: string, extra: Partial<CoachMessage> = {}): CoachMessage {
  return { id: uid("m_"), role: "coach", text, createdAt: new Date().toISOString(), ...extra };
}

function activeInterview(history: CoachMessage[]): { step: number; total: number; simulationId?: string } | null {
  const lastCoach = [...history].reverse().find((m) => m.role === "coach");
  if (!lastCoach?.interview) return null;
  return lastCoach.interview.step < lastCoach.interview.total ? lastCoach.interview : null;
}

function quickAnswerFeedback(answer: string): string {
  const a = analyzeSpeech({ transcript: answer, durationSec: 0, source: "text" });
  const m = a.metrics;
  const notes: string[] = [];
  if (m.wordCount < 25) notes.push("C'est un peu court : vise 3 ou 4 phrases, avec un exemple concret.");
  else if (m.wordCount > 220) notes.push("C'est long. Vise 45 secondes à l'oral, soit environ 110 mots.");
  if (m.fillerCount >= 2) notes.push(`J'ai relevé ${m.fillerCount} mots parasites (${Object.keys(m.fillers).slice(0, 2).map((f) => `« ${f} »`).join(", ")}). À l'oral, ils s'entendent encore plus.`);
  if (m.hedges) notes.push("Tu nuances trop : remplace « je pense que » par une affirmation.");
  if (m.connectors.length === 0 && m.wordCount >= 25) notes.push("Ajoute des repères (« d'abord », « par exemple ») pour guider l'écoute.");
  if (!/\d|par exemple|exemple|quand j|lorsque j|j'ai /i.test(answer) && m.wordCount >= 25) notes.push("Il manque une preuve concrète : un chiffre, une situation vécue.");
  if (notes.length === 0) return "Réponse nette et bien construite. Rien à redire sur le fond.";
  return notes.slice(0, 2).join(" ");
}

function pickSimulation(t: string) {
  if (/recruteur|entretien.*embauche|fais[- ]?moi passer un entretien/.test(t)) return getSimulation("sim-entretien");
  if (/banque|bancaire/.test(t)) return getSimulation("sim-banque");
  if (/commercial/.test(t)) return getSimulation("sim-commercial");
  if (/client.*difficile|client.*mécontent/.test(t)) return getSimulation("sim-client-difficile");
  if (/salaire|negociation salariale|augmentation/.test(t)) return getSimulation("sim-negociation-salaire");
  if (/vente|vendre|prospect/.test(t)) return getSimulation("sim-vente");
  if (/reunion|collegue/.test(t)) return getSimulation("sim-reunion");
  if (/jury|oral|soutenance|grand oral/.test(t)) return getSimulation("sim-jury");
  if (/network|événement/.test(t)) return getSimulation("sim-networking");
  if (/conflit|desaccord/.test(t)) return getSimulation("sim-conflit");
  if (/simul|entretien/.test(t)) return getSimulation("sim-entretien");
  return null;
}

export function ruleBasedCoachReply(userText: string, ctx: CoachContext): CoachMessage {
  const t = fold(userText);
  const name = ctx.user.firstName;
  const current = ctx.summary?.current ?? null;
  const weak = weakestDimension(current);
  const strong = strongestDimension(current);

  // --- Active simulation flow ---------------------------------------------
  const interview = activeInterview(ctx.history);
  if (interview) {
    if (/^(stop|arrete|fin|termine|j'arrete)/.test(t.trim())) {
      return msg("On s'arrête là. Tu peux relancer une simulation quand tu veux, ou passer à l'oral pour une analyse complète de ta voix.", {
        action: { label: "Entretien oral · 60 s", exerciseId: "entretien-presentation" },
      });
    }
    const sim = interview.simulationId ? getSimulation(interview.simulationId) : getSimulation("sim-entretien")!;
    const questions = sim?.questions ?? [];
    const feedback = quickAnswerFeedback(userText);
    const next = interview.step + 1;
    if (next < interview.total) {
      return msg(`${feedback}\n\n${sim?.persona ?? "Le recruteur"} — Question ${next + 1}/${interview.total} : ${questions[next]}`, {
        interview: { step: next, total: interview.total, simulationId: sim?.id },
      });
    }
    return msg(
      `${feedback}\n\nFin de la simulation. Tu as tenu les ${interview.total} questions : c'est exactement l'endurance qu'il faut le jour J. Prochaine étape : refais la première question à voix haute, pour travailler ta voix et ton rythme.`,
      { interview: { step: next, total: interview.total, simulationId: sim?.id }, action: { label: "À l'oral cette fois · 60 s", exerciseId: "entretien-presentation" } },
    );
  }

  const sim = pickSimulation(t);
  if (sim) {
    return msg(
      `C'est parti. ${sim.intro}\n\n${sim.persona} — Question 1/${sim.questions.length} : ${sim.questions[0]}`,
      { interview: { step: 0, total: sim.questions.length, simulationId: sim.id } },
    );
  }

  // --- Culture générale / topic quizzing ----------------------------------
  const quizMatch = TOPIC_CATEGORY_KEYWORDS.find(([re]) => re.test(t));
  if (/culture generale|question de culture|interroge[- ]?moi/.test(t) || quizMatch) {
    const category = quizMatch?.[1];
    const pool = allSubjects(category);
    const topic = pool[Math.floor(Math.random() * pool.length)];
    return msg(
      `Question${category ? ` (${category})` : ""} : explique en une minute — ${topic.label}.\n\nTape ta réponse ici, ou lance l'exercice pour une vraie analyse vocale.`,
      { action: { label: "Répondre à l'oral", exerciseId: "culture-libre" } },
    );
  }

  // --- Topics ---------------------------------------------------------------
  if (/vite|rapide|debit|lent|rythme|precipit/.test(t)) {
    const wpm = ctx.lastSession?.analysis.metrics.wpm;
    const measured = wpm ? ` Sur ta dernière session, tu étais à ${wpm} mots/min${wpm > 160 ? ", au-dessus de la zone idéale (130–160)" : wpm < 125 ? ", un peu sous la zone idéale (130–160)" : ", dans la zone idéale"}.` : "";
    return msg(
      `On parle vite pour trois raisons : le stress, l'envie d'en finir, ou parce qu'on connaît trop bien son sujet.${measured}\n\nCe qui marche : une pause complète après chaque idée importante. Pas un ralentissement général, une vraie respiration.`,
      { action: { label: EXERCISE_FOR.debit.label, exerciseId: EXERCISE_FOR.debit.id } },
    );
  }
  if (/confian|stress|trac|timid|peur|angoiss|assurance|legitim/.test(t)) {
    const strongLine = strong ? ` Ton point fort actuel, c'est ${DIMENSION_POSSESSIVE[strong]} : appuie-toi dessus.` : "";
    return msg(
      `La confiance à l'oral se construit par la répétition, pas par la motivation.${strongLine}\n\nTrois leviers concrets :\n1. Prépare ta première phrase mot pour mot. Les 10 premières secondes fixent tout le reste.\n2. Supprime « un peu », « je pense », « peut-être » : ils affaiblissent ce que tu dis.\n3. Termine tes phrases vers le bas, comme une affirmation.`,
      { action: { label: EXERCISE_FOR.confiance.label, exerciseId: EXERCISE_FOR.confiance.id } },
    );
  }
  if (/argument|debat|convaincre|persuas/.test(t)) {
    return msg(
      "Le modèle de Toulmin en trois briques : une thèse, une preuve (exemple, chiffre), et la garantie — le lien logique qui explique pourquoi cette preuve soutient cette thèse. Ajoute une objection anticipée (« certes… mais ») et ton argument devient nettement plus solide.",
      { action: { label: EXERCISE_FOR.argumentation.label, exerciseId: EXERCISE_FOR.argumentation.id } },
    );
  }
  if (/improvis|spontan|exercice|entrain|pratiqu/.test(t)) {
    return msg(
      "Exercice « Trois mots » : trois mots au hasard, à relier dans une histoire de 75 secondes. Le but n'est pas d'être brillant, c'est de ne jamais t'arrêter. Si tu bloques, décris ce que tu vois : ça relance toujours la parole.",
      { action: { label: "Trois mots · 75 s", exerciseId: "g-trois-mots" } },
    );
  }
  if (/euh|du coup|parasite|en fait|tic|hesit/.test(t)) {
    const last = ctx.lastSession?.analysis.metrics;
    const top = last ? Object.entries(last.fillers).sort((a, b) => b[1] - a[1])[0] : undefined;
    const measured = top ? ` Chez toi, le plus fréquent en ce moment, c'est « ${top[0]} » (${top[1]} fois sur ta dernière session).` : "";
    return msg(
      `Les mots parasites remplissent un silence que tu crois gênant. Il ne l'est pas.${measured}\n\nMéthode : ne cherche pas à tout supprimer d'un coup. Cible un seul mot, et fais le défi « sans euh » jusqu'à ce qu'il disparaisse.`,
      { action: { label: "Défi sans « euh » · 60 s", exerciseId: "g-sans-euh" } },
    );
  }
  if (/structur|plan|organis|perd|fil|brouillon/.test(t)) {
    return msg(
      "Structure de base, valable presque partout :\n1. Annonce : « Je vois deux raisons. »\n2. Développe chaque point avec un exemple.\n3. Conclus en une phrase qui répond à la question.\n\nAnnoncer ton plan t'oblige à le tenir.",
      { action: { label: EXERCISE_FOR.structure.label, exerciseId: EXERCISE_FOR.structure.id } },
    );
  }
  if (/voix|monoton|intonation|articul|diction|prononc/.test(t)) {
    return msg(
      "Une voix monotone vient souvent d'une respiration haute et rapide. Deux réglages : respire par le ventre avant de commencer, et exagère légèrement tes intonations.",
      { action: { label: "Articulation · 45 s", exerciseId: "pron-articulation" } },
    );
  }
  if (/presentation|expose|oral|concours|examen|soutenance|classe|jury/.test(t)) {
    return msg(
      "Pour un oral qui compte : répète à voix haute (pas dans ta tête), chronomètre-toi, et prépare mot pour mot ton introduction et ta conclusion — le reste en mots-clés.",
      { action: { label: "Exposé express · 2 min", exerciseId: "pres-sujet" } },
    );
  }
  if (/progres|score|niveau|resultat|ou j'en suis|bilan|stat|faiblesse/.test(t)) {
    const s = ctx.summary;
    if (!s || s.sessionCount === 0) {
      return msg("Tu n'as pas encore de session analysée. Fais un premier exercice et je te donne un bilan précis.", {
        action: { label: "Premier exercice · 60 s", exerciseId: "impro-passion" },
      });
    }
    const trend = s.trend30 !== null ? (s.trend30 >= 0 ? `+${s.trend30} points sur 30 jours` : `${s.trend30} points sur 30 jours`) : "pas encore assez de recul sur 30 jours";
    const cats = Object.entries(s.byCategory).sort((a, b) => (b[1]?.count ?? 0) - (a[1]?.count ?? 0)).slice(0, 2)
      .map(([c, v]) => `${CATEGORY_LABELS[c as keyof typeof CATEGORY_LABELS]} (${v?.average})`).join(", ");
    return msg(
      `${name}, voici où tu en es : ${s.sessionCount} sessions, score moyen de ${s.averageScore}/100, ${trend}.${strong ? ` Point fort : ${DIMENSION_POSSESSIVE[strong]} (${current![strong]}).` : ""}${weak ? ` À travailler : ${DIMENSION_POSSESSIVE[weak]} (${current![weak]}).` : ""}${cats ? ` Le plus pratiqué : ${cats}.` : ""}\n\nPriorité de la semaine : ${weak ? DIMENSION_POSSESSIVE[weak] : "la régularité"}.`,
      weak ? { action: { label: EXERCISE_FOR[weak].label, exerciseId: EXERCISE_FOR[weak].id } } : {},
    );
  }
  if (/^(salut|bonjour|hello|coucou|hey|bonsoir)/.test(t.trim())) {
    return msg(`Bonjour ${name}. Sur quoi veux-tu travailler aujourd'hui ? Je peux t'expliquer un point précis, te proposer un exercice, une simulation, ou t'interroger sur un sujet.`);
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
    `${focus} Dis-m'en un peu plus sur la situation que tu prépares (entretien, réunion, oral, pitch…), ou demande-moi une simulation (${SIMULATIONS.slice(0, 3).map((s) => s.title.toLowerCase()).join(", ")}…).`,
    weak ? { action: { label: EXERCISE_FOR[weak].label, exerciseId: EXERCISE_FOR[weak].id } } : {},
  );
}

/** Compact, factual context for an LLM coach prompt. */
export function coachContextText(ctx: CoachContext): string {
  const lines = [
    `Prénom : ${ctx.user.firstName}`,
    `Objectifs : ${ctx.user.goalText ?? ctx.user.goals.join(", ")}`,
    `Niveau déclaré : ${ctx.user.level}`,
  ];
  const s = ctx.summary;
  if (s && s.current) {
    lines.push(`Sessions : ${s.sessionCount}, score moyen ${s.averageScore}/100, série ${s.streak} jours`);
    lines.push(
      "Scores récents : " +
        (Object.keys(DIMENSION_LABELS) as Dimension[]).map((d) => `${DIMENSION_LABELS[d]} ${s.current![d]}`).join(", "),
    );
    if (s.recurringIssue) lines.push(`Difficulté récurrente : « ${s.recurringIssue.label} » sur ${s.recurringIssue.sessionsAffected} des dernières sessions.`);
  }
  if (ctx.lastSession) {
    const m = ctx.lastSession.analysis.metrics;
    lines.push(
      `Dernière session : « ${ctx.lastSession.exerciseTitle} », ${ctx.lastSession.score}/100, ${m.wpm} mots/min, ${m.fillerCount} mots parasites (${Object.keys(m.fillers).slice(0, 3).join(", ") || "aucun"})`,
    );
  }
  return lines.join("\n");
}
