import { Pool } from "pg";
import type {
  AccountState, CoachMessage, DiagnosticReport, EarnedBadge, Program, Session, User, UserSettings,
} from "@eloquence/core";
import { DEFAULT_SETTINGS, DIMENSIONS, summarize, scoreSeries } from "@eloquence/core";
import type { Store, UserRecord, SessionRow } from "./types";

// Postgres-backed Store, for a hosted deployment (e.g. Supabase free tier)
// where the server's own disk is not persistent (Render free tier). Same
// schema and behaviour as SqliteStore, adapted to Postgres syntax
// ($1,$2 placeholders, ON CONFLICT DO NOTHING, a real SERIAL for message
// ordering instead of SQLite's implicit rowid).

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
  seq BIGSERIAL,
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

export class PostgresStore implements Store {
  readonly pool: Pool;
  private ready: Promise<void>;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      ssl: connectionString.includes("localhost") || connectionString.includes("127.0.0.1")
        ? false
        : { rejectUnauthorized: false },
    });
    this.ready = this.pool.query(SCHEMA).then(() => {});
  }

  private async q<T extends Row = Row>(text: string, params: unknown[] = []): Promise<T[]> {
    await this.ready;
    const r = await this.pool.query(text, params);
    return r.rows as T[];
  }

  async close() {
    await this.pool.end();
  }

  private async tx<T>(fn: (client: { query: (text: string, params?: unknown[]) => Promise<Row[]> }) => Promise<T>): Promise<T> {
    await this.ready;
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const out = await fn({ query: async (text, params = []) => (await client.query(text, params)).rows });
      await client.query("COMMIT");
      return out;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
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

  async createUser(u: Omit<UserRecord, "diagnosticDone"> & { diagnosticDone?: boolean }): Promise<UserRecord> {
    await this.q(
      `INSERT INTO users (id, first_name, email, password_hash, google_sub, avatar, goals, goal_text, level, frequency, settings, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [u.id, u.firstName, u.email, u.passwordHash, u.googleSub, u.avatar, JSON.stringify(u.goals), u.goalText,
        u.level, u.frequency, JSON.stringify(u.settings), u.createdAt],
    );
    return (await this.userById(u.id))!;
  }

  async userById(id: string): Promise<UserRecord | null> {
    const rows = await this.q("SELECT * FROM users WHERE id = $1", [id]);
    return rows[0] ? this.toUser(rows[0]) : null;
  }

  async userByEmail(email: string): Promise<UserRecord | null> {
    const rows = await this.q("SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);
    return rows[0] ? this.toUser(rows[0]) : null;
  }

  async userByGoogle(sub: string): Promise<UserRecord | null> {
    const rows = await this.q("SELECT * FROM users WHERE google_sub = $1", [sub]);
    return rows[0] ? this.toUser(rows[0]) : null;
  }

  async updateUser(id: string, patch: Partial<UserRecord>): Promise<UserRecord> {
    const cur = await this.userById(id);
    if (!cur) throw new Error("user not found");
    const u = { ...cur, ...patch, settings: { ...cur.settings, ...(patch.settings ?? {}) } };
    await this.q(
      `UPDATE users SET first_name=$1, email=$2, password_hash=$3, google_sub=$4, avatar=$5, goals=$6, goal_text=$7, level=$8, frequency=$9, diagnostic_done=$10, settings=$11 WHERE id=$12`,
      [u.firstName, u.email, u.passwordHash, u.googleSub, u.avatar, JSON.stringify(u.goals), u.goalText, u.level,
        u.frequency, u.diagnosticDone ? 1 : 0, JSON.stringify(u.settings), id],
    );
    return u;
  }

  async markModelAnswerSeen(id: string) {
    await this.q("UPDATE users SET model_answer_seen = 1 WHERE id = $1", [id]);
  }

  async modelAnswerSeen(id: string): Promise<boolean> {
    const rows = await this.q("SELECT model_answer_seen FROM users WHERE id = $1", [id]);
    return !!rows[0]?.model_answer_seen;
  }

  async deleteUser(id: string) {
    await this.q("DELETE FROM users WHERE id = $1", [id]);
  }

  // ---- Sessions & analyses ----------------------------------------------

  private toSession(r: Row): SessionRow {
    return {
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
    };
  }

  async sessions(userId: string): Promise<SessionRow[]> {
    const rows = await this.q(
      `SELECT s.*, a.details FROM sessions s JOIN analyses a ON a.session_id = s.id
       WHERE s.user_id = $1 ORDER BY s.created_at DESC`,
      [userId],
    );
    return rows.map((r) => this.toSession(r));
  }

  async sessionOwner(id: string): Promise<{ userId: string; audioKey: string | null } | null> {
    const rows = await this.q("SELECT user_id, audio_key FROM sessions WHERE id = $1", [id]);
    return rows[0] ? { userId: rows[0].user_id as string, audioKey: (rows[0].audio_key as string) ?? null } : null;
  }

  async session(id: string): Promise<SessionRow | null> {
    const rows = await this.q(
      `SELECT s.*, a.details FROM sessions s JOIN analyses a ON a.session_id = s.id WHERE s.id = $1`,
      [id],
    );
    return rows[0] ? this.toSession(rows[0]) : null;
  }

  async insertSession(s: Session, audioKey: string | null) {
    const a = s.analysis;
    await this.q(
      `INSERT INTO sessions (id, user_id, exercise_id, exercise_title, category, source, created_at, duration_sec, audio_key, transcript, score, xp_earned, attempt)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [s.id, s.userId, s.exerciseId, s.exerciseTitle, s.category, s.source, s.createdAt, s.durationSec,
        audioKey, s.transcript, s.score, s.xpEarned, s.attempt],
    );
    await this.q(
      `INSERT INTO analyses (session_id, clarte, fluidite, confiance, structure, vocabulaire, debit, parasites, argumentation, grammaire, persuasion, concision, feedback, engine, details)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [s.id, ...DIMENSIONS.map((d) => a.scores[d]), JSON.stringify(a.feedback), a.engine, JSON.stringify(a)],
    );
  }

  async deleteSession(id: string) {
    await this.q("DELETE FROM sessions WHERE id = $1", [id]);
  }

  async countToday(userId: string, since: string): Promise<number> {
    const rows = await this.q("SELECT COUNT(*) AS n FROM sessions WHERE user_id = $1 AND created_at >= $2", [userId, since]);
    return Number(rows[0].n);
  }

  async distinctGameTitles(userId: string): Promise<number> {
    const rows = await this.q("SELECT COUNT(DISTINCT exercise_title) AS n FROM sessions WHERE user_id = $1 AND source = 'jeu'", [userId]);
    return Number(rows[0].n);
  }

  // ---- Progress (denormalised snapshot, recomputed after each change) ----

  async refreshProgress(userId: string) {
    const sessions = await this.sessions(userId);
    const s = summarize(sessions, await this.badges(userId));
    const history = scoreSeries(sessions, 90);
    await this.q(
      `INSERT INTO progress (user_id, xp, streak, best_streak, session_count, total_sec, score_history, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (user_id) DO UPDATE SET xp=excluded.xp, streak=excluded.streak, best_streak=excluded.best_streak,
         session_count=excluded.session_count, total_sec=excluded.total_sec, score_history=excluded.score_history, updated_at=excluded.updated_at`,
      [userId, s.xp, s.streak, s.bestStreak, s.sessionCount, s.totalSec, JSON.stringify(history), new Date().toISOString()],
    );
  }

  // ---- Badges, program, diagnostic, library, coach -----------------------

  async badges(userId: string): Promise<EarnedBadge[]> {
    const rows = await this.q("SELECT badge_id, earned_at FROM badges WHERE user_id = $1 ORDER BY earned_at", [userId]);
    return rows.map((r) => ({ id: r.badge_id as string, earnedAt: r.earned_at as string }));
  }

  async addBadges(userId: string, badges: EarnedBadge[]) {
    for (const b of badges) {
      await this.q("INSERT INTO badges (user_id, badge_id, earned_at) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING", [userId, b.id, b.earnedAt]);
    }
  }

  async program(userId: string): Promise<Program | null> {
    const rows = await this.q("SELECT data FROM programs WHERE user_id = $1", [userId]);
    return rows[0] ? JSON.parse(rows[0].data as string) : null;
  }

  async saveProgram(userId: string, p: Program | null) {
    if (!p) { await this.q("DELETE FROM programs WHERE user_id = $1", [userId]); return; }
    await this.q(
      "INSERT INTO programs (user_id, data) VALUES ($1,$2) ON CONFLICT (user_id) DO UPDATE SET data = excluded.data",
      [userId, JSON.stringify(p)],
    );
  }

  async diagnostic(userId: string): Promise<DiagnosticReport | null> {
    const rows = await this.q("SELECT data FROM diagnostics WHERE user_id = $1", [userId]);
    return rows[0] ? JSON.parse(rows[0].data as string) : null;
  }

  async saveDiagnostic(userId: string, report: DiagnosticReport) {
    await this.q(
      "INSERT INTO diagnostics (user_id, data) VALUES ($1,$2) ON CONFLICT (user_id) DO UPDATE SET data = excluded.data",
      [userId, JSON.stringify(report)],
    );
  }

  async markLibraryRead(userId: string, lessonId: string) {
    await this.q(
      "INSERT INTO library_reads (user_id, lesson_id, read_at) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING",
      [userId, lessonId, new Date().toISOString()],
    );
  }

  async libraryReadCount(userId: string): Promise<number> {
    const rows = await this.q("SELECT COUNT(*) AS n FROM library_reads WHERE user_id = $1", [userId]);
    return Number(rows[0].n);
  }

  async libraryReadIds(userId: string): Promise<string[]> {
    const rows = await this.q("SELECT lesson_id FROM library_reads WHERE user_id = $1", [userId]);
    return rows.map((r) => r.lesson_id as string);
  }

  async coach(userId: string, limit = 200): Promise<CoachMessage[]> {
    const rows = await this.q(
      "SELECT * FROM coach_messages WHERE user_id = $1 ORDER BY created_at DESC, seq DESC LIMIT $2",
      [userId, limit],
    );
    return rows.reverse().map((r) => ({
      id: r.id as string,
      role: r.role as CoachMessage["role"],
      text: r.text as string,
      createdAt: r.created_at as string,
      ...(r.meta ? JSON.parse(r.meta as string) : {}),
    }));
  }

  async distinctCompletedSimulations(userId: string): Promise<number> {
    const msgs = await this.coach(userId, 2000);
    const done = new Set<string>();
    for (const m of msgs) {
      if (m.interview?.simulationId && m.interview.step >= m.interview.total) done.add(m.interview.simulationId);
    }
    return done.size;
  }

  async addCoach(userId: string, m: CoachMessage) {
    const { id, role, text, createdAt, ...meta } = m;
    await this.q(
      "INSERT INTO coach_messages (id, user_id, role, text, meta, created_at) VALUES ($1,$2,$3,$4,$5,$6)",
      [id, userId, role, text, Object.keys(meta).length ? JSON.stringify(meta) : null, createdAt],
    );
  }

  async clearCoach(userId: string) {
    await this.q("DELETE FROM coach_messages WHERE user_id = $1", [userId]);
  }

  // ---- Password resets ----------------------------------------------------

  async saveReset(tokenHash: string, userId: string, expiresAt: string) {
    await this.q("DELETE FROM password_resets WHERE user_id = $1", [userId]);
    await this.q("INSERT INTO password_resets (token_hash, user_id, expires_at) VALUES ($1,$2,$3)", [tokenHash, userId, expiresAt]);
  }

  async consumeReset(tokenHash: string): Promise<string | null> {
    const rows = await this.q("SELECT user_id, expires_at FROM password_resets WHERE token_hash = $1", [tokenHash]);
    const r = rows[0];
    if (!r) return null;
    await this.q("DELETE FROM password_resets WHERE token_hash = $1", [tokenHash]);
    return new Date(r.expires_at as string) > new Date() ? (r.user_id as string) : null;
  }

  // ---- Bulk import (guest → account) ------------------------------------

  async importState(userId: string, state: Partial<Pick<AccountState, "sessions" | "coach" | "program" | "badges" | "diagnostic">>) {
    await this.tx(async (client) => {
      for (const s of state.sessions ?? []) {
        const sess = { ...s, id: `${s.id}_${userId.slice(-6)}`, userId, audioUrl: null } as Session;
        const a = sess.analysis;
        await client.query(
          `INSERT INTO sessions (id, user_id, exercise_id, exercise_title, category, source, created_at, duration_sec, audio_key, transcript, score, xp_earned, attempt)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
          [sess.id, sess.userId, sess.exerciseId, sess.exerciseTitle, sess.category, sess.source, sess.createdAt,
            sess.durationSec, null, sess.transcript, sess.score, sess.xpEarned, sess.attempt],
        );
        await client.query(
          `INSERT INTO analyses (session_id, clarte, fluidite, confiance, structure, vocabulaire, debit, parasites, argumentation, grammaire, persuasion, concision, feedback, engine, details)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
          [sess.id, ...DIMENSIONS.map((d) => a.scores[d]), JSON.stringify(a.feedback), a.engine, JSON.stringify(a)],
        );
      }
      for (const m of state.coach ?? []) {
        const { id, role, text, createdAt, ...meta } = { ...m, id: `${m.id}_${userId.slice(-6)}` };
        await client.query(
          "INSERT INTO coach_messages (id, user_id, role, text, meta, created_at) VALUES ($1,$2,$3,$4,$5,$6)",
          [id, userId, role, text, Object.keys(meta).length ? JSON.stringify(meta) : null, createdAt],
        );
      }
      if (state.program) {
        await client.query(
          "INSERT INTO programs (user_id, data) VALUES ($1,$2) ON CONFLICT (user_id) DO UPDATE SET data = excluded.data",
          [userId, JSON.stringify(state.program)],
        );
      }
      for (const b of state.badges ?? []) {
        await client.query("INSERT INTO badges (user_id, badge_id, earned_at) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING", [userId, b.id, b.earnedAt]);
      }
      if (state.diagnostic) {
        await client.query(
          "INSERT INTO diagnostics (user_id, data) VALUES ($1,$2) ON CONFLICT (user_id) DO UPDATE SET data = excluded.data",
          [userId, JSON.stringify(state.diagnostic)],
        );
        await client.query("UPDATE users SET diagnostic_done = 1 WHERE id = $1", [userId]);
      }
    });
    await this.refreshProgress(userId);
  }
}
