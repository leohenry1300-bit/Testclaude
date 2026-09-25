import type { Analysis, EarnedBadge, Plan, Session, SessionResult, User } from "./types";
import type { Exercise } from "./exercises";
import { compareAttempts, evaluateBadges, levelFor, streaks, totalXp, xpForSession } from "./progress";

export const FREE_DAILY_EXERCISES = 3;
export const FREE_DAILY_COACH_MESSAGES = 5;
export const FREE_HISTORY_DAYS = 7;

export function uid(prefix = ""): string {
  const rnd = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().replace(/-/g, "").slice(0, 16)
    : Math.random().toString(36).slice(2, 18);
  return prefix + rnd;
}

export function isPremium(user: Pick<User, "plan" | "premiumUntil">, now = new Date()): boolean {
  if (user.plan !== "premium") return false;
  return !user.premiumUntil || new Date(user.premiumUntil) > now;
}

export type Gate =
  | { ok: true }
  | { ok: false; reason: "premium_exercise" | "daily_limit"; message: string };

export function canStartExercise(
  user: Pick<User, "plan" | "premiumUntil">,
  exercise: Pick<Exercise, "premium">,
  todayCount: number,
  opts: { onboarding?: boolean } = {},
): Gate {
  if (opts.onboarding || isPremium(user)) return { ok: true };
  if (exercise.premium) {
    return { ok: false, reason: "premium_exercise", message: "Cet exercice fait partie d'Éloquence Premium." };
  }
  if (todayCount >= FREE_DAILY_EXERCISES) {
    return {
      ok: false,
      reason: "daily_limit",
      message: `Tu as fait tes ${FREE_DAILY_EXERCISES} exercices gratuits du jour. Reviens demain ou passe en Premium pour continuer.`,
    };
  }
  return { ok: true };
}

export function planLabel(plan: Plan): string {
  return plan === "premium" ? "Premium" : "Gratuit";
}

/**
 * Turns an analysis into a stored session plus its rewards. Pure: the caller
 * persists the returned session and badges. Used by both the API and the
 * offline/demo client so the rules can't drift apart.
 */
export function buildSessionResult(args: {
  userId: string;
  exercise: Pick<Exercise, "id" | "title" | "category">;
  analysis: Analysis;
  transcript: string;
  durationSec: number;
  audioUrl: string | null;
  previous: Session[];
  badges: EarnedBadge[];
  now?: Date;
  id?: string;
}): SessionResult {
  const now = args.now ?? new Date();
  const earlier = args.previous
    .filter((s) => s.exerciseId === args.exercise.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const last = earlier[0];
  const score = args.analysis.scores.global;
  const comparison = last ? compareAttempts(last, { score, analysis: args.analysis }) : null;

  const before = streaks(args.previous, now).current;
  const draft: Session = {
    id: args.id ?? uid("s_"),
    userId: args.userId,
    exerciseId: args.exercise.id,
    exerciseTitle: args.exercise.title,
    category: args.exercise.category,
    createdAt: now.toISOString(),
    durationSec: Math.round(args.durationSec),
    audioUrl: args.audioUrl,
    transcript: args.transcript,
    score,
    analysis: args.analysis,
    xpEarned: 0,
    attempt: earlier.length + 1,
  };
  const all = [...args.previous, draft];
  const after = streaks(all, now).current;
  const xp = xpForSession(score, comparison, after, before);
  draft.xpEarned = xp.reduce((a, l) => a + l.xp, 0);

  const levelBefore = levelFor(totalXp(args.previous));
  const levelAfter = levelFor(totalXp(all));
  const newBadges = evaluateBadges(all, args.badges, now);

  return {
    session: draft,
    comparison,
    xp,
    newBadges,
    levelUp: levelAfter.level > levelBefore.level ? levelAfter : null,
  };
}
