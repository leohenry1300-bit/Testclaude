import path from "node:path";
import { loadConfig } from "./config";
import { createStore } from "./db";
import { createApp } from "./app";
import { ClientTranscriptStt, OpenAiWhisperStt, type SttProvider } from "./providers/stt";
import { AnthropicLlm, HeuristicLlm, type LlmProvider } from "./providers/llm";
import { ConsoleMailer, LocalDiskStorage, ResendMailer, type Mailer } from "./providers/services";

const config = loadConfig();
const store = createStore({ file: path.join(config.dataDir, "eloquence.db"), databaseUrl: config.databaseUrl ?? undefined });

const stt: SttProvider = config.stt.provider === "openai" && config.stt.openaiKey
  ? new OpenAiWhisperStt(config.stt.openaiKey, config.stt.model)
  : new ClientTranscriptStt();
const llm: LlmProvider = config.llm.provider === "anthropic" ? new AnthropicLlm(config.llm.model) : new HeuristicLlm();
const mailer: Mailer = config.mail.resendKey ? new ResendMailer(config.mail.resendKey, config.mail.from) : new ConsoleMailer();
const storage = new LocalDiskStorage(path.join(config.dataDir, "audio"));

const app = createApp({ config, store, stt, llm, storage, mailer });

app.listen(config.port, () => {
  console.log(`Éloquence API → http://localhost:${config.port}`);
  console.log(`  STT : ${stt.name} · IA : ${llm.name}${llm.name === "anthropic" ? ` (${config.llm.model})` : ""} · e-mails : ${mailer.name} · BDD : ${config.databaseUrl ? "postgres" : "sqlite"}`);
});
