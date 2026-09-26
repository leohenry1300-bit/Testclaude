import type { CategoryId, Dimension, ProgressSummary, RecurringChallenge, Session, WeeklyGoals } from "./types";
import { DIMENSION_LABELS, DIMENSIONS } from "./analysis";
import { GAMES, type GameGroup } from "./games";
import { dayKey } from "./progress";

// ---------------------------------------------------------------------------
// Weekly goals — computed, not hand-set: principal + secondary levers from
// the current competency profile, a cultural target, and one challenge.

const GROUP_BY_DIMENSION: Partial<Record<Dimension, GameGroup>> = {
  parasites: "parasites", debit: "debit", fluidite: "improvisation", structure: "structure",
  vocabulaire: "vocabulaire", persuasion: "persuasion", argumentation: "argumentation",
};

function gameForDimension(d: Dimension): string {
  const group = GROUP_BY_DIMENSION[d] ?? "improvisation";
  const list = GAMES.filter((g) => g.group === group);
  return (list[0] ?? GAMES[0]).id;
}

function weekBounds(now: Date): { start: Date; end: Date; prevStart: Date; prevEnd: Date } {
  const day = (now.getDay() + 6) % 7; // Monday = 0
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - day);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  const prevStart = new Date(start);
  prevStart.setDate(prevStart.getDate() - 7);
  return { start, end, prevStart, prevEnd: start };
}

export function computeWeeklyGoals(sessions: Session[], summary: ProgressSummary, now = new Date()): WeeklyGoals {
  const { start, end, prevStart, prevEnd } = weekBounds(now);
  const scores = summary.current;
  const ranked = scores ? [...DIMENSIONS].sort((a, b) => scores[a] - scores[b]) : [...DIMENSIONS];
  const principalDim = ranked[0];
  const secondaryDim = summary.recurringIssue ? undefined : ranked[1];

  const thisWeekTopics = new Set(sessions.filter((s) => new Date(s.createdAt) >= start && new Date(s.createdAt) < end).map((s) => s.exerciseTitle));
  const culturalTarget = 5;

  const challengeId = summary.recurringIssue?.suggestedGameId ?? gameForDimension(principalDim);

  const weekStartKey = dayKey(start);
  const thisWeek = sessions.filter((s) => new Date(s.createdAt) >= start && new Date(s.createdAt) < end);
  const prevWeek = sessions.filter((s) => new Date(s.createdAt) >= prevStart && new Date(s.createdAt) < prevEnd);
  let recap: WeeklyGoals["recap"];
  if (thisWeek.length >= 2 && prevWeek.length >= 2) {
    const a = thisWeek.reduce((x, s) => x + s.score, 0) / thisWeek.length;
    const b = prevWeek.reduce((x, s) => x + s.score, 0) / prevWeek.length;
    const delta = Math.round(a - b);
    recap = {
      scoreDelta: delta,
      message: delta > 3 ? `+${delta} points par rapport à la semaine dernière. Ça progresse.`
        : delta < -3 ? `${delta} points par rapport à la semaine dernière. Une baisse ponctuelle, rien d'alarmant si tu restes régulier.`
        : "Score stable par rapport à la semaine dernière.",
    };
  }

  return {
    weekStart: weekStartKey,
    principal: { dimension: principalDim, label: `Améliorer ${DIMENSION_LABELS[principalDim].toLowerCase()}` },
    secondary: secondaryDim ? { dimension: secondaryDim, label: `Progresser en ${DIMENSION_LABELS[secondaryDim].toLowerCase()}` } : summary.recurringIssue
      ? { dimension: "parasites", label: `Faire disparaître « ${summary.recurringIssue.label} »` } : null,
    culturel: { label: "Découvrir de nouveaux sujets", target: culturalTarget, done: Math.min(culturalTarget, thisWeekTopics.size) },
    challenge: { label: "Relever le défi de la semaine", activityId: challengeId },
    recapAvailable: !!recap,
    recap,
  };
}

// ---------------------------------------------------------------------------
// Quick session queue — fills a time budget (5 / 15 / 30 min) with a mix of
// short activities, prioritising the current weak point.

export interface QueuedActivity {
  kind: "exercise" | "game";
  id: string;
  estSec: number;
}

const QUICK_EXERCISES = ["impro-passion", "pitch-soi", "entretien-qualite", "debat-teletravail", "story-experience", "culture-libre"];

export function buildQuickSession(minutes: 5 | 15 | 30, weakest?: Dimension, recurring?: RecurringChallenge | null): QueuedActivity[] {
  const budget = minutes * 60;
  const queue: QueuedActivity[] = [];
  let used = 0;
  if (recurring) { queue.push({ kind: "game", id: recurring.suggestedGameId, estSec: 60 }); used += 60; }
  else if (weakest) { queue.push({ kind: "game", id: gameForDimension(weakest), estSec: 60 }); used += 60; }
  let i = 0;
  while (used < budget - 20) {
    const useGame = i % 2 === 0;
    if (useGame) {
      const g = GAMES[Math.floor(Math.random() * GAMES.length)];
      if (used + g.durationSec > budget + 30) { i++; continue; }
      queue.push({ kind: "game", id: g.id, estSec: g.durationSec });
      used += g.durationSec;
    } else {
      const id = QUICK_EXERCISES[Math.floor(Math.random() * QUICK_EXERCISES.length)];
      queue.push({ kind: "exercise", id, estSec: 60 });
      used += 60;
    }
    i++;
    if (i > 12) break;
  }
  return queue;
}

// ---------------------------------------------------------------------------
// Heuristic rewrite — always available offline. Mechanically tightens the
// user's own words; never invents new content. The richer LLM-backed
// "réponse modèle" lives server-side (providers/llm.ts).

const PRO_SYNONYMS: Record<string, string> = {
  truc: "élément", trucs: "éléments", machin: "dispositif", "un peu": "sensiblement",
  "vraiment": "réellement", "super": "particulièrement efficace", "cool": "pertinent",
  "ouais": "oui", "nickel": "conforme aux attentes",
};

const HEDGE_STRIP = ["je pense que", "je crois que", "un peu", "peut-être", "en quelque sorte", "je dirais que"];
const FILLER_STRIP = ["euh", "du coup", "en fait", "genre", "voilà", "enfin bref", "bon bah", "quoi"];

export type RewriteMode = "clair" | "concis" | "pro";

export function heuristicRewrite(transcript: string, mode: RewriteMode): string {
  let text = transcript;
  for (const f of FILLER_STRIP) text = text.replace(new RegExp(`\\b${f}\\b[,]?\\s*`, "gi"), "");
  if (mode === "clair" || mode === "concis") {
    for (const h of HEDGE_STRIP) text = text.replace(new RegExp(`\\b${h}\\b\\s*`, "gi"), "");
  }
  if (mode === "pro") {
    for (const [from, to] of Object.entries(PRO_SYNONYMS)) text = text.replace(new RegExp(`\\b${from}\\b`, "gi"), to);
  }
  text = text.replace(/\s{2,}/g, " ").replace(/\s+([,.!?])/g, "$1").trim();
  if (mode === "concis") {
    const sentences = text.split(/(?<=[.!?])\s+/);
    text = sentences.filter((s) => s.split(/\s+/).length <= 26).join(" ") || sentences.slice(0, Math.ceil(sentences.length * 0.7)).join(" ");
  }
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// ---------------------------------------------------------------------------
// Category-profile label helper, used by the "compétences" view.

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  improvisation: "Improvisation", entretien: "Entretien", pitch: "Pitch", presentation: "Présentation",
  debat: "Débat", pro: "Communication pro", prononciation: "Prononciation", culture: "Culture générale",
  storytelling: "Storytelling", libre: "Entraînement libre",
};

export function normalizeForSearch(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Simple full-text search across a session's title and transcript. */
export function searchSessions(sessions: Session[], query: string): Session[] {
  const q = normalizeForSearch(query.trim());
  if (!q) return sessions;
  return sessions.filter((s) => normalizeForSearch(s.exerciseTitle).includes(q) || normalizeForSearch(s.transcript).includes(q));
}
