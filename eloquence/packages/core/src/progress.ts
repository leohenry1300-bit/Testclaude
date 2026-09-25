import type {
  Badge, Comparison, Dimension, EarnedBadge, LevelInfo, ProgressSummary,
  Scores, Session, XpLine,
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
  // Current streak: counts today, or ends yesterday if today isn't done yet.
  let cursor = days.has(dayKey(now)) ? now : addDays(now, -1);
  let current = 0;
  while (days.has(dayKey(cursor))) { current++; cursor = addDays(cursor, -1); }
  // Best streak.
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
// Badges

export const BADGES: Badge[] = [
  { id: "first", title: "Première session", description: "Tu as pris la parole une première fois.", icon: "Mic" },
  { id: "sessions10", title: "10 sessions", description: "Dix prises de parole analysées.", icon: "Layers" },
  { id: "sessions50", title: "50 sessions", description: "La régularité devient une habitude.", icon: "Award" },
  { id: "minutes100", title: "100 minutes parlées", description: "Plus d'une heure et demie d'entraînement.", icon: "Timer" },
  { id: "streak7", title: "7 jours consécutifs", description: "Une semaine sans interruption.", icon: "Flame" },
  { id: "streak30", title: "30 jours consécutifs", description: "Un mois complet d'entraînement.", icon: "Trophy" },
  { id: "fillers100", title: "100 mots parasites éliminés", description: "Cumul de mots parasites en moins par rapport à ta première session.", icon: "Eraser" },
  { id: "score85", title: "Cap des 85", description: "Un score global de 85 ou plus.", icon: "Target" },
  { id: "improver", title: "Rebond", description: "+10 points en refaisant un exercice.", icon: "TrendingUp" },
  { id: "explorer", title: "Touche-à-tout", description: "Au moins un exercice dans 5 catégories.", icon: "Compass" },
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

export function evaluateBadges(sessions: Session[], owned: EarnedBadge[], now = new Date()): Badge[] {
  const have = new Set(owned.map((b) => b.id));
  const totalSec = sessions.reduce((a, s) => a + s.durationSec, 0);
  const { current } = streaks(sessions, now);
  const categories = new Set(sessions.map((s) => s.category));
  const checks: Record<string, boolean> = {
    first: sessions.length >= 1,
    sessions10: sessions.length >= 10,
    sessions50: sessions.length >= 50,
    minutes100: totalSec >= 6000,
    streak7: current >= 7,
    streak30: current >= 30,
    fillers100: fillersRemoved(sessions) >= 100,
    score85: sessions.some((s) => s.score >= 85),
    improver: hasImprovement(sessions, 10),
    explorer: categories.size >= 5,
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
): XpLine[] {
  const lines: XpLine[] = [{ label: "Session terminée", xp: 10 }];
  lines.push({ label: `Score de ${score}`, xp: Math.max(10, Math.round(score * 0.5)) });
  if (comparison && comparison.delta > 0) lines.push({ label: "Amélioration", xp: 20 });
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

export function summarize(sessions: Session[], badges: EarnedBadge[], now = new Date()): ProgressSummary {
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
