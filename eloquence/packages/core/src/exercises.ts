import type { CategoryId, Dimension } from "./types";
import { generateStaticTopicExercises } from "./topics";

export interface Category {
  id: CategoryId;
  title: string;
  tagline: string;
  icon: string; // lucide icon name, resolved by the UI
}

export interface Exercise {
  id: string;
  category: CategoryId;
  title: string;
  prompt: string;
  instruction: string;
  durationSec: number;
  focus: Dimension;
  /** Short structure the user can lean on, shown before recording. */
  scaffold?: string[];
  /** Text to read aloud, for pronunciation drills. */
  readText?: string;
  /** Opinion to defend / contradict, for debates. */
  stance?: string;
}

export const CATEGORIES: Category[] = [
  { id: "improvisation", title: "Improvisation", tagline: "Répondre sans préparer", icon: "Sparkles" },
  { id: "entretien", title: "Entretien", tagline: "Face à un recruteur IA", icon: "Briefcase" },
  { id: "pitch", title: "Pitch", tagline: "Vendre une idée en 60 s", icon: "Rocket" },
  { id: "presentation", title: "Présentation", tagline: "Exposer un sujet de 1 à 5 min", icon: "Presentation" },
  { id: "debat", title: "Débat", tagline: "Défendre ou contredire", icon: "Scale" },
  { id: "pro", title: "Communication pro", tagline: "Les situations qui comptent", icon: "Users" },
  { id: "prononciation", title: "Prononciation", tagline: "Diction, articulation, rythme", icon: "AudioLines" },
  { id: "culture", title: "Culture générale", tagline: "Parler de tout, avec fond", icon: "BookOpen" },
  { id: "storytelling", title: "Storytelling", tagline: "Raconter pour marquer", icon: "BookMarked" },
  { id: "libre", title: "Entraînement libre", tagline: "Parle, on analyse", icon: "Mic" },
];

const INSTR = "Parle naturellement. Ne cherche pas la réponse parfaite.";

export const EXERCISES: Exercise[] = [
  // Improvisation
  { id: "impro-passion", category: "improvisation", title: "Un sujet qui te passionne", prompt: "Explique-nous un sujet qui te passionne en 60 secondes.", instruction: INSTR, durationSec: 60, focus: "fluidite", scaffold: ["Le sujet en une phrase", "Pourquoi il te parle", "Un exemple concret", "Ce que tu aimerais transmettre"] },
  { id: "impro-metier", category: "improvisation", title: "Ton métier idéal", prompt: "Quel serait ton métier idéal ?", instruction: INSTR, durationSec: 60, focus: "structure", scaffold: ["Le métier", "Ce qui t'attire", "Ce que tu y apporterais"] },
  { id: "impro-ville", category: "improvisation", title: "Vends ta ville", prompt: "Convaincs-moi de visiter ta ville.", instruction: INSTR, durationSec: 60, focus: "confiance", scaffold: ["Une accroche", "Trois raisons", "Une invitation"] },
  { id: "impro-competence", category: "improvisation", title: "Une compétence pour tous", prompt: "Quelle compétence devrait tout le monde apprendre ?", instruction: INSTR, durationSec: 60, focus: "vocabulaire" },
  { id: "impro-souvenir", category: "improvisation", title: "Un souvenir marquant", prompt: "Raconte un moment qui t'a fait changer d'avis.", instruction: INSTR, durationSec: 90, focus: "clarte" },
  { id: "impro-objet", category: "improvisation", title: "L'objet du quotidien", prompt: "Choisis un objet autour de toi et fais-en l'éloge pendant une minute.", instruction: INSTR, durationSec: 60, focus: "vocabulaire" },

  // Entretien
  { id: "entretien-presentation", category: "entretien", title: "Présente-toi en 60 secondes", prompt: "Présentez-vous.", instruction: INSTR, durationSec: 60, focus: "structure", scaffold: ["Qui tu es aujourd'hui", "Ton parcours clé", "Ce que tu cherches", "Pourquoi ici"] },
  { id: "entretien-motivation", category: "entretien", title: "Pourquoi nous ?", prompt: "Pourquoi souhaitez-vous rejoindre notre entreprise ?", instruction: INSTR, durationSec: 90, focus: "confiance", scaffold: ["Ce qui t'attire chez eux", "Le lien avec ton parcours", "Ce que tu apportes"] },
  { id: "entretien-qualite", category: "entretien", title: "Votre principale qualité", prompt: "Quelle est votre principale qualité ?", instruction: INSTR, durationSec: 60, focus: "clarte", scaffold: ["La qualité", "Une preuve concrète", "L'impact pour l'équipe"] },
  { id: "entretien-difficulte", category: "entretien", title: "Une difficulté surmontée", prompt: "Parlez-moi d'une difficulté que vous avez rencontrée.", instruction: "Utilise la méthode STAR : Situation, Tâche, Action, Résultat.", durationSec: 120, focus: "structure", scaffold: ["Situation", "Tâche", "Action", "Résultat"] },
  { id: "entretien-defaut", category: "entretien", title: "Votre principal défaut", prompt: "Quel est votre principal défaut ?", instruction: INSTR, durationSec: 60, focus: "confiance" },
  { id: "entretien-5ans", category: "entretien", title: "Dans cinq ans", prompt: "Où vous voyez-vous dans cinq ans ?", instruction: INSTR, durationSec: 60, focus: "clarte" },
  { id: "entretien-90s", category: "entretien", title: "Présentation complète", prompt: "Présentez-vous pendant 90 secondes : parcours, compétences, ce que vous cherchez.", instruction: INSTR, durationSec: 90, focus: "structure", scaffold: ["Qui tu es", "Ton parcours", "Tes compétences clés", "Ce que tu cherches"] },

  // Pitch
  { id: "pitch-soi", category: "pitch", title: "Ton pitch personnel", prompt: "Vends-toi en 30 secondes, comme dans un ascenseur.", instruction: "Une idée forte, une preuve, une ouverture.", durationSec: 30, focus: "confiance", scaffold: ["Qui tu es", "Ta valeur unique", "Ce que tu proposes"] },
  { id: "pitch-produit", category: "pitch", title: "Un produit du quotidien", prompt: "Vends-moi ton application préférée comme si tu l'avais créée.", instruction: INSTR, durationSec: 60, focus: "structure", scaffold: ["Le problème", "La solution", "La preuve", "L'appel à l'action"] },
  { id: "pitch-idee", category: "pitch", title: "Une idée à financer", prompt: "Tu as 60 secondes pour convaincre un investisseur de financer ton idée.", instruction: INSTR, durationSec: 60, focus: "confiance" },

  // Présentation
  { id: "pres-sujet", category: "presentation", title: "Exposé express", prompt: "Présente un sujet que tu maîtrises à quelqu'un qui n'y connaît rien.", instruction: "Annonce ton plan, puis déroule-le.", durationSec: 120, focus: "structure", scaffold: ["Introduction et plan", "Partie 1", "Partie 2", "Conclusion"] },
  { id: "pres-projet", category: "presentation", title: "Ton dernier projet", prompt: "Présente un projet que tu as mené : objectif, démarche, résultat.", instruction: INSTR, durationSec: 180, focus: "clarte" },
  { id: "pres-livre", category: "presentation", title: "Un livre ou un film", prompt: "Présente un livre ou un film qui t'a marqué, sans divulgâcher la fin.", instruction: INSTR, durationSec: 120, focus: "vocabulaire" },
  { id: "pres-long", category: "presentation", title: "Présentation de 5 minutes", prompt: "Présente un sujet de ton choix pendant 5 minutes, comme devant une salle.", instruction: "Garde un fil conducteur et varie ton rythme.", durationSec: 300, focus: "debit" },
  { id: "pres-conference", category: "presentation", title: "Conférence", prompt: "Présente un sujet que tu maîtrises comme si tu étais invité à en parler devant 100 personnes.", instruction: "Capte l'attention dès les dix premières secondes.", durationSec: 180, focus: "persuasion" },

  // Débat
  { id: "debat-teletravail", category: "debat", title: "Le télétravail", prompt: "Défends ou contredis cette position.", stance: "Le télétravail devrait devenir la norme.", instruction: "Prends position dès la première phrase.", durationSec: 90, focus: "argumentation", scaffold: ["Ta position", "Argument 1 + exemple", "Argument 2 + exemple", "Réponse à l'objection"] },
  { id: "debat-reseaux", category: "debat", title: "Les réseaux sociaux", prompt: "Défends ou contredis cette position.", stance: "Les réseaux sociaux font plus de mal que de bien.", instruction: "Prends position dès la première phrase.", durationSec: 90, focus: "confiance" },
  { id: "debat-notes", category: "debat", title: "Les notes à l'école", prompt: "Défends ou contredis cette position.", stance: "Il faudrait supprimer les notes à l'école.", instruction: "Prends position dès la première phrase.", durationSec: 90, focus: "argumentation" },
  { id: "debat-ia", category: "debat", title: "L'IA au travail", prompt: "Défends ou contredis cette position.", stance: "L'IA va rendre le travail plus humain.", instruction: "Prends position dès la première phrase.", durationSec: 90, focus: "vocabulaire" },
  { id: "debat-voiture", category: "debat", title: "La voiture individuelle en ville", prompt: "Défends ou contredis cette position.", stance: "Les centres-villes devraient être interdits aux voitures.", instruction: "Prends position dès la première phrase.", durationSec: 90, focus: "argumentation" },
  { id: "debat-nucleaire", category: "debat", title: "L'énergie nucléaire", prompt: "Défends ou contredis cette position.", stance: "Le nucléaire est la meilleure réponse au changement climatique.", instruction: "Prends position dès la première phrase.", durationSec: 90, focus: "argumentation" },

  // Communication pro
  { id: "pro-augmentation", category: "pro", title: "Demander une augmentation", prompt: "Ton manager t'accorde 90 secondes. Demande une augmentation.", instruction: "Appuie-toi sur des faits, reste calme et précis.", durationSec: 90, focus: "confiance", scaffold: ["Le contexte", "Tes résultats chiffrés", "Ta demande claire", "Ouverture au dialogue"] },
  { id: "pro-reunion", category: "pro", title: "Prendre la parole en réunion", prompt: "Interviens en réunion pour proposer une nouvelle façon de travailler.", instruction: INSTR, durationSec: 60, focus: "clarte" },
  { id: "pro-client", category: "pro", title: "Convaincre un client", prompt: "Un client hésite à signer. Convaincs-le en une minute.", instruction: INSTR, durationSec: 60, focus: "persuasion" },
  { id: "pro-mauvaise-nouvelle", category: "pro", title: "Annoncer une mauvaise nouvelle", prompt: "Annonce à ton équipe que le projet prend un mois de retard.", instruction: "Sois direct, factuel et propose une suite.", durationSec: 60, focus: "clarte" },
  { id: "pro-objection", category: "pro", title: "Répondre à une objection", prompt: "« C'est trop cher. » Réponds à cette objection.", instruction: INSTR, durationSec: 45, focus: "persuasion" },
  { id: "pro-projet", category: "pro", title: "Présenter un projet", prompt: "Présente un projet à ta direction en une minute et demie.", instruction: INSTR, durationSec: 90, focus: "structure" },
  { id: "pro-negociation", category: "pro", title: "Négocier un délai", prompt: "Un client te demande une livraison impossible à tenir. Négocie un délai réaliste.", instruction: INSTR, durationSec: 60, focus: "persuasion" },

  // Prononciation
  { id: "pron-articulation", category: "prononciation", title: "Articulation", prompt: "Lis ce texte en articulant chaque syllabe.", instruction: "Lentement d'abord. La vitesse viendra ensuite.", durationSec: 45, focus: "debit", readText: "Un chasseur sachant chasser doit savoir chasser sans son chien. Les chaussettes de l'archiduchesse sont-elles sèches, archi-sèches ? Si six scies scient six cyprès, six cent six scies scient six cent six cyprès." },
  { id: "pron-rythme", category: "prononciation", title: "Rythme et pauses", prompt: "Lis ce passage en marquant une vraie pause à chaque point.", instruction: "Une pause d'une seconde vaut mieux qu'un « euh ».", durationSec: 60, focus: "debit", readText: "La parole est une respiration. On inspire avant l'idée. On la pose. Puis on laisse le silence faire son travail. Celui qui écoute a besoin de ce temps pour comprendre. Parler moins vite, c'est être mieux entendu." },
  { id: "pron-intonation", category: "prononciation", title: "Intonation", prompt: "Lis ce texte en faisant varier ton intonation.", instruction: "Monte sur les questions, descends sur les affirmations.", durationSec: 45, focus: "confiance", readText: "Vous pensez que c'est impossible ? Moi aussi, au début. Puis j'ai essayé. Une fois. Deux fois. Et un matin, tout est devenu simple. Alors, qu'est-ce qui vous retient ?" },
  { id: "pron-virelangues", category: "prononciation", title: "Virelangues express", prompt: "Lis ces virelangues trois fois de suite, de plus en plus vite.", instruction: "L'objectif : rester intelligible même en accélérant.", durationSec: 40, focus: "debit", readText: "Ces cyprès sont si loin qu'on ne sait si c'en sont. Je veux et j'exige d'exquises excuses. Piano, panier, pinceau, poulain." },

  // Culture générale
  { id: "culture-libre", category: "culture", title: "Question de culture générale", prompt: "Explique en 60 secondes : pourquoi les villes se développent-elles historiquement autour des fleuves ?", instruction: "Structure ta réponse : cause, exemple, conséquence.", durationSec: 60, focus: "argumentation" },
  { id: "culture-philo", category: "culture", title: "Question de philosophie", prompt: "La liberté, est-ce faire ce que l'on veut ?", instruction: "Prends position, puis nuance.", durationSec: 90, focus: "argumentation" },
  { id: "culture-eco", category: "culture", title: "Question d'économie", prompt: "Explique simplement ce qu'est l'inflation et pourquoi elle inquiète.", instruction: "Vulgarise sans trahir le sujet.", durationSec: 60, focus: "clarte" },

  // Storytelling
  { id: "story-experience", category: "storytelling", title: "Une expérience marquante", prompt: "Raconte une expérience qui t'a appris quelque chose sur toi-même.", instruction: "Utilise la Story Spine : contexte, événement déclencheur, conséquences, ce qui a changé.", durationSec: 90, focus: "structure", scaffold: ["À l'origine…", "Jusqu'au jour où…", "À cause de ça…", "Et depuis…"] },
  { id: "story-echec", category: "storytelling", title: "Un échec transformé en leçon", prompt: "Raconte un échec, et ce qu'il t'a appris.", instruction: "Ne minimise pas l'échec : c'est lui qui rend l'histoire crédible.", durationSec: 90, focus: "structure" },
  { id: "story-rencontre", category: "storytelling", title: "Une rencontre marquante", prompt: "Raconte une rencontre qui a compté pour toi.", instruction: INSTR, durationSec: 90, focus: "vocabulaire" },

  // Entraînement libre
  { id: "libre-parler", category: "libre", title: "Parler, sans consigne", prompt: "Parle de ce que tu veux, pendant le temps que tu veux.", instruction: "Aucun objectif imposé. L'analyse choisira elle-même ce qui compte le plus à travailler.", durationSec: 90, focus: "clarte" },
];

// ---------------------------------------------------------------------------
// Generated catalogue extras: the curated list above stays short and
// hand-picked (it's what onboarding, the daily pick and the tests rely on),
// but "Exercices" needs real depth per category too. Each bank below is a
// list of real, specific prompts; combined with a handful of delivery
// variants (duration, extra constraint), the same pattern used for "Sujets"
// (packages/core/src/topics.ts) multiplies it into a large, still genuinely
// distinct catalogue — with stable ids, so history and best-score tracking
// keep working across reloads.

interface Variant { suffix: string; durationSec: number; instruction: string; focus?: Dimension }

const VARIANTS: Variant[] = [
  { suffix: "std", durationSec: 0, instruction: INSTR },
  { suffix: "court", durationSec: -30, instruction: "Réponds en 30 secondes maximum : va droit à l'essentiel.", focus: "concision" },
  { suffix: "structure", durationSec: 15, instruction: "Structure ta réponse en trois points annoncés dès la première phrase.", focus: "structure" },
  { suffix: "exemple", durationSec: 0, instruction: "Appuie ta réponse sur un exemple concret et si possible chiffré.", focus: "argumentation" },
  { suffix: "impro", durationSec: 0, instruction: "Aucune préparation : enregistre-toi dès que tu as lu la question.", focus: "confiance" },
];

function expandBank(bank: { id: string; title: string; prompt: string; focus: Dimension }[], category: CategoryId, baseDuration: number): Exercise[] {
  const out: Exercise[] = [];
  for (const item of bank) {
    for (const v of VARIANTS) {
      out.push({
        id: `${item.id}_${v.suffix}`,
        category,
        title: item.title,
        prompt: item.prompt,
        instruction: v.instruction,
        durationSec: Math.max(20, baseDuration + v.durationSec),
        focus: v.focus ?? item.focus,
      });
    }
  }
  return out;
}

const ENTRETIEN_BANK: { id: string; title: string; prompt: string; focus: Dimension }[] = [
  { id: "ent-parcours", title: "Ton parcours", prompt: "Décrivez votre parcours en quelques phrases.", focus: "structure" },
  { id: "ent-choix", title: "Un choix de carrière", prompt: "Pourquoi avoir choisi cette voie professionnelle ?", focus: "clarte" },
  { id: "ent-reussite", title: "Une réussite marquante", prompt: "Parlez-moi de votre plus grande réussite professionnelle.", focus: "structure" },
  { id: "ent-echec-pro", title: "Un échec professionnel", prompt: "Racontez un échec professionnel et ce que vous en avez tiré.", focus: "confiance" },
  { id: "ent-conflit-pro", title: "Un conflit géré", prompt: "Parlez-moi d'un conflit que vous avez géré avec un collègue ou un client.", focus: "structure" },
  { id: "ent-travail-equipe", title: "Le travail en équipe", prompt: "Comment travaillez-vous en équipe ?", focus: "clarte" },
  { id: "ent-pression", title: "Travailler sous pression", prompt: "Comment gérez-vous la pression et les délais serrés ?", focus: "confiance" },
  { id: "ent-critique", title: "Recevoir une critique", prompt: "Comment réagissez-vous face à une critique sur votre travail ?", focus: "confiance" },
  { id: "ent-leadership", title: "Ton style de leadership", prompt: "Comment décririez-vous votre style de leadership ou de collaboration ?", focus: "vocabulaire" },
  { id: "ent-priorites", title: "Gérer les priorités", prompt: "Comment organisez-vous vos priorités quand tout semble urgent ?", focus: "structure" },
  { id: "ent-decision-difficile", title: "Une décision difficile", prompt: "Parlez-moi d'une décision professionnelle difficile que vous avez prise.", focus: "argumentation" },
  { id: "ent-apprentissage", title: "Apprendre vite", prompt: "Racontez une situation où vous avez dû apprendre quelque chose très vite.", focus: "clarte" },
  { id: "ent-valeur-ajoutee", title: "Ta valeur ajoutée", prompt: "Qu'apportez-vous à une équipe que peu de gens apportent ?", focus: "confiance" },
  { id: "ent-salaire", title: "Prétentions salariales", prompt: "Quelles sont vos prétentions salariales, et pourquoi ce montant ?", focus: "argumentation" },
  { id: "ent-question-finale", title: "Une question pour nous", prompt: "Avez-vous une question à nous poser ?", focus: "confiance" },
  { id: "ent-changement", title: "S'adapter au changement", prompt: "Racontez une situation où vous avez dû vous adapter à un changement important.", focus: "structure" },
  { id: "ent-initiative", title: "Prendre une initiative", prompt: "Parlez-moi d'une fois où vous avez pris une initiative sans qu'on vous le demande.", focus: "confiance" },
  { id: "ent-erreur", title: "Reconnaître une erreur", prompt: "Racontez une erreur que vous avez commise et comment vous l'avez corrigée.", focus: "confiance" },
  { id: "ent-motivation-poste", title: "Motivation pour ce poste précis", prompt: "Qu'est-ce qui, dans ce poste précisément, vous motive le plus ?", focus: "clarte" },
  { id: "ent-collegue-difficile", title: "Un collègue difficile", prompt: "Comment géreriez-vous un collègue difficile à vivre au quotidien ?", focus: "structure" },
];

const PRO_BANK: { id: string; title: string; prompt: string; focus: Dimension }[] = [
  { id: "pro-delai-manque", title: "Annoncer un délai manqué", prompt: "Vous devez annoncer à un client que le délai promis ne sera pas tenu.", focus: "clarte" },
  { id: "pro-budget-refuse", title: "Un budget refusé", prompt: "Votre demande de budget vient d'être refusée. Réagissez face à votre équipe.", focus: "confiance" },
  { id: "pro-recadrer", title: "Recadrer un collaborateur", prompt: "Un collaborateur rend un travail bâclé pour la deuxième fois. Recadrez-le.", focus: "clarte" },
  { id: "pro-idee-rejetee", title: "Défendre une idée rejetée", prompt: "Votre idée vient d'être rejetée en réunion. Défendez-la une dernière fois avec de nouveaux arguments.", focus: "persuasion" },
  { id: "pro-changement-annonce", title: "Annoncer un changement d'organisation", prompt: "Annoncez à votre équipe une réorganisation qui va changer leurs habitudes.", focus: "structure" },
  { id: "pro-remerciement", title: "Remercier publiquement", prompt: "Remerciez publiquement un collègue pour son aide sur un projet difficile.", focus: "vocabulaire" },
  { id: "pro-demission", title: "Annoncer un départ", prompt: "Annoncez à votre équipe que vous quittez l'entreprise.", focus: "clarte" },
  { id: "pro-feedback-difficile", title: "Un feedback difficile à donner", prompt: "Donnez un retour honnête à quelqu'un dont le travail ne convient pas, sans le démolir.", focus: "clarte" },
  { id: "pro-urgence", title: "Gérer l'urgence", prompt: "Un problème urgent vient d'éclater. Briefez votre équipe en une minute.", focus: "concision" },
  { id: "pro-presentation-chiffres", title: "Présenter des résultats décevants", prompt: "Présentez à la direction des résultats trimestriels en dessous des objectifs.", focus: "clarte" },
  { id: "pro-vente-interne", title: "Vendre une idée en interne", prompt: "Convainquez votre direction d'investir dans un nouvel outil ou une nouvelle méthode.", focus: "persuasion" },
  { id: "pro-refus", title: "Dire non poliment", prompt: "Un collègue vous demande de l'aide alors que vous êtes déjà débordé. Dites non sans le vexer.", focus: "clarte" },
  { id: "pro-onboarding", title: "Accueillir un nouveau", prompt: "Présentez votre équipe et son fonctionnement à une nouvelle recrue.", focus: "structure" },
  { id: "pro-clients-mecontents", title: "Répondre à plusieurs plaintes", prompt: "Plusieurs clients se plaignent du même problème. Expliquez la situation et le plan d'action.", focus: "clarte" },
  { id: "pro-arbitrage", title: "Trancher entre deux options", prompt: "Deux membres de votre équipe défendent des approches opposées. Tranchez et expliquez pourquoi.", focus: "argumentation" },
  { id: "pro-networking-interne", title: "Se présenter à un nouveau service", prompt: "Présentez-vous et votre rôle à un service avec lequel vous allez désormais collaborer.", focus: "clarte" },
  { id: "pro-plan-social", title: "Annoncer une mauvaise nouvelle collective", prompt: "Annoncez à votre équipe une nouvelle difficile qui les concerne tous directement.", focus: "confiance" },
  { id: "pro-negocier-contrat", title: "Négocier un contrat", prompt: "Négociez les termes d'un contrat avec un partenaire qui campe sur ses positions.", focus: "persuasion" },
  { id: "pro-escalade", title: "Faire remonter un problème", prompt: "Expliquez à votre supérieur un problème que vous ne pouvez pas résoudre seul.", focus: "structure" },
  { id: "pro-celebration", title: "Célébrer une victoire d'équipe", prompt: "Votre équipe vient de réussir un projet difficile. Prenez la parole pour marquer le moment.", focus: "vocabulaire" },
];

const STORY_BANK: { id: string; title: string; prompt: string; focus: Dimension }[] = [
  { id: "story-peur", title: "Une peur surmontée", prompt: "Raconte une fois où tu as dû affronter une peur.", focus: "structure" },
  { id: "story-fierte", title: "Un moment de fierté", prompt: "Raconte un moment où tu as été particulièrement fier de toi.", focus: "vocabulaire" },
  { id: "story-risque", title: "Un pari risqué", prompt: "Raconte une fois où tu as pris un risque important.", focus: "structure" },
  { id: "story-mentor", title: "Une personne qui t'a marqué", prompt: "Raconte l'histoire d'une personne qui a changé ta façon de voir les choses.", focus: "vocabulaire" },
  { id: "story-premiere-fois", title: "Une première fois", prompt: "Raconte une « première fois » qui t'a marqué (premier jour, premier échec, première réussite…).", focus: "structure" },
  { id: "story-hasard", title: "Un heureux hasard", prompt: "Raconte une coïncidence ou un hasard qui a eu de grandes conséquences.", focus: "clarte" },
  { id: "story-transformation", title: "Une transformation", prompt: "Raconte comment tu as changé sur un point précis en quelques années.", focus: "structure" },
  { id: "story-entraide", title: "Un moment d'entraide", prompt: "Raconte une fois où quelqu'un t'a aidé de façon inattendue, ou l'inverse.", focus: "vocabulaire" },
  { id: "story-decision-vie", title: "Une décision qui a tout changé", prompt: "Raconte une décision qui a changé le cours de ta vie.", focus: "structure" },
  { id: "story-voyage-marquant", title: "Un voyage marquant", prompt: "Raconte un voyage qui t'a vraiment marqué, et pourquoi.", focus: "vocabulaire" },
  { id: "story-perte", title: "Faire face à une perte", prompt: "Raconte comment tu as traversé une période difficile.", focus: "confiance" },
  { id: "story-objectif-atteint", title: "Un objectif atteint", prompt: "Raconte comment tu as atteint un objectif qui semblait hors de portée.", focus: "structure" },
  { id: "story-malentendu", title: "Un malentendu réglé", prompt: "Raconte un malentendu que tu as dû clarifier avec quelqu'un.", focus: "clarte" },
  { id: "story-improviste", title: "Un imprévu géré", prompt: "Raconte une fois où tout ne s'est pas passé comme prévu, et comment tu as réagi.", focus: "confiance" },
  { id: "story-enfance", title: "Un souvenir d'enfance fondateur", prompt: "Raconte un souvenir d'enfance qui explique en partie qui tu es aujourd'hui.", focus: "vocabulaire" },
  { id: "story-communaute", title: "Un moment collectif fort", prompt: "Raconte un moment fort vécu en groupe (équipe, famille, association).", focus: "structure" },
  { id: "story-second-chance", title: "Une seconde chance", prompt: "Raconte une fois où on t'a donné, ou où tu as donné, une seconde chance.", focus: "confiance" },
  { id: "story-curiosite", title: "Une découverte inattendue", prompt: "Raconte comment tu as découvert une passion ou un intérêt de façon inattendue.", focus: "vocabulaire" },
  { id: "story-limite", title: "Repousser une limite", prompt: "Raconte une fois où tu es allé au-delà de ce que tu pensais capable de faire.", focus: "confiance" },
  { id: "story-transmission", title: "Transmettre quelque chose", prompt: "Raconte une fois où tu as appris quelque chose d'important à quelqu'un d'autre.", focus: "structure" },
];

const PITCH_BANK: { id: string; title: string; prompt: string; focus: Dimension }[] = [
  { id: "pitch-appli", title: "Une application utile", prompt: "Pitche une application qui résoudrait un petit problème du quotidien.", focus: "structure" },
  { id: "pitch-service-local", title: "Un service de quartier", prompt: "Pitche un service qui manque dans ton quartier.", focus: "persuasion" },
  { id: "pitch-evenement", title: "Un événement à organiser", prompt: "Pitche un événement que tu aimerais organiser, à quelqu'un qui doit le financer.", focus: "confiance" },
  { id: "pitch-association", title: "Une cause à défendre", prompt: "Pitche une association ou une cause à quelqu'un pour le convaincre de s'engager.", focus: "persuasion" },
  { id: "pitch-produit-existant", title: "Réinventer un produit existant", prompt: "Pitche une amélioration simple d'un produit que tout le monde connaît.", focus: "structure" },
  { id: "pitch-toi-recruteur", title: "Toi, en 30 secondes", prompt: "Pitche-toi comme candidat idéal pour un poste que tu choisis toi-même.", focus: "confiance" },
  { id: "pitch-livre", title: "Un livre à lire absolument", prompt: "Pitche un livre (réel ou imaginaire) pour donner envie de le lire en 30 secondes.", focus: "vocabulaire" },
  { id: "pitch-abonnement", title: "Un abonnement mensuel", prompt: "Pitche un service par abonnement à quelqu'un qui n'en veut pas un de plus.", focus: "persuasion" },
  { id: "pitch-idee-pro", title: "Une idée pour ton entreprise", prompt: "Pitche une idée d'amélioration à appliquer dans ton entreprise ou ton école.", focus: "structure" },
  { id: "pitch-collecte-fonds", title: "Une collecte de fonds", prompt: "Pitche un projet pour lequel tu dois collecter de l'argent auprès d'inconnus.", focus: "persuasion" },
  { id: "pitch-outil-travail", title: "Un outil pour ton équipe", prompt: "Pitche un outil ou une méthode que ton équipe devrait adopter.", focus: "structure" },
  { id: "pitch-produit-absurde", title: "Un produit absurde", prompt: "Pitche sérieusement un produit volontairement absurde, comme s'il était génial.", focus: "confiance" },
  { id: "pitch-partenariat", title: "Un partenariat", prompt: "Pitche un partenariat entre deux structures que tu choisis toi-même.", focus: "persuasion" },
  { id: "pitch-fonctionnalite", title: "Une nouvelle fonctionnalité", prompt: "Pitche une fonctionnalité à ajouter à une application que tu utilises souvent.", focus: "structure" },
  { id: "pitch-recrutement", title: "Convaincre quelqu'un de rejoindre ton équipe", prompt: "Pitche ton équipe ou ton projet à quelqu'un que tu veux recruter.", focus: "persuasion" },
  { id: "pitch-changement-habitude", title: "Un changement d'habitude", prompt: "Pitche un changement d'habitude à quelqu'un de sceptique (sport, alimentation, organisation).", focus: "persuasion" },
  { id: "pitch-cadeau", title: "Le cadeau parfait", prompt: "Pitche un cadeau original à quelqu'un pour une occasion précise.", focus: "vocabulaire" },
  { id: "pitch-destination", title: "Une destination de voyage", prompt: "Pitche une destination de voyage à des amis hésitants.", focus: "persuasion" },
  { id: "pitch-films", title: "Un film à voir ce soir", prompt: "Pitche un film pour convaincre un groupe indécis de le regarder ce soir.", focus: "vocabulaire" },
  { id: "pitch-formation", title: "Une formation à suivre", prompt: "Pitche une formation ou un cours à quelqu'un qui hésite à investir du temps dedans.", focus: "persuasion" },
];

const IMPRO_BANK: { id: string; title: string; prompt: string; focus: Dimension }[] = [
  { id: "impro-superpouvoir", title: "Ton super-pouvoir", prompt: "Si tu avais un super-pouvoir, lequel choisirais-tu, et pourquoi ?", focus: "fluidite" },
  { id: "impro-regle-abolir", title: "Une règle à abolir", prompt: "Quelle règle absurde aimerais-tu voir disparaître ?", focus: "argumentation" },
  { id: "impro-conseil", title: "Un conseil reçu", prompt: "Quel est le meilleur conseil qu'on t'ait jamais donné ?", focus: "clarte" },
  { id: "impro-objet-disparu", title: "Un objet qui devrait disparaître", prompt: "Quel objet du quotidien devrait, selon toi, disparaître ?", focus: "argumentation" },
  { id: "impro-talent-cache", title: "Un talent caché", prompt: "Quel talent aimerais-tu avoir, même s'il est totalement inutile ?", focus: "fluidite" },
  { id: "impro-machine-temps", title: "La machine à remonter le temps", prompt: "Si tu pouvais parler à toi-même il y a dix ans, que lui dirais-tu ?", focus: "clarte" },
  { id: "impro-metier-disparu", title: "Un métier qui va disparaître", prompt: "Quel métier actuel risque, selon toi, de disparaître d'ici vingt ans ?", focus: "argumentation" },
  { id: "impro-lieu-refuge", title: "Ton lieu refuge", prompt: "Décris l'endroit où tu te sens le mieux au monde.", focus: "vocabulaire" },
  { id: "impro-journee-parfaite", title: "Ta journée parfaite", prompt: "Décris à quoi ressemblerait ta journée parfaite, du matin au soir.", focus: "fluidite" },
  { id: "impro-invention", title: "Une invention utile", prompt: "Si tu pouvais inventer un objet qui n'existe pas encore, ce serait quoi ?", focus: "vocabulaire" },
  { id: "impro-different", title: "Ce qui te rend différent", prompt: "Qu'est-ce qui te différencie vraiment des autres, selon toi ?", focus: "confiance" },
  { id: "impro-defi-annee", title: "Un défi pour l'année", prompt: "Quel défi personnel aimerais-tu te lancer cette année ?", focus: "confiance" },
  { id: "impro-heros", title: "Un modèle inspirant", prompt: "Qui est une personne (connue ou non) qui t'inspire, et pourquoi ?", focus: "vocabulaire" },
  { id: "impro-decision-vite", title: "Une décision immédiate", prompt: "On te propose de partir vivre à l'étranger demain. Tu réponds quoi, tout de suite ?", focus: "confiance" },
  { id: "impro-question-etrange", title: "Une question bizarre", prompt: "Si les animaux pouvaient parler, lequel serait le plus désagréable et pourquoi ?", focus: "fluidite" },
  { id: "impro-monde-meilleur", title: "Un monde meilleur", prompt: "Quel petit changement rendrait le monde nettement meilleur, selon toi ?", focus: "argumentation" },
  { id: "impro-peur-enfant", title: "Une peur d'enfant", prompt: "De quoi avais-tu peur enfant, et en as-tu encore peur aujourd'hui ?", focus: "vocabulaire" },
  { id: "impro-tradition", title: "Une tradition à créer", prompt: "Si tu pouvais créer une nouvelle tradition, ce serait laquelle ?", focus: "fluidite" },
  { id: "impro-derniere-conversation", title: "Une dernière conversation", prompt: "S'il ne te restait qu'une conversation à avoir, avec qui, et pour dire quoi ?", focus: "confiance" },
  { id: "impro-mot-prefere", title: "Ton mot préféré", prompt: "Quel est ton mot préféré dans la langue française, et pourquoi ?", focus: "vocabulaire" },
];

const PRONO_TEXTS: { id: string; title: string; text: string; focus: Dimension }[] = [
  { id: "pron-cha", title: "Les chaussettes", text: "Les chaussettes de l'archiduchesse sont-elles sèches, archi-sèches ?", focus: "debit" },
  { id: "pron-chasseur", title: "Le chasseur", text: "Un chasseur sachant chasser sait chasser sans son chien.", focus: "debit" },
  { id: "pron-tortues", title: "Les tortues", text: "Trois tortues trottaient sur trois toits très étroits.", focus: "debit" },
  { id: "pron-scies", title: "Les scies", text: "Si six scies scient six cyprès, six cent six scies scient six cent six cyprès.", focus: "clarte" },
  { id: "pron-druides", title: "Les druides", text: "Douze douches douces douchent doucement douze druides distraits.", focus: "clarte" },
  { id: "pron-cerises", title: "Les cerises", text: "Ces cerises sont si sûres qu'on ne sait pas si c'en sont.", focus: "clarte" },
  { id: "pron-pecheur", title: "Le pêcheur", text: "Pauvre petit pêcheur, prend patience pour pêcher plusieurs poissons.", focus: "debit" },
  { id: "pron-excuses", title: "Les excuses", text: "Je veux et j'exige d'exquises excuses.", focus: "clarte" },
  { id: "pron-ver", title: "Le ver vert", text: "Le ver vert va vers le verre vert.", focus: "clarte" },
  { id: "pron-natacha", title: "Natacha", text: "Natacha n'attacha pas son chat Pacha qui s'échappa.", focus: "debit" },
  { id: "pron-sisyphe", title: "Sisyphe heureux", text: "Il faut imaginer Sisyphe heureux : la lutte elle-même vers les sommets suffit à remplir un cœur d'homme.", focus: "clarte" },
  { id: "pron-renard", title: "Le renard", text: "On ne voit bien qu'avec le cœur. L'essentiel est invisible pour les yeux, disait le renard, sans jamais élever la voix.", focus: "confiance" },
  { id: "pron-generosite", title: "La générosité", text: "La vraie générosité envers l'avenir consiste à tout donner au présent, disait-elle, en pesant chaque mot.", focus: "debit" },
  { id: "pron-acquis", title: "Rien n'est acquis", text: "Rien n'est jamais acquis à l'homme. Ni sa force, ni sa faiblesse, ni son cœur.", focus: "confiance" },
  { id: "pron-doute", title: "Le doute", text: "Le doute n'est pas une faiblesse : c'est souvent le premier pas vers une certitude plus solide.", focus: "clarte" },
  { id: "pron-matin", title: "Chaque matin", text: "Chaque matin, le monde est à refaire, et pourtant chaque matin nous croyons qu'il est déjà fini.", focus: "debit" },
  { id: "pron-respiration", title: "La respiration de la parole", text: "La parole est une respiration. On inspire avant l'idée. On la pose. Puis on laisse le silence faire son travail.", focus: "debit" },
  { id: "pron-question", title: "L'intonation qui interroge", text: "Vous pensez que c'est impossible ? Moi aussi, au début. Puis j'ai essayé. Une fois. Deux fois. Et un matin, tout est devenu simple.", focus: "confiance" },
  { id: "pron-fanfare", title: "La fanfare fatiguée", text: "Fanfaron, le fanfaron fanfaronne, mais la fanfare, fatiguée, ne le suit plus.", focus: "debit" },
  { id: "pron-piano", title: "Piano, panier, pinceau", text: "Piano, panier, pinceau, poulain : quatre mots, quatre appuis, une seule respiration.", focus: "clarte" },
  { id: "pron-dragon", title: "Le dragon gradé", text: "Un dragon gradé dégrade un gradé dragon, qui dégrade à son tour un dragon gradé.", focus: "clarte" },
  { id: "pron-silence", title: "Le pouvoir du silence", text: "Le silence, bien placé, dit parfois plus qu'une phrase entière. Apprends à t'y arrêter, sans peur du vide.", focus: "confiance" },
  { id: "pron-avenir", title: "Se donner au présent", text: "Rien ne sert de courir après le temps : il suffit de bien habiter chaque instant qu'on lui doit.", focus: "debit" },
  { id: "pron-vertige", title: "Le vertige apaisant", text: "Le silence éternel de ces espaces infinis m'effraie, et pourtant j'y trouve une forme de vertige apaisant.", focus: "confiance" },
  { id: "pron-refaire", title: "Tout est à refaire", text: "On ne se baigne jamais deux fois dans le même fleuve, disait-on déjà dans l'Antiquité : tout coule, rien ne demeure.", focus: "clarte" },
];

const PRONO_VARIANTS: { suffix: string; durationSec: number; instruction: string }[] = [
  { suffix: "lent", durationSec: 45, instruction: "Lis ce texte lentement, en articulant chaque syllabe." },
  { suffix: "rapide", durationSec: 40, instruction: "Lis ce texte trois fois de suite, de plus en plus vite, sans perdre en clarté." },
  { suffix: "pause", durationSec: 50, instruction: "Lis ce texte en marquant une vraie pause silencieuse à chaque ponctuation." },
  { suffix: "intonation", durationSec: 45, instruction: "Lis ce texte en variant volontairement ton intonation : ne reste jamais monocorde." },
];

function expandProno(): Exercise[] {
  const out: Exercise[] = [];
  for (const t of PRONO_TEXTS) {
    for (const v of PRONO_VARIANTS) {
      out.push({
        id: `${t.id}_${v.suffix}`,
        category: "prononciation",
        title: t.title,
        prompt: "Lis ce texte à voix haute.",
        instruction: v.instruction,
        durationSec: v.durationSec,
        focus: t.focus,
        readText: t.text,
      });
    }
  }
  return out;
}

export const EXERCISES_GENERATED: Exercise[] = [
  ...expandBank(ENTRETIEN_BANK, "entretien", 75),
  ...expandBank(PRO_BANK, "pro", 60),
  ...expandBank(STORY_BANK, "storytelling", 90),
  ...expandBank(PITCH_BANK, "pitch", 45),
  ...expandBank(IMPRO_BANK, "improvisation", 60),
  ...expandProno(),
  ...generateStaticTopicExercises("expliquer", 120),
  ...generateStaticTopicExercises("debattre", 120),
  ...generateStaticTopicExercises("presenter", 120),
];

export const EXERCISES_ALL: Exercise[] = [...EXERCISES, ...EXERCISES_GENERATED];

export function getExercise(id: string): Exercise | undefined {
  return EXERCISES_ALL.find((e) => e.id === id);
}

export function exercisesByCategory(category: CategoryId): Exercise[] {
  return EXERCISES_ALL.filter((e) => e.category === category);
}

export function getCategory(id: CategoryId): Category {
  return CATEGORIES.find((c) => c.id === id)!;
}

/** The first oral test offered during onboarding. */
export const ONBOARDING_EXERCISE_ID = "impro-passion";

const DAILY_POOL = [
  "impro-passion", "impro-metier", "entretien-presentation", "impro-ville",
  "pitch-soi", "debat-teletravail", "pro-reunion", "impro-competence",
  "entretien-qualite", "pres-livre", "debat-reseaux", "pitch-produit",
  "story-experience", "culture-libre",
];

/** Deterministic "session du jour", nudged towards the user's weakest skill. */
export function dailyExercise(date: Date, weakest?: Dimension): Exercise {
  const dayIndex = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  if (weakest && dayIndex % 3 === 0) {
    const match = EXERCISES.find((e) => e.focus === weakest && DAILY_POOL.includes(e.id));
    if (match) return match;
  }
  return getExercise(DAILY_POOL[dayIndex % DAILY_POOL.length])!;
}

export function formatDuration(sec: number): string {
  if (sec < 60) return `${sec} s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s ? `${m} min ${s}` : `${m} min`;
}
