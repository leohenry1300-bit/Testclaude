import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

export interface Config {
  port: number;
  dataDir: string;
  webDist: string;
  publicUrl: string;
  jwtSecret: string;
  databaseUrl: string | null;
  googleClientId: string | null;
  stt: { provider: "client" | "openai"; openaiKey: string | null; model: string };
  llm: { provider: "heuristic" | "anthropic"; model: string };
  mail: { provider: "console" | "resend"; resendKey: string | null; from: string };
  billing: { provider: "dev" };
  s3: { bucket: string; endpoint: string | null; region: string; accessKeyId: string; secretAccessKey: string } | null;
}

function persistentSecret(dataDir: string): string {
  const file = path.join(dataDir, "jwt-secret");
  if (existsSync(file)) return readFileSync(file, "utf8").trim();
  const secret = randomBytes(48).toString("hex");
  writeFileSync(file, secret, { mode: 0o600 });
  return secret;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const dataDir = path.resolve(env.DATA_DIR ?? path.join(here, "../../../data"));
  mkdirSync(dataDir, { recursive: true });
  const openaiKey = env.OPENAI_API_KEY || null;
  const hasAnthropic = Boolean(env.ANTHROPIC_API_KEY || env.ANTHROPIC_AUTH_TOKEN);
  return {
    port: Number(env.PORT ?? 8787),
    dataDir,
    webDist: path.resolve(env.WEB_DIST ?? path.join(here, "../../web/dist")),
    publicUrl: env.PUBLIC_URL ?? "http://localhost:5173",
    jwtSecret: env.JWT_SECRET || persistentSecret(dataDir),
    databaseUrl: env.DATABASE_URL || null,
    googleClientId: env.GOOGLE_CLIENT_ID || null,
    stt: {
      provider: env.STT_PROVIDER === "openai" || (!env.STT_PROVIDER && openaiKey) ? "openai" : "client",
      openaiKey,
      model: env.STT_MODEL ?? "whisper-1",
    },
    llm: {
      provider: env.LLM_PROVIDER === "heuristic" ? "heuristic" : env.LLM_PROVIDER === "anthropic" || hasAnthropic ? "anthropic" : "heuristic",
      model: env.ANTHROPIC_MODEL ?? "claude-opus-5",
    },
    mail: {
      provider: env.RESEND_API_KEY ? "resend" : "console",
      resendKey: env.RESEND_API_KEY || null,
      from: env.MAIL_FROM ?? "Éloquence <bonjour@eloquence.app>",
    },
    billing: { provider: "dev" },
    s3: env.S3_BUCKET && env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY ? {
      bucket: env.S3_BUCKET,
      endpoint: env.S3_ENDPOINT || null,
      region: env.S3_REGION || "auto",
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    } : null,
  };
}
