import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { createApp } from "./app";
import { loadConfig } from "./config";
import { Store } from "./db";
import { ClientTranscriptStt } from "./providers/stt";
import { HeuristicLlm } from "./providers/llm";
import { ConsoleMailer, LocalDiskStorage } from "./providers/services";

let server: Server;
let base: string;
let dir: string;
let token = "";

const MESSY = "Bonjour, euh, je suis étudiant et, du coup, je cherche un stage. Du coup, euh, j'aime le marketing et en fait je suis motivé. Du coup voilà.";
const CLEAN = "Bonjour, je m'appelle Alex. D'abord, j'étudie le marketing à Nantes. Ensuite, j'ai mené une campagne qui a doublé les inscriptions d'une association. Par exemple, nous avons touché dix mille personnes en un mois. Pour conclure, je cherche un stage où apprendre vite.";

async function api(method: string, url: string, body?: unknown, auth = true) {
  const headers: Record<string, string> = {};
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  let payload: FormData | string | undefined;
  if (body instanceof FormData) payload = body;
  else if (body !== undefined) { headers["Content-Type"] = "application/json"; payload = JSON.stringify(body); }
  const res = await fetch(base + url, { method, headers, body: payload });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { status: res.status, body: (await res.json()) as any };
}

function sessionForm(exerciseId: string, transcript: string, withAudio = false) {
  const f = new FormData();
  f.append("meta", JSON.stringify({ exerciseId, capture: { transcript, durationSec: 20, source: "speech" } }));
  if (withAudio) f.append("audio", new Blob([new Uint8Array([26, 69, 223, 163, 1, 2, 3])], { type: "audio/webm" }), "a.webm");
  return f;
}

beforeAll(async () => {
  dir = mkdtempSync(path.join(tmpdir(), "eloq-"));
  const config = loadConfig({ DATA_DIR: dir, JWT_SECRET: "test-secret", WEB_DIST: path.join(dir, "none"), GOOGLE_CLIENT_ID: "cid" });
  const app = createApp({
    config,
    store: new Store(path.join(dir, "db.sqlite")),
    stt: new ClientTranscriptStt(),
    llm: new HeuristicLlm(),
    storage: new LocalDiskStorage(path.join(dir, "audio")),
    mailer: { name: "console", send: async () => {} } as ConsoleMailer,
    verifyGoogle: async (cred) => (cred === "good" ? { sub: "g1", email: "g@ex.com", firstName: "Gaby", picture: null } : null),
  });
  server = app.listen(0);
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => {
  server.close();
  rmSync(dir, { recursive: true, force: true });
});

describe("API", () => {
  it("signs up, rejects duplicates and bad logins", async () => {
    const r = await api("POST", "/api/auth/signup", { firstName: "Alex", email: "Alex@Ex.com", password: "motdepasse", profile: { goal: "entretiens", level: "debutant" } });
    expect(r.status).toBe(201);
    token = r.body.token;
    expect(r.body.state.user.email).toBe("alex@ex.com");
    expect(r.body.state.user.passwordHash).toBeUndefined();
    expect((await api("POST", "/api/auth/signup", { firstName: "A", email: "alex@ex.com", password: "motdepasse" })).status).toBe(409);
    expect((await api("POST", "/api/auth/login", { email: "alex@ex.com", password: "wrong-pass" }, false)).status).toBe(401);
    expect((await api("POST", "/api/auth/signup", { firstName: "B", email: "b@ex.com", password: "court" })).body.message).toBe("8 caractères minimum");
  });

  it("requires auth", async () => {
    expect((await api("GET", "/api/state", undefined, false)).status).toBe(401);
  });

  it("analyses a session, stores audio, then compares a retry", async () => {
    const first = await api("POST", "/api/sessions", sessionForm("entretien-presentation", MESSY, true));
    expect(first.status).toBe(201);
    expect(first.body.session.analysis.metrics.fillers["du coup"]).toBe(3);
    expect(first.body.comparison).toBeNull();
    expect(first.body.newBadges.map((b: { id: string }) => b.id)).toContain("first");
    expect(first.body.session.audioUrl).toMatch(/^\/api\/audio\//);
    const audio = await fetch(base + first.body.session.audioUrl);
    expect(audio.status).toBe(200);
    expect((await fetch(base + first.body.session.audioUrl.replace(/sig=[^&]+/, "sig=bad"))).status).toBe(403);

    const retry = await api("POST", "/api/sessions", sessionForm("entretien-presentation", CLEAN));
    expect(retry.status).toBe(201);
    expect(retry.body.comparison.delta).toBeGreaterThan(0);
    expect(retry.body.session.attempt).toBe(2);

    const state = await api("GET", "/api/state");
    expect(state.body.sessions).toHaveLength(2);
    expect(state.body.badges.length).toBeGreaterThan(0);
  });

  it("rejects empty transcripts and enforces free limits", async () => {
    expect((await api("POST", "/api/sessions", sessionForm("impro-passion", "  "))).status).toBe(422);
    expect((await api("POST", "/api/sessions", sessionForm("entretien-difficulte", CLEAN))).status).toBe(402); // premium exercise
    expect((await api("POST", "/api/sessions", sessionForm("impro-passion", CLEAN))).status).toBe(201); // 3rd today
    const blocked = await api("POST", "/api/sessions", sessionForm("impro-metier", CLEAN));
    expect(blocked.status).toBe(402);
    expect(blocked.body.error).toBe("daily_limit");
    // Premium trial lifts the limit.
    const up = await api("POST", "/api/billing/checkout", { plan: "yearly" });
    expect(up.body.user.plan).toBe("premium");
    expect((await api("POST", "/api/sessions", sessionForm("entretien-difficulte", CLEAN))).status).toBe(201);
  });

  it("builds a program and ticks days off", async () => {
    const p = await api("POST", "/api/program", { goalText: "Je veux réussir mon prochain entretien." });
    expect(p.body.program.days).toHaveLength(14);
    await api("POST", "/api/sessions", sessionForm("entretien-presentation", CLEAN));
    const state = await api("GET", "/api/state");
    expect(state.body.program.days[0].done).toBe(true);
  });

  it("chats with the coach and keeps the conversation", async () => {
    const r = await api("POST", "/api/coach", { text: "Fais-moi passer un entretien d'embauche." });
    expect(r.body.reply.interview.step).toBe(0);
    const r2 = await api("POST", "/api/coach", { text: "Je suis étudiant en marketing, du coup voilà." });
    expect(r2.body.reply.text).toMatch(/Question 2\/4/);
    expect((await api("GET", "/api/state")).body.coach).toHaveLength(4);
  });

  it("resets a forgotten password", async () => {
    const f = await api("POST", "/api/auth/forgot", { email: "alex@ex.com" }, false);
    const resetToken = new URL(f.body.devResetUrl).searchParams.get("token");
    expect((await api("POST", "/api/auth/forgot", { email: "nobody@ex.com" }, false)).body).toEqual({ ok: true });
    const r = await api("POST", "/api/auth/reset", { token: resetToken, password: "nouveau-mdp" }, false);
    expect(r.status).toBe(200);
    expect((await api("POST", "/api/auth/reset", { token: resetToken, password: "nouveau-mdp" }, false)).status).toBe(400);
    expect((await api("POST", "/api/auth/login", { email: "alex@ex.com", password: "nouveau-mdp" }, false)).status).toBe(200);
  });

  it("signs in with Google and imports guest data", async () => {
    token = "";
    const guest = await api("POST", "/api/auth/google", {
      credential: "good",
      importState: { sessions: [], coach: [{ id: "x", role: "user", text: "Salut", createdAt: new Date().toISOString() }], badges: [{ id: "first", earnedAt: new Date().toISOString() }] },
    });
    expect(guest.status).toBe(201);
    token = guest.body.token;
    expect(guest.body.state.user.firstName).toBe("Gaby");
    expect(guest.body.state.coach).toHaveLength(1);
    expect((await api("POST", "/api/auth/google", { credential: "bad" })).status).toBe(401);
  });

  it("updates the profile and deletes the account", async () => {
    const me = await api("PATCH", "/api/me", { firstName: "Gab", settings: { theme: "dark" } });
    expect(me.body.user.firstName).toBe("Gab");
    expect(me.body.user.settings.theme).toBe("dark");
    expect(me.body.user.settings.saveAudio).toBe(true);
    expect((await api("DELETE", "/api/me")).status).toBe(200);
    expect((await api("GET", "/api/state")).status).toBe(401);
  });
});
