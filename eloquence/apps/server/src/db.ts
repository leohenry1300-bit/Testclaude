import { DatabaseSync } from "node:sqlite";
import type {
  AccountState, CoachMessage, DiagnosticReport, EarnedBadge, Program, Session, User, UserSettings,
} from "@eloquence/core";
import { DEFAULT_SETTINGS, DIMENSIONS, summarize, scoreSeries } from "@eloquence/core";

// Persistence layer. SQLite (built into Node) keeps the project dependency-free;
// every query lives here so swapping to Postgres only touches this file.
// This is a personal, single-user app: there is no plan/premium column
// anywhere in this schema, on purpose.

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT,
  google_sub TEXT UNIQUE,
  avatar TEXT,
  goals TEXT NOT NULL,
  goal_text TEXT,
  level TEXT NOT NULL,
  frequency TEXT NOT NULL,
  diagnostic_done INTEGER NOT NULL DEFAULT 0,
  model_answer_seen INTEGER NOT NULL DEFAULT 0,
  settings TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  exercise_title TEXT NOT NULL,
  category TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'catalogue',
  created_at TEXT NOT NULL,
  duration_sec INTEGER NOT NULL,
  audio_key TEXT,
  transcript TEXT NOT NULL,
  score INTEGER NOT NULL,
  xp_earned INTEGER NOT NULL,
  attempt INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id, created_at);
CREATE TABLE IF NOT EXISTS analyses (
  session_id TEXT PRIMARY KEY REFERENCES sessions(id) ON DELETE CASCADE,
  clarte INTEGER NOT NULL,
  fluidite INTEGER NOT NULL,
  confiance INTEGER NOT NULL,
  structure INTEGER NOT NULL,
  vocabulaire INTEGER NOT NULL,
  debit INTEGER NOT NULL,
  parasites INTEGER NOT NULL,
  argumentation INTEGER NOT NULL DEFAULT 0,
  grammaire INTEGER NOT NULL DEFAULT 0,
  persuasion INTEGER NOT NULL DEFAULT 0,
  concision INTEGER NOT NULL DEFAULT 0,
  feedback TEXT NOT NULL,
  engine TEXT NOT NULL,
  details TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS progress (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  xp INTEGER NOT NULL,
  streak INTEGER NOT NULL,
  best_streak INTEGER NOT NULL,
  session_count INTEGER NOT NULL,
  total_sec INTEGER NOT NULL,
  score_history TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS badges (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  earned_at TEXT NOT NULL,
  PRIMARY KEY (user_id, badge_id)
);
CREATE TABLE IF NOT EXISTS programs (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  data TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS diagnostics (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  data TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS library_reads (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  read_at TEXT NOT NULL,
  PRIMARY KEY (user_id, lesson_id)
);
CREATE TABLE IF NOT EXISTS coach_messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  text TEXT NOT NULL,
  meta TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS coach_user ON coach_messages(user_id, created_at);
CREATE TABLE IF NOT EXISTS password_resets (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);
`;

type Row = Record<string, unknown>;

export interface UserRecord extends User {
  passwordHash: string | null;
  googleSub: string | null;
}

export class Store {
  readonly db: DatabaseSync;

  constructor(file: string) {
    this.db = new DatabaseSync(file);
    this.db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
    this.db.exec(SCHEMA);
  }

  close() {
    this.db.close();
  }

  private tx<T>(fn: () => T): T {
    this.db.exec("BEGIN");
    try {
      const out = fn();
      this.db.exec("COMMIT");
      return out;
    } catch (e) {
      this.db.exec("ROLLBACK");
      throw e;
    }
  }

  // ---- Users --------------------------------------------------------------

  private toUser(r: Row): UserRecord {
    return {
      id: r.id as string,
      firstName: r.first_name as string,
      email: (r.email as string) ?? null,
      avatar: (r.avatar as string) ?? null,
      goals: JSON.parse(r.goals as string) as User["goals"],
      goalText: (r.goal_text as string) ?? null,
      level: r.level as User["level"],
      frequency: r.frequency as User["frequency"],
      createdAt: r.created_at as string,
      diagnosticDone: !!r.diagnostic_done,
      settings: { ...DEFAULT_SETTINGS, ...(JSON.parse(r.settings as string) as Partial<UserSettings>) },
      passwordHash: (r.password_hash as string) ?? null,
      googleSub: (r.google_sub as string) ?? null,
    };
  }

  createUser(u: Omit<UserRecord, "diagnosticDone"> & { diagnosticDone?: boolean }): UserRecord {
    this.db.prepare(`INSERT INTO users (id, first_name, email, password_hash, google_sub, avatar, goals, goal_text, level, frequency, settings, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      u.id, u.firstName, u.email, u.passwordHash, u.googleSub, u.avatar, JSON.stringify(u.goals), u.goalText,
      u.level, u.frequency, JSON.stringify(u.settings), u.createdAt,
    );
    return this.userById(u.id)!;
  }

  userById(id: string): UserRecord | null {
    const r = this.db.prepare("SELECT * FROM users WHERE id = ?").get(id) as Row | undefined;
    return r ? this.toUser(r) : null;
  }

  userByEmail(email: string): UserRecord | null {
    const r = this.db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase()) as Row | undefined;
    return r ? this.toUser(r) : null;
  }

  userByGoogle(sub: string): UserRecord | null {
    const r = this.db.prepare("SELECT * FROM users WHERE google_sub = ?").get(sub) as Row | undefined;
    return r ? this.toUser(r) : null;
  }

  updateUser(id: string, patch: Partial<UserRecord>): UserRecord {
    const cur = this.userById(id);
    if (!cur) throw new Error("user not found");
    const u = { ...cur, ...patch, settings: { ...cur.settings, ...(patch.settings ?? {}) } };
    this.db.prepare(`UPDATE users SET first_name=?, email=?, password_hash=?, google_sub=?, avatar=?, goals=?, goal_text=?, level=?, frequency=?, diagnostic_done=?, settings=? WHERE id=?`).run(
      u.firstName, u.email, u.passwordHash, u.googleSub, u.avatar, JSON.stringify(u.goals), u.goalText, u.level,
      u.frequency, u.diagnosticDone ? 1 : 0, JSON.stringify(u.settings), id,
    );
    return u;
  }

  markModelAnswerSeen(id: string) {
    this.db.prepare("UPDATE users SET model_answer_seen = 1 WHERE id = ?").run(id);
  }

  modelAnswerSeen(id: string): boolean {
    const r = this.db.prepare("SELECT model_answer_seen FROM users WHERE id = ?").get(id) as Row | undefined;
    return !!r?.model_answer_seen;
  }

  deleteUser(id: string) {
    this.db.prepare("DELETE FROM users WHERE id = ?").run(id);
  }

  // ---- Sessions & analyses ----------------------------------------------

  sessions(userId: string): (Session & { audioKey: string | null })[] {
    const rows = this.db.prepare(`SELECT s.*, a.details FROM sessions s JOIN analyses a ON a.session_id = s.id
      WHERE s.user_id = ? ORDER BY s.created_at DESC`).all(userId) as Row[];
    return rows.map((r) => ({
      id: r.id as string,
      userId: r.user_id as string,
      exerciseId: r.exercise_id as string,
      exerciseTitle: r.exercise_title as string,
      category: r.category as Session["category"],
      source: (r.source as Session["source"]) ?? "catalogue",
      createdAt: r.created_at as string,
      durationSec: r.duration_sec as number,
      audioUrl: null,
      audioKey: (r.audio_key as string) ?? null,
      transcript: r.transcript as string,
      score: r.score as number,
      xpEarned: r.xp_earned as number,
      attempt: r.attempt as number,
      analysis: JSON.parse(r.details as string),
    }));
  }

  sessionOwner(id: string): { userId: string; audioKey: string | null } | null {
    const r = this.db.prepare("SELECT user_id, audio_key FROM sessions WHERE id = ?").get(id) as Row | undefined;
    return r ? { userId: r.user_id as string, audioKey: (r.audio_key as string) ?? null } : null;
  }

  session(id: string): (Session & { audioKey: string | null }) | null {
    const r = this.db.prepare(`SELECT s.*, a.details FROM sessions s JOIN analyses a ON a.session_id = s.id WHERE s.id = ?`).get(id) as Row | undefined;
    if (!r) return null;
    return {
      id: r.id as string, userId: r.user_id as string, exerciseId: r.exercise_id as string,
      exerciseTitle: r.exercise_title as string, category: r.category as Session["category"],
      source: (r.source as Session["source"]) ?? "catalogue", createdAt: r.created_at as string,
      durationSec: r.duration_sec as number, audioUrl: null, audioKey: (r.audio_key as string) ?? null,
      transcript: r.transcript as string, score: r.score as number, xpEarned: r.xp_earned as number,
      attempt: r.attempt as number, analysis: JSON.parse(r.details as string),
    };
  }

  insertSession(s: Session, audioKey: string | null) {
    const a = s.analysis;
    this.db.prepare(`INSERT INTO sessions (id, user_id, exercise_id, exercise_title, category, source, created_at, duration_sec, audio_key, transcript, score, xp_earned, attempt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      s.id, s.userId, s.exerciseId, s.exerciseTitle, s.category, s.source, s.createdAt, s.durationSec,
      audioKey, s.transcript, s.score, s.xpEarned, s.attempt,
    );
    this.db.prepare(`INSERT INTO analyses (session_id, clarte, fluidite, confiance, structure, vocabulaire, debit, parasites, argumentation, grammaire, persuasion, concision, feedback, engine, details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      s.id, ...DIMENSIONS.map((d) => a.scores[d]), JSON.stringify(a.feedback), a.engine, JSON.stringify(a),
    );
  }

  deleteSession(id: string) {
    this.db.prepare("DELETE FROM sessions WHERE id = ?").run(id);
  }

  countToday(userId: string, since: string): number {
    const r = this.db.prepare("SELECT COUNT(*) AS n FROM sessions WHERE user_id = ? AND created_at >= ?").get(userId, since) as Row;
    return r.n as number;
  }

  distinctGameTitles(userId: string): number {
    const r = this.db.prepare("SELECT COUNT(DISTINCT exercise_title) AS n FROM sessions WHERE user_id = ? AND source = 'jeu'").get(userId) as Row;
    return r.n as number;
  }

  // ---- Progress (denormalised snapshot, recomputed after each change) ----

  refreshProgress(userId: string) {
    const sessions = this.sessions(userId);
    const s = summarize(sessions, this.badges(userId));
    const history = scoreSeries(sessions, 90);
    this.db.prepare(`INSERT INTO progress (user_id, xp, streak, best_streak, session_count, total_sec, score_history, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET xp=excluded.xp, streak=excluded.streak, best_streak=excluded.best_streak,
        session_count=excluded.session_count, total_sec=excluded.total_sec, score_history=excluded.score_history, updated_at=excluded.updated_at`).run(
      userId, s.xp, s.streak, s.bestStreak, s.sessionCount, s.totalSec, JSON.stringify(history), new Date().toISOString(),
    );
  }

  // ---- Badges, program, diagnostic, library, coach -----------------------

  badges(userId: string): EarnedBadge[] {
    return (this.db.prepare("SELECT badge_id, earned_at FROM badges WHERE user_id = ? ORDER BY earned_at").all(userId) as Row[])
      .map((r) => ({ id: r.badge_id as string, earnedAt: r.earned_at as string }));
  }

  addBadges(userId: string, badges: EarnedBadge[]) {
    const stmt = this.db.prepare("INSERT OR IGNORE INTO badges (user_id, badge_id, earned_at) VALUES (?, ?, ?)");
    for (const b of badges) stmt.run(userId, b.id, b.earnedAt);
  }

  program(userId: string): Program | null {
    const r = this.db.prepare("SELECT data FROM programs WHERE user_id = ?").get(userId) as Row | undefined;
    return r ? JSON.parse(r.data as string) : null;
  }

  saveProgram(userId: string, p: Program | null) {
    if (!p) { this.db.prepare("DELETE FROM programs WHERE user_id = ?").run(userId); return; }
    this.db.prepare("INSERT INTO programs (user_id, data) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET data = excluded.data")
      .run(userId, JSON.stringify(p));
  }

  diagnostic(userId: string): DiagnosticReport | null {
    const r = this.db.prepare("SELECT data FROM diagnostics WHERE user_id = ?").get(userId) as Row | undefined;
    return r ? JSON.parse(r.data as string) : null;
  }

  saveDiagnostic(userId: string, report: DiagnosticReport) {
    this.db.prepare("INSERT INTO diagnostics (user_id, data) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET data = excluded.data")
      .run(userId, JSON.stringify(report));
  }

  markLibraryRead(userId: string, lessonId: string) {
    this.db.prepare("INSERT OR IGNORE INTO library_reads (user_id, lesson_id, read_at) VALUES (?, ?, ?)")
      .run(userId, lessonId, new Date().toISOString());
  }

  libraryReadCount(userId: string): number {
    const r = this.db.prepare("SELECT COUNT(*) AS n FROM library_reads WHERE user_id = ?").get(userId) as Row;
    return r.n as number;
  }

  libraryReadIds(userId: string): string[] {
    return (this.db.prepare("SELECT lesson_id FROM library_reads WHERE user_id = ?").all(userId) as Row[]).map((r) => r.lesson_id as string);
  }

  coach(userId: string, limit = 200): CoachMessage[] {
    const rows = this.db.prepare("SELECT * FROM coach_messages WHERE user_id = ? ORDER BY created_at DESC, rowid DESC LIMIT ?").all(userId, limit) as Row[];
    return rows.reverse().map((r) => ({
      id: r.id as string,
      role: r.role as CoachMessage["role"],
      text: r.text as string,
      createdAt: r.created_at as string,
      ...(r.meta ? JSON.parse(r.meta as string) : {}),
    }));
  }

  distinctCompletedSimulations(userId: string): number {
    const msgs = this.coach(userId, 2000);
    const done = new Set<string>();
    for (const m of msgs) {
      if (m.interview?.simulationId && m.interview.step >= m.interview.total) done.add(m.interview.simulationId);
    }
    return done.size;
  }

  addCoach(userId: string, m: CoachMessage) {
    const { id, role, text, createdAt, ...meta } = m;
    this.db.prepare("INSERT INTO coach_messages (id, user_id, role, text, meta, created_at) VALUES (?, ?, ?, ?, ?, ?)")
      .run(id, userId, role, text, Object.keys(meta).length ? JSON.stringify(meta) : null, createdAt);
  }

  clearCoach(userId: string) {
    this.db.prepare("DELETE FROM coach_messages WHERE user_id = ?").run(userId);
  }

  // ---- Password resets ----------------------------------------------------

  saveReset(tokenHash: string, userId: string, expiresAt: string) {
    this.db.prepare("DELETE FROM password_resets WHERE user_id = ?").run(userId);
    this.db.prepare("INSERT INTO password_resets (token_hash, user_id, expires_at) VALUES (?, ?, ?)").run(tokenHash, userId, expiresAt);
  }

  consumeReset(tokenHash: string): string | null {
    const r = this.db.prepare("SELECT user_id, expires_at FROM password_resets WHERE token_hash = ?").get(tokenHash) as Row | undefined;
    if (!r) return null;
    this.db.prepare("DELETE FROM password_resets WHERE token_hash = ?").run(tokenHash);
    return new Date(r.expires_at as string) > new Date() ? (r.user_id as string) : null;
  }

  // ---- Bulk import (guest → account) ------------------------------------

  importState(userId: string, state: Partial<Pick<AccountState, "sessions" | "coach" | "program" | "badges" | "diagnostic">>) {
    this.tx(() => {
      for (const s of state.sessions ?? []) {
        this.insertSession({ ...s, id: `${s.id}_${userId.slice(-6)}`, userId, audioUrl: null }, null);
      }
      for (const m of state.coach ?? []) this.addCoach(userId, { ...m, id: `${m.id}_${userId.slice(-6)}` });
      if (state.program) this.saveProgram(userId, state.program);
      if (state.badges) this.addBadges(userId, state.badges);
      if (state.diagnostic) { this.saveDiagnostic(userId, state.diagnostic); this.updateUser(userId, { diagnosticDone: true }); }
    });
    this.refreshProgress(userId);
  }
}
