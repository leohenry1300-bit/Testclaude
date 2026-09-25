import { describe, expect, it } from "vitest";
import {
  analyzeSpeech, buildSessionResult, canStartExercise, createDemoAccount,
  generateProgram, getExercise, ruleBasedCoachReply, streaks, summarize,
} from "./index";

const exercise = getExercise("entretien-presentation")!;

describe("analyzeSpeech", () => {
  it("detects fillers, including multi-word ones and contextual tics", () => {
    const a = analyzeSpeech({
      transcript: "Bonjour, euh, je suis actuellement étudiant et, du coup, je cherche un stage. Du coup j'ai postulé. En fait, du coup, voilà quoi.",
      durationSec: 12,
      source: "speech",
    }, { exercise });
    expect(a.metrics.fillers["du coup"]).toBe(3);
    expect(a.metrics.fillers["euh"]).toBe(1);
    expect(a.metrics.fillers["en fait"]).toBe(1);
    expect(a.metrics.fillers["quoi"]).toBe(1);
    const issue = a.issues.find((i) => i.label === "« du coup »")!;
    expect(issue.detail).toBe("« du coup » utilisé 3 fois.");
    // Highlighted tokens point to their issue.
    const tokens = a.sentences.flatMap((s) => s.tokens).filter((t) => t.kind === "filler");
    expect(tokens.length).toBeGreaterThanOrEqual(7);
  });

  it("does not flag 'donc' used once as a connector", () => {
    const a = analyzeSpeech({ transcript: "Il pleuvait, donc nous sommes restés à la maison pour travailler sur le projet ensemble.", durationSec: 6, source: "speech" });
    expect(a.metrics.fillers["donc"]).toBeUndefined();
  });

  it("scores a clean structured answer higher than a messy one", () => {
    const clean = "Je m'appelle Camille. D'abord, j'ai étudié le marketing à Lyon. Ensuite, j'ai travaillé deux ans dans une start-up où nous avons doublé les inscriptions. Par exemple, j'ai piloté une campagne qui a touché cent mille personnes. Pour conclure, je cherche aujourd'hui un poste où allier analyse et créativité.";
    const messy = "Euh bah je m'appelle Camille euh et du coup en fait j'ai fait un peu de marketing genre et euh du coup je sais pas je pense que j'ai fait des trucs et tout euh dans une boîte et du coup voilà en fait euh je cherche un truc quoi.";
    const words = (t: string) => t.split(" ").length;
    const a = analyzeSpeech({ transcript: clean, durationSec: Math.round(words(clean) / 2.4), source: "speech" }, { exercise });
    const b = analyzeSpeech({ transcript: messy, durationSec: Math.round(words(messy) / 2.4), source: "speech" }, { exercise });
    expect(a.scores.global).toBeGreaterThan(b.scores.global + 10);
    expect(a.scores.parasites).toBeGreaterThan(90);
    expect(b.scores.parasites).toBeLessThan(50);
    expect(a.metrics.connectors).toContain("pour conclure");
    expect(b.metrics.hedges).toBeGreaterThan(0);
    expect(b.feedback.retry.length).toBeGreaterThan(10);
  });

  it("computes pace and pauses from segments and silences", () => {
    const a = analyzeSpeech({
      transcript: "",
      durationSec: 20,
      source: "speech",
      segments: [
        { text: "Je vais vous présenter mon projet de fin d'études", start: 0.5, end: 4 },
        { text: "Il s'agit d'une application qui aide les étudiants à mieux dormir", start: 7, end: 11 },
        { text: "Nous avons testé avec cent personnes et les résultats sont encourageants", start: 11.4, end: 15.5 },
      ],
      silences: [{ start: 4, end: 7 }],
    });
    expect(a.metrics.pauseCount).toBe(1);
    expect(a.metrics.longestPause).toBe(3);
    expect(a.metrics.pace.length).toBe(3);
    expect(a.sentences[0].pauseAfter).toBe(3);
  });

  it("flags long sentences and caps very short answers", () => {
    const long = Array.from({ length: 40 }, (_, i) => `mot${i}`).join(" ");
    const a = analyzeSpeech({ transcript: long + ".", durationSec: 16, source: "speech" });
    expect(a.metrics.longSentences).toBe(1);
    const short = analyzeSpeech({ transcript: "Bonjour à tous.", durationSec: 3, source: "speech" });
    expect(short.scores.global).toBeLessThanOrEqual(35);
    expect(short.feedback.headline).toMatch(/Pas assez/);
  });
});

describe("sessions, streaks & rewards", () => {
  it("computes streaks over consecutive days", () => {
    const now = new Date("2026-09-25T12:00:00");
    const at = (d: number) => ({ createdAt: new Date(now.getTime() - d * 86_400_000).toISOString() });
    expect(streaks([at(0), at(1), at(2), at(4)], now)).toEqual({ current: 3, best: 3 });
    expect(streaks([at(1), at(2)], now).current).toBe(2); // today not done yet
    expect(streaks([at(3)], now).current).toBe(0);
  });

  it("compares retries and awards XP & badges", () => {
    const ex = getExercise("impro-passion")!;
    const first = buildSessionResult({
      userId: "u", exercise: ex, transcript: "x", durationSec: 60, audioUrl: null, previous: [], badges: [],
      analysis: analyzeSpeech({ transcript: "Euh du coup je aime euh la photo en fait euh du coup voilà quoi euh genre.", durationSec: 20, source: "speech" }),
    });
    expect(first.comparison).toBeNull();
    expect(first.newBadges.map((b) => b.id)).toContain("first");
    const second = buildSessionResult({
      userId: "u", exercise: ex, transcript: "y", durationSec: 60, audioUrl: null, previous: [first.session], badges: [{ id: "first", earnedAt: "" }],
      analysis: analyzeSpeech({ transcript: "Ce qui me passionne, c'est la photographie de rue. D'abord parce qu'elle apprend à observer. Par exemple, une scène banale devient une histoire. Pour conclure, il suffit de regarder autour de soi.", durationSec: 20, source: "speech" }),
    });
    expect(second.comparison).not.toBeNull();
    expect(second.comparison!.delta).toBeGreaterThan(0);
    expect(second.xp.some((l) => l.label === "Amélioration")).toBe(true);
    expect(second.session.attempt).toBe(2);
  });

  it("gates free users", () => {
    const free = { plan: "free" as const, premiumUntil: null };
    expect(canStartExercise(free, { premium: true }, 0).ok).toBe(false);
    expect(canStartExercise(free, { premium: false }, 3).ok).toBe(false);
    expect(canStartExercise(free, { premium: false }, 3, { onboarding: true }).ok).toBe(true);
    expect(canStartExercise({ plan: "premium", premiumUntil: null }, { premium: true }, 10).ok).toBe(true);
  });
});

describe("demo account", () => {
  it("looks like an active user", () => {
    const now = new Date();
    const demo = createDemoAccount(now);
    const s = summarize(demo.sessions, demo.badges, now);
    expect(s.sessionCount).toBe(17);
    expect(s.streak).toBe(6);
    expect(s.averageScore).toBeGreaterThanOrEqual(74);
    expect(s.averageScore).toBeLessThanOrEqual(82);
    expect(s.trend30).toBeGreaterThan(8);
    expect(demo.badges.length).toBeGreaterThan(1);
    expect(demo.program?.days.filter((d) => d.done).length).toBeGreaterThan(0);
  });
});

describe("programs & coach", () => {
  it("builds a 14-day program from a goal sentence", () => {
    const p = generateProgram("Je veux réussir mon prochain entretien.", "aisance");
    expect(p.days).toHaveLength(14);
    expect(p.days[0].title).toBe("Se présenter");
    expect(p.days.some((d) => d.exerciseId === "entretien-difficulte")).toBe(true);
  });

  it("runs a mock interview", () => {
    const user = { firstName: "Léa", goal: "entretiens" as const, goalText: null, level: "debutant" as const };
    const start = ruleBasedCoachReply("Fais-moi passer un entretien d'embauche.", { user, summary: null, lastSession: null, history: [] });
    expect(start.interview).toEqual({ step: 0, total: 4 });
    const next = ruleBasedCoachReply("Euh je suis étudiante du coup voilà.", {
      user, summary: null, lastSession: null,
      history: [{ id: "1", role: "user", text: "x", createdAt: "" }, start],
    });
    expect(next.interview?.step).toBe(1);
    expect(next.text).toMatch(/Question 2\/4/);
  });
});
