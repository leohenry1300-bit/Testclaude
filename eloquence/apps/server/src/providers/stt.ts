import type { SpeechSegment } from "@eloquence/core";

// Speech-to-text providers. The browser already produces a live transcript
// (Web Speech API); a server provider, when configured, replaces it with a
// more accurate one computed from the uploaded audio.

export interface SttResult {
  transcript: string;
  segments: SpeechSegment[];
}

export interface SttProvider {
  readonly name: string;
  /** Returns null when the provider can't (or shouldn't) transcribe. */
  transcribe(audio: Buffer, mime: string, language: string): Promise<SttResult | null>;
}

/** Trusts the transcript produced on the device. */
export class ClientTranscriptStt implements SttProvider {
  readonly name = "client";
  async transcribe(): Promise<SttResult | null> {
    return null;
  }
}

/** OpenAI Whisper-compatible endpoint (also works with self-hosted gateways). */
export class OpenAiWhisperStt implements SttProvider {
  readonly name = "openai";
  constructor(
    private apiKey: string,
    private model = "whisper-1",
    private baseUrl = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
  ) {}

  async transcribe(audio: Buffer, mime: string, language: string): Promise<SttResult | null> {
    const ext = mime.includes("mp4") ? "m4a" : mime.includes("ogg") ? "ogg" : mime.includes("wav") ? "wav" : "webm";
    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(audio)], { type: mime }), `speech.${ext}`);
    form.append("model", this.model);
    form.append("language", language.slice(0, 2));
    form.append("response_format", "verbose_json");
    form.append("timestamp_granularities[]", "segment");
    // Ask Whisper to keep hesitations instead of cleaning them up.
    form.append("prompt", "Euh, bah, du coup, en fait… je veux dire, voilà quoi.");
    const res = await fetch(`${this.baseUrl}/audio/transcriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}` },
      body: form,
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) throw new Error(`STT ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = (await res.json()) as { text: string; segments?: { start: number; end: number; text: string }[] };
    return {
      transcript: data.text.trim(),
      segments: (data.segments ?? []).map((s) => ({ text: s.text.trim(), start: s.start, end: s.end })),
    };
  }
}
