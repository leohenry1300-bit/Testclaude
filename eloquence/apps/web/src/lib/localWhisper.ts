import type { SpeechSegment } from "@eloquence/core";

// Main-thread side of local (in-browser) transcription: decodes the
// recording to the 16 kHz mono PCM Whisper expects, then hands it to a
// Worker (localWhisper.worker.ts) that runs the model off the UI thread.

export interface LocalWhisperProgress {
  /** 0-100, or null while a file is still being located/initiated. */
  percent: number | null;
}

let worker: Worker | null = null;

function getWorker(): Worker {
  worker ??= new Worker(new URL("./localWhisper.worker.ts", import.meta.url), { type: "module" });
  return worker;
}

export function localWhisperSupported(): boolean {
  return typeof Worker !== "undefined" && typeof window !== "undefined"
    && (typeof window.AudioContext !== "undefined" || typeof (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext !== "undefined");
}

async function decodeTo16kMono(blob: Blob): Promise<Float32Array> {
  const bytes = await blob.arrayBuffer();
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AC();
  let decoded: AudioBuffer;
  try {
    decoded = await ctx.decodeAudioData(bytes);
  } finally {
    void ctx.close();
  }
  const targetRate = 16000;
  const offline = new OfflineAudioContext(1, Math.ceil(decoded.duration * targetRate), targetRate);
  const src = offline.createBufferSource();
  src.buffer = decoded;
  src.connect(offline.destination);
  src.start();
  const rendered = await offline.startRendering();
  return rendered.getChannelData(0);
}

// Whisper's own language codes: full English names, not BCP-47 tags.
const WHISPER_LANGUAGE: Record<string, string> = {
  "fr-FR": "french", "fr-BE": "french", "fr-CH": "french", "fr-CA": "french",
};

interface WorkerChunk { text: string; timestamp: [number, number] }
type WorkerMessage =
  | { type: "progress"; info: { status: string; progress?: number } }
  | { type: "result"; text: string; chunks: WorkerChunk[] }
  | { type: "error"; message: string };

export async function transcribeLocally(
  audio: Blob,
  language: string,
  onProgress?: (p: LocalWhisperProgress) => void,
): Promise<{ transcript: string; segments: SpeechSegment[] }> {
  const pcm = await decodeTo16kMono(audio);
  const w = getWorker();
  return new Promise((resolve, reject) => {
    const onMessage = (e: MessageEvent<WorkerMessage>) => {
      const data = e.data;
      if (data.type === "progress") {
        if (data.info.status === "progress_total") onProgress?.({ percent: data.info.progress ?? null });
        return;
      }
      w.removeEventListener("message", onMessage);
      if (data.type === "error") { reject(new Error(data.message)); return; }
      const segments: SpeechSegment[] = data.chunks
        .filter((c) => c.text.trim())
        .map((c) => ({ text: c.text.trim(), start: c.timestamp[0] ?? 0, end: c.timestamp[1] ?? 0 }));
      resolve({ transcript: data.text.trim(), segments });
    };
    w.addEventListener("message", onMessage);
    w.postMessage({ type: "transcribe", audio: pcm, language: WHISPER_LANGUAGE[language] ?? "french" }, [pcm.buffer]);
  });
}
