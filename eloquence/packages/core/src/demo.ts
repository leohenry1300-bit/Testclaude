import type { AccountState, CoachMessage, EarnedBadge, Session, SpeechCapture, User, UserSettings } from "./types";
import { analyzeSpeech, DIMENSIONS, globalScore } from "./analysis";
import { getExercise } from "./exercises";
import { buildSessionResult } from "./pipeline";
import { generateProgram, markProgramProgress } from "./programs";
import { detectRecurringIssue, weakestDimension } from "./progress";

export const DEFAULT_SETTINGS: UserSettings = {
  notifications: true,
  reminderHour: 19,
  sessionSeconds: 60,
  language: "fr-FR",
  theme: "system",
  saveAudio: true,
  shareAnonymousStats: false,
  localTranscription: false,
};

// Clean spoken answers; fillers are injected to simulate early vs. late sessions.
const TEXTS: Record<string, string> = {
  "impro-passion": "Ce qui me passionne, c'est la photographie de rue. J'aime observer les gens sans qu'ils le sachent. Une scène banale devient une histoire quand on la cadre bien. Par exemple, la semaine dernière, j'ai photographié un vieux monsieur qui nourrissait des pigeons devant la gare. La lumière du soir tombait parfaitement. C'est pour ça que je sors toujours avec mon appareil. Ce que j'aimerais transmettre, c'est l'idée qu'il suffit de regarder autour de soi pour trouver de la beauté. Ce qui m'a fait commencer, c'est un voyage à Lisbonne il y a trois ans. J'avais un vieil appareil prêté par mon oncle, et je suis rentrée avec deux cents photos de trams, de linge aux fenêtres et de visages. Depuis, j'essaie de sortir au moins une heure par semaine, sans objectif précis. Ce n'est pas une question de matériel : un téléphone suffit largement pour commencer.",
  "entretien-presentation": "Je m'appelle Camille, j'ai vingt-quatre ans et je termine un master en marketing digital. Pendant mon alternance chez une start-up lyonnaise, j'ai piloté les campagnes d'acquisition et nous avons doublé le nombre d'inscriptions en six mois. Ce qui me motive, c'est de comprendre les utilisateurs à partir des données. Aujourd'hui, je cherche un premier poste où je peux allier analyse et créativité. C'est pourquoi votre équipe m'intéresse particulièrement. Concrètement, j'ai appris à construire des tableaux de bord, à tester des messages et à présenter mes résultats à la direction chaque mois. J'ai aussi animé un atelier interne pour former mes collègues aux outils d'analyse. Ce que je retiens de cette expérience, c'est qu'une bonne idée ne vaut rien si on ne sait pas l'expliquer simplement.",
  "impro-ville": "Si vous venez à Lyon, vous allez manger mieux que partout ailleurs. D'abord, il y a les bouchons, ces petits restaurants où l'on partage des plats généreux. Ensuite, la ville se découvre à pied, des pentes de la Croix-Rousse jusqu'aux quais du Rhône. Enfin, au mois de décembre, la fête des Lumières transforme chaque rue en œuvre d'art. Alors réservez un week-end, vous ne le regretterez pas. Et si vous aimez la culture, vous trouverez des musées pour tous les goûts, du cinéma avec l'institut Lumière aux confluences entre science et histoire. Le soir, les péniches sur le Rhône accueillent des concerts. Tout est accessible en métro ou à vélo, et vous pouvez même faire un saut dans les vignobles du Beaujolais en moins d'une heure.",
  "pitch-soi": "Je transforme des données en décisions. En deux ans d'alternance, j'ai aidé une start-up à doubler ses inscriptions grâce à des campagnes mieux ciblées. Je cherche maintenant une équipe ambitieuse où mettre cette énergie au service de vos clients. Ce qui me distingue, c'est ma capacité à expliquer des chiffres à des gens qui n'aiment pas les chiffres. Si vous cherchez quelqu'un qui relie le terrain et les données, parlons-en.",
  "debat-teletravail": "Je pense que le télétravail ne doit pas devenir la norme, mais une option. D'abord, parce que les échanges informels créent de l'innovation. Par exemple, beaucoup de bonnes idées naissent autour d'un café. Ensuite, les jeunes salariés apprennent énormément en observant leurs collègues. Cependant, le télétravail apporte de la concentration et évite des heures de transport. Pour conclure, je défends un modèle hybride, choisi par les équipes. Concrètement, deux ou trois jours sur site permettent de garder le lien, de former les nouveaux et de décider vite. Les autres jours, chacun peut se concentrer sur les tâches qui demandent du calme. Imposer un modèle unique, qu'il soit tout au bureau ou tout à distance, revient à ignorer la diversité des métiers.",
  "entretien-qualite": "Ma principale qualité, c'est la rigueur. Lors de mon alternance, j'ai mis en place un tableau de suivi des campagnes que toute l'équipe utilise encore aujourd'hui. Grâce à ce suivi, nous avons repéré une erreur de ciblage qui nous coûtait plusieurs milliers d'euros par mois. Cette rigueur rassure mes collègues et me permet de prendre des décisions solides. Concrètement, je vérifie chaque hypothèse avant de lancer une action, et je documente ce que je fais pour que n'importe qui puisse reprendre mon travail. Cette habitude m'a aussi appris à dire non quand une demande n'est pas assez claire, puis à poser les bonnes questions pour la préciser.",
  "pro-reunion": "Je voudrais proposer une nouvelle façon d'organiser nos points hebdomadaires. Aujourd'hui, ils durent une heure et chacun présente tout. Je propose de passer à trente minutes, avec seulement les blocages et les décisions à prendre. Le reste peut être partagé par écrit la veille. On pourrait tester pendant un mois et faire le bilan ensemble. Concrètement, chacun enverrait trois lignes le lundi soir : ce qui avance, ce qui bloque, ce dont il a besoin. Le mardi, on ne traiterait que les blocages. Je pense qu'on gagnerait une demi-heure par semaine et par personne, soit plus de vingt heures par mois pour l'équipe.",
  "story-experience": "À l'origine, j'étais plutôt du genre à éviter de parler en public. Chaque jour, je préférais laisser les autres prendre la parole en réunion. Jusqu'au jour où mon manager est tombé malade juste avant une présentation client importante, et j'ai dû la faire à sa place avec deux heures de préparation. À cause de ça, j'ai dû improviser un plan sur un coin de table. Et à cause de ça aussi, j'ai découvert que je retenais mieux mes idées en les structurant en trois points qu'en essayant de tout retenir par cœur. Et depuis ce jour, je prépare toujours mes interventions de cette façon, même les plus courtes.",
  "culture-libre": "Les villes se sont historiquement développées autour des fleuves pour plusieurs raisons concrètes. D'abord, l'eau était indispensable à la vie quotidienne et à l'agriculture environnante. Ensuite, les fleuves offraient une voie de transport bien plus rapide que la route, ce qui facilitait le commerce. Par exemple, Paris s'est développée autour de la Seine notamment pour cette raison commerciale. Cependant, cette proximité comporte aussi un risque d'inondation, ce qui explique certains choix d'urbanisme plus récents. Pour conclure, le fleuve a longtemps été à la fois une ressource et une voie de circulation, ce qui explique sa place centrale dans l'histoire urbaine.",
};

const FILLER_POOL = ["euh", "du coup", "en fait", "euh", "voilà", "genre", "donc euh"];

function seeded(seed: number) {
  let x = seed;
  return () => {
    x = (x * 1103515245 + 12345) % 2147483648;
    return x / 2147483648;
  };
}

function simulateCapture(text: string, fillerRate: number, wpm: number, rand: () => number): SpeechCapture {
  const words = text.split(" ");
  const out: string[] = [];
  for (const w of words) {
    if (rand() < fillerRate) out.push(FILLER_POOL[Math.floor(rand() * FILLER_POOL.length)] + ",");
    out.push(w);
  }
  const segments: SpeechCapture["segments"] = [];
  const silences: SpeechCapture["silences"] = [];
  let t = 0.6;
  for (let i = 0; i < out.length; i += 11) {
    const chunk = out.slice(i, i + 11).join(" ");
    const n = Math.min(11, out.length - i);
    const speed = wpm * (0.85 + rand() * 0.35);
    const d = (n / speed) * 60;
    segments.push({ text: chunk, start: t, end: t + d });
    t += d;
    const gap = rand() < fillerRate * 3 ? 1.3 + rand() * 1.6 : 0.3 + rand() * 0.4;
    if (gap >= 1.2) silences.push({ start: t, end: t + gap });
    t += gap;
  }
  return { transcript: out.join(" "), durationSec: Math.round(t), segments, silences, source: "speech" };
}

interface Plan { dayOffset: number; hour: number; exerciseId: string; target: number; fillerRate: number; wpm: number }

// 17 sessions over 30 days, the last 6 days in a row, scores trending up.
const PLAN: Plan[] = [
  { dayOffset: -29, hour: 19, exerciseId: "impro-passion", target: 66, fillerRate: 0.12, wpm: 190 },
  { dayOffset: -27, hour: 20, exerciseId: "entretien-presentation", target: 68, fillerRate: 0.11, wpm: 186 },
  { dayOffset: -25, hour: 18, exerciseId: "impro-ville", target: 71, fillerRate: 0.1, wpm: 184 },
  { dayOffset: -22, hour: 21, exerciseId: "pitch-soi", target: 70, fillerRate: 0.09, wpm: 182 },
  { dayOffset: -20, hour: 19, exerciseId: "entretien-presentation", target: 74, fillerRate: 0.08, wpm: 180 },
  { dayOffset: -17, hour: 12, exerciseId: "debat-teletravail", target: 75, fillerRate: 0.08, wpm: 177 },
  { dayOffset: -15, hour: 19, exerciseId: "entretien-qualite", target: 77, fillerRate: 0.07, wpm: 174 },
  { dayOffset: -12, hour: 20, exerciseId: "impro-passion", target: 78, fillerRate: 0.06, wpm: 172 },
  { dayOffset: -10, hour: 8, exerciseId: "pro-reunion", target: 79, fillerRate: 0.06, wpm: 170 },
  { dayOffset: -8, hour: 19, exerciseId: "pitch-soi", target: 80, fillerRate: 0.05, wpm: 169 },
  { dayOffset: -5, hour: 19, exerciseId: "impro-ville", target: 81, fillerRate: 0.05, wpm: 166 },
  { dayOffset: -4, hour: 18, exerciseId: "entretien-qualite", target: 82, fillerRate: 0.04, wpm: 164 },
  { dayOffset: -3, hour: 19, exerciseId: "debat-teletravail", target: 80, fillerRate: 0.05, wpm: 168 },
  { dayOffset: -3, hour: 20, exerciseId: "story-experience", target: 85, fillerRate: 0.03, wpm: 163 },
  { dayOffset: -2, hour: 19, exerciseId: "entretien-presentation", target: 84, fillerRate: 0.03, wpm: 162 },
  { dayOffset: -1, hour: 21, exerciseId: "culture-libre", target: 86, fillerRate: 0.03, wpm: 161 },
  { dayOffset: 0, hour: 9, exerciseId: "impro-passion", target: 86, fillerRate: 0.02, wpm: 160 },
];

export function createDemoAccount(now = new Date()): AccountState {
  const rand = seeded(42);
  const user: User = {
    id: "demo",
    firstName: "Camille",
    email: null,
    avatar: null,
    goals: ["entretiens", "confiance", "parasites"],
    goalText: "Je veux réussir mon prochain entretien.",
    level: "intermediaire",
    frequency: "10",
    createdAt: new Date(now.getTime() - 30 * 86_400_000).toISOString(),
    settings: { ...DEFAULT_SETTINGS },
    isDemo: true,
    diagnosticDone: true,
  };

  const sessions: Session[] = [];
  const badges: EarnedBadge[] = [];
  PLAN.forEach((p, i) => {
    const exercise = getExercise(p.exerciseId)!;
    const capture = simulateCapture(TEXTS[p.exerciseId], p.fillerRate, p.wpm, rand);
    const analysis = analyzeSpeech(capture, { exercise });
    const shift = p.target - analysis.scores.global;
    for (const d of DIMENSIONS) analysis.scores[d] = Math.max(35, Math.min(97, Math.round(analysis.scores[d] + shift)));
    analysis.scores.global = globalScore(analysis.scores);
    const at = new Date(now);
    at.setDate(at.getDate() + p.dayOffset);
    at.setHours(p.hour, (i * 7) % 60, 0, 0);
    if (at > now) at.setTime(now.getTime() - 60 * 60 * 1000);
    const result = buildSessionResult({
      userId: user.id, exercise, source: "catalogue", analysis, transcript: capture.transcript,
      durationSec: capture.durationSec, audioUrl: null, previous: sessions, badges, now: at, id: `demo_${i + 1}`,
      badgeContext: { diagnosticDone: true, distinctGames: 3, distinctSimulations: 1 },
    });
    sessions.push(result.session);
    for (const b of result.newBadges) badges.push({ id: b.id, earnedAt: at.toISOString() });
  });

  const sorted = sessions.slice().reverse();
  const weakest = weakestDimension({
    global: 0, clarte: 87, fluidite: 84, confiance: 80, structure: 73, vocabulaire: 92, debit: 93, parasites: 76,
    argumentation: 79, grammaire: 88, persuasion: 78, concision: 81,
  });
  let program = generateProgram(user.goalText!, user.goals, weakest, detectRecurringIssue(sessions), 21, new Date(now.getTime() - 5 * 86_400_000));
  for (const s of sorted.slice(-6)) program = markProgramProgress(program, s.exerciseId);

  const t0 = new Date(now.getTime() - 2 * 86_400_000).toISOString();
  const coach: CoachMessage[] = [
    { id: "c1", role: "user", text: "Pourquoi je parle trop vite ?", createdAt: t0 },
    {
      id: "c2", role: "coach", createdAt: t0,
      text: "On parle vite pour trois raisons : le stress, l'envie d'en finir, ou parce qu'on connaît trop bien son sujet. Sur tes premières sessions, tu étais au-dessus de 180 mots/min. Tu es maintenant autour de 160 : c'est la zone idéale.\n\nPour ancrer ce rythme : une pause complète après chaque idée importante.",
      action: { label: "Rythme et pauses · 60 s", exerciseId: "pron-rythme" },
    },
  ];

  return {
    user, sessions: sorted, program, coach, badges, completedChallenges: [],
    diagnostic: {
      completedAt: new Date(now.getTime() - 29 * 86_400_000).toISOString(),
      steps: [],
      averageScores: { global: 66, clarte: 68, fluidite: 62, confiance: 64, structure: 60, vocabulaire: 70, debit: 65, parasites: 55, argumentation: 61, grammaire: 74, persuasion: 60, concision: 63 },
      level: "intermediaire",
      strongest: "grammaire",
      weakest: "parasites",
      summary: "Tu te débrouilles déjà bien, avec quelques réflexes à automatiser. Ton point fort actuel : grammaire. Le levier prioritaire : parasites.",
    },
  };
}
