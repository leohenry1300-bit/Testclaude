import type {
  Badge, CategoryId, Comparison, Dimension, EarnedBadge, LevelInfo, ProgressSummary,
  RecurringChallenge, Scores, Session, XpLine,
} from "./types";
import { DIMENSIONS, DIMENSION_LABELS } from "./analysis";

// ---------------------------------------------------------------------------
// Levels

export const LEVELS: { name: string; minXp: number }[] = [
  { name: "Découverte", minXp: 0 },
  { name: "Confiance", minXp: 400 },
  { name: "Fluidité", minXp: 1200 },
  { name: "Impact", minXp: 2800 },
  { name: "Éloquence", minXp: 5500 },
  { name: "Maîtrise", minXp: 10000 },
];

export function levelFor(xp: number): LevelInfo {
  let i = 0;
  while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].minXp) i++;
  return {
    level: i + 1,
    name: LEVELS[i].name,
    minXp: LEVELS[i].minXp,
    nextXp: LEVELS[i + 1]?.minXp ?? null,
  };
}

// ---------------------------------------------------------------------------
// Dates (local calendar days)

export function dayKey(d: Date | string): string {
  const x = typeof d === "string" ? new Date(d) : d;
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function streaks(sessions: Pick<Session, "createdAt">[], now = new Date()): { current: number; best: number } {
  const days = new Set(sessions.map((s) => dayKey(s.createdAt)));
  if (days.size === 0) return { current: 0, best: 0 };
  let cursor = days.has(dayKey(now)) ? now : addDays(now, -1);
  let current = 0;
  while (days.has(dayKey(cursor))) { current++; cursor = addDays(cursor, -1); }
  const sorted = [...days].sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const k of sorted) {
    if (prev && dayKey(addDays(new Date(`${prev}T12:00:00`), 1)) === k) run++;
    else run = 1;
    best = Math.max(best, run);
    prev = k;
  }
  return { current, best: Math.max(best, current) };
}

// ---------------------------------------------------------------------------
// Badges — a large, honest set. No fake rarity, just real milestones.

export const BADGES: Badge[] = [
  { id: "first", title: "Première session", description: "Tu as pris la parole une première fois.", icon: "Mic" },
  { id: "sessions10", title: "10 sessions", description: "Dix prises de parole analysées.", icon: "Layers" },
  { id: "sessions25", title: "25 sessions", description: "Un quart de centaine de sessions.", icon: "Layers" },
  { id: "sessions50", title: "50 sessions", description: "La régularité devient une habitude.", icon: "Award" },
  { id: "sessions100", title: "100 sessions", description: "Un cap symbolique.", icon: "Award" },
  { id: "sessions250", title: "250 sessions", description: "Un entraînement de fond.", icon: "Award" },
  { id: "minutes60", title: "1 heure parlée", description: "Ta première heure d'entraînement cumulée.", icon: "Timer" },
  { id: "minutes100", title: "100 minutes parlées", description: "Plus d'une heure et demie d'entraînement.", icon: "Timer" },
  { id: "minutes600", title: "10 heures parlées", description: "Dix heures d'entraînement cumulées.", icon: "Timer" },
  { id: "words1000", title: "1 000 mots prononcés", description: "Ton millième mot analysé.", icon: "MessageSquareText" },
  { id: "words10000", title: "10 000 mots prononcés", description: "Un cap conséquent.", icon: "MessageSquareText" },
  { id: "words100000", title: "100 000 mots prononcés", description: "Un très gros volume d'entraînement.", icon: "MessageSquareText" },
  { id: "streak3", title: "3 jours consécutifs", description: "Un premier enchaînement.", icon: "Flame" },
  { id: "streak7", title: "7 jours consécutifs", description: "Une semaine sans interruption.", icon: "Flame" },
  { id: "streak14", title: "14 jours consécutifs", description: "Deux semaines de régularité.", icon: "Flame" },
  { id: "streak30", title: "30 jours consécutifs", description: "Un mois complet d'entraînement.", icon: "Trophy" },
  { id: "streak100", title: "100 jours consécutifs", description: "Une régularité exceptionnelle.", icon: "Trophy" },
  { id: "fillers50", title: "50 mots parasites éliminés", description: "Cumul estimé par rapport à tes débuts.", icon: "Eraser" },
  { id: "fillers100", title: "100 mots parasites éliminés", description: "Cumul estimé par rapport à tes débuts.", icon: "Eraser" },
  { id: "fillers500", title: "500 mots parasites éliminés", description: "Un net progrès sur la durée.", icon: "Eraser" },
  { id: "fillersHalved", title: "50 % de mots parasites en moins", description: "Par rapport à tes premières sessions.", icon: "TrendingDown" },
  { id: "score85", title: "Cap des 85", description: "Un score global de 85 ou plus.", icon: "Target" },
  { id: "score95", title: "Cap des 95", description: "Un score global de 95 ou plus.", icon: "Target" },
  { id: "improver", title: "Rebond", description: "+10 points en refaisant un exercice.", icon: "TrendingUp" },
  { id: "improver20", title: "Grand rebond", description: "+20 points en refaisant un exercice.", icon: "TrendingUp" },
  { id: "explorer", title: "Touche-à-tout", description: "Au moins une session dans 5 catégories.", icon: "Compass" },
  { id: "explorerAll", title: "Explorateur complet", description: "Au moins une session dans chaque catégorie.", icon: "Compass" },
  { id: "topics20", title: "20 sujets différents", description: "20 sujets distincts abordés à l'oral.", icon: "Globe" },
  { id: "topics50", title: "50 sujets différents", description: "50 sujets distincts abordés à l'oral.", icon: "Globe" },
  { id: "topics100", title: "100 sujets différents", description: "100 sujets distincts abordés à l'oral.", icon: "Globe" },
  { id: "games10", title: "10 jeux essayés", description: "10 mini-jeux différents joués.", icon: "Gamepad2" },
  { id: "games20", title: "20 jeux essayés", description: "20 mini-jeux différents joués.", icon: "Gamepad2" },
  { id: "simulations5", title: "5 simulations", description: "5 mises en situation avec le coach IA.", icon: "Drama" },
  { id: "diagnostic", title: "Diagnostic complet", description: "Le bilan de niveau initial est terminé.", icon: "ClipboardCheck" },
  { id: "program1", title: "Premier programme terminé", description: "Un parcours d'entraînement mené à son terme.", icon: "CalendarCheck" },
  { id: "weeklyGoal", title: "Objectif de la semaine tenu", description: "Le bilan hebdomadaire est positif.", icon: "CheckCircle2" },
  { id: "morning", title: "Lève-tôt", description: "Une session avant 8 h du matin.", icon: "Sunrise" },
  { id: "night", title: "Oiseau de nuit", description: "Une session après 22 h.", icon: "Moon" },
  { id: "readModel", title: "Curieux", description: "Tu as consulté une réponse modèle.", icon: "Eye" },
  { id: "library5", title: "5 mini-cours lus", description: "5 leçons de la bibliothèque consultées.", icon: "BookOpen" },
];

export function getBadge(id: string): Badge | undefined {
  return BADGES.find((b) => b.id === id);
}

/** Estimated fillers avoided vs. the user's first sessions, cumulated. */
export function fillersRemoved(sessions: Session[]): number {
  const sorted = [...sessions].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  if (sorted.length < 2) return 0;
  const base = sorted.slice(0, 3).reduce((a, s) => a + s.analysis.metrics.fillerPer100, 0) / Math.min(3, sorted.length);
  let removed = 0;
  for (const s of sorted.slice(1)) {
    const expected = (base * s.analysis.metrics.wordCount) / 100;
    removed += Math.max(0, expected - s.analysis.metrics.fillerCount);
  }
  return Math.round(removed);
}

function fillerHalved(sessions: Session[]): boolean {
  const sorted = [...sessions].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  if (sorted.length < 6) return false;
  const base = sorted.slice(0, 3).reduce((a, s) => a + s.analysis.metrics.fillerPer100, 0) / 3;
  const recent = sorted.slice(-3).reduce((a, s) => a + s.analysis.metrics.fillerPer100, 0) / 3;
  return base > 0.5 && recent <= base / 2;
}

const ALL_CATEGORIES: CategoryId[] = ["improvisation", "entretien", "pitch", "presentation", "debat", "pro", "prononciation", "culture", "storytelling", "libre"];

export function evaluateBadges(
  sessions: Session[],
  owned: EarnedBadge[],
  ctx: { diagnosticDone?: boolean; programCompleted?: boolean; weeklyGoalMet?: boolean; distinctGames?: number; distinctSimulations?: number; libraryRead?: number; modelAnswerSeen?: boolean } = {},
  now = new Date(),
): Badge[] {
  const have = new Set(owned.map((b) => b.id));
  const totalSec = sessions.reduce((a, s) => a + s.durationSec, 0);
  const totalWords = sessions.reduce((a, s) => a + s.analysis.metrics.wordCount, 0);
  const { current } = streaks(sessions, now);
  const categories = new Set(sessions.map((s) => s.category));
  const topics = new Set(sessions.map((s) => s.exerciseTitle));
  const lastSession = [...sessions].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const lastHour = lastSession ? new Date(lastSession.createdAt).getHours() : -1;
  const checks: Record<string, boolean> = {
    first: sessions.length >= 1,
    sessions10: sessions.length >= 10,
    sessions25: sessions.length >= 25,
    sessions50: sessions.length >= 50,
    sessions100: sessions.length >= 100,
    sessions250: sessions.length >= 250,
    minutes60: totalSec >= 3600,
    minutes100: totalSec >= 6000,
    minutes600: totalSec >= 36000,
    words1000: totalWords >= 1000,
    words10000: totalWords >= 10000,
    words100000: totalWords >= 100000,
    streak3: current >= 3,
    streak7: current >= 7,
    streak14: current >= 14,
    streak30: current >= 30,
    streak100: current >= 100,
    fillers50: fillersRemoved(sessions) >= 50,
    fillers100: fillersRemoved(sessions) >= 100,
    fillers500: fillersRemoved(sessions) >= 500,
    fillersHalved: fillerHalved(sessions),
    score85: sessions.some((s) => s.score >= 85),
    score95: sessions.some((s) => s.score >= 95),
    improver: hasImprovement(sessions, 10),
    improver20: hasImprovement(sessions, 20),
    explorer: categories.size >= 5,
    explorerAll: categories.size >= ALL_CATEGORIES.length,
    topics20: topics.size >= 20,
    topics50: topics.size >= 50,
    topics100: topics.size >= 100,
    games10: (ctx.distinctGames ?? 0) >= 10,
    games20: (ctx.distinctGames ?? 0) >= 20,
    simulations5: (ctx.distinctSimulations ?? 0) >= 5,
    diagnostic: !!ctx.diagnosticDone,
    program1: !!ctx.programCompleted,
    weeklyGoal: !!ctx.weeklyGoalMet,
    morning: lastHour >= 0 && lastHour < 8,
    night: lastHour >= 22,
    readModel: !!ctx.modelAnswerSeen,
    library5: (ctx.libraryRead ?? 0) >= 5,
  };
  return BADGES.filter((b) => !have.has(b.id) && checks[b.id]);
}

function hasImprovement(sessions: Session[], pts: number): boolean {
  const byEx = new Map<string, Session[]>();
  for (const s of [...sessions].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    const list = byEx.get(s.exerciseId) ?? [];
    if (list.some((p) => s.score - p.score >= pts)) return true;
    list.push(s);
    byEx.set(s.exerciseId, list);
  }
  return false;
}

// ---------------------------------------------------------------------------
// Comparison between two attempts of the same exercise

export function compareAttempts(prev: Session, next: { score: number; analysis: Session["analysis"] }): Comparison {
  const dimensions: Partial<Record<Dimension, number>> = {};
  for (const d of DIMENSIONS) dimensions[d] = next.analysis.scores[d] - prev.analysis.scores[d];
  const pf = prev.analysis.metrics.fillerPer100;
  const nf = next.analysis.metrics.fillerPer100;
  const fillerChangePct = pf > 0 ? Math.round(((nf - pf) / pf) * 100) : null;
  const delta = next.score - prev.score;

  const ups = DIMENSIONS.filter((d) => (dimensions[d] ?? 0) >= 5).sort((a, b) => (dimensions[b] ?? 0) - (dimensions[a] ?? 0));
  const downs = DIMENSIONS.filter((d) => (dimensions[d] ?? 0) <= -5);
  let message: string;
  if (delta >= 8) {
    const parts: string[] = [];
    if (ups.includes("structure")) parts.push("ta réponse est plus structurée");
    if (ups.includes("fluidite") || ups.includes("parasites")) parts.push("tu hésites moins");
    if (ups.includes("argumentation")) parts.push("tes arguments sont mieux étayés");
    if (ups.includes("clarte") && parts.length < 2) parts.push("tes idées sont plus nettes");
    if (ups.includes("debit") && parts.length < 2) parts.push("ton rythme est mieux posé");
    if (ups.includes("confiance") && parts.length < 2) parts.push("tu affirmes davantage");
    message = parts.length
      ? `Belle progression. ${capitalize(parts.join(" et "))}.`
      : "Belle progression sur l'ensemble de ta prestation.";
  } else if (delta >= 1) {
    message = ups.length
      ? `Tu progresses, surtout en ${DIMENSION_LABELS[ups[0]].toLowerCase()}. Continue sur cette lancée.`
      : "Légère progression. Concentre-toi sur un seul point à la prochaine tentative.";
  } else if (delta === 0) {
    message = "Score stable. Choisis un seul point à changer et refais l'exercice.";
  } else {
    message = downs.length
      ? `Un peu en retrait sur ${DIMENSION_LABELS[downs[0]].toLowerCase()}. C'est normal quand on change sa façon de parler : ça se stabilise en 2 ou 3 essais.`
      : "Un peu en retrait cette fois. Les variations sont normales, c'est la tendance qui compte.";
  }
  return { previousScore: prev.score, newScore: next.score, delta, dimensions, fillerChangePct, message };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---------------------------------------------------------------------------
// XP

export function xpForSession(
  score: number,
  comparison: Comparison | null,
  streakAfter: number,
  streakBefore: number,
  constraintPassed?: boolean,
): XpLine[] {
  const lines: XpLine[] = [{ label: "Session terminée", xp: 10 }];
  lines.push({ label: `Score de ${score}`, xp: Math.max(10, Math.round(score * 0.5)) });
  if (comparison && comparison.delta > 0) lines.push({ label: "Amélioration", xp: 20 });
  if (constraintPassed) lines.push({ label: "Défi réussi", xp: 25 });
  if (streakAfter > streakBefore && streakAfter > 0 && streakAfter % 7 === 0) {
    lines.push({ label: `Série de ${streakAfter} jours`, xp: 30 });
  }
  return lines;
}

export function totalXp(sessions: Pick<Session, "xpEarned">[]): number {
  return sessions.reduce((a, s) => a + s.xpEarned, 0);
}

// ---------------------------------------------------------------------------
// Summary & series

export function averageScores(sessions: Session[]): Scores | null {
  if (!sessions.length) return null;
  const out = { global: 0 } as Scores;
  for (const d of DIMENSIONS) out[d] = 0;
  for (const s of sessions) {
    out.global += s.analysis.scores.global;
    for (const d of DIMENSIONS) out[d] += s.analysis.scores[d];
  }
  out.global = Math.round(out.global / sessions.length);
  for (const d of DIMENSIONS) out[d] = Math.round(out[d] / sessions.length);
  return out;
}

/** The real "competency profile": average score & session count per category. */
export function categoryProfile(sessions: Session[]): Partial<Record<CategoryId, { average: number; count: number }>> {
  const out: Partial<Record<CategoryId, { average: number; count: number }>> = {};
  const byCat = new Map<CategoryId, number[]>();
  for (const s of sessions) {
    const list = byCat.get(s.category) ?? [];
    list.push(s.score);
    byCat.set(s.category, list);
  }
  for (const [cat, scores] of byCat) {
    out[cat] = { average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length), count: scores.length };
  }
  return out;
}

/** Detects an issue that keeps coming back across recent sessions. */
export function detectRecurringIssue(sessions: Session[], windowSize = 8): RecurringChallenge | null {
  const recent = [...sessions].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, windowSize);
  if (recent.length < 3) return null;
  const counts = new Map<string, { label: string; kind: RecurringChallenge["kind"]; occurrences: number; sessions: Set<string> }>();
  for (const s of recent) {
    for (const issue of s.analysis.issues) {
      if (issue.kind !== "filler" && issue.kind !== "repetition" && issue.kind !== "hedge") continue;
      const key = `${issue.kind}:${issue.label}`;
      const e = counts.get(key) ?? { label: issue.label, kind: issue.kind, occurrences: 0, sessions: new Set() };
      e.occurrences += issue.count;
      e.sessions.add(s.id);
      counts.set(key, e);
    }
  }
  let best: { key: string; label: string; kind: RecurringChallenge["kind"]; occurrences: number; sessions: Set<string> } | null = null;
  for (const [key, e] of counts) {
    if (e.sessions.size < 3) continue;
    if (!best || e.occurrences > best.occurrences) best = { key, ...e };
  }
  if (!best) return null;
  const suggestedGameId = best.kind === "filler" && /euh|voilà|donc|quoi|du coup|en fait|genre/.test(best.label) ? "g-sans-euh" : best.kind === "filler" ? "g-mot-interdit" : "g-synonymes";
  return { key: best.key, label: best.label, kind: best.kind, occurrences: best.occurrences, sessionsAffected: best.sessions.size, suggestedGameId };
}

export function summarize(
  sessions: Session[],
  badges: EarnedBadge[],
  now = new Date(),
): ProgressSummary {
  const sorted = [...sessions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const xp = totalXp(sessions);
  const level = levelFor(xp);
  const levelProgress = level.nextXp ? (xp - level.minXp) / (level.nextXp - level.minXp) : 1;
  const { current, best } = streaks(sessions, now);
  const weekStart = addDays(now, -6);
  weekStart.setHours(0, 0, 0, 0);
  const week = sessions.filter((s) => new Date(s.createdAt) >= weekStart);
  const monthAgo = addDays(now, -30);
  const lastMonth = sorted.filter((s) => new Date(s.createdAt) >= monthAgo);
  let trend30: number | null = null;
  if (lastMonth.length >= 4) {
    const chron = [...lastMonth].reverse();
    const k = Math.max(2, Math.floor(chron.length / 3));
    const first = chron.slice(0, k).reduce((a, s) => a + s.score, 0) / k;
    const last = chron.slice(-k).reduce((a, s) => a + s.score, 0) / k;
    trend30 = Math.round(last - first);
  }
  return {
    xp,
    level,
    levelProgress,
    streak: current,
    bestStreak: best,
    sessionCount: sessions.length,
    totalSec: sessions.reduce((a, s) => a + s.durationSec, 0),
    totalWords: sessions.reduce((a, s) => a + s.analysis.metrics.wordCount, 0),
    averageScore: sessions.length ? Math.round(sessions.reduce((a, s) => a + s.score, 0) / sessions.length) : 0,
    bestScore: sessions.reduce((m, s) => Math.max(m, s.score), 0),
    weekSec: week.reduce((a, s) => a + s.durationSec, 0),
    weekSessions: week.length,
    current: averageScores(sorted.slice(0, 5)),
    trend30,
    fillersRemoved: fillersRemoved(sessions),
    todayCount: sessions.filter((s) => dayKey(s.createdAt) === dayKey(now)).length,
    badges,
    byCategory: categoryProfile(sessions),
    distinctTopics: new Set(sessions.map((s) => s.exerciseTitle)).size,
    recurringIssue: detectRecurringIssue(sessions),
  };
}

export interface SeriesPoint {
  date: string; // day key
  score: number;
  sessions: number;
}

/** One point per day with sessions (average score), within the range. */
export function scoreSeries(sessions: Session[], days: number, now = new Date()): SeriesPoint[] {
  const start = addDays(now, -(days - 1));
  start.setHours(0, 0, 0, 0);
  const map = new Map<string, { total: number; n: number }>();
  for (const s of sessions) {
    if (new Date(s.createdAt) < start) continue;
    const k = dayKey(s.createdAt);
    const e = map.get(k) ?? { total: 0, n: 0 };
    e.total += s.score;
    e.n++;
    map.set(k, e);
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, e]) => ({ date, score: Math.round(e.total / e.n), sessions: e.n }));
}

/** Minutes spoken per day for the last 7 days (including empty days). */
export function weekActivity(sessions: Session[], now = new Date()): { date: string; minutes: number }[] {
  const out: { date: string; minutes: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const k = dayKey(addDays(now, -i));
    const sec = sessions.filter((s) => dayKey(s.createdAt) === k).reduce((a, s) => a + s.durationSec, 0);
    out.push({ date: k, minutes: Math.round((sec / 60) * 10) / 10 });
  }
  return out;
}

export function weakestDimension(scores: Scores | null): Dimension | undefined {
  if (!scores) return undefined;
  return [...DIMENSIONS].sort((a, b) => scores[a] - scores[b])[0];
}

export function strongestDimension(scores: Scores | null): Dimension | undefined {
  if (!scores) return undefined;
  return [...DIMENSIONS].sort((a, b) => scores[b] - scores[a])[0];
}
