import { useCallback, useEffect, useRef, useState } from "react";
import type { Silence, SpeechCapture, SpeechSegment } from "@eloquence/core";

// Microphone capture: audio recording (MediaRecorder), live signal analysis
// (loudness + silences via Web Audio) and live transcription (Web Speech API).

export type RecorderStatus = "idle" | "requesting" | "recording" | "paused" | "stopped" | "error";

export type MicError = "permission" | "no-device" | "unsupported" | "insecure" | "busy" | "unknown";

export const MIC_ERROR_TEXT: Record<MicError, { title: string; body: string }> = {
  permission: {
    title: "Accès au micro refusé",
    body: "Autorise le micro dans les réglages de ton navigateur (icône à gauche de l'adresse), puis réessaie.",
  },
  "no-device": {
    title: "Aucun micro détecté",
    body: "Branche un micro ou des écouteurs avec micro, puis réessaie.",
  },
  unsupported: {
    title: "Enregistrement non disponible",
    body: "Ce navigateur ne permet pas d'enregistrer la voix. Essaie Chrome, Edge ou Safari récent.",
  },
  insecure: {
    title: "Connexion non sécurisée",
    body: "Le micro n'est accessible que sur une page en HTTPS (ou en local).",
  },
  busy: {
    title: "Micro déjà utilisé",
    body: "Une autre application utilise ton micro. Ferme-la, puis réessaie.",
  },
  unknown: {
    title: "Le micro n'a pas démarré",
    body: "Une erreur inattendue est survenue. Recharge la page et réessaie.",
  },
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

export function speechRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function micSupport(): { ok: true } | { ok: false; error: MicError } {
  if (typeof window === "undefined") return { ok: false, error: "unsupported" };
  if (!window.isSecureContext) return { ok: false, error: "insecure" };
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") return { ok: false, error: "unsupported" };
  return { ok: true };
}

function pickMime(): string | undefined {
  const options = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
  return options.find((m) => MediaRecorder.isTypeSupported?.(m));
}

const SILENCE_LEVEL = 0.035;
const SILENCE_MIN = 1.2;

export interface RecorderResult {
  capture: SpeechCapture;
  audio: Blob | null;
  transcriptionAvailable: boolean;
}

export function useRecorder(opts: { language: string; maxSeconds: number; onAutoStop?: () => void }) {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [error, setError] = useState<MicError | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [interim, setInterim] = useState("");
  const [finalText, setFinalText] = useState("");
  const [speechAvailable] = useState(() => speechRecognitionCtor() !== null);

  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const srRef = useRef<SpeechRecognitionLike | null>(null);
  const tickRef = useRef<number | null>(null);

  // Timing that excludes paused periods.
  const startedAt = useRef(0);
  const pausedTotal = useRef(0);
  const pausedAt = useRef<number | null>(null);
  const now = () => (performance.now() - startedAt.current - pausedTotal.current - (pausedAt.current ? performance.now() - pausedAt.current : 0)) / 1000;

  const volume = useRef<number[]>([]);
  const silences = useRef<Silence[]>([]);
  const silenceStart = useRef<number | null>(null);
  const segments = useRef<SpeechSegment[]>([]);
  const segStart = useRef<number | null>(null);
  const wantRecognition = useRef(false);
  const statusRef = useRef<RecorderStatus>("idle");
  statusRef.current = status;
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const cleanup = useCallback(() => {
    wantRecognition.current = false;
    if (tickRef.current) window.clearInterval(tickRef.current);
    tickRef.current = null;
    try { srRef.current?.abort(); } catch { /* ignore */ }
    srRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void ctxRef.current?.close().catch(() => undefined);
    ctxRef.current = null;
    analyserRef.current = null;
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const startRecognition = useCallback(() => {
    const Ctor = speechRecognitionCtor();
    if (!Ctor) return;
    const sr = new Ctor();
    sr.lang = optsRef.current.language;
    sr.continuous = true;
    sr.interimResults = true;
    sr.onresult = (e) => {
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const text = r[0].transcript.trim();
        if (!text) continue;
        if (segStart.current === null) segStart.current = Math.max(0, now() - 0.8);
        if (r.isFinal) {
          segments.current.push({ text, start: segStart.current, end: now() });
          segStart.current = null;
          setFinalText(segments.current.map((s) => s.text).join(" "));
        } else {
          interimText += (interimText ? " " : "") + text;
        }
      }
      setInterim(interimText);
    };
    sr.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") wantRecognition.current = false;
    };
    // Chrome ends recognition after a silence or ~1 min: restart while recording.
    sr.onend = () => {
      if (wantRecognition.current && statusRef.current === "recording") {
        try { sr.start(); } catch { /* already started */ }
      }
    };
    srRef.current = sr;
    wantRecognition.current = true;
    try { sr.start(); } catch { /* ignore */ }
  }, []);

  const sample = useCallback(() => {
    const an = analyserRef.current;
    if (!an || statusRef.current !== "recording") return;
    const buf = new Float32Array(an.fftSize);
    an.getFloatTimeDomainData(buf);
    let sum = 0;
    for (const v of buf) sum += v * v;
    const level = Math.min(1, Math.sqrt(sum / buf.length) * 4);
    volume.current.push(Math.round(level * 1000) / 1000);
    const t = now();
    if (level < SILENCE_LEVEL) {
      if (silenceStart.current === null) silenceStart.current = t;
    } else if (silenceStart.current !== null) {
      if (t - silenceStart.current >= SILENCE_MIN) silences.current.push({ start: silenceStart.current, end: t });
      silenceStart.current = null;
    }
    setElapsed(t);
    if (t >= optsRef.current.maxSeconds) optsRef.current.onAutoStop?.();
  }, []);

  const start = useCallback(async (): Promise<boolean> => {
    const support = micSupport();
    if (!support.ok) { setError(support.error); setStatus("error"); return false; }
    setStatus("requesting");
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      // Some browsers create the context "suspended" until a user gesture
      // resumes it explicitly; the click that got us here counts, but only
      // if we actually call resume() — otherwise the waveform/halo silently
      // never animate even though recording itself works.
      if (ctx.state === "suspended") void ctx.resume();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.75;
      src.connect(analyser);
      ctxRef.current = ctx;
      analyserRef.current = analyser;

      const mime = pickMime();
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      rec.start(1000);
      recRef.current = rec;

      volume.current = [];
      silences.current = [];
      segments.current = [];
      silenceStart.current = null;
      segStart.current = null;
      setFinalText("");
      setInterim("");
      startedAt.current = performance.now();
      pausedTotal.current = 0;
      pausedAt.current = null;
      setElapsed(0);
      statusRef.current = "recording";
      setStatus("recording");
      startRecognition();
      tickRef.current = window.setInterval(sample, 100);
      return true;
    } catch (e) {
      cleanup();
      const name = (e as DOMException).name;
      setError(
        name === "NotAllowedError" || name === "SecurityError" ? "permission"
        : name === "NotFoundError" || name === "OverconstrainedError" ? "no-device"
        : name === "NotReadableError" ? "busy"
        : "unknown",
      );
      setStatus("error");
      return false;
    }
  }, [cleanup, sample, startRecognition]);

  const pause = useCallback(() => {
    if (statusRef.current !== "recording") return;
    pausedAt.current = performance.now();
    recRef.current?.pause();
    wantRecognition.current = false;
    try { srRef.current?.stop(); } catch { /* ignore */ }
    statusRef.current = "paused";
    setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    if (statusRef.current !== "paused") return;
    if (pausedAt.current) pausedTotal.current += performance.now() - pausedAt.current;
    pausedAt.current = null;
    recRef.current?.resume();
    statusRef.current = "recording";
    setStatus("recording");
    wantRecognition.current = true;
    try { srRef.current?.start(); } catch { startRecognition(); }
  }, [startRecognition]);

  const stop = useCallback(async (): Promise<RecorderResult> => {
    if (statusRef.current === "paused" && pausedAt.current) {
      pausedTotal.current += performance.now() - pausedAt.current;
      pausedAt.current = null;
    }
    const duration = now();
    statusRef.current = "stopped";
    setStatus("stopped");
    wantRecognition.current = false;
    // Give recognition a moment to flush its last final result.
    try { srRef.current?.stop(); } catch { /* ignore */ }
    await new Promise((r) => setTimeout(r, 450));
    if (silenceStart.current !== null && duration - silenceStart.current >= SILENCE_MIN) {
      silences.current.push({ start: silenceStart.current, end: duration });
    }
    const rec = recRef.current;
    const audio = await new Promise<Blob | null>((resolve) => {
      if (!rec || rec.state === "inactive") return resolve(null);
      rec.onstop = () => resolve(chunksRef.current.length ? new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" }) : null);
      try { rec.stop(); } catch { resolve(null); }
    });
    cleanup();
    // Keep any pending interim text: better than losing the end of the answer.
    const pendingInterim = interimRef.current.trim();
    if (pendingInterim) segments.current.push({ text: pendingInterim, start: segStart.current ?? Math.max(0, duration - 2), end: duration });
    const transcript = segments.current.map((s) => s.text).join(" ").trim();
    return {
      audio,
      transcriptionAvailable: speechAvailable,
      capture: {
        transcript,
        durationSec: Math.round(duration * 10) / 10,
        segments: segments.current,
        silences: silences.current,
        volume: volume.current.filter((_, i) => i % 2 === 0),
        source: "speech",
      },
    };
  }, [cleanup, speechAvailable]);

  const interimRef = useRef("");
  interimRef.current = interim;

  const reset = useCallback(() => {
    cleanup();
    setStatus("idle");
    setError(null);
    setElapsed(0);
    setInterim("");
    setFinalText("");
  }, [cleanup]);

  return {
    status, error, elapsed, interim, finalText, speechAvailable,
    analyser: analyserRef, start, pause, resume, stop, reset,
  };
}
