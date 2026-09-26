// Short, practical mini-lessons, each followed by a linked exercise or game.
// Content is grounded in named, real frameworks (PREP, STAR, Toulmin, the
// Pixar Story Spine, Toastmasters delivery criteria) rather than generic
// advice — see the app's README for sources.

export interface LibraryLesson {
  id: string;
  courseId: string;
  title: string;
  body: string;
  linkedActivityId: string;
}

export interface LibraryCourse {
  id: string;
  title: string;
  icon: string;
}

export const LIBRARY_COURSES: LibraryCourse[] = [
  { id: "eloquence", title: "Éloquence", icon: "Sparkles" },
  { id: "argumentation", title: "Argumentation", icon: "Scale" },
  { id: "communication", title: "Communication", icon: "MessageCircle" },
  { id: "presentation", title: "Présentation", icon: "Presentation" },
  { id: "entretien", title: "Entretien", icon: "Briefcase" },
  { id: "vocabulaire", title: "Vocabulaire", icon: "BookOpen" },
];

export const LIBRARY_LESSONS: LibraryLesson[] = [
  // Éloquence
  { id: "elo-captiver", courseId: "eloquence", title: "Captiver dès la première phrase", linkedActivityId: "impro-passion",
    body: "Les dix premières secondes décident si on t'écoute vraiment. Évite les formules d'ouverture creuses (« Alors, aujourd'hui je vais vous parler de… »). Préfère un fait surprenant, une question directe, ou une image concrète. Exemple : au lieu de « Je vais parler du sommeil », dis « Un tiers de ta vie se passe les yeux fermés — et tu ne sais probablement pas pourquoi. »" },
  { id: "elo-intro", courseId: "eloquence", title: "Construire une introduction", linkedActivityId: "pres-sujet",
    body: "Une bonne introduction fait trois choses en moins de 20 secondes : elle capte l'attention, annonce le sujet, et annonce le plan (« Je vais voir avec vous deux choses : d'abord X, puis Y »). Annoncer le plan n'est pas scolaire, c'est un cadeau à ton auditoire : il sait où il va et peut te suivre sans effort." },
  { id: "elo-conclusion", courseId: "eloquence", title: "Faire une conclusion qui marque", linkedActivityId: "pres-sujet",
    body: "Ne termine jamais sur « Voilà, c'est tout. » Une bonne conclusion fait deux choses : elle résume en une phrase le message central, et elle ouvre sur une action ou une question. Exemple : « Retenez une chose : la régularité bat l'intensité. Alors, quelle sera votre prochaine session ? »" },
  { id: "elo-histoire", courseId: "eloquence", title: "Raconter une histoire", linkedActivityId: "story-experience",
    body: "La Story Spine, utilisée par les scénaristes de Pixar, structure n'importe quelle anecdote en sept temps : « À l'origine… », « Chaque jour… », « Jusqu'au jour où… », « À cause de ça… », « À cause de ça… », « Jusqu'à ce que finalement… », « Et depuis ce jour… ». Elle garantit un vrai enchaînement cause-conséquence, ce qui rend une histoire mémorable." },
  { id: "elo-analogie", courseId: "eloquence", title: "Utiliser une analogie", linkedActivityId: "g-eli5",
    body: "Une bonne analogie relie un concept abstrait à une expérience déjà connue de l'auditoire. « L'inflation, c'est comme un gâteau qu'on partage entre plus de convives : la part de chacun rétrécit même si le gâteau grandit un peu. » Teste toujours ton analogie sur quelqu'un qui ne connaît pas le sujet." },
  { id: "elo-metaphore", courseId: "eloquence", title: "Utiliser une métaphore", linkedActivityId: "g-eli5",
    body: "Contrairement à l'analogie (« c'est comme »), la métaphore affirme directement : « Ce projet est un marathon, pas un sprint. » Une métaphore filée sur toute une présentation (garder l'image du marathon à chaque étape) rend le discours plus facile à retenir." },

  // Argumentation
  { id: "arg-construire", courseId: "argumentation", title: "Construire un argument solide", linkedActivityId: "debat-teletravail",
    body: "Le modèle de Toulmin décompose un bon argument en trois briques essentielles : la thèse (ce que tu affirmes), la preuve (les faits, les chiffres, l'exemple), et la garantie (le lien logique entre les deux — pourquoi cette preuve soutient cette thèse). Beaucoup d'arguments faibles ont une thèse et une preuve, mais oublient d'expliciter la garantie." },
  { id: "arg-exemple", courseId: "argumentation", title: "Donner un exemple qui porte", linkedActivityId: "g-eli-expert",
    body: "Un exemple vécu (« la semaine dernière, j'ai… ») convainc plus qu'une statistique abstraite, car il est concret et vérifiable par l'auditoire. Règle simple : après chaque affirmation importante, demande-toi « et concrètement, ça ressemble à quoi ? »" },
  { id: "arg-objection", courseId: "argumentation", title: "Anticiper une objection", linkedActivityId: "g-contre-argument",
    body: "Anticiper l'objection la plus évidente («certes… mais») rend ton argument plus solide, pas plus faible : ça montre que tu as réfléchi à l'envers du décor. Structure : « Certes, [objection], mais [ta réponse], et c'est pourquoi [ta thèse tient toujours]. »" },
  { id: "arg-refuter", courseId: "argumentation", title: "Réfuter un argument", linkedActivityId: "g-contre-argument",
    body: "Pour réfuter, attaque un des trois maillons de Toulmin : la preuve est-elle fausse ou incomplète ? La garantie (le lien logique) tient-elle vraiment ? Y a-t-il une exception qui change tout ? Réfuter la personne plutôt que l'argument (« tu dis ça parce que… ») est toujours un aveu de faiblesse." },
  { id: "arg-nuancer", courseId: "argumentation", title: "Nuancer sans se contredire", linkedActivityId: "debat-ia",
    body: "Nuancer, ce n'est pas hésiter : c'est délimiter la portée de ton affirmation. « Dans la plupart des cas… sauf quand… » est plus fort que « je pense que… je ne sais pas trop… peut-être… ». La nuance précise ta position, elle ne l'affaiblit pas." },

  // Communication
  { id: "com-ecouter", courseId: "communication", title: "Écouter activement", linkedActivityId: "sim-client-difficile",
    body: "Écouter activement, c'est reformuler avant de répondre : « Si je comprends bien, ce qui vous gêne, c'est… ». Ça montre que tu as vraiment entendu, et ça évite de répondre à côté. C'est particulièrement utile face à un client mécontent ou un désaccord." },
  { id: "com-reformuler", courseId: "communication", title: "Reformuler pour clarifier", linkedActivityId: "g-reformulation",
    body: "Reformuler une idée complexe de trois façons — simple, professionnelle, imagée — t'entraîne à l'adapter à n'importe quel auditoire en temps réel. C'est l'une des compétences les plus transférables : elle sert en entretien, en réunion, en vente." },
  { id: "com-questions", courseId: "communication", title: "Poser de bonnes questions", linkedActivityId: "sim-vente",
    body: "Une bonne question ouverte (« qu'est-ce qui compte le plus pour vous là-dedans ? ») en dit plus qu'une question fermée (« vous aimez ça ? »). En vente comme en entretien, découvrir le besoin réel avant de répondre change tout." },
  { id: "com-repondre", courseId: "communication", title: "Répondre précisément", linkedActivityId: "g-question-piege",
    body: "Une réponse précise commence directement par l'information demandée, puis développe. Beaucoup de réponses orales tournent autour du sujet avant d'y arriver : entraîne-toi à donner d'abord la réponse en une phrase, puis à l'expliquer." },

  // Présentation
  { id: "pres-structure", courseId: "presentation", title: "Structurer une présentation", linkedActivityId: "pres-long",
    body: "La grille d'évaluation Toastmasters juge une présentation sur : le contenu et son organisation, la clarté de la livraison, la variété vocale, et le non-verbal. Concrètement : un plan annoncé et suivi, une voix qui varie (pas monocorde), et une gestuelle qui appuie le propos plutôt que de le distraire." },
  { id: "pres-storytelling", courseId: "presentation", title: "Storytelling en présentation", linkedActivityId: "pres-conference",
    body: "Une présentation purement informative se retient mal. En ouvrant sur une mini-histoire (un cas client, une anecdote personnelle) avant de passer aux données, tu donnes un point d'ancrage émotionnel à ton auditoire — les données s'en souviennent mieux ensuite." },
  { id: "pres-intro-longue", courseId: "presentation", title: "Une introduction qui tient la distance", linkedActivityId: "pres-conference",
    body: "Pour une présentation longue (5 minutes ou plus), l'introduction doit aussi donner une raison d'écouter jusqu'au bout : « À la fin de cette présentation, vous saurez… ». Ça crée une attente que ta conclusion viendra combler." },
  { id: "pres-conclusion-longue", courseId: "presentation", title: "Conclure une présentation longue", linkedActivityId: "pres-long",
    body: "Récapitule en trois points maximum (l'auditoire n'en retiendra pas plus), puis termine par une phrase mémorable ou une action concrète. Ne rajoute jamais d'idée nouvelle dans la conclusion : c'est le moment de refermer, pas d'ouvrir." },

  // Entretien
  { id: "ent-parler-de-soi", courseId: "entretien", title: "Parler de soi sans se survendre", linkedActivityId: "entretien-90s",
    body: "La méthode STAR (Situation, Tâche, Action, Résultat) structure n'importe quelle question sur ton expérience. Elle évite deux pièges classiques : rester trop vague (« j'ai beaucoup appris ») ou partir dans un récit sans fin. Un résultat chiffré ou concret referme toujours mieux la réponse qu'une impression générale." },
  { id: "ent-questions-difficiles", courseId: "entretien", title: "Répondre aux questions difficiles", linkedActivityId: "entretien-defaut",
    body: "Face à une question déstabilisante (« parlez-moi de votre défaut »), la meilleure réponse est honnête et orientée solution : le défaut réel, son impact concret, ce que tu fais pour le compenser. Éviter les faux défauts (« je suis trop perfectionniste ») : les recruteurs les repèrent immédiatement." },
  { id: "ent-defauts", courseId: "entretien", title: "Parler de ses défauts", linkedActivityId: "entretien-defaut",
    body: "Choisis un vrai défaut, mineur mais réel dans le contexte du poste, puis montre une action concrète mise en place pour le limiter. La structure : le défaut, un exemple où il t'a coûté quelque chose, ce que tu as changé depuis." },
  { id: "ent-qualites", courseId: "entretien", title: "Parler de ses qualités", linkedActivityId: "entretien-qualite",
    body: "Une qualité sans preuve reste une affirmation vide. Associe toujours ta qualité à une situation précise où elle a eu un impact mesurable pour l'équipe ou le projet — c'est ce qui la rend crédible plutôt que récitée." },

  // Vocabulaire
  { id: "voc-synonymes", courseId: "vocabulaire", title: "Élargir sa palette de synonymes", linkedActivityId: "g-synonymes",
    body: "Répéter le même mot cinq fois dans une réponse de 60 secondes n'est pas grave en soi — mais ça donne une impression de vocabulaire limité. Entraîne-toi à préparer mentalement deux ou trois synonymes des mots que tu utilises le plus souvent dans ton domaine." },
  { id: "voc-connecteurs", courseId: "vocabulaire", title: "Les connecteurs logiques", linkedActivityId: "pres-sujet",
    body: "Les connecteurs (« d'abord », « cependant », « c'est pourquoi », « en revanche ») sont les panneaux indicateurs de ton discours : ils signalent à l'auditoire où tu en es dans ton raisonnement. Un discours sans connecteur, même bien pensé, semble décousu à l'oral." },
  { id: "voc-expressions", courseId: "vocabulaire", title: "Des expressions plus précises", linkedActivityId: "g-reformulation",
    body: "Remplace les mots fourre-tout (« truc », « chose », « bien », « très ») par des mots précis. « C'était vraiment bien » en dit moins que « ça a doublé notre productivité » ou « ça a beaucoup rassuré l'équipe »." },
  { id: "voc-pro", courseId: "vocabulaire", title: "Le vocabulaire professionnel", linkedActivityId: "sim-reunion",
    body: "Le vocabulaire professionnel n'est pas plus compliqué, il est plus précis : « prioriser » plutôt que « faire en premier », « un livrable » plutôt que « un truc à rendre ». Utilisé à bon escient (pas en excès), il installe ta crédibilité en quelques secondes." },
];

export function lessonsByCourse(courseId: string): LibraryLesson[] {
  return LIBRARY_LESSONS.filter((l) => l.courseId === courseId);
}

export function getLesson(id: string): LibraryLesson | undefined {
  return LIBRARY_LESSONS.find((l) => l.id === id);
}
