import {
  analyzeSpeech, buildSessionResult, canStartExercise, dayKey, generateProgram, getExercise,
  isPremium, markProgramProgress, ruleBasedCoachReply, summarize, uid, weakestDimension,
  FREE_DAILY_COACH_MESSAGES,
  type AccountState, type CoachMessage, type Program, type SessionResult, type SpeechCapture, type User,
} from "@eloquence/core";
import { ApiError, http } from "./http";
import { deleteClip, saveClip } from "./audioStore";

export interface SubmitInput {
  exerciseId: string;
  capture: SpeechCapture;
  audio: Blob | null;
  onboarding?: boolean;
}

export type UserPatch = Partial<Pick<User, "firstName" | "avatar" | "goal" | "goalText" | "level" | "frequency">> & {
  settings?: Partial<User["settings"]>;
};

/**
 * Everything the UI can do to an account. Two implementations: the API
 * (signed-in users) and the device (guest & demo), which runs the exact same
 * analysis engine locally.
 */
export interface Backend {
  readonly kind: "local" | "remote";
  submitSession(state: AccountState, input: SubmitInput): Promise<{ state: AccountState; result: SessionResult }>;
  deleteSession(state: AccountState, id: string): Promise<AccountState>;
  sendCoach(state: AccountState, text: string): Promise<AccountState>;
  clearCoach(state: AccountState): Promise<AccountState>;
  updateMe(state: AccountState, patch: UserPatch): Promise<AccountState>;
  createProgram(state: AccountState, goalText: string): Promise<AccountState>;
  deleteProgram(state: AccountState): Promise<AccountState>;
  checkout(state: AccountState, plan: "monthly" | "yearly"): Promise<AccountState>;
  cancelPremium(state: AccountState): Promise<AccountState>;
  refresh(state: AccountState): Promise<AccountState>;
}

const merge = (state: AccountState, user: User): AccountState => ({ ...state, user });

// ---------------------------------------------------------------------------

export class RemoteBackend implements Backend {
  readonly kind = "remote";

  async submitSession(state: AccountState, input: SubmitInput) {
    const form = new FormData();
    form.append("meta", JSON.stringify({ exerciseId: input.exerciseId, capture: input.capture, onboarding: input.onboarding }));
    if (input.audio) form.append("audio", input.audio, `speech.${input.audio.type.includes("mp4") ? "m4a" : "webm"}`);
    const result = await http<SessionResult>("POST", "/api/sessions", form, 120_000);
    const fresh = await http<AccountState>("GET", "/api/state").catch(() => null);
    return { state: fresh ?? { ...state, sessions: [result.session, ...state.sessions] }, result };
  }

  async deleteSession(state: AccountState, id: string) {
    await http("DELETE", `/api/sessions/${id}`);
    return { ...state, sessions: state.sessions.filter((s) => s.id !== id) };
  }

  async sendCoach(state: AccountState, text: string) {
    const r = await http<{ userMessage: CoachMessage; reply: CoachMessage }>("POST", "/api/coach", { text });
    return { ...state, coach: [...state.coach, r.userMessage, r.reply] };
  }

  async clearCoach(state: AccountState) {
    await http("DELETE", "/api/coach");
    return { ...state, coach: [] };
  }

  async updateMe(state: AccountState, patch: UserPatch) {
    const r = await http<{ user: User }>("PATCH", "/api/me", patch);
    return merge(state, r.user);
  }

  async createProgram(state: AccountState, goalText: string) {
    const r = await http<{ program: Program }>("POST", "/api/program", { goalText });
    return { ...state, program: r.program, user: { ...state.user, goalText } };
  }

  async deleteProgram(state: AccountState) {
    await http("DELETE", "/api/program");
    return { ...state, program: null };
  }

  async checkout(state: AccountState, plan: "monthly" | "yearly") {
    const r = await http<{ user: User }>("POST", "/api/billing/checkout", { plan });
    return merge(state, r.user);
  }

  async cancelPremium(state: AccountState) {
    const r = await http<{ user: User }>("POST", "/api/billing/cancel");
    return merge(state, r.user);
  }

  async refresh() {
    return http<AccountState>("GET", "/api/state");
  }
}

// ---------------------------------------------------------------------------

export class LocalBackend implements Backend {
  readonly kind = "local";
  constructor(private persist: (s: AccountState) => void) {}

  private save(s: AccountState): AccountState {
    this.persist(s);
    return s;
  }

  async submitSession(state: AccountState, input: SubmitInput) {
    const exercise = getExercise(input.exerciseId);
    if (!exercise) throw new ApiError(404, "exercise_not_found", "Exercice introuvable.");
    const today = dayKey(new Date());
    const todayCount = state.sessions.filter((s) => dayKey(s.createdAt) === today).length;
    const gate = canStartExercise(state.user, exercise, todayCount, { onboarding: input.onboarding && state.sessions.length === 0 });
    if (!gate.ok) throw new ApiError(402, gate.reason, gate.message);

    const capture = { ...input.capture };
    if (!capture.transcript.trim()) capture.transcript = (capture.segments ?? []).map((s) => s.text).join(" ");
    if (!capture.transcript.trim()) {
      throw new ApiError(422, "empty_transcript", "Nous n'avons rien entendu. Vérifie ton micro et parle un peu plus fort.");
    }
    const analysis = analyzeSpeech(capture, { exercise });
    const id = uid("s_");
    let audioUrl: string | null = null;
    if (input.audio && state.user.settings.saveAudio && (await saveClip(id, input.audio))) audioUrl = `idb:${id}`;

    const result = buildSessionResult({
      userId: state.user.id, exercise, analysis, transcript: capture.transcript,
      durationSec: analysis.metrics.durationSec, audioUrl, previous: state.sessions, badges: state.badges, id,
    });
    const next: AccountState = {
      ...state,
      sessions: [result.session, ...state.sessions],
      badges: [...state.badges, ...result.newBadges.map((b) => ({ id: b.id, earnedAt: result.session.createdAt }))],
      program: state.program ? markProgramProgress(state.program, exercise.id) : null,
    };
    return { state: this.save(next), result };
  }

  async deleteSession(state: AccountState, id: string) {
    await deleteClip(id);
    return this.save({ ...state, sessions: state.sessions.filter((s) => s.id !== id) });
  }

  async sendCoach(state: AccountState, text: string) {
    const today = dayKey(new Date());
    const used = state.coach.filter((m) => m.role === "user" && dayKey(m.createdAt) === today).length;
    if (!isPremium(state.user) && used >= FREE_DAILY_COACH_MESSAGES) {
      throw new ApiError(402, "coach_limit", `Tu as utilisé tes ${FREE_DAILY_COACH_MESSAGES} messages gratuits du jour. Le coach illimité fait partie de Premium.`);
    }
    const userMessage: CoachMessage = { id: uid("m_"), role: "user", text, createdAt: new Date().toISOString() };
    const reply = ruleBasedCoachReply(text, {
      user: state.user,
      summary: summarize(state.sessions, state.badges),
      lastSession: state.sessions[0] ?? null,
      history: state.coach.slice(-30),
    });
    // A short, natural delay: the reply shouldn't feel pre-canned.
    await new Promise((r) => setTimeout(r, 500 + Math.min(1200, reply.text.length * 3)));
    return this.save({ ...state, coach: [...state.coach, userMessage, reply] });
  }

  async clearCoach(state: AccountState) {
    return this.save({ ...state, coach: [] });
  }

  async updateMe(state: AccountState, patch: UserPatch) {
    const user = { ...state.user, ...patch, settings: { ...state.user.settings, ...(patch.settings ?? {}) } };
    return this.save({ ...state, user });
  }

  async createProgram(state: AccountState, goalText: string) {
    const weakest = weakestDimension(summarize(state.sessions, []).current);
    const program = generateProgram(goalText, state.user.goal, weakest);
    return this.save({ ...state, program, user: { ...state.user, goalText } });
  }

  async deleteProgram(state: AccountState) {
    return this.save({ ...state, program: null });
  }

  async checkout(state: AccountState) {
    const until = new Date(Date.now() + 7 * 86_400_000).toISOString();
    return this.save({ ...state, user: { ...state.user, plan: "premium", premiumUntil: until } });
  }

  async cancelPremium(state: AccountState) {
    return this.save({ ...state, user: { ...state.user, plan: "free", premiumUntil: null } });
  }

  async refresh(state: AccountState) {
    return state;
  }
}
