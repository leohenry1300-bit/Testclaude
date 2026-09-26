import type { CategoryId, Dimension } from "./types";
import type { Exercise } from "./exercises";
import { uid } from "./pipeline";

// A large, curated bank of named subjects, combined with question templates
// to generate realistic, non-repetitive spoken prompts. This is the engine
// behind "Sujets", "Roulette des sujets", "Question du jour" and the
// personalised recommendation queue — see point 29 of the brief: content is
// generated from data, not hand-written one prompt at a time.

export type TopicCategory =
  | "histoire" | "philosophie" | "geographie" | "economie" | "entreprise"
  | "technologie" | "sciences" | "societe" | "politique" | "arts" | "quotidien";

export const TOPIC_CATEGORIES: { id: TopicCategory; title: string; icon: string }[] = [
  { id: "histoire", title: "Histoire", icon: "Landmark" },
  { id: "philosophie", title: "Philosophie", icon: "BrainCircuit" },
  { id: "geographie", title: "Géographie", icon: "Globe" },
  { id: "economie", title: "Économie & finance", icon: "TrendingUp" },
  { id: "entreprise", title: "Entreprise", icon: "Briefcase" },
  { id: "technologie", title: "Technologie", icon: "Cpu" },
  { id: "sciences", title: "Sciences", icon: "FlaskConical" },
  { id: "societe", title: "Société", icon: "Users" },
  { id: "politique", title: "Institutions & citoyenneté", icon: "Landmark" },
  { id: "arts", title: "Arts & culture", icon: "Palette" },
  { id: "quotidien", title: "Quotidien", icon: "Coffee" },
];

// ---------------------------------------------------------------------------
// Named subjects. Real, specific entries — not generic filler. Politics &
// institutions are phrased neutrally (how things work, not what's "right").

const SUBJECTS: Record<TopicCategory, string[]> = {
  histoire: [
    "la chute de l'Empire romain", "la Révolution française", "la Renaissance italienne", "les grandes découvertes maritimes",
    "la Première Guerre mondiale", "la Seconde Guerre mondiale", "la guerre froide", "la décolonisation",
    "la construction européenne", "la révolution industrielle", "l'Empire napoléonien", "la chute du mur de Berlin",
    "la révolution russe de 1917", "l'unification de l'Allemagne", "l'unification de l'Italie", "l'Empire ottoman",
    "la route de la soie", "l'invention de l'imprimerie", "la traite atlantique", "les indépendances africaines",
    "la guerre de Sécession américaine", "la crise de 1929", "mai 68 en France", "la Ve République",
    "l'Empire britannique et son déclin", "les croisades", "la civilisation égyptienne antique", "la démocratie athénienne",
    "l'Empire byzantin", "la peste noire au Moyen Âge", "la conquête spatiale", "la guerre du Vietnam",
    "la construction de la Ve République", "les grandes migrations humaines préhistoriques", "l'Empire mongol",
  ],
  philosophie: [
    "la liberté", "le bonheur", "la justice", "la vérité", "la conscience", "l'identité personnelle",
    "le travail a-t-il un sens", "l'argent rend-il heureux", "le pouvoir corrompt-il nécessairement",
    "peut-on tout dire", "faut-il craindre la mort", "qu'est-ce qu'aimer", "la technologie nous libère-t-elle ou nous asservit-elle",
    "sommes-nous responsables de nos choix", "l'intelligence artificielle peut-elle penser", "le mensonge est-il parfois justifié",
    "faut-il obéir aux lois injustes", "peut-on être heureux seul", "la beauté est-elle subjective",
    "faut-il pardonner", "le progrès est-il toujours un bien", "la nature humaine est-elle bonne ou mauvaise",
    "avons-nous besoin des autres pour être nous-mêmes", "la culture nous rend-elle plus libres ou moins libres",
    "faut-il désobéir pour être juste", "le hasard existe-t-il", "peut-on désirer sans manquer",
  ],
  geographie: [
    "l'urbanisation des mégapoles", "le réchauffement climatique et les littoraux", "les frontières artificielles en Afrique",
    "la géopolitique de l'eau", "les migrations climatiques", "la déforestation en Amazonie", "l'Arctique et ses ressources",
    "la Chine et sa démographie", "l'Inde, futur pays le plus peuplé", "les routes maritimes mondiales",
    "les inégalités de développement Nord-Sud", "la désertification au Sahel", "les délocalisations industrielles",
    "le tourisme de masse", "la Méditerranée comme carrefour", "les fleuves transfrontaliers et leurs tensions",
    "l'exode rural", "les villes nouvelles", "la fonte des glaciers", "les zones économiques exclusives en mer",
    "la Russie et son immensité territoriale", "le canal de Suez", "le canal de Panama",
  ],
  economie: [
    "l'inflation", "le chômage structurel", "les banques centrales", "les marchés financiers",
    "la dette publique", "les taux d'intérêt", "la fiscalité des entreprises", "les inégalités de revenus",
    "la mondialisation des échanges", "les crypto-monnaies", "l'économie circulaire", "le pouvoir d'achat",
    "les délocalisations", "le protectionnisme", "le libre-échange", "la spéculation immobilière",
    "les subventions publiques", "la croissance économique a-t-elle des limites", "le revenu universel",
    "l'économie de la donnée", "les paradis fiscaux", "la finance verte", "le surendettement des ménages",
  ],
  entreprise: [
    "le management à distance", "le leadership bienveillant", "la culture d'entreprise", "la transformation digitale",
    "l'entrepreneuriat", "la semaine de quatre jours", "la marque employeur", "la gestion du changement",
    "l'innovation ouverte", "la responsabilité sociale des entreprises", "le télétravail", "la fidélisation des talents",
    "la négociation commerciale", "la prise de décision en équipe", "l'intelligence collective", "le mentorat",
    "les startups face aux grands groupes", "la raison d'être d'une entreprise", "le burnout au travail",
  ],
  technologie: [
    "l'intelligence artificielle générative", "la cybersécurité", "les réseaux sociaux et l'attention", "la 5G",
    "les voitures autonomes", "la robotique", "la conquête spatiale privée", "le métavers",
    "les smartphones et la déconnexion", "l'impression 3D", "les objets connectés", "la reconnaissance faciale",
    "le quantique et l'informatique", "les biotechnologies", "la désinformation en ligne", "l'open source",
    "la neutralité du net", "l'automatisation du travail", "les données personnelles",
  ],
  sciences: [
    "le changement climatique", "la biodiversité", "les énergies renouvelables", "le cerveau humain",
    "la vaccination", "l'exploration de Mars", "la théorie de l'évolution", "les trous noirs",
    "le génome humain", "les antibiotiques et leurs limites", "le sommeil", "les océans et leur exploration",
    "les énergies fossiles", "la fusion nucléaire", "l'intelligence animale", "la médecine personnalisée",
    "les épidémies et leur prévention", "la physique quantique expliquée simplement",
  ],
  societe: [
    "l'école et l'orientation", "l'égalité femmes-hommes au travail", "le vieillissement de la population",
    "les réseaux sociaux chez les adolescents", "la place du sport dans la société", "la solitude urbaine",
    "les nouvelles formes de famille", "la place des seniors dans l'entreprise", "le harcèlement scolaire",
    "la consommation responsable", "le logement des jeunes actifs", "la mixité sociale à l'école",
    "les générations au travail", "la santé mentale", "l'accès à la culture", "le bénévolat",
  ],
  politique: [
    "le rôle du Parlement", "la séparation des pouvoirs", "le fonctionnement d'une commune", "le fonctionnement d'une région",
    "les élections et le mode de scrutin", "l'Union européenne et ses institutions", "la décentralisation en France",
    "les libertés publiques", "le référendum comme outil démocratique", "la participation citoyenne locale",
    "le rôle du Conseil constitutionnel", "la fonction publique", "le fonctionnement de la justice",
    "les collectivités territoriales", "la démocratie représentative face à la démocratie participative",
  ],
  arts: [
    "l'impressionnisme", "le cinéma comme art populaire", "la musique classique aujourd'hui", "l'architecture contemporaine",
    "la bande dessinée comme neuvième art", "le street art", "la place du patrimoine", "la photographie numérique",
    "la mode comme expression culturelle", "le théâtre à l'ère du streaming", "les musées et leur numérisation",
    "la littérature de science-fiction", "la place de la culture française à l'international",
  ],
  quotidien: [
    "tes dernières vacances", "un plat que tu adores cuisiner", "ton sport préféré", "un voyage qui t'a marqué",
    "ta ville ou ton quartier", "une habitude que tu voudrais changer", "un ami qui compte pour toi",
    "un objet auquel tu tiens", "une série ou un film que tu recommandes", "ta routine du matin",
    "un achat dont tu es content", "un projet personnel en cours", "un souvenir d'enfance", "ta façon de te détendre",
    "un défi que tu t'es lancé récemment", "une compétence que tu aimerais apprendre", "ton dernier week-end",
    "une rencontre récente", "un livre qui t'a marqué", "un conseil que tu donnerais à ton plus jeune toi",
  ],
};

const TOPIC_FOCUS: Record<TopicCategory, Dimension> = {
  histoire: "structure", philosophie: "argumentation", geographie: "vocabulaire", economie: "clarte",
  entreprise: "persuasion", technologie: "argumentation", sciences: "clarte", societe: "argumentation",
  politique: "structure", arts: "vocabulaire", quotidien: "fluidite",
};

// ---------------------------------------------------------------------------
// Prompt templates — combined with subjects, they multiply the effective
// number of distinct, realistic prompts several times over.

export type TemplateKind = "expliquer" | "debattre" | "opinion" | "presenter" | "eli5" | "expert";

interface Template {
  kind: TemplateKind;
  category: CategoryId;
  durationSec: number;
  build: (subject: string) => { prompt: string; instruction: string; stance?: string };
}

const TEMPLATES: Template[] = [
  {
    kind: "expliquer", category: "culture", durationSec: 75,
    build: (s) => ({ prompt: `Explique simplement : ${capitalize(s)}.`, instruction: "Structure : le sujet en une phrase, une cause, un exemple, une conséquence." }),
  },
  {
    kind: "debattre", category: "debat", durationSec: 90,
    build: (s) => ({ prompt: "Défends ou contredis cette position.", stance: firstLetterUpper(s), instruction: "Prends position dès la première phrase, puis anticipe une objection." }),
  },
  {
    kind: "opinion", category: "culture", durationSec: 60,
    build: (s) => ({ prompt: `Quelle est ton opinion sur : ${s} ?`, instruction: "Donne ton avis, puis un argument, puis une nuance." }),
  },
  {
    kind: "presenter", category: "presentation", durationSec: 120,
    build: (s) => ({ prompt: `Présente le sujet suivant comme si tu devais l'expliquer à un public curieux : ${s}.`, instruction: "Annonce ton plan, puis déroule-le en deux ou trois points." }),
  },
  {
    kind: "eli5", category: "culture", durationSec: 60,
    build: (s) => ({ prompt: `Explique « ${s} » à un enfant de 8 ans.`, instruction: "Aucun jargon. Utilise une image ou une comparaison simple." }),
  },
  {
    kind: "expert", category: "culture", durationSec: 75,
    build: (s) => ({ prompt: `Explique « ${s} » à un expert du domaine.`, instruction: "Utilise un vocabulaire précis, sans simplifier à l'excès." }),
  },
];

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function firstLetterUpper(s: string): string {
  const c = capitalize(s);
  return /[.!?]$/.test(c) ? c : c + ".";
}

function slug(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
}

export interface TopicRef {
  id: string;
  label: string;
  category: TopicCategory;
}

export function allSubjects(category?: TopicCategory): TopicRef[] {
  const cats = category ? [category] : (Object.keys(SUBJECTS) as TopicCategory[]);
  const out: TopicRef[] = [];
  for (const c of cats) for (const label of SUBJECTS[c]) out.push({ id: `${c}:${slug(label)}`, label, category: c });
  return out;
}

export const TOPIC_COUNT = allSubjects().length;
export const GENERATED_PROMPT_COUNT = TOPIC_COUNT * TEMPLATES.length;

/**
 * Builds a runnable, Exercise-shaped activity from a subject + template.
 * These are never stored in the static catalogue: they're generated on the
 * fly, which is how the app avoids ever running out of content.
 */
export function generateTopicActivity(topic: TopicRef, kind?: TemplateKind): Exercise {
  const tpl = kind ? TEMPLATES.find((t) => t.kind === kind) ?? TEMPLATES[0] : TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
  const built = tpl.build(topic.label);
  return {
    id: uid(`sujet_${topic.category}_`),
    category: tpl.category,
    title: capitalize(topic.label),
    prompt: built.prompt,
    instruction: built.instruction,
    stance: built.stance,
    durationSec: tpl.durationSec,
    focus: TOPIC_FOCUS[topic.category],
  };
}

/** Picks a subject the user hasn't seen recently, optionally within a category. */
export function pickTopic(opts: { category?: TopicCategory; excludeIds?: string[]; kind?: TemplateKind } = {}): { topic: TopicRef; activity: Exercise } {
  const pool = allSubjects(opts.category);
  const exclude = new Set(opts.excludeIds ?? []);
  const available = pool.filter((t) => !exclude.has(t.id));
  const topic = (available.length ? available : pool)[Math.floor(Math.random() * (available.length ? available.length : pool.length))];
  return { topic, activity: generateTopicActivity(topic, opts.kind) };
}

/** Deterministic "Question du jour": same subject all day, changes daily. */
export function dailyTopic(date: Date): { topic: TopicRef; activity: Exercise } {
  const all = allSubjects();
  const dayIndex = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  const topic = all[dayIndex % all.length];
  return { topic, activity: generateTopicActivity(topic, "expliquer") };
}
