import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { Analysis, CoachMessage, Exercise, Feedback } from "@eloquence/core";
import {
  DIMENSION_LABELS, DIMENSIONS, EXERCISES, GAMES, SIMULATIONS, coachContextText, getSimulation,
  heuristicRewrite, ruleBasedCoachReply, uid, type CoachContext, type RewriteMode,
} from "@eloquence/core";

// Language-model providers. The heuristic provider is always available and is
// the fallback whenever a remote provider fails, so the product never breaks.
// This is a personal, single-user app: no plan/tier logic here either.

export interface FeedbackInput {
  analysis: Analysis;
  transcript: string;
  exercise: Exercise;
  firstName: string;
  /** Compact, factual summary of the user's recent history (trend, recurring
   * issue) — null when there isn't enough history yet. Lets the coach
   * reference real progress instead of treating every session as the first. */
  historyNote?: string | null;
}

export interface RewriteResult {
  clair: string;
  concis: string;
  pro: string;
  persuasif: string | null;
}

export interface CoherenceResult {
  score: number;
  reason: string;
}

export interface LlmProvider {
  readonly name: string;
  /** Rewrites the coaching feedback from the measured analysis. Null = keep heuristic. */
  feedback(input: FeedbackInput): Promise<Feedback | null>;
  coach(text: string, ctx: CoachContext): Promise<CoachMessage>;
  /** Four grounded reformulations of the user's own words. Never null: the
   * heuristic fallback always returns something, even offline. */
  rewrite(transcript: string): Promise<RewriteResult>;
  /** A model answer to the exercise prompt — clearly not "the only right
   * answer". Null when no LLM is configured (never fabricated offline). */
  modelAnswer(input: FeedbackInput): Promise<string | null>;
  /** Judges whether the answer actually makes sense and addresses the
   * prompt — content, not delivery. Null when no LLM is configured: the
   * heuristic engine has no way to judge meaning, so this is never guessed
   * at offline. */
  coherence(input: FeedbackInput): Promise<CoherenceResult | null>;
}

export class HeuristicLlm implements LlmProvider {
  readonly name = "heuristic";
  async feedback(): Promise<Feedback | null> {
    return null;
  }
  async coach(text: string, ctx: CoachContext): Promise<CoachMessage> {
    return ruleBasedCoachReply(text, ctx);
  }
  async rewrite(transcript: string): Promise<RewriteResult> {
    return {
      clair: heuristicRewrite(transcript, "clair"),
      concis: heuristicRewrite(transcript, "concis"),
      pro: heuristicRewrite(transcript, "pro"),
      persuasif: null,
    };
  }
  async modelAnswer(): Promise<string | null> {
    return null;
  }
  async coherence(): Promise<CoherenceResult | null> {
    return null;
  }
}

const COACH_VOICE = `Tu es le coach personnel de prise de parole de l'application Éloquence. Tu tutoies l'utilisateur.
Ton ton est exigeant, intelligent, honnête et précis. Jamais infantilisant, jamais de compliment générique.
Si une réponse est faible, dis-le clairement, puis explique comment progresser. Préfère toujours "Ta réponse manque de structure et tourne autour du sujet" à "Très bonne réponse, continue comme ça !".
Chaque réponse mène à une action concrète. Écris en français, en texte brut (pas de Markdown).
N'invente jamais une phrase que l'utilisateur n'a pas prononcée : appuie-toi uniquement sur ce qui t'est donné.
Ne prétends jamais détecter un état psychologique ou une "confiance intérieure" : commente uniquement des éléments observables dans le discours ou la voix.`;

const FeedbackSchema = z.object({
  headline: z.string().describe("Une phrase courte qui résume la prestation"),
  strengths: z.array(z.string()).max(3).describe("Ce que la personne fait bien, au plus 3 points concrets"),
  weaknesses: z.array(z.string()).max(3).describe("Ce qui pénalise la réponse, au plus 3 points concrets"),
  example: z.object({ text: z.string(), issue: z.enum(["filler", "repetition", "long_sentence", "pause", "hedge", "vague", "grammar", "forbidden"]) }).nullable()
    .describe("Une phrase EXACTEMENT recopiée de la transcription qui illustre le problème principal, ou null"),
  why: z.string().describe("Pourquoi cet exemple précis pose problème"),
  howToFix: z.string().describe("Une technique concrète pour corriger, en nommant une méthode si pertinent (PREP, STAR, Toulmin, Story Spine)"),
  goal: z.string().describe("Un objectif chiffré pour la prochaine tentative, commençant par « Refais l'exercice »"),
});

const exerciseIds = EXERCISES.map((e) => e.id) as [string, ...string[]];
const gameIds = GAMES.map((g) => g.id) as [string, ...string[]];
const activityIds = [...exerciseIds, ...gameIds] as [string, ...string[]];
const CoachSchema = z.object({
  text: z.string().describe("La réponse du coach, 40 à 140 mots, sauf pendant une simulation où c'est la réplique du personnage"),
  exerciseId: z.enum(activityIds).nullable().describe("Un exercice ou un jeu pertinent à proposer, ou null"),
});

export class AnthropicLlm implements LlmProvider {
  readonly name = "anthropic";
  private client: Anthropic;

  constructor(private model: string) {
    this.client = new Anthropic({ timeout: 45_000, maxRetries: 1 });
  }

  private facts(analysis: Analysis, exercise: Exercise): string {
    const m = analysis.metrics;
    return [
      `Exercice : « ${exercise.title} » — consigne : ${exercise.prompt}${exercise.stance ? ` Position : ${exercise.stance}` : ""}`,
      `Durée : ${m.durationSec} s (cible ${exercise.durationSec} s), ${m.wordCount} mots, ${m.wpm} mots/min`,
      `Scores mesurés : ${DIMENSIONS.map((d) => `${DIMENSION_LABELS[d]} ${analysis.scores[d]}`).join(", ")}, global ${analysis.scores.global}`,
      `Mots parasites : ${Object.entries(m.fillers).map(([w, n]) => `${w} ×${n}`).join(", ") || "aucun"}`,
      `Pauses notables : ${m.pauseCount} (max ${m.longestPause} s), phrases longues : ${m.longSentences}, formules d'excuse : ${m.hedges}`,
      `Connecteurs utilisés : ${m.connectors.join(", ") || "aucun"}`,
      `Marqueurs d'argumentation : ${m.exampleMarkers} exemple(s), ${m.counterArgumentMarkers} nuance/contre-argument`,
      `Tournures fautives relevées : ${m.grammarFlags.map((g) => g.label).join(", ") || "aucune"}`,
    ].join("\n");
  }

  async feedback({ analysis, transcript, exercise, firstName, historyNote }: FeedbackInput): Promise<Feedback | null> {
    const history = historyNote
      ? `\n\nHistorique réel de la personne (utilise-le seulement si c'est vraiment pertinent pour cette réponse précise — jamais de comparaison forcée) :\n${historyNote}`
      : "";
    const response = await this.client.messages.parse({
      model: this.model,
      max_tokens: 4000,
      system: `${COACH_VOICE}\nTu rédiges le retour après un exercice oral. Les scores sont mesurés : ne les contredis pas. Le champ "example" doit être une phrase copiée mot pour mot depuis la transcription fournie — jamais reformulée ni inventée.`,
      messages: [{
        role: "user",
        content: `Prénom : ${firstName}\n${this.facts(analysis, exercise)}${history}\n\nTranscription :\n"""${transcript.slice(0, 6000)}"""`,
      }],
      output_config: { format: zodOutputFormat(FeedbackSchema), effort: "medium" },
    });
    if (response.stop_reason === "refusal" || !response.parsed_output) return null;
    const out = response.parsed_output;
    // Guard against a fabricated quote: keep only if it's actually in the transcript.
    if (out.example && !transcript.includes(out.example.text)) out.example = null;
    return out;
  }

  async coherence({ transcript, exercise, firstName }: FeedbackInput): Promise<CoherenceResult | null> {
    const CoherenceSchema = z.object({
      score: z.number().min(0).max(100).describe("0 = incohérent, hors-sujet ou absurde ; 100 = répond vraiment et sensément à la consigne"),
      reason: z.string().describe("Une phrase factuelle et honnête expliquant ce score, sans complaisance"),
    });
    const response = await this.client.messages.parse({
      model: this.model,
      max_tokens: 500,
      system: `${COACH_VOICE}\nÉvalue UNIQUEMENT si ce que la personne a dit a du sens et répond réellement à la consigne — pas la forme (débit, mots parasites, longueur des phrases : déjà mesurés ailleurs, ignore-les). Un texte fluide et bien articulé qui ne répond pas à la question, se contredit, part dans tous les sens ou ne veut rien dire doit avoir un score bas malgré une bonne forme. Sois strict : jamais un score élevé par politesse.`,
      messages: [{
        role: "user",
        content: `Prénom : ${firstName}\nExercice : « ${exercise.title} » — consigne : ${exercise.prompt}${exercise.stance ? ` Position : ${exercise.stance}` : ""}\n\nTranscription :\n"""${transcript.slice(0, 4000)}"""`,
      }],
      output_config: { format: zodOutputFormat(CoherenceSchema), effort: "low" },
    });
    if (response.stop_reason === "refusal" || !response.parsed_output) return null;
    return response.parsed_output;
  }

  async modelAnswer({ analysis, transcript, exercise, firstName }: FeedbackInput): Promise<string | null> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1200,
      system: `${COACH_VOICE}\nRédige une réponse modèle à l'exercice — une bonne façon d'y répondre, pas "la seule bonne réponse". Précise en une phrase au début ce qui la rend efficace (structure, vocabulaire, concision, exemples), puis donne le texte. Reste dans le même registre que l'exercice, à l'oral.`,
      messages: [{ role: "user", content: `Prénom : ${firstName}\n${this.facts(analysis, exercise)}\n\nSa réponse actuelle :\n"""${transcript.slice(0, 3000)}"""` }],
    });
    if (response.stop_reason === "refusal") return null;
    const text = response.content.find((b) => b.type === "text")?.text;
    return text?.trim() || null;
  }

  async rewrite(transcript: string): Promise<RewriteResult> {
    const RewriteSchema = z.object({ clair: z.string(), concis: z.string(), pro: z.string(), persuasif: z.string() });
    const response = await this.client.messages.parse({
      model: this.model,
      max_tokens: 2000,
      system: `${COACH_VOICE}\nOn te donne une transcription orale telle quelle. Reformule-la EXACTEMENT quatre fois, en gardant le même sens et les mêmes idées (n'invente aucun fait nouveau) :
- clair : phrases courtes, idées nettes
- concis : la même chose en beaucoup moins de mots
- pro : registre professionnel
- persuasif : orientée vers l'action, avec un appel à l'action explicite`,
      messages: [{ role: "user", content: transcript.slice(0, 4000) }],
      output_config: { format: zodOutputFormat(RewriteSchema), effort: "low" },
    });
    if (response.stop_reason === "refusal" || !response.parsed_output) {
      return { clair: heuristicRewrite(transcript, "clair"), concis: heuristicRewrite(transcript, "concis"), pro: heuristicRewrite(transcript, "pro"), persuasif: null };
    }
    return response.parsed_output;
  }

  async coach(text: string, ctx: CoachContext): Promise<CoachMessage> {
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

    const lastCoach = [...history].reverse().find((m) => m.role === "coach");
    const activeSim = lastCoach?.interview && lastCoach.interview.step < lastCoach.interview.total
      ? getSimulation(lastCoach.interview.simulationId ?? "") : undefined;
    const simPersona = activeSim
      ? `\n\nSIMULATION EN COURS — tu incarnes ce personnage, pas le coach : ${activeSim.llmPersona}\nRéagis naturellement à ce que l'utilisateur vient de dire, puis enchaîne avec la suite logique de la conversation (tu n'es pas obligé de suivre un script figé). Le champ "text" est ta réplique dans le personnage. Mets "exerciseId" à null pendant la simulation.`
      : `\n\nSimulations disponibles si l'utilisateur en demande une : ${SIMULATIONS.map((s) => `${s.id} (${s.title})`).join(", ")}. Pour en lancer une, réponds normalement en préparant le terrain — l'application gère le script des questions côté client.`;

    const catalog = EXERCISES.map((e) => `${e.id} : ${e.title}`).join("\n") + "\n" + GAMES.map((g) => `${g.id} : ${g.title}`).join("\n");
    const response = await this.client.messages.parse({
      model: this.model,
      max_tokens: 3000,
      system: `${COACH_VOICE}${simPersona}

Profil et résultats :
${coachContextText(ctx)}

Activités disponibles (identifiant : titre) :
${catalog}`,
      messages,
      output_config: { format: zodOutputFormat(CoachSchema), effort: "low" },
    });
    const out = response.parsed_output;
    if (response.stop_reason === "refusal" || !out) return ruleBasedCoachReply(text, ctx);
    const ex = out.exerciseId ? EXERCISES.find((e) => e.id === out.exerciseId) ?? GAMES.find((g) => g.id === out.exerciseId) : undefined;
    const label = ex ? `${ex.title} · ${ex.durationSec < 60 ? `${ex.durationSec} s` : `${Math.round(ex.durationSec / 60)} min`}` : undefined;
    return {
      id: uid("m_"),
      role: "coach",
      text: out.text,
      createdAt: new Date().toISOString(),
      ...(ex ? { action: { label: label!, exerciseId: ex.id } } : {}),
      ...(activeSim ? { interview: { step: lastCoach!.interview!.step + 1, total: lastCoach!.interview!.total, simulationId: activeSim.id } } : {}),
    };
  }
}

export type { RewriteMode };
