// Shared domain model for Éloquence. Used by the web app, the API and the
// analysis engine so that both sides always speak the same language.

export type Goal =
  | "aisance"
  | "entretiens"
  | "presentations"
  | "convaincre"
  | "improviser"
  | "concours";

export type Level = "debutant" | "intermediaire" | "a_l_aise" | "tres_a_l_aise";

export type Frequency = "5" | "10" | "15" | "semaine";

export type Plan = "free" | "premium";

export type CategoryId =
  | "improvisation"
  | "entretien"
  | "pitch"
  | "presentation"
  | "debat"
  | "pro"
  | "prononciation";

export type Dimension =
  | "clarte"
  | "fluidite"
  | "confiance"
  | "structure"
  | "vocabulaire"
  | "debit"
  | "parasites";

export type Scores = Record<Dimension, number> & { global: number };

export interface UserSettings {
  notifications: boolean;
  reminderHour: number;
  sessionSeconds: number;
  language: "fr-FR" | "fr-CA" | "fr-BE" | "fr-CH";
  theme: "system" | "light" | "dark";
  saveAudio: boolean;
  shareAnonymousStats: boolean;
}

export interface User {
  id: string;
  firstName: string;
  email: string | null;
  avatar: string | null; // data URL or emoji seed
  goal: Goal;
  goalText: string | null;
  level: Level;
  frequency: Frequency;
  plan: Plan;
  premiumUntil: string | null;
  createdAt: string;
  settings: UserSettings;
  isDemo?: boolean;
}

/** A chunk of recognised speech with its timing, in seconds from start. */
export interface SpeechSegment {
  text: string;
  start: number;
  end: number;
}

/** A silence detected from the audio signal, in seconds from start. */
export interface Silence {
  start: number;
  end: number;
}

/** Raw signals captured while the user speaks. */
export interface SpeechCapture {
  transcript: string;
  durationSec: number;
  segments?: SpeechSegment[];
  silences?: Silence[];
  /** 0..1 loudness samples, roughly every 100 ms. */
  volume?: number[];
  /** "speech" when captured with a real mic, "text" for typed fallback. */
  source: "speech" | "text" | "server-stt";
}

export type IssueKind =
  | "filler"
  | "repetition"
  | "long_sentence"
  | "pause"
  | "hedge"
  | "vague";

export interface TranscriptToken {
  text: string;
  kind?: IssueKind;
  /** index into the analysis issues list */
  issue?: number;
}

export interface TranscriptSentence {
  tokens: TranscriptToken[];
  tooLong: boolean;
  wordCount: number;
  /** Pause (seconds) that follows this sentence, if notable. */
  pauseAfter?: number;
}

export interface Issue {
  kind: IssueKind;
  label: string;
  count: number;
  detail: string;
  suggestion: string;
}

export interface PaceSample {
  t: number;
  wpm: number;
}

export interface Metrics {
  wordCount: number;
  uniqueWords: number;
  durationSec: number;
  speakingSec: number;
  wpm: number;
  fillerCount: number;
  fillerPer100: number;
  fillers: Record<string, number>;
  repetitions: Record<string, number>;
  sentenceCount: number;
  avgSentenceWords: number;
  longSentences: number;
  pauseCount: number;
  longestPause: number;
  lexicalDiversity: number;
  connectors: string[];
  hedges: number;
  pace: PaceSample[];
  accelerations: number;
  slowdowns: number;
  volumeStability: number | null;
  /** True when the answer was typed: pace and pauses aren't measured. */
  typed?: boolean;
}

export interface Feedback {
  strengths: string;
  improvements: string;
  tip: string;
  retry: string;
  /** one-line headline summarising the attempt */
  headline: string;
}

export interface Analysis {
  scores: Scores;
  metrics: Metrics;
  issues: Issue[];
  sentences: TranscriptSentence[];
  feedback: Feedback;
  engine: "heuristic" | "llm";
}

export interface Session {
  id: string;
  userId: string;
  exerciseId: string;
  exerciseTitle: string;
  category: CategoryId;
  createdAt: string;
  durationSec: number;
  audioUrl: string | null;
  transcript: string;
  score: number;
  analysis: Analysis;
  xpEarned: number;
  attempt: number;
}

export interface Comparison {
  previousScore: number;
  newScore: number;
  delta: number;
  dimensions: Partial<Record<Dimension, number>>;
  fillerChangePct: number | null;
  message: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface EarnedBadge {
  id: string;
  earnedAt: string;
}

export interface XpLine {
  label: string;
  xp: number;
}

export interface SessionResult {
  session: Session;
  comparison: Comparison | null;
  xp: XpLine[];
  newBadges: Badge[];
  levelUp: LevelInfo | null;
}

export interface LevelInfo {
  level: number;
  name: string;
  minXp: number;
  nextXp: number | null;
}

export interface ProgramDay {
  day: number;
  title: string;
  focus: string;
  exerciseId: string;
  done: boolean;
}

export interface Program {
  id: string;
  goalText: string;
  createdAt: string;
  days: ProgramDay[];
}

export interface CoachMessage {
  id: string;
  role: "user" | "coach";
  text: string;
  createdAt: string;
  /** Optional suggested exercise the UI can launch. */
  action?: { label: string; exerciseId: string };
  /** Set while the coach runs a mock interview, to track the question index. */
  interview?: { step: number; total: number };
}

export interface ProgressSummary {
  xp: number;
  level: LevelInfo;
  levelProgress: number;
  streak: number;
  bestStreak: number;
  sessionCount: number;
  totalSec: number;
  totalWords: number;
  averageScore: number;
  bestScore: number;
  weekSec: number;
  weekSessions: number;
  current: Scores | null;
  /** score change over the last 30 days, in points */
  trend30: number | null;
  fillersRemoved: number;
  todayCount: number;
  badges: EarnedBadge[];
}

/** Everything a client needs to render the app for one user. */
export interface AccountState {
  user: User;
  sessions: Session[];
  program: Program | null;
  coach: CoachMessage[];
  badges: EarnedBadge[];
}
