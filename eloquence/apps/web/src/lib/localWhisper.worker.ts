// Runs a small Whisper model entirely in the browser (WebAssembly), so
// transcription never needs a server or an API key. Lives in a Worker so
// loading the model (first use: a real download) and running inference
// never freezes the UI thread.
import { env, pipeline, type AutomaticSpeechRecognitionPipeline, type ProgressInfo } from "@huggingface/transformers";

// Multi-threaded WASM needs SharedArrayBuffer, which needs COOP/COEP
// response headers the server doesn't set (and forcing that on would risk
// breaking other things for a feature that's opt-in and off by default).
// Single-threaded is slower but works everywhere, no server config needed.
if (env.backends.onnx.wasm) env.backends.onnx.wasm.numThreads = 1;

// whisper-tiny, 8-bit quantised: the smallest multilingual Whisper checkpoint
// transformers.js ships — a deliberate tradeoff for a free, in-browser,
// phone-friendly transcription. It reads French reasonably well but is not
// as accurate as the paid, server-side Whisper API (OPENAI_API_KEY).
const MODEL_ID = "Xenova/whisper-tiny";

let transcriberPromise: Promise<AutomaticSpeechRecognitionPipeline> | null = null;

function getTranscriber(): Promise<AutomaticSpeechRecognitionPipeline> {
  transcriberPromise ??= pipeline("automatic-speech-recognition", MODEL_ID, {
    dtype: "q8",
    progress_callback: (info: ProgressInfo) => {
      postMessage({ type: "progress", info });
    },
  });
  return transcriberPromise;
}

interface TranscribeMessage {
  type: "transcribe";
  audio: Float32Array;
  language: string;
}

self.onmessage = async (e: MessageEvent<TranscribeMessage>) => {
  if (e.data.type !== "transcribe") return;
  try {
    const transcriber = await getTranscriber();
    const out = await transcriber(e.data.audio, {
      language: e.data.language,
      task: "transcribe",
      chunk_length_s: 30,
      stride_length_s: 5,
      return_timestamps: true,
    });
    const single = Array.isArray(out) ? out[0] : out;
    postMessage({ type: "result", text: single.text, chunks: single.chunks ?? [] });
  } catch (err) {
    postMessage({ type: "error", message: (err as Error).message });
  }
};
