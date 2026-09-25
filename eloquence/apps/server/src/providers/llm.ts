import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { Analysis, CoachMessage, Exercise, Feedback } from "@eloquence/core";
import {
  DIMENSION_LABELS, DIMENSIONS, EXERCISES, coachContextText, ruleBasedCoachReply, uid,
  type CoachContext,
} from "@eloquence/core";

// Language-model providers. The heuristic provider is always available and is
// the fallback whenever a remote provider fails, so the product never breaks.

export interface FeedbackInput {
  analysis: Analysis;
  transcript: string;
  exercise: Exercise;
  firstName: string;
}

export interface LlmProvider {
  readonly name: string;
  /** Rewrites the coaching feedback from the measured analysis. Null = keep heuristic. */
  feedback(input: FeedbackInput): Promise<Feedback | null>;
  coach(text: string, ctx: CoachContext): Promise<CoachMessage>;
}

export class HeuristicLlm implements LlmProvider {
  readonly name = "heuristic";
  async feedback(): Promise<Feedback | null> {
    return null;
  }
  async coach(text: string, ctx: CoachContext): Promise<CoachMessage> {
    return ruleBasedCoachReply(text, ctx);
  }
}

const COACH_VOICE = `Tu es le coach de prise de parole de l'application Éloquence. Tu tutoies l'utilisateur.
Ton ton est direct, humain, motivant et professionnel. Jamais scolaire, jamais infantilisant, jamais culpabilisant.
Évite les compliments génériques (« Félicitations, tu es incroyable ! »). Préfère des constats précis et chiffrés quand tu as des données.
Chaque réponse doit mener à une action concrète. Écris en français, en texte brut (pas de Markdown, listes numérotées simples autorisées).`;

const FeedbackSchema = z.object({
  headline: z.string().describe("Une phrase courte qui résume la prestation"),
  strengths: z.string().describe("Ce que la personne fait bien, 1 à 2 phrases précises"),
  improvements: z.string().describe("Le point principal à améliorer, 1 à 2 phrases, avec un exemple tiré de la transcription si possible"),
  tip: z.string().describe("Un conseil du jour actionnable immédiatement"),
  retry: z.string().describe("Un objectif chiffré pour refaire l'exercice, commençant par « Refais l'exercice »"),
});

const exerciseIds = EXERCISES.map((e) => e.id) as [string, ...string[]];
const CoachSchema = z.object({
  text: z.string().describe("La réponse du coach, 40 à 140 mots"),
  exerciseId: z.enum(exerciseIds).nullable().describe("Un exercice pertinent à proposer, ou null"),
});

export class AnthropicLlm implements LlmProvider {
  readonly name = "anthropic";
  private client: Anthropic;

  constructor(private model: string) {
    this.client = new Anthropic({ timeout: 45_000, maxRetries: 1 });
  }

  async feedback({ analysis, transcript, exercise, firstName }: FeedbackInput): Promise<Feedback | null> {
    const m = analysis.metrics;
    const facts = [
      `Exercice : « ${exercise.title} » — consigne : ${exercise.prompt}${exercise.stance ? ` Position : ${exercise.stance}` : ""}`,
      `Durée : ${m.durationSec} s (cible ${exercise.durationSec} s), ${m.wordCount} mots, ${m.wpm} mots/min`,
      `Scores mesurés : ${DIMENSIONS.map((d) => `${DIMENSION_LABELS[d]} ${analysis.scores[d]}`).join(", ")}, global ${analysis.scores.global}`,
      `Mots parasites : ${Object.entries(m.fillers).map(([w, n]) => `${w} ×${n}`).join(", ") || "aucun"}`,
      `Pauses notables : ${m.pauseCount} (max ${m.longestPause} s), phrases longues : ${m.longSentences}, formules d'excuse : ${m.hedges}`,
      `Connecteurs utilisés : ${m.connectors.join(", ") || "aucun"}`,
    ].join("\n");
    const response = await this.client.messages.parse({
      model: this.model,
      max_tokens: 4000,
      system: `${COACH_VOICE}\nTu rédiges le retour après un exercice oral. Les scores sont mesurés : ne les contredis pas. Appuie-toi sur le contenu réel de la transcription (idées, exemples, structure).`,
      messages: [{
        role: "user",
        content: `Prénom : ${firstName}\n${facts}\n\nTranscription :\n"""${transcript.slice(0, 6000)}"""`,
      }],
      output_config: { format: zodOutputFormat(FeedbackSchema), effort: "medium" },
    });
    if (response.stop_reason === "refusal" || !response.parsed_output) return null;
    return response.parsed_output;
  }

  async coach(text: string, ctx: CoachContext): Promise<CoachMessage> {
    // Keep a bounded, well-formed alternating history (must start with user).
    const history = ctx.history.slice(-16);
    const messages: Anthropic.MessageParam[] = [];
    for (const m of history) {
      const role = m.role === "coach" ? "assistant" : "user";
      if (messages.length === 0 && role === "assistant") continue;
      const last = messages[messages.length - 1];
      if (last && last.role === role) last.content = `${last.content as string}\n\n${m.text}`;
      else messages.push({ role, content: m.text });
    }
    if (messages.length && messages[messages.length - 1].role === "user") messages.pop();
    messages.push({ role: "user", content: text });

    const catalog = EXERCISES.map((e) => `${e.id} : ${e.title}`).join("\n");
    const response = await this.client.messages.parse({
      model: this.model,
      max_tokens: 3000,
      system: `${COACH_VOICE}
Tu peux simuler un recruteur si on te le demande : pose une question à la fois, commente brièvement chaque réponse, puis passe à la suivante.
Personnalise tes conseils avec les données ci-dessous.

Profil et résultats :
${coachContextText(ctx)}

Exercices disponibles dans l'app (identifiant : titre) :
${catalog}`,
      messages,
      output_config: { format: zodOutputFormat(CoachSchema), effort: "low" },
    });
    const out = response.parsed_output;
    if (response.stop_reason === "refusal" || !out) return ruleBasedCoachReply(text, ctx);
    const ex = out.exerciseId ? EXERCISES.find((e) => e.id === out.exerciseId) : undefined;
    return {
      id: uid("m_"),
      role: "coach",
      text: out.text,
      createdAt: new Date().toISOString(),
      ...(ex ? { action: { label: `${ex.title} · ${ex.durationSec < 60 ? `${ex.durationSec} s` : `${Math.round(ex.durationSec / 60)} min`}`, exerciseId: ex.id } } : {}),
    };
  }
}
