import type {
  AccountState, CoachMessage, CompletedChallenge, DiagnosticReport, EarnedBadge, Program, Session, User,
} from "@eloquence/core";

export interface UserRecord extends User {
  passwordHash: string | null;
  googleSub: string | null;
}

export type SessionRow = Session & { audioKey: string | null };

/**
 * Everything the API needs from persistence, as a plain async interface so
 * either backend (SQLite for local dev, Postgres for a hosted, synced
 * deployment like Supabase) can implement it identically. Nothing in
 * apps/server/src/app.ts knows which one is behind `Store`.
 */
export interface Store {
  close(): Promise<void>;

  createUser(u: Omit<UserRecord, "diagnosticDone"> & { diagnosticDone?: boolean }): Promise<UserRecord>;
  userById(id: string): Promise<UserRecord | null>;
  userByEmail(email: string): Promise<UserRecord | null>;
  userByGoogle(sub: string): Promise<UserRecord | null>;
  updateUser(id: string, patch: Partial<UserRecord>): Promise<UserRecord>;
  markModelAnswerSeen(id: string): Promise<void>;
  modelAnswerSeen(id: string): Promise<boolean>;
  deleteUser(id: string): Promise<void>;

  sessions(userId: string): Promise<SessionRow[]>;
  sessionOwner(id: string): Promise<{ userId: string; audioKey: string | null } | null>;
  session(id: string): Promise<SessionRow | null>;
  insertSession(s: Session, audioKey: string | null): Promise<void>;
  deleteSession(id: string): Promise<void>;
  countToday(userId: string, since: string): Promise<number>;
  distinctGameTitles(userId: string): Promise<number>;

  refreshProgress(userId: string): Promise<void>;

  badges(userId: string): Promise<EarnedBadge[]>;
  addBadges(userId: string, badges: EarnedBadge[]): Promise<void>;

  program(userId: string): Promise<Program | null>;
  saveProgram(userId: string, p: Program | null): Promise<void>;

  diagnostic(userId: string): Promise<DiagnosticReport | null>;
  saveDiagnostic(userId: string, report: DiagnosticReport): Promise<void>;

  markLibraryRead(userId: string, lessonId: string): Promise<void>;
  libraryReadCount(userId: string): Promise<number>;
  libraryReadIds(userId: string): Promise<string[]>;

  coach(userId: string, limit?: number): Promise<CoachMessage[]>;
  distinctCompletedSimulations(userId: string): Promise<number>;
  addCoach(userId: string, m: CoachMessage): Promise<void>;
  clearCoach(userId: string): Promise<void>;

  saveReset(tokenHash: string, userId: string, expiresAt: string): Promise<void>;
  consumeReset(tokenHash: string): Promise<string | null>;

  completedChallenges(userId: string): Promise<CompletedChallenge[]>;
  completeChallenge(userId: string, challengeId: string, date: string): Promise<void>;
  uncompleteChallenge(userId: string, challengeId: string, date: string): Promise<void>;

  importState(userId: string, state: Partial<Pick<AccountState, "sessions" | "coach" | "program" | "badges" | "diagnostic" | "completedChallenges">>): Promise<void>;
}
