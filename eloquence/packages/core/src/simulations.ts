// Roleplay simulations: the coach plays a persona across several turns. In
// heuristic (offline) mode each persona follows a fixed script with
// rule-based reactions; when an LLM is configured, the same persona becomes
// a free-flowing system prompt so the AI can genuinely react to what was
// said (see providers/llm.ts on the server).

export interface Simulation {
  id: string;
  title: string;
  persona: string;
  icon: string;
  intro: string;
  questions: string[];
  /** System-prompt voice for the LLM-backed version. */
  llmPersona: string;
}

export const SIMULATIONS: Simulation[] = [
  {
    id: "sim-entretien", title: "Entretien d'embauche", persona: "Un·e recruteur·se", icon: "Briefcase",
    intro: "Je joue le recruteur. Réponds par écrit comme tu le dirais à l'oral.",
    questions: [
      "Présentez-vous en quelques phrases.",
      "Pourquoi souhaitez-vous rejoindre notre entreprise ?",
      "Parlez-moi d'une difficulté que vous avez rencontrée et de la façon dont vous l'avez gérée.",
      "Pourquoi devrions-nous vous choisir plutôt qu'un autre candidat ?",
      "Avez-vous des questions pour nous ?",
    ],
    llmPersona: "Tu joues un recruteur professionnel, exigeant mais bienveillant, qui mène un entretien d'embauche classique. Pose une question à la fois, rebondis brièvement sur la réponse précédente avant la suivante.",
  },
  {
    id: "sim-banque", title: "Entretien bancaire", persona: "Un·e recruteur·se en banque", icon: "Landmark",
    intro: "Je joue le recruteur d'une banque. Contexte plus formel, questions plus techniques.",
    questions: [
      "Pourquoi le secteur bancaire vous intéresse-t-il ?",
      "Comment réagissez-vous face à la pression et aux objectifs chiffrés ?",
      "Parlez-moi d'une situation où vous avez dû convaincre quelqu'un malgré son scepticisme.",
      "Où vous voyez-vous dans cinq ans dans ce secteur ?",
    ],
    llmPersona: "Tu joues un recruteur du secteur bancaire, formel, précis, qui teste la rigueur et la résistance au stress du candidat.",
  },
  {
    id: "sim-commercial", title: "Entretien commercial", persona: "Un·e responsable commercial·e", icon: "Handshake",
    intro: "Je joue le responsable commercial qui recrute. Il veut voir si tu sais vendre — y compris toi-même.",
    questions: [
      "Vendez-moi ce stylo.",
      "Racontez-moi votre plus grosse vente ou votre plus grande réussite personnelle.",
      "Comment gérez-vous un client qui vous dit non ?",
      "Quel est votre objectif de chiffre d'affaires idéal, et pourquoi ?",
    ],
    llmPersona: "Tu joues un directeur commercial exigeant qui teste le sens du closing et l'aisance à l'oral du candidat.",
  },
  {
    id: "sim-client-difficile", title: "Client difficile", persona: "Un client mécontent", icon: "Frown",
    intro: "Je joue un client mécontent. Garde ton calme et trouve une solution.",
    questions: [
      "Votre produit ne fonctionne pas comme prévu, et c'est la deuxième fois ce mois-ci !",
      "Vous vous rendez compte du temps que je perds à cause de vous ?",
      "Qu'est-ce que vous comptez faire, concrètement, pour rattraper ça ?",
      "Et qu'est-ce qui me garantit que ça ne se reproduira plus ?",
    ],
    llmPersona: "Tu joues un client en colère mais raisonnable : tu te calmes progressivement si les réponses sont posées et concrètes, tu restes ferme si elles sont vagues.",
  },
  {
    id: "sim-negociation-salaire", title: "Négociation salariale", persona: "Un·e recruteur·se", icon: "Wallet",
    intro: "Je joue le recruteur en phase de négociation salariale.",
    questions: [
      "Quelles sont vos prétentions salariales ?",
      "Qu'est-ce qui justifie ce montant selon vous ?",
      "Notre budget est en dessous de votre demande. Que proposez-vous ?",
      "Y a-t-il d'autres éléments du package qui comptent pour vous, en dehors du salaire ?",
    ],
    llmPersona: "Tu joues un recruteur en négociation salariale : tu pousses gentiment mais fermement pour un montant plus bas, et vois si le candidat argumente avec des preuves.",
  },
  {
    id: "sim-vente", title: "Vente", persona: "Un prospect hésitant", icon: "ShoppingCart",
    intro: "Je joue un prospect intéressé mais hésitant. Découvre mon besoin, puis convaincs-moi.",
    questions: [
      "Bonjour, on m'a dit que vous aviez quelque chose qui pourrait m'intéresser. Dites-m'en plus.",
      "D'accord, mais qu'est-ce que ça change vraiment pour moi au quotidien ?",
      "C'est plus cher que ce que j'utilise actuellement. Pourquoi je changerais ?",
      "Très bien, vous m'avez presque convaincu. Qu'est-ce que vous me proposez pour qu'on avance ?",
    ],
    llmPersona: "Tu joues un prospect B2C hésitant et pragmatique. Tu deviens plus réceptif si le vendeur pose de bonnes questions et prouve la valeur avant de parler prix.",
  },
  {
    id: "sim-reunion", title: "Réunion d'équipe", persona: "Plusieurs collègues", icon: "Users",
    intro: "Je joue tour à tour plusieurs collègues en réunion. Défends ta proposition face à leurs remarques.",
    questions: [
      "OK, on t'écoute, présente ta proposition.",
      "Marie : « Ça va nous coûter du temps qu'on n'a pas, non ? »",
      "Karim : « Pourquoi pas continuer comme on fait déjà, ça marche non ? »",
      "Marie : « Et si ça ne marche pas, on fait quoi ? »",
    ],
    llmPersona: "Tu joues plusieurs collègues différents en réunion (nomme-les), sceptiques mais de bonne foi, qui challengent la proposition de l'utilisateur avec des objections réalistes de contexte professionnel.",
  },
  {
    id: "sim-jury", title: "Devant un jury", persona: "Un jury exigeant", icon: "Gavel",
    intro: "Je joue le jury (grand oral, oral universitaire, soutenance). Présente, puis réponds aux questions.",
    questions: [
      "Présentez votre sujet en deux minutes.",
      "Quelle est la limite principale de votre approche ?",
      "Comment répondez-vous à quelqu'un qui ne serait pas d'accord avec votre conclusion ?",
      "Si vous deviez résumer en une phrase ce qu'il faut retenir, ce serait quoi ?",
    ],
    llmPersona: "Tu joues un jury académique exigeant mais juste : tu poses des questions précises qui testent la maîtrise du sujet et la capacité à synthétiser.",
  },
  {
    id: "sim-networking", title: "Networking", persona: "Une personne inconnue", icon: "UserPlus",
    intro: "Je joue une personne que tu croises lors d'un événement professionnel. Engage la conversation.",
    questions: [
      "Bonjour, je ne crois pas qu'on se soit déjà parlé. Qu'est-ce qui vous amène ici ?",
      "Intéressant. Et concrètement, vous faites quoi dans votre travail ?",
      "Ah, et vous cherchez à rencontrer qui, ce soir ?",
      "On devrait rester en contact. Vous avez une carte, ou je vous ajoute où ?",
    ],
    llmPersona: "Tu joues une personne inconnue lors d'un événement de networking, curieuse et avenante, qui pose des questions naturelles et se souvient de ce qui a été dit.",
  },
  {
    id: "sim-conflit", title: "Situation conflictuelle", persona: "Un interlocuteur en désaccord", icon: "AlertTriangle",
    intro: "Je joue quelqu'un en désaccord avec toi. Reste factuel et cherche un terrain d'entente.",
    questions: [
      "Je ne suis vraiment pas d'accord avec ta décision, et je pense que tu le sais.",
      "Tu ne m'as même pas consulté avant. Ça pose un problème de confiance, non ?",
      "Bon. Qu'est-ce que tu proposes pour qu'on avance, concrètement ?",
    ],
    llmPersona: "Tu joues un interlocuteur en désaccord, ferme mais pas malhonnête, qui se calme si l'utilisateur reste factuel et cherche un compromis réel.",
  },
];

export function getSimulation(id: string): Simulation | undefined {
  return SIMULATIONS.find((s) => s.id === id);
}
