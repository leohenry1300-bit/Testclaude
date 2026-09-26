import type { Analysis, EarnedBadge, Session, SessionResult } from "./types";
import type { Exercise } from "./exercises";
import {
  compareAttempts, detectRecurringIssue, evaluateBadges, levelFor, streaks, totalXp, xpForSession,
} from "./progress";

export function uid(prefix = ""): string {
  const rnd = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().replace(/-/g, "").slice(0, 16)
    : Math.random().toString(36).slice(2, 18);
  return prefix + rnd;
}

/**
 * Turns an analysis into a stored session plus its rewards. Pure: the caller
 * persists the returned session and badges. Used by both the API and the
 * offline/demo client so the rules can't drift apart.
 *
 * This is a personal, single-user app: nothing here gates access — every
 * exercise, game, simulation and coach conversation is unlimited.
 */
export function buildSessionResult(args: {
  userId: string;
  exercise: Pick<Exercise, "id" | "title" | "category">;
  source: Session["source"];
  analysis: Analysis;
  transcript: string;
  durationSec: number;
  audioUrl: string | null;
  previous: Session[];
  badges: EarnedBadge[];
  badgeContext?: Parameters<typeof evaluateBadges>[2];
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
    source: args.source,
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
  const xp = xpForSession(score, comparison, after, before, args.analysis.constraintResult?.passed);
  draft.xpEarned = xp.reduce((a, l) => a + l.xp, 0);

  const levelBefore = levelFor(totalXp(args.previous));
  const levelAfter = levelFor(totalXp(all));
  const newBadges = evaluateBadges(all, args.badges, args.badgeContext, now);
  const recurringChallenge = detectRecurringIssue(all);

  return {
    session: draft,
    comparison,
    xp,
    newBadges,
    levelUp: levelAfter.level > levelBefore.level ? levelAfter : null,
    recurringChallenge,
  };
}
