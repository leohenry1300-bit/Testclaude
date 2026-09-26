import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { DeleteObjectCommand, GetObjectCommand, NoSuchKey, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

// ---- Audio storage --------------------------------------------------------

export interface AudioStorage {
  put(key: string, data: Buffer, mime: string): Promise<void>;
  get(key: string): Promise<{ data: Buffer; mime: string } | null>;
  delete(key: string): Promise<void>;
}

/**
 * Stores recordings on disk — the default, zero-config option, but the
 * disk it writes to isn't persistent on every host (e.g. Render's free
 * tier): recordings vanish on restart/redeploy even though session
 * metadata, now in Postgres, survives. Use S3Storage for real persistence.
 */
export class LocalDiskStorage implements AudioStorage {
  constructor(private dir: string) {}

  private file(key: string) {
    if (!/^[\w-]+\.(webm|ogg|m4a|mp4|wav)$/.test(key)) throw new Error("invalid key");
    return path.join(this.dir, key);
  }

  async put(key: string, data: Buffer) {
    await mkdir(this.dir, { recursive: true });
    await writeFile(this.file(key), data);
  }

  async get(key: string) {
    try {
      const data = await readFile(this.file(key));
      const ext = key.split(".").pop()!;
      const mime = ext === "ogg" ? "audio/ogg" : ext === "wav" ? "audio/wav" : ext === "webm" ? "audio/webm" : "audio/mp4";
      return { data, mime };
    } catch {
      return null;
    }
  }

  async delete(key: string) {
    await rm(this.file(key), { force: true });
  }
}

/**
 * Stores recordings in any S3-compatible bucket (Cloudflare R2's free tier
 * is a good fit — 10 GB storage, no egress fees). Selected automatically
 * when S3_* env vars are set — see loadConfig / createStorage in index.ts.
 */
export class S3Storage implements AudioStorage {
  private client: S3Client;
  constructor(private bucket: string, opts: { endpoint?: string | null; region: string; accessKeyId: string; secretAccessKey: string }) {
    this.client = new S3Client({
      region: opts.region,
      endpoint: opts.endpoint ?? undefined,
      credentials: { accessKeyId: opts.accessKeyId, secretAccessKey: opts.secretAccessKey },
    });
  }

  async put(key: string, data: Buffer, mime: string) {
    await this.client.send(new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: data, ContentType: mime }));
  }

  async get(key: string) {
    try {
      const out = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
      const data = Buffer.from(await out.Body!.transformToByteArray());
      return { data, mime: out.ContentType ?? "audio/webm" };
    } catch (e) {
      if (e instanceof NoSuchKey) return null;
      throw e;
    }
  }

  async delete(key: string) {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}

// ---- Mail -----------------------------------------------------------------

export interface Mailer {
  readonly name: string;
  send(to: string, subject: string, text: string): Promise<void>;
}

export class ConsoleMailer implements Mailer {
  readonly name = "console";
  async send(to: string, subject: string, text: string) {
    console.log(`\n[mail] À : ${to}\n[mail] Objet : ${subject}\n${text}\n`);
  }
}

export class ResendMailer implements Mailer {
  readonly name = "resend";
  constructor(private apiKey: string, private from: string) {}
  async send(to: string, subject: string, text: string) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: this.from, to, subject, text }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`mail ${res.status}`);
  }
}

// ---- Google sign-in -------------------------------------------------------

export interface GoogleIdentity {
  sub: string;
  email: string;
  firstName: string;
  picture: string | null;
}

/** Verifies a Google Identity Services ID token via Google's tokeninfo endpoint. */
export async function verifyGoogleCredential(credential: string, clientId: string): Promise<GoogleIdentity | null> {
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`, {
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) return null;
  const t = (await res.json()) as Record<string, string>;
  if (t.aud !== clientId || t.email_verified !== "true") return null;
  if (!["accounts.google.com", "https://accounts.google.com"].includes(t.iss)) return null;
  return { sub: t.sub, email: t.email.toLowerCase(), firstName: t.given_name || t.name || "Toi", picture: t.picture ?? null };
}
