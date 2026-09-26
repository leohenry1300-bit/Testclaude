import { SqliteStore } from "./store/sqlite";
import { PostgresStore } from "./store/postgres";
import type { Store, UserRecord, SessionRow } from "./store/types";

// Backend-selecting factory: SQLite by default (zero-config local dev, a
// single file on disk), or Postgres when DATABASE_URL is set — e.g. a free
// Supabase project — so the app can run on a host with no persistent disk
// (Render's free tier) without losing data between deploys/restarts.
export function createStore(opts: { file: string; databaseUrl?: string }): Store {
  return opts.databaseUrl ? new PostgresStore(opts.databaseUrl) : new SqliteStore(opts.file);
}

export type { Store, UserRecord, SessionRow };
