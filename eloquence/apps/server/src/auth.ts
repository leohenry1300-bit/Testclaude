import { createHash, createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { NextFunction, Request, Response } from "express";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

// ---- Passwords ------------------------------------------------------------

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string | null): Promise<boolean> {
  if (!stored) return false;
  const [scheme, saltB64, hashB64] = stored.split("$");
  if (scheme !== "scrypt") return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = await scrypt(password, Buffer.from(saltB64, "base64"), expected.length);
  return timingSafeEqual(expected, actual);
}

// ---- Tokens (compact HS256 JWT) ------------------------------------------

const b64url = (b: Buffer | string) => Buffer.from(b).toString("base64url");

export function signToken(secret: string, userId: string, ttlSec = 60 * 60 * 24 * 30): string {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = b64url(JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + ttlSec }));
  const sig = createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${sig}`;
}

export function verifyToken(secret: string, token: string): string | null {
  const [header, payload, sig] = token.split(".");
  if (!header || !payload || !sig) return null;
  const expected = createHmac("sha256", secret).update(`${header}.${payload}`).digest();
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { sub: string; exp: number };
    return data.exp > Date.now() / 1000 ? data.sub : null;
  } catch {
    return null;
  }
}

/** Signed, expiring URL fragment so <audio> tags can fetch without headers. */
export function signAudio(secret: string, key: string, ttlSec = 60 * 60 * 6): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSec;
  const sig = createHmac("sha256", secret).update(`audio:${key}:${exp}`).digest("base64url");
  return `/api/audio/${encodeURIComponent(key)}?exp=${exp}&sig=${sig}`;
}

export function verifyAudio(secret: string, key: string, exp: string, sig: string): boolean {
  if (Number(exp) < Date.now() / 1000) return false;
  const expected = createHmac("sha256", secret).update(`audio:${key}:${exp}`).digest();
  const given = Buffer.from(sig, "base64url");
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export function newResetToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: sha256(token) };
}

export function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

// ---- Middleware -----------------------------------------------------------

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
  }
}

export function requireAuth(secret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    const userId = token ? verifyToken(secret, token) : null;
    if (!userId) {
      res.status(401).json({ error: "unauthorized", message: "Ta session a expiré. Reconnecte-toi." });
      return;
    }
    req.userId = userId;
    next();
  };
}

/** Tiny fixed-window rate limiter, per IP and route group. */
export function rateLimit(max: number, windowMs: number) {
  const hits = new Map<string, { n: number; reset: number }>();
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip ?? "unknown";
    const now = Date.now();
    const e = hits.get(key);
    if (!e || e.reset < now) hits.set(key, { n: 1, reset: now + windowMs });
    else if (++e.n > max) {
      res.status(429).json({ error: "rate_limited", message: "Trop de tentatives. Réessaie dans une minute." });
      return;
    }
    next();
  };
}
