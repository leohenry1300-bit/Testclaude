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
  {
    id: "sim-manager", title: "Recadrage managérial", persona: "Un·e manager", icon: "Briefcase",
    intro: "Je joue ton manager, qui doit te faire un retour sur un problème récent.",
    questions: [
      "J'ai remarqué plusieurs retards ces deux dernières semaines. Qu'est-ce qui se passe ?",
      "Je comprends, mais ça a un impact sur l'équipe. Qu'est-ce que tu proposes pour que ça change ?",
      "D'accord. On se refait un point dans deux semaines pour voir où ça en est ?",
    ],
    llmPersona: "Tu joues un manager ferme mais bienveillant qui recadre poliment sur un problème concret, cherche des solutions plutôt que des excuses, et reste constructif si l'utilisateur est honnête et propose des actions concrètes.",
  },
  {
    id: "sim-appraisal", title: "Entretien annuel", persona: "Un·e manager", icon: "ClipboardCheck",
    intro: "Je joue ton manager pour ton entretien annuel d'évaluation.",
    questions: [
      "Comment évalues-tu ton année, globalement ?",
      "Quelle a été ta plus grande réussite, et ta plus grande difficulté ?",
      "Quels sont tes objectifs pour l'année prochaine ?",
      "As-tu des attentes particulières vis-à-vis de moi ou de l'entreprise ?",
    ],
    llmPersona: "Tu joues un manager qui mène un entretien annuel classique, à l'écoute mais qui pousse à la précision et aux exemples concrets plutôt qu'aux généralités.",
  },
  {
    id: "sim-media", title: "Interview presse", persona: "Un·e journaliste", icon: "MessageSquareText",
    intro: "Je joue un journaliste qui t'interviewe. Reste clair, même sous pression.",
    questions: [
      "Pouvez-vous résumer votre position en une phrase pour nos lecteurs ?",
      "Certains vous reprochent d'aller trop vite sur ce sujet. Que répondez-vous ?",
      "Concrètement, qu'est-ce que ça change pour les gens qui nous écoutent ?",
      "Un dernier mot pour conclure cet entretien ?",
    ],
    llmPersona: "Tu joues un journaliste courtois mais incisif, qui pose des questions qui poussent à la clarté et n'accepte pas les réponses évasives sans relancer.",
  },
  {
    id: "sim-service-client", title: "Réclamation téléphonique", persona: "Un client au téléphone", icon: "MessageCircleQuestion",
    intro: "Je joue un client qui t'appelle pour une réclamation. Gère l'appel du début à la fin.",
    questions: [
      "Bonjour, j'appelle parce que ma commande n'est toujours pas arrivée, ça fait dix jours.",
      "C'est inadmissible, j'ai déjà payé. Qu'est-ce que vous allez faire ?",
      "Bon, et vous me garantissez que ça sera réglé quand exactement ?",
    ],
    llmPersona: "Tu joues un client au téléphone, agacé au début, qui se détend si l'utilisateur reste calme, précis et propose un délai concret.",
  },
  {
    id: "sim-colocataire", title: "Conversation entre colocataires", persona: "Un·e colocataire", icon: "Users",
    intro: "Je joue ton colocataire. On doit régler un désaccord sur la vie commune.",
    questions: [
      "On doit parler du ménage, ça devient n'importe quoi.",
      "Je sens que je fais toujours plus que toi, tu ne trouves pas que c'est injuste ?",
      "OK, qu'est-ce qu'on met en place concrètement pour que ça change ?",
    ],
    llmPersona: "Tu joues un colocataire agacé mais pas hostile, qui cherche un vrai compromis pratique plutôt qu'un simple mea culpa.",
  },
  {
    id: "sim-professeur", title: "Face à un professeur", persona: "Un·e professeur·e", icon: "GraduationCap",
    intro: "Je joue un professeur. Défends ton travail ou ton point de vue.",
    questions: [
      "Vous avez rendu ce travail en retard, pouvez-vous m'expliquer pourquoi ?",
      "Votre note ne reflète pas vos capacités habituelles. Que s'est-il passé ?",
      "Qu'allez-vous mettre en place pour la prochaine fois ?",
    ],
    llmPersona: "Tu joues un professeur exigeant mais juste, qui veut comprendre la situation avant de juger, et valorise les élèves qui prennent leurs responsabilités.",
  },
  {
    id: "sim-investisseur", title: "Face à un investisseur", persona: "Un·e investisseur·se", icon: "TrendingUp",
    intro: "Je joue un investisseur potentiel. Pitch ton projet et réponds à mes questions difficiles.",
    questions: [
      "Présentez-moi votre projet en deux minutes.",
      "Quel est votre modèle économique, concrètement ?",
      "Qu'est-ce qui vous différencie de vos concurrents ?",
      "Pourquoi je devrais vous faire confiance avec mon argent plutôt qu'à un autre projet ?",
    ],
    llmPersona: "Tu joues un investisseur pragmatique et sceptique par défaut, qui challenge le modèle économique et la crédibilité de l'équipe, et devient plus réceptif face à des réponses chiffrées et concrètes.",
  },
  {
    id: "sim-douane", title: "Contrôle ou administration", persona: "Un agent administratif", icon: "ShieldAlert",
    intro: "Je joue un agent administratif à qui tu dois expliquer ta situation clairement.",
    questions: [
      "Pouvez-vous m'expliquer votre situation en quelques mots ?",
      "Avez-vous les justificatifs nécessaires pour appuyer votre demande ?",
      "Et si ce document manque, comment comptez-vous procéder ?",
    ],
    llmPersona: "Tu joues un agent administratif neutre et procédurier, qui demande de la précision et des justificatifs, sans hostilité mais sans complaisance.",
  },
  {
    id: "sim-blind-date", title: "Premier rendez-vous", persona: "Une personne que tu rencontres", icon: "UserPlus",
    intro: "Je joue une personne que tu rencontres pour la première fois. Fais connaissance naturellement.",
    questions: [
      "Alors, parle-moi un peu de toi, qu'est-ce qui te définit ?",
      "Qu'est-ce que tu aimes faire de ton temps libre ?",
      "Et qu'est-ce que tu recherches en ce moment, dans la vie en général ?",
    ],
    llmPersona: "Tu joues une personne curieuse et détendue lors d'un premier rendez-vous, qui pose des questions naturelles et réagit avec authenticité, sans jamais être artificielle.",
  },
  {
    id: "sim-jury-concours", title: "Oral de concours", persona: "Un jury de concours", icon: "Gavel",
    intro: "Je joue un jury de concours. Réponds avec méthode, même sous pression.",
    questions: [
      "Pourquoi avez-vous choisi de vous présenter à ce concours ?",
      "Quelle actualité récente vous a marqué, et pourquoi ?",
      "Si vous étiez face à une décision impopulaire mais nécessaire, comment agiriez-vous ?",
      "Avez-vous des questions pour le jury ?",
    ],
    llmPersona: "Tu joues un jury de concours administratif exigeant, qui teste la méthode, le sang-froid et la culture générale du candidat.",
  },
  {
    id: "sim-fournisseur", title: "Négociation fournisseur", persona: "Un·e fournisseur·se", icon: "Handshake",
    intro: "Je joue un fournisseur avec qui tu dois négocier des conditions.",
    questions: [
      "Nos tarifs sont fixes, je ne vois pas ce qu'on peut faire de plus.",
      "Si je baisse le prix, il faudra revoir les volumes ou les délais. Qu'en pensez-vous ?",
      "Qu'est-ce que vous pouvez m'offrir en échange d'un effort de ma part ?",
    ],
    llmPersona: "Tu joues un fournisseur pragmatique, ni hostile ni complaisant, qui cherche un accord gagnant-gagnant si l'utilisateur propose une vraie contrepartie.",
  },
  {
    id: "sim-parent", title: "Conversation familiale difficile", persona: "Un membre de ta famille", icon: "Users",
    intro: "Je joue un proche avec qui tu dois avoir une conversation délicate.",
    questions: [
      "Je voulais qu'on parle de ce qui s'est passé la dernière fois.",
      "Je ne suis pas sûr de comprendre ton point de vue, tu peux m'expliquer ?",
      "Qu'est-ce que tu attends de moi, concrètement, pour qu'on avance ?",
    ],
    llmPersona: "Tu joues un proche blessé mais aimant, qui cherche sincèrement à comprendre et à se réconcilier si l'utilisateur fait preuve d'écoute et de sincérité.",
  },
];

export function getSimulation(id: string): Simulation | undefined {
  return SIMULATIONS.find((s) => s.id === id);
}
