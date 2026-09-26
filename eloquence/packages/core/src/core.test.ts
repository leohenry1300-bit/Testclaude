import { describe, expect, it } from "vitest";
import {
  analyzeSpeech, buildDiagnosticReport, buildGameActivity, buildQuickSession, buildSessionResult,
  buildTemplateProgram, computeWeeklyGoals, createDemoAccount, detectRecurringIssue, GAMES,
  generateProgram, generateTopicActivity, getExercise, getGame, getSimulation, heuristicRewrite,
  pickTopic, ruleBasedCoachReply, searchSessions, streaks, summarize, TOPIC_COUNT,
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
    const tokens = a.sentences.flatMap((s) => s.tokens).filter((t) => t.kind === "filler");
    expect(tokens.length).toBeGreaterThanOrEqual(7);
  });

  it("detects grammar slips and argumentation markers", () => {
    const a = analyzeSpeech({
      transcript: "Malgré que ce soit difficile, je pense que c'est possible. Par exemple, on l'a déjà vu ailleurs. Cependant, il faut nuancer ce point.",
      durationSec: 12, source: "speech",
    });
    expect(a.metrics.grammarFlags.length).toBeGreaterThan(0);
    expect(a.metrics.exampleMarkers).toBeGreaterThan(0);
    expect(a.metrics.counterArgumentMarkers).toBeGreaterThan(0);
    expect(a.scores.grammaire).toBeLessThan(96);
  });

  it("scores a clean structured answer higher than a messy one, with grounded feedback", () => {
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
    expect(b.feedback.weaknesses.length).toBeGreaterThan(0);
    expect(b.feedback.weaknesses.length).toBeLessThanOrEqual(3);
    expect(b.feedback.strengths.length).toBeLessThanOrEqual(3);
    expect(b.feedback.goal.length).toBeGreaterThan(10);
    // The example, when present, must be a real excerpt from the transcript.
    if (b.feedback.example) expect(messy).toContain(b.feedback.example.text.split(" ")[0]);
  });

  it("checks game constraints (forbidden words, must-include, pace target)", () => {
    const forbidden = analyzeSpeech(
      { transcript: "C'est un vrai truc intéressant, un vrai truc marquant.", durationSec: 6, source: "speech" },
      { constraint: { type: "forbidden_words", words: ["truc"] } },
    );
    expect(forbidden.constraintResult?.passed).toBe(false);

    const mustInclude = analyzeSpeech(
      { transcript: "Le pont et la valise étaient dans le grenier.", durationSec: 6, source: "speech" },
      { constraint: { type: "must_include", words: ["valise", "orage"] } },
    );
    expect(mustInclude.constraintResult?.passed).toBe(false);
    expect(mustInclude.constraintResult?.detail).toContain("orage");

    const paceOk = analyzeSpeech(
      { transcript: "test", durationSec: 20, source: "speech", segments: [{ text: "un deux trois quatre cinq six sept huit neuf dix onze douze treize quatorze quinze seize dix-sept dix-huit dix-neuf vingt", start: 0, end: 8 }] },
      { constraint: { type: "pace_target", min: 100, max: 200 } },
    );
    expect(paceOk.constraintResult?.constraint.type).toBe("pace_target");
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

  it("caps very short answers", () => {
    const short = analyzeSpeech({ transcript: "Bonjour à tous.", durationSec: 3, source: "speech" });
    expect(short.scores.global).toBeLessThanOrEqual(35);
    expect(short.feedback.headline).toMatch(/Pas assez/);
  });
});

describe("sessions, streaks & rewards — no gating anywhere", () => {
  it("computes streaks over consecutive days", () => {
    const now = new Date("2026-09-25T12:00:00");
    const at = (d: number) => ({ createdAt: new Date(now.getTime() - d * 86_400_000).toISOString() });
    expect(streaks([at(0), at(1), at(2), at(4)], now)).toEqual({ current: 3, best: 3 });
    expect(streaks([at(1), at(2)], now).current).toBe(2);
    expect(streaks([at(3)], now).current).toBe(0);
  });

  it("compares retries and awards XP & badges", () => {
    const ex = getExercise("impro-passion")!;
    const first = buildSessionResult({
      userId: "u", exercise: ex, source: "catalogue", transcript: "x", durationSec: 60, audioUrl: null, previous: [], badges: [],
      analysis: analyzeSpeech({ transcript: "Euh du coup je aime euh la photo en fait euh du coup voilà quoi euh genre.", durationSec: 20, source: "speech" }),
    });
    expect(first.comparison).toBeNull();
    expect(first.newBadges.map((b) => b.id)).toContain("first");
    const second = buildSessionResult({
      userId: "u", exercise: ex, source: "catalogue", transcript: "y", durationSec: 60, audioUrl: null, previous: [first.session], badges: [{ id: "first", earnedAt: "" }],
      analysis: analyzeSpeech({ transcript: "Ce qui me passionne, c'est la photographie de rue. D'abord parce qu'elle apprend à observer. Par exemple, une scène banale devient une histoire. Pour conclure, il suffit de regarder autour de soi.", durationSec: 20, source: "speech" }),
    });
    expect(second.comparison).not.toBeNull();
    expect(second.comparison!.delta).toBeGreaterThan(0);
    expect(second.xp.some((l) => l.label === "Amélioration")).toBe(true);
    expect(second.session.attempt).toBe(2);
  });
});

describe("topics, games & simulations", () => {
  it("generates a large number of distinct topic subjects", () => {
    expect(TOPIC_COUNT).toBeGreaterThan(200);
    const { topic, activity } = pickTopic({ category: "histoire" });
    expect(topic.category).toBe("histoire");
    expect(activity.prompt.length).toBeGreaterThan(5);
  });

  it("has a large, functional games catalogue with real constraints", () => {
    expect(GAMES.length).toBeGreaterThan(20);
    const g = getGame("g-mot-interdit")!;
    const { exercise: act, constraint } = buildGameActivity(g);
    expect(act.title).toBe("Mot interdit");
    expect(constraint?.type).toBe("forbidden_words");
    // Built exactly once: the returned constraint matches the activity's own instruction.
    if (constraint?.type === "forbidden_words") {
      for (const w of constraint.words) expect(act.instruction).toContain(w);
    }
  });

  it("exposes runnable simulations with a scripted question flow", () => {
    const sim = getSimulation("sim-entretien")!;
    expect(sim.questions.length).toBeGreaterThanOrEqual(4);
  });

  it("generateTopicActivity never repeats the exact same generated id", () => {
    const a = generateTopicActivity({ id: "x", label: "le climat", category: "sciences" });
    const b = generateTopicActivity({ id: "x", label: "le climat", category: "sciences" });
    expect(a.id).not.toBe(b.id);
  });
});

describe("diagnostic", () => {
  it("builds a report from 8 step results", () => {
    const scores = (global: number) => ({
      global, clarte: global, fluidite: global, confiance: global, structure: global, vocabulaire: global,
      debit: global, parasites: global, argumentation: global, grammaire: global, persuasion: global, concision: global,
    });
    const steps = [
      { stepId: "presentation", title: "Présentation", sessionId: "s1", scores: scores(70) },
      { stepId: "improvisation", title: "Improvisation", sessionId: "s2", scores: scores(50) },
      { stepId: "argumentation", title: "Argumentation", sessionId: "s3", scores: scores(90) },
    ];
    const report = buildDiagnosticReport(steps);
    expect(report.averageScores.global).toBe(70);
    expect(report.level).toBe("a_l_aise");
    expect(report.summary.length).toBeGreaterThan(20);
  });
});

describe("weekly goals, recurring issues & quick sessions", () => {
  it("detects a recurring filler across recent sessions", () => {
    const ex = getExercise("impro-passion")!;
    let sessions: ReturnType<typeof buildSessionResult>["session"][] = [];
    for (let i = 0; i < 4; i++) {
      const text = "Du coup je pense que du coup c'est bien, du coup vraiment.";
      const r = buildSessionResult({
        userId: "u", exercise: ex, source: "catalogue", transcript: text, durationSec: 30, audioUrl: null, previous: sessions, badges: [],
        analysis: analyzeSpeech({ transcript: text, durationSec: 15, source: "speech" }),
        now: new Date(Date.now() - (4 - i) * 86_400_000),
      });
      sessions = [...sessions, r.session];
    }
    const recurring = detectRecurringIssue(sessions);
    expect(recurring?.label).toBe("« du coup »");
    expect(recurring?.suggestedGameId).toBe("g-sans-euh");

    const summary = summarize(sessions, []);
    const weekly = computeWeeklyGoals(sessions, summary);
    expect(weekly.principal.dimension).toBeDefined();
    expect(weekly.challenge.activityId.length).toBeGreaterThan(0);
  });

  it("builds a quick session queue that roughly fits the time budget", () => {
    const q5 = buildQuickSession(5);
    const total = q5.reduce((a, x) => a + x.estSec, 0);
    expect(total).toBeGreaterThan(60);
    expect(total).toBeLessThan(5 * 60 + 90);
  });

  it("searches sessions by transcript content", () => {
    const ex = getExercise("impro-passion")!;
    const text = "Je parle de photographie et de voyages à Lisbonne.";
    const r = buildSessionResult({
      userId: "u", exercise: ex, source: "catalogue", transcript: text, durationSec: 30, audioUrl: null, previous: [], badges: [],
      analysis: analyzeSpeech({ transcript: text, durationSec: 15, source: "speech" }),
    });
    expect(searchSessions([r.session], "lisbonne")).toHaveLength(1);
    expect(searchSessions([r.session], "cuisine")).toHaveLength(0);
  });
});

describe("heuristic rewrite (always available offline)", () => {
  it("mechanically tightens the user's own words without inventing content", () => {
    const original = "Euh, je pense que, du coup, c'est un peu un truc intéressant, voilà.";
    const clear = heuristicRewrite(original, "clair");
    expect(clear).not.toMatch(/euh|du coup/i);
    const concise = heuristicRewrite(original, "concis");
    expect(concise.length).toBeLessThanOrEqual(original.length);
  });
});

describe("demo account", () => {
  it("looks like an active user with a real competency profile", () => {
    const now = new Date();
    const demo = createDemoAccount(now);
    const s = summarize(demo.sessions, demo.badges, now);
    expect(s.sessionCount).toBe(17);
    expect(s.streak).toBe(6);
    expect(s.averageScore).toBeGreaterThanOrEqual(74);
    expect(s.averageScore).toBeLessThanOrEqual(82);
    expect(s.trend30).toBeGreaterThan(8);
    expect(demo.badges.length).toBeGreaterThan(1);
    expect(demo.program?.days.some((d) => d.done)).toBe(true);
    expect(Object.keys(s.byCategory).length).toBeGreaterThan(1);
    expect(demo.diagnostic).not.toBeNull();
  });
});

describe("programs & coach", () => {
  it("builds a named template program end to end", () => {
    const p = buildTemplateProgram("tpl-entretien")!;
    expect(p.days).toHaveLength(14);
    expect(p.days.every((d) => d.activityId.length > 0)).toBe(true);
  });

  it("builds a personalised program from multiple goals and a free-text objective", () => {
    const p = generateProgram("Je veux réussir mon prochain entretien.", ["aisance", "confiance"], "structure", null, 14);
    expect(p.days).toHaveLength(14);
  });

  it("runs a generalised roleplay simulation via the rule-based coach", () => {
    const user = { firstName: "Léa", goals: ["entretiens"] as import("./types").Goal[], goalText: null, level: "debutant" as const };
    const start = ruleBasedCoachReply("Fais-moi passer un entretien d'embauche.", { user, summary: null, lastSession: null, history: [] });
    expect(start.interview?.total).toBe(5);
    const next = ruleBasedCoachReply("Euh je suis étudiante du coup voilà.", {
      user, summary: null, lastSession: null,
      history: [{ id: "1", role: "user", text: "x", createdAt: "" }, start],
    });
    expect(next.interview?.step).toBe(1);
    expect(next.text).toMatch(/Question 2\/5/);
  });

  it("runs other simulation personas too, not just the hardcoded interview", () => {
    const user = { firstName: "Léa", goals: ["commercial"] as import("./types").Goal[], goalText: null, level: "debutant" as const };
    const start = ruleBasedCoachReply("Fais-moi une négociation salariale.", { user, summary: null, lastSession: null, history: [] });
    expect(start.interview?.simulationId).toBe("sim-negociation-salaire");
  });
});
