import type { CategoryId, Dimension, GameConstraint } from "./types";
import type { Exercise } from "./exercises";
import { uid } from "./pipeline";
import { allSubjects, generateTopicActivity } from "./topics";

// A large library of short, self-contained training games. Each one is a
// data definition that the runner turns into an Exercise-shaped activity at
// launch time — so adding a new game never requires touching the UI.

export type GameGroup = "parasites" | "debit" | "improvisation" | "argumentation" | "vocabulaire" | "persuasion" | "storytelling" | "structure" | "diction" | "memoire" | "confiance" | "ecoute";

interface BuiltGame {
  prompt: string;
  instruction: string;
  stance?: string;
  constraint?: GameConstraint;
  category: CategoryId;
  focus: Dimension;
}

export interface Game {
  id: string;
  title: string;
  tagline: string;
  icon: string;
  group: GameGroup;
  durationSec: number;
  build: () => BuiltGame;
}

const FORBIDDABLE = ["euh", "du coup", "en fait", "genre", "voilà", "quoi", "donc"];
const THREE_WORD_POOL = [
  "valise", "orage", "clavier", "pont", "miroir", "sirène", "carnet", "boussole", "lanterne", "escalier",
  "aquarium", "trompette", "cactus", "tunnel", "marée", "grenier", "étincelle", "labyrinthe", "cerf-volant", "horloge",
  "fanfare", "bougie", "récif", "parapluie", "cascade", "bourrasque", "coquillage", "vitrail", "fourmilière",
];
const TONGUE_TWISTERS = [
  "Les chaussettes de l'archiduchesse sont-elles sèches, archi-sèches ?",
  "Un chasseur sachant chasser sait chasser sans son chien.",
  "Trois tortues trottaient sur trois toits très étroits.",
  "Si six scies scient six cyprès, six cent six scies scient six cent six cyprès.",
  "Douze douches douces douchent doucement douze druides distraits.",
  "Cinq chiens chassent six chats.",
  "Ces cerises sont si sûres qu'on ne sait pas si c'en sont.",
  "Pauvre petit pêcheur, prend patience pour pêcher plusieurs poissons.",
  "Je veux et j'exige d'exquises excuses.",
  "Le ver vert va vers le verre vert.",
  "Un dragon gradé dégrade un gradé dragon.",
  "Natacha n'attacha pas son chat Pacha qui s'échappa.",
];
const READING_TEXTS = [
  "Il faut imaginer Sisyphe heureux : la lutte elle-même vers les sommets suffit à remplir un cœur d'homme.",
  "Le silence éternel de ces espaces infinis m'effraie, et pourtant j'y trouve une forme de vertige apaisant.",
  "On ne voit bien qu'avec le cœur. L'essentiel est invisible pour les yeux, disait le renard, sans jamais élever la voix.",
  "La vraie générosité envers l'avenir consiste à tout donner au présent, disait-elle, en pesant chaque mot.",
  "Rien n'est jamais acquis à l'homme. Ni sa force, ni sa faiblesse, ni son cœur. Et quand il croit ouvrir ses bras, son ombre est celle d'une croix.",
  "Le doute n'est pas une faiblesse : c'est souvent le premier pas vers une certitude plus solide.",
  "Chaque matin, le monde est à refaire, et pourtant chaque matin nous croyons qu'il est déjà fini.",
];

function randomOf<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  return out;
}

function randomTopicLabel(): string {
  const all = allSubjects();
  return all[Math.floor(Math.random() * all.length)].label;
}

function randomStance(): string {
  const label = randomTopicLabel();
  const c = label.charAt(0).toUpperCase() + label.slice(1);
  return /[.!?]$/.test(c) ? c : c + ".";
}

function randomPrompt(): { prompt: string; instruction: string } {
  const t = allSubjects()[Math.floor(Math.random() * allSubjects().length)];
  const a = generateTopicActivity(t);
  return { prompt: a.prompt, instruction: a.instruction };
}

export const GAMES: Game[] = [
  {
    id: "g-roulette", title: "Roulette des sujets", tagline: "Un sujet totalement aléatoire", icon: "Dices", group: "improvisation", durationSec: 60,
    build: () => ({ ...randomPrompt(), category: "improvisation", focus: "fluidite" }),
  },
  {
    id: "g-60s", title: "60 secondes", tagline: "Parler exactement une minute", icon: "Timer", group: "improvisation", durationSec: 60,
    build: () => { const p = randomPrompt(); return { prompt: p.prompt, instruction: "Tiens exactement 60 secondes, ni plus ni moins.", category: "improvisation", focus: "debit" }; },
  },
  {
    id: "g-30s", title: "30 secondes chrono", tagline: "Très rapide, va à l'essentiel", icon: "Zap", group: "improvisation", durationSec: 30,
    build: () => { const p = randomPrompt(); return { prompt: p.prompt, instruction: "30 secondes seulement : une idée, un exemple, c'est tout.", category: "improvisation", focus: "concision" }; },
  },
  {
    id: "g-3min", title: "3 minutes", tagline: "Développer un sujet en profondeur", icon: "Hourglass", group: "improvisation", durationSec: 180,
    build: () => { const p = randomPrompt(); return { prompt: p.prompt, instruction: "Développe : introduis, illustre par deux exemples, conclus.", category: "presentation", focus: "structure" }; },
  },
  {
    id: "g-mot-interdit", title: "Mot interdit", tagline: "Parler sans utiliser certains mots", icon: "Ban", group: "parasites", durationSec: 60,
    build: () => {
      const words = pickN(["truc", "chose", "genre", "quoi", "bien", "très"], 2);
      const p = randomPrompt();
      return { prompt: p.prompt, instruction: `Interdit de dire : ${words.map((w) => `« ${w} »`).join(", ")}.`, constraint: { type: "forbidden_words", words }, category: "improvisation", focus: "vocabulaire" };
    },
  },
  {
    id: "g-sans-euh", title: "Sans « euh »", tagline: "Zéro mot parasite", icon: "VolumeX", group: "parasites", durationSec: 60,
    build: () => { const p = randomPrompt(); return { prompt: p.prompt, instruction: "Défi à zéro tolérance : aucun « euh », « du coup », « en fait »… Remplace par un silence.", constraint: { type: "forbidden_words", words: FORBIDDABLE }, category: "improvisation", focus: "parasites" }; },
  },
  {
    id: "g-debit-controle", title: "Débit contrôlé", tagline: "Respecter une vitesse précise", icon: "Gauge", group: "debit", durationSec: 60,
    build: () => { const p = randomPrompt(); return { prompt: p.prompt, instruction: "Vise 130 à 150 mots par minute, ni plus vite ni plus lentement.", constraint: { type: "pace_target", min: 125, max: 155 }, category: "improvisation", focus: "debit" }; },
  },
  {
    id: "g-trois-mots", title: "Trois mots", tagline: "Invente une histoire avec 3 mots imposés", icon: "Shuffle", group: "storytelling", durationSec: 75,
    build: () => { const words = pickN(THREE_WORD_POOL, 3); return { prompt: `Invente une histoire en 75 secondes en utilisant ces trois mots : ${words.join(", ")}.`, instruction: "Utilise chaque mot au moins une fois. Une histoire a un début, un problème, une fin.", constraint: { type: "must_include", words }, category: "storytelling", focus: "structure" }; },
  },
  {
    id: "g-histoire-impossible", title: "Histoire impossible", tagline: "Contraintes absurdes imposées", icon: "Wand2", group: "storytelling", durationSec: 75,
    build: () => {
      const constraint = pickN(["sans jamais utiliser le mot « et »", "en commençant par la fin", "du point de vue d'un objet", "sans aucun nom propre"], 1)[0];
      const character = pickN(["astronaute retraité", "chat détective", "boulanger insomniaque", "pirate végétarien"], 1)[0];
      return { prompt: `Invente une histoire complètement improbable, avec ce personnage : un ${character}.`, instruction: `Contrainte supplémentaire : ${constraint}.`, category: "storytelling", focus: "structure" };
    },
  },
  {
    id: "g-eli5", title: "Explique-moi comme si j'avais 5 ans", tagline: "Vulgarisation totale", icon: "Baby", group: "vocabulaire", durationSec: 60,
    build: () => ({ prompt: `Explique « ${randomTopicLabel()} » à un enfant de 5 ans.`, instruction: "Aucun mot compliqué. Utilise une image simple.", category: "culture", focus: "clarte" }),
  },
  {
    id: "g-eli-expert", title: "Explique-moi comme à un expert", tagline: "Même sujet, niveau complexe", icon: "GraduationCap", group: "vocabulaire", durationSec: 75,
    build: () => ({ prompt: `Explique « ${randomTopicLabel()} » à un expert du domaine.`, instruction: "Vocabulaire précis, pas de simplification excessive.", category: "culture", focus: "vocabulaire" }),
  },
  {
    id: "g-avocat-diable", title: "Avocat du diable", tagline: "Défendre une position imposée", icon: "Swords", group: "argumentation", durationSec: 60,
    build: () => ({ prompt: "Défends cette position, même si elle ne te convainc pas.", stance: randomStance(), instruction: "L'objectif : trouver les meilleurs arguments possibles, quelle que soit ton opinion réelle.", category: "debat", focus: "argumentation" }),
  },
  {
    id: "g-contre-argument", title: "Contre-argument", tagline: "Réfuter un argument imposé", icon: "ShieldAlert", group: "argumentation", durationSec: 45,
    build: () => ({ prompt: `Voici un argument : « ${randomStance()} » Réfute-le.`, instruction: "Trouve la faille, puis propose une meilleure vision.", category: "debat", focus: "argumentation" }),
  },
  {
    id: "g-debat-express", title: "Débat express", tagline: "30 secondes pour défendre une position", icon: "Flame", group: "argumentation", durationSec: 30,
    build: () => ({ prompt: "Défends cette position en 30 secondes.", stance: randomStance(), instruction: "Va droit à l'argument le plus fort.", category: "debat", focus: "persuasion" }),
  },
  {
    id: "g-debat-inverse", title: "Débat inversé", tagline: "Défendre l'avis contraire au tien", icon: "RefreshCcw", group: "argumentation", durationSec: 60,
    build: () => ({ prompt: "Choisis un sujet sur lequel tu as un avis tranché, puis défends l'avis inverse pendant 60 secondes.", instruction: "L'objectif : sortir de ta zone de confort argumentative.", category: "debat", focus: "argumentation" }),
  },
  {
    id: "g-question-piege", title: "Question piège", tagline: "Une question inattendue", icon: "HelpCircle", group: "improvisation", durationSec: 45,
    build: () => ({ prompt: pickN(["Si tu devais renoncer à un sens, lequel choisirais-tu ?", "Quel est le pire conseil qu'on t'ait donné ?", "Que ferais-tu si tu ne pouvais plus jamais mentir ?", "Quelle règle absurde aimerais-tu abolir ?"], 1)[0], instruction: "Pas de temps pour préparer : réponds tout de suite.", category: "improvisation", focus: "confiance" }),
  },
  {
    id: "g-question-impossible", title: "Question impossible", tagline: "Répondre sans préparation à une question très difficile", icon: "Puzzle", group: "argumentation", durationSec: 60,
    build: () => ({ prompt: pickN(["Combien de dentistes y a-t-il en France, et comment le sait-on ?", "Pourquoi le ciel est-il bleu, en une minute ?", "Comment estimer le nombre de pianos accordés dans ta ville ?"], 1)[0], instruction: "Réfléchis à voix haute, montre ton raisonnement plutôt qu'une réponse toute faite.", category: "culture", focus: "argumentation" }),
  },
  {
    id: "g-pitch-express", title: "Pitch express", tagline: "Vendre quelque chose en 30 secondes", icon: "Rocket", group: "persuasion", durationSec: 30,
    build: () => ({ prompt: `Vends « ${pickN(["un parapluie sur la lune", "un abonnement à un journal papier", "une brosse à dents connectée", "un cours de macramé"], 1)[0]} » en 30 secondes.`, instruction: "Un problème, une solution, un appel à l'action.", category: "pitch", focus: "persuasion" }),
  },
  {
    id: "g-objection", title: "Objection", tagline: "Le client formule une objection, tu réponds", icon: "MessageSquareWarning", group: "persuasion", durationSec: 45,
    build: () => ({ prompt: `Le client dit : ${pickN(["« C'est trop cher. »", "« Je vais réfléchir. »", "« Votre concurrent est moins cher. »", "« Je n'en ai pas besoin maintenant. »"], 1)[0]} Réponds.`, instruction: "Reformule l'objection, puis apporte une preuve concrète.", category: "pro", focus: "persuasion" }),
  },
  {
    id: "g-resume", title: "Résumé", tagline: "Résume ce que tu viens de lire en 30 secondes", icon: "FileText", group: "structure", durationSec: 30,
    build: () => ({ prompt: "Résume en 30 secondes le dernier article, livre ou vidéo que tu as consulté.", instruction: "L'essentiel seulement : de quoi ça parle, et pourquoi c'est intéressant.", category: "presentation", focus: "concision" }),
  },
  {
    id: "g-reformulation", title: "Reformulation", tagline: "Dire la même chose de trois façons différentes", icon: "Repeat", group: "vocabulaire", durationSec: 60,
    build: () => ({ prompt: `Explique « ${randomTopicLabel()} » de trois manières différentes : simple, professionnelle, puis imagée.`, instruction: "Marque une courte pause entre chaque version.", category: "culture", focus: "vocabulaire" }),
  },
  {
    id: "g-synonymes", title: "Synonymes", tagline: "Ne jamais répéter le même mot important", icon: "SpellCheck", group: "vocabulaire", durationSec: 60,
    build: () => { const p = randomPrompt(); return { prompt: p.prompt, instruction: "Interdiction de répéter deux fois le même mot important : varie sans cesse.", constraint: { type: "no_repeat_word" }, category: "improvisation", focus: "vocabulaire" }; },
  },
  {
    id: "g-mot-du-jour", title: "Mot du jour", tagline: "Utiliser un mot imposé naturellement", icon: "Type", group: "vocabulaire", durationSec: 60,
    build: () => { const word = pickN(["néanmoins", "singulier", "foisonnant", "in fine", "à contre-courant", "tangible", "inéluctable"], 1); const p = randomPrompt(); return { prompt: p.prompt, instruction: `Place le mot « ${word[0]} » naturellement dans ta réponse.`, constraint: { type: "must_include", words: word }, category: "improvisation", focus: "vocabulaire" }; },
  },
  {
    id: "g-sans-preparation", title: "Sans préparation", tagline: "Sujet aléatoire, zéro seconde de réflexion", icon: "Shuffle", group: "improvisation", durationSec: 60,
    build: () => { const p = randomPrompt(); return { prompt: p.prompt, instruction: "Démarre l'enregistrement immédiatement, sans réfléchir avant.", category: "improvisation", focus: "fluidite" }; },
  },
  {
    id: "g-cinq-pourquoi", title: "5 pourquoi", tagline: "Creuser une réflexion progressivement", icon: "ListTree", group: "argumentation", durationSec: 90,
    build: () => ({ prompt: `Pars de ce constat : « ${randomTopicLabel()} ». Demande-toi « pourquoi » cinq fois de suite, à voix haute, et développe chaque réponse.`, instruction: "Chaque « pourquoi » doit creuser plus profond que le précédent.", category: "culture", focus: "argumentation" }),
  },
  {
    id: "g-socratique", title: "Question socratique", tagline: "Approfondir ta pensée par questionnement", icon: "MessageCircleQuestion", group: "argumentation", durationSec: 90,
    build: () => ({ prompt: "Choisis une opinion que tu tiens pour évidente, puis mets-la à l'épreuve : qu'est-ce qui la justifie vraiment ? Quelle serait la meilleure objection possible ?", instruction: "Parle comme si tu te questionnais toi-même à voix haute.", category: "culture", focus: "argumentation" }),
  },

  // ---- Diction & prononciation ---------------------------------------------
  {
    id: "g-virelangue", title: "Virelangue", tagline: "Articule une phrase piège sans fauter", icon: "AudioLines", group: "diction", durationSec: 40,
    build: () => { const text = randomOf(TONGUE_TWISTERS); return { prompt: "Lis ce virelangue trois fois de suite, de plus en plus vite, sans te tromper.", instruction: text, category: "prononciation", focus: "debit" }; },
  },
  {
    id: "g-lecture-expressive", title: "Lecture expressive", tagline: "Donner vie à un texte à voix haute", icon: "BookOpen", group: "diction", durationSec: 60,
    build: () => { const text = randomOf(READING_TEXTS); return { prompt: "Lis ce texte comme si tu le racontais à quelqu'un, pas comme si tu le lisais.", instruction: text, category: "prononciation", focus: "clarte" }; },
  },
  {
    id: "g-syllabe-par-syllabe", title: "Articulation extrême", tagline: "Exagérer chaque syllabe", icon: "Type", group: "diction", durationSec: 45,
    build: () => { const p = randomPrompt(); return { prompt: p.prompt, instruction: "Détache volontairement chaque syllabe, comme pour un public malentendant, sans perdre le naturel.", category: "prononciation", focus: "clarte" }; },
  },
  {
    id: "g-voyelles", title: "Voyelles ouvertes", tagline: "Articuler sans mâcher les mots", icon: "MessageCircleQuestion", group: "diction", durationSec: 45,
    build: () => { const text = randomOf(TONGUE_TWISTERS); return { prompt: "Lis ce virelangue en articulant exagérément chaque voyelle.", instruction: text, category: "prononciation", focus: "clarte" }; },
  },
  {
    id: "g-lecture-rythmee", title: "Lecture rythmée", tagline: "Respecter un débit imposé en lisant", icon: "Gauge", group: "diction", durationSec: 45,
    build: () => { const text = randomOf(READING_TEXTS); return { prompt: "Lis ce texte à voix haute, à un rythme posé et régulier.", instruction: text, constraint: { type: "pace_target", min: 110, max: 140 }, category: "prononciation", focus: "debit" }; },
  },

  // ---- Mémoire & structure --------------------------------------------------
  {
    id: "g-liste-croissante", title: "Liste qui grandit", tagline: "Répéter puis ajouter un élément", icon: "ListTree", group: "memoire", durationSec: 60,
    build: () => ({ prompt: "Improvise une liste sur un thème de ton choix (ex : des villes, des métiers) et énumère-la en développant un peu chaque élément.", instruction: "Reste fluide : ne t'arrête pas pour chercher le mot juste.", category: "improvisation", focus: "fluidite" }),
  },
  {
    id: "g-plan-impose", title: "Plan imposé", tagline: "Respecter une structure en 3 temps stricte", icon: "Layers", group: "structure", durationSec: 90,
    build: () => { const p = randomPrompt(); return { prompt: p.prompt, instruction: "Structure obligatoire, annoncée à voix haute : « D'abord... », « Ensuite... », « Enfin... ».", category: "presentation", focus: "structure" }; },
  },
  {
    id: "g-conclusion-dabord", title: "La conclusion d'abord", tagline: "Annoncer le message clé en premier", icon: "Target", group: "structure", durationSec: 60,
    build: () => { const p = randomPrompt(); return { prompt: p.prompt, instruction: "Commence directement par ta conclusion ou ton message principal, puis justifie-le ensuite.", category: "presentation", focus: "concision" }; },
  },
  {
    id: "g-recap-15s", title: "Récap en 15 secondes", tagline: "Condenser un développement", icon: "Timer", group: "structure", durationSec: 75,
    build: () => { const p = randomPrompt(); return { prompt: p.prompt, instruction: "Développe pendant 60 secondes, puis résume tout en 15 secondes seulement, sans rien perdre d'essentiel.", category: "presentation", focus: "concision" }; },
  },
  {
    id: "g-un-mot-un-point", title: "Un mot, un point", tagline: "Trois points, un mot-clé chacun", icon: "ListTree", group: "structure", durationSec: 60,
    build: () => { const p = randomPrompt(); return { prompt: p.prompt, instruction: "Annonce trois mots-clés au tout début, puis développe chacun d'eux dans l'ordre annoncé.", category: "presentation", focus: "structure" }; },
  },

  // ---- Confiance & impro ----------------------------------------------------
  {
    id: "g-sans-filet", title: "Sans filet", tagline: "Zéro préparation, zéro retour en arrière", icon: "Zap", group: "confiance", durationSec: 45,
    build: () => { const p = randomPrompt(); return { prompt: p.prompt, instruction: "Une seule prise : pas de pause pour réfléchir, pas de retour en arrière si tu bafouilles.", category: "improvisation", focus: "confiance" }; },
  },
  {
    id: "g-silence-assume", title: "Silence assumé", tagline: "Remplacer chaque hésitation par une vraie pause", icon: "VolumeX", group: "confiance", durationSec: 60,
    build: () => { const p = randomPrompt(); return { prompt: p.prompt, instruction: "Interdiction de mot parasite : à chaque hésitation, fais une vraie pause silencieuse d'une seconde plutôt que de dire « euh ».", constraint: { type: "no_fillers" }, category: "improvisation", focus: "confiance" }; },
  },
  {
    id: "g-debout-face-cam", title: "Face caméra", tagline: "Parler comme si tu étais filmé pour de vrai", icon: "Eye", group: "confiance", durationSec: 60,
    build: () => { const p = randomPrompt(); return { prompt: p.prompt, instruction: "Imagine que cette prise sera vraiment publiée : engage-toi comme si le public t'écoutait déjà.", category: "presentation", focus: "confiance" }; },
  },
  {
    id: "g-affirmation", title: "Affirme, ne t'excuse pas", tagline: "Bannir les tournures qui minimisent", icon: "ShieldCheck", group: "confiance", durationSec: 60,
    build: () => { const p = randomPrompt(); return { prompt: p.prompt, instruction: "Interdiction de dire « je pense que », « peut-être », « un peu » : affirme directement ce que tu penses.", constraint: { type: "forbidden_words", words: ["peut-être", "un peu", "je pense"] }, category: "pro", focus: "confiance" }; },
  },

  // ---- Écoute & interaction ---------------------------------------------
  {
    id: "g-reformule-objection", title: "Reformule puis réponds", tagline: "Prouver que tu as compris avant de répondre", icon: "MessageSquareText", group: "ecoute", durationSec: 60,
    build: () => ({ prompt: `Un collègue te dit : ${pickN(["« Je trouve que ton rapport manque de clarté. »", "« On n'a pas le temps de faire ça correctement. »", "« Je ne suis pas d'accord avec ta méthode. »"], 1)[0]} Réponds-lui.`, instruction: "Commence par reformuler ce qu'il vient de dire en une phrase, avant de répondre sur le fond.", category: "pro", focus: "clarte" }),
  },
  {
    id: "g-question-relance", title: "Question de relance", tagline: "Répondre puis relancer par une question", icon: "MessageCircleQuestion", group: "ecoute", durationSec: 45,
    build: () => { const p = randomPrompt(); return { prompt: p.prompt, instruction: "Termine ta réponse par une question ouverte, comme si tu voulais relancer une vraie conversation.", category: "pro", focus: "clarte" }; },
  },
  {
    id: "g-ecoute-active", title: "Écoute active simulée", tagline: "Répondre à une remarque avec empathie d'abord", icon: "Handshake", group: "ecoute", durationSec: 60,
    build: () => ({ prompt: `Un ami te dit : ${pickN(["« Je suis épuisé, rien ne va en ce moment. »", "« J'ai raté un entretien important. »", "« Personne ne m'écoute jamais. »"], 1)[0]} Réponds-lui.`, instruction: "Commence par une phrase qui montre que tu as vraiment entendu ce qu'il ressent, avant tout conseil.", category: "pro", focus: "clarte" }),
  },

  // ---- Plus de storytelling, argumentation, persuasion, vocabulaire --------
  {
    id: "g-story-spine", title: "Story Spine", tagline: "La structure Pixar en accéléré", icon: "BookMarked", group: "storytelling", durationSec: 90,
    build: () => ({ prompt: "Raconte une histoire (vraie ou inventée) en suivant strictement cette trame.", instruction: "« Il était une fois… Chaque jour… Jusqu'au jour où… À cause de ça… À cause de ça… Jusqu'à ce que, finalement… »", category: "storytelling", focus: "structure" }),
  },
  {
    id: "g-chute-inattendue", title: "Chute inattendue", tagline: "Une histoire qui se termine par une pirouette", icon: "Sparkles", group: "storytelling", durationSec: 60,
    build: () => { const words = pickN(THREE_WORD_POOL, 2); return { prompt: `Raconte une courte histoire impliquant ${words.join(" et ")}, avec une chute surprenante à la fin.`, instruction: "Garde la chute pour la toute dernière phrase.", constraint: { type: "must_include", words }, category: "storytelling", focus: "structure" }; },
  },
  {
    id: "g-point-de-vue", title: "Changement de point de vue", tagline: "Raconter le même fait de deux points de vue", icon: "RefreshCcw", group: "storytelling", durationSec: 90,
    build: () => ({ prompt: "Raconte brièvement un désaccord ou un conflit que tu connais, une première fois de ton point de vue, puis à nouveau du point de vue de l'autre personne.", instruction: "Marque clairement la transition entre les deux versions.", category: "storytelling", focus: "structure" }),
  },
  {
    id: "g-toulmin", title: "Argument à la Toulmin", tagline: "Thèse, preuve, garantie, réfutation", icon: "Scale", group: "argumentation", durationSec: 90,
    build: () => ({ prompt: "Défends cette position en suivant strictement une structure d'argumentation rigoureuse.", stance: randomStance(), instruction: "Annonce ta thèse, une preuve concrète, la règle générale qui relie les deux, puis anticipe une objection.", category: "debat", focus: "argumentation" }),
  },
  {
    id: "g-chiffre-choc", title: "Le chiffre qui frappe", tagline: "Construire un argument autour d'une statistique", icon: "TrendingUp", group: "argumentation", durationSec: 60,
    build: () => ({ prompt: `Défends cette position en t'appuyant sur un chiffre ou une statistique (réelle ou estimée à voix haute).`, stance: randomStance(), instruction: "Cite un ordre de grandeur, même approximatif, et explique pourquoi il compte.", category: "debat", focus: "argumentation" }),
  },
  {
    id: "g-elevator-pitch-60", title: "Ascenseur, 60 secondes", tagline: "Convaincre avant que la porte ne s'ouvre", icon: "Rocket", group: "persuasion", durationSec: 60,
    build: () => ({ prompt: `Tu croises la bonne personne dans un ascenseur et tu as 60 secondes pour la convaincre de : ${pickN(["financer ton projet", "te recommander pour un poste", "essayer ton produit", "te donner sa carte de visite"], 1)[0]}.`, instruction: "Sois concret : ce que tu proposes, pourquoi maintenant, ce que tu demandes.", category: "pitch", focus: "persuasion" }),
  },
  {
    id: "g-negociation-express", title: "Négociation express", tagline: "Trouver un compromis en 60 secondes", icon: "Handshake", group: "persuasion", durationSec: 60,
    build: () => ({ prompt: `Négocie : ${pickN(["un délai supplémentaire pour un rendu", "un prix plus bas chez un vendeur", "un jour de télétravail en plus", "un échange de service entre collègues"], 1)[0]}.`, instruction: "Propose une solution gagnant-gagnant, pas juste une demande à sens unique.", category: "pro", focus: "persuasion" }),
  },
  {
    id: "g-mot-rare", title: "Mot rare", tagline: "Placer un mot peu courant à bon escient", icon: "Type", group: "vocabulaire", durationSec: 60,
    build: () => { const word = pickN(["idoine", "ubuesque", "velléité", "acmé", "paradigme", "palimpseste", "sérendipité", "épiphénomène"], 1); const p = randomPrompt(); return { prompt: p.prompt, instruction: `Utilise le mot « ${word[0]} » à un endroit où il a vraiment du sens, pas juste casé.`, constraint: { type: "must_include", words: word }, category: "improvisation", focus: "vocabulaire" }; },
  },
  {
    id: "g-registre-soutenu", title: "Registre soutenu", tagline: "Parler comme à l'écrit littéraire", icon: "BookOpen", group: "vocabulaire", durationSec: 60,
    build: () => { const p = randomPrompt(); return { prompt: p.prompt, instruction: "Exprime-toi dans un registre soutenu, comme si tu écrivais une lettre formelle, sans familiarité.", category: "culture", focus: "vocabulaire" }; },
  },
  {
    id: "g-registre-familier", title: "Registre familier maîtrisé", tagline: "Rester clair même en langage courant", icon: "MessageCircle", group: "vocabulaire", durationSec: 60,
    build: () => { const p = randomPrompt(); return { prompt: p.prompt, instruction: "Parle comme à un ami proche, langage courant, mais reste structuré et compréhensible.", category: "improvisation", focus: "vocabulaire" }; },
  },
  {
    id: "g-double-audience", title: "Double audience", tagline: "Le même message pour deux publics", icon: "Users", group: "vocabulaire", durationSec: 90,
    build: () => ({ prompt: `Explique « ${randomTopicLabel()} », d'abord à un enfant, puis exactement le même contenu à un professionnel du secteur.`, instruction: "Garde le même message de fond, change uniquement le niveau de langue.", category: "culture", focus: "vocabulaire" }),
  },
  {
    id: "g-cent-mots", title: "Cent mots pile", tagline: "Viser une longueur précise, pas de texte", icon: "Hourglass", group: "structure", durationSec: 60,
    build: () => { const p = randomPrompt(); return { prompt: p.prompt, instruction: "Vise environ 100 mots : ni un développement trop long, ni une réponse trop courte.", category: "presentation", focus: "concision" }; },
  },
  {
    id: "g-sans-jargon", title: "Zéro jargon", tagline: "Interdiction des mots techniques de ton métier", icon: "Ban", group: "vocabulaire", durationSec: 60,
    build: () => { const p = randomPrompt(); return { prompt: p.prompt, instruction: "Interdiction d'utiliser le moindre jargon technique ou anglicisme professionnel : reformule tout simplement.", category: "pro", focus: "clarte" }; },
  },
];

export function getGame(id: string): Game | undefined {
  return GAMES.find((g) => g.id === id);
}

export function gamesByGroup(group: GameGroup): Game[] {
  return GAMES.filter((g) => g.group === group);
}

export const GAME_GROUPS: { id: GameGroup; title: string }[] = [
  { id: "parasites", title: "Anti mots parasites" },
  { id: "debit", title: "Rythme & débit" },
  { id: "diction", title: "Diction & prononciation" },
  { id: "improvisation", title: "Improvisation" },
  { id: "confiance", title: "Confiance & aisance" },
  { id: "argumentation", title: "Argumentation & débat" },
  { id: "vocabulaire", title: "Vocabulaire" },
  { id: "persuasion", title: "Persuasion & vente" },
  { id: "storytelling", title: "Storytelling" },
  { id: "structure", title: "Structure" },
  { id: "memoire", title: "Mémoire & fluidité" },
  { id: "ecoute", title: "Écoute & interaction" },
];

/** Turns a Game into a launchable, Exercise-shaped activity plus its
 * constraint (built exactly once, so both stay consistent). */
export function buildGameActivity(game: Game): { exercise: Exercise; constraint?: GameConstraint } {
  const built = game.build();
  const exercise: Exercise = {
    id: uid(`jeu_${game.id}_`),
    category: built.category,
    title: game.title,
    prompt: built.prompt,
    instruction: built.instruction,
    stance: built.stance,
    durationSec: game.durationSec,
    focus: built.focus,
  };
  return { exercise, constraint: built.constraint };
}
