import type { ChallengeCategory, CompletedChallenge, RealLifeChallenge } from "./types";
import { dayKey } from "./progress";

// Real-life social challenges: unlike the in-app exercises, these are done
// away from the app, with real people, and only ever self-reported ("fait" /
// "pas fait"). The goal is different too: not measuring delivery, but
// building the habit of actually speaking up in daily life — the anxiety
// around that rarely goes away just from practising alone in an app.

export const CHALLENGE_CATEGORY_LABELS: Record<ChallengeCategory, string> = {
  contact: "Aller vers les autres",
  audace: "Sortir de ta zone de confort",
  expression: "T'exprimer davantage",
  ecoute: "Écouter et t'intéresser",
  quotidien: "Réflexes du quotidien",
};

function c(id: string, title: string, description: string, category: ChallengeCategory): RealLifeChallenge {
  return { id, title, description, category };
}

export const CHALLENGES: RealLifeChallenge[] = [
  // --- contact : aller vers les autres --------------------------------------
  c("rl-vocal3", "Envoie 3 messages vocaux", "Au lieu d'écrire, réponds à 3 messages aujourd'hui avec un vocal — même court.", "contact"),
  c("rl-inconnu", "Parle à un inconnu", "Échange quelques phrases avec quelqu'un que tu ne connais pas (caissier, voisin, livreur) au-delà du strict nécessaire.", "contact"),
  c("rl-appel", "Passe un appel plutôt qu'un texto", "Choisis un message que tu allais écrire et appelle la personne à la place.", "contact"),
  c("rl-chemin", "Demande ton chemin à voix haute", "Même avec ton GPS, demande ton chemin à quelqu'un dans la rue.", "contact"),
  c("rl-compliment", "Complimente une personne", "Fais un compliment sincère et précis à quelqu'un que tu croises aujourd'hui.", "contact"),
  c("rl-commande", "Commande à voix haute", "Passe ta commande (café, resto, boulangerie) en parlant, pas via une appli ou une borne.", "contact"),
  c("rl-collegue-inconnu", "Parle à un collègue que tu ne connais pas", "Va discuter 2 minutes avec quelqu'un de ton travail/école à qui tu n'as jamais parlé.", "contact"),
  c("rl-relance", "Recontacte quelqu'un que tu as perdu de vue", "Envoie un message ou appelle une personne que tu n'as pas contactée depuis longtemps.", "contact"),
  c("rl-file-attente", "Fais la conversation dans une file d'attente", "Engage une remarque légère avec quelqu'un pendant que tu attends (caisse, arrêt de bus...).", "contact"),
  c("rl-remercie", "Remercie quelqu'un en personne", "Va remercier oralement quelqu'un qui t'a aidé récemment, au lieu d'un simple message.", "contact"),
  c("rl-presente-toi", "Présente-toi à quelqu'un de nouveau", "Dans un contexte de groupe (cours, travail, club), va te présenter à une personne que tu ne connais pas encore.", "contact"),
  c("rl-service", "Demande un service à voix haute", "Demande un petit service (tenir la porte, un renseignement) à un inconnu, sans passer par un geste.", "contact"),
  c("rl-voisin", "Dis bonjour à un voisin", "Salue et échange une phrase avec un voisin que tu croises habituellement sans lui parler.", "contact"),
  c("rl-invite", "Invite quelqu'un à faire quelque chose", "Propose une activité (café, sortie, appel) à quelqu'un — à l'oral ou en vocal, pas en texto plat.", "contact"),

  // --- audace : sortir de ta zone de confort --------------------------------
  c("rl-non", "Dis non sans te justifier", "La prochaine fois qu'on te demande quelque chose que tu ne veux pas faire, dis non en une phrase, sans t'excuser pendant 3 minutes.", "audace"),
  c("rl-avis-groupe", "Donne ton avis dans un groupe", "Dans une conversation à plusieurs, dis clairement ce que tu penses, même si ça diffère des autres.", "audace"),
  c("rl-parle-premier", "Prends la parole en premier", "Dans une réunion ou un cours, sois la première personne à parler aujourd'hui.", "audace"),
  c("rl-question-public", "Pose une question devant le groupe", "Pose une question à voix haute pendant un cours, une réunion ou une conférence, devant tout le monde.", "audace"),
  c("rl-negocie", "Négocie quelque chose", "Négocie un prix, un délai ou une condition à voix haute, au lieu de l'accepter directement.", "audace"),
  c("rl-reclamation", "Fais une réclamation en personne", "Si un service ne va pas (commande, produit, livraison), dis-le en personne ou par téléphone plutôt que par écrit.", "audace"),
  c("rl-scene", "Chante ou parle fort dans un lieu public", "Chante à voix haute dans la rue, ou parle fort dans un lieu où tu chuchoterais d'habitude.", "audace"),
  c("rl-desaccord", "Exprime un désaccord poliment", "La prochaine fois que tu n'es pas d'accord avec quelqu'un, dis-le clairement, avec respect, au lieu d'acquiescer.", "audace"),
  c("rl-refuse-sourire", "Refuse une invitation sans mentir", "Si tu dois refuser quelque chose, donne la vraie raison au lieu d'inventer une excuse.", "audace"),
  c("rl-blague", "Raconte une blague ou une anecdote", "Raconte une histoire ou une blague à voix haute devant au moins deux personnes.", "audace"),
  c("rl-appel-inconnu", "Passe un appel professionnel", "Appelle un service, une entreprise ou une administration au téléphone plutôt que par mail ou chat.", "audace"),
  c("rl-demande-augmentation", "Amorce une discussion difficile", "Lance une conversation que tu repousses depuis longtemps (demande, mise au point, clarification).", "audace"),
  c("rl-scene-publique", "Prends la parole devant un groupe", "Porte un toast, anime un point ou prends la parole spontanément devant un groupe, même petit.", "audace"),

  // --- expression : t'exprimer davantage ------------------------------------
  c("rl-emotion", "Exprime une émotion à voix haute", "Dis clairement à quelqu'un ce que tu ressens aujourd'hui, sans minimiser.", "expression"),
  c("rl-besoin", "Exprime un besoin clairement", "Formule un besoin précis à quelqu'un (\"j'ai besoin que...\") au lieu d'espérer qu'on le devine.", "expression"),
  c("rl-recadre", "Reformule ce qu'on t'a mal compris", "Si quelqu'un te comprend de travers aujourd'hui, reformule calmement au lieu de laisser filer.", "expression"),
  c("rl-explique-passion", "Parle de ce qui te passionne", "Raconte à quelqu'un, avec enthousiasme, un sujet qui te passionne vraiment.", "expression"),
  c("rl-vocal-long", "Envoie un vocal de 2 minutes", "Raconte ta journée ou un sujet en détail dans un seul message vocal d'au moins 2 minutes.", "expression"),
  c("rl-appel-video", "Fais un appel vidéo", "Passe un appel en vidéo plutôt qu'audio ou texte, pour t'habituer à parler face caméra.", "expression"),
  c("rl-presente-idee", "Présente une idée à quelqu'un", "Explique une idée ou une proposition à voix haute à une personne, avec un vrai argumentaire.", "expression"),
  c("rl-raconte-journee", "Raconte ta journée en détail", "Le soir, raconte ta journée à quelqu'un avec des détails précis, pas juste \"ça va, RAS\".", "expression"),
  c("rl-debat-ami", "Débats avec un proche", "Choisis un sujet où vous n'êtes pas d'accord et défends ton point de vue à l'oral, sans couper court.", "expression"),
  c("rl-lis-haut", "Lis quelque chose à voix haute devant quelqu'un", "Lis un texte, un article ou un message à voix haute devant une autre personne.", "expression"),
  c("rl-improvise-histoire", "Improvise une histoire pour quelqu'un", "Invente et raconte une petite histoire à voix haute à un proche, sans préparation.", "expression"),
  c("rl-exprime-fierte", "Parle d'une réussite sans minimiser", "Raconte une réussite personnelle à quelqu'un sans la minimiser ni t'excuser de la mentionner.", "expression"),

  // --- ecoute : écouter et t'intéresser --------------------------------------
  c("rl-question-ouverte", "Pose 3 questions ouvertes", "Dans une conversation, pose 3 questions qui ne se répondent pas par oui/non, et laisse la personne développer.", "ecoute"),
  c("rl-silence", "Laisse un silence s'installer", "Dans une conversation, résiste à l'envie de combler tous les silences — laisse-en un durer.", "ecoute"),
  c("rl-reformule-ecoute", "Reformule ce qu'on te dit", "Dans une conversation, reformule ce que la personne vient de dire avant de répondre.", "ecoute"),
  c("rl-interesse-inconnu", "Intéresse-toi à un inconnu", "Pose des questions à quelqu'un que tu connais peu, sur son métier, sa passion ou son parcours.", "ecoute"),
  c("rl-feedback", "Demande un retour sincère", "Demande à quelqu'un un vrai retour honnête sur toi ou ton travail, et écoute sans te justifier.", "ecoute"),
  c("rl-ecoute-active", "Pratique l'écoute active", "Dans une discussion, concentre-toi entièrement sur l'autre sans penser à ce que tu vas répondre.", "ecoute"),
  c("rl-avis-avant", "Demande l'avis de quelqu'un avant de parler", "Avant de donner ton opinion sur un sujet, demande d'abord celle de la personne en face.", "ecoute"),

  // --- quotidien : réflexes du quotidien --------------------------------------
  c("rl-tel-plutot-texto", "Réponds au téléphone plutôt qu'en différé", "La prochaine fois que ton téléphone sonne, décroche au lieu de laisser sonner et rappeler plus tard.", "quotidien"),
  c("rl-annonce-arret", "Demande l'arrêt à voix haute", "Dans un bus/tram, demande l'arrêt ou un renseignement à voix haute au chauffeur plutôt que de regarder ton téléphone.", "quotidien"),
  c("rl-parle-repas", "Lance un sujet à table", "Au prochain repas partagé, lance un sujet de conversation au lieu d'attendre que ça vienne.", "quotidien"),
  c("rl-appel-plutot-mail", "Passe un appel au lieu d'un mail", "Pour une question simple, appelle plutôt que d'écrire un mail qui prendra 3 échanges.", "quotidien"),
  c("rl-parle-fort-repond", "Réponds sans baisser la voix", "Dans une conversation aujourd'hui, fais l'effort de garder un volume de voix clair du début à la fin.", "quotidien"),
  c("rl-regard", "Garde le contact visuel", "Dans tes échanges du jour, fais l'effort conscient de garder le regard pendant que tu parles.", "quotidien"),
  c("rl-parle-lentement", "Ralentis volontairement", "Choisis une conversation aujourd'hui et parle un cran plus lentement que d'habitude, volontairement.", "quotidien"),
  c("rl-pas-de-euh", "Traque un mot parasite en vrai", "Choisis un mot parasite (euh, du coup...) et fais l'effort de le repérer et l'éviter dans tes conversations réelles aujourd'hui.", "quotidien"),
  c("rl-annonce-toi", "Annonce-toi au téléphone", "Au prochain appel que tu passes, dis clairement qui tu es et pourquoi tu appelles, sans bafouiller.", "quotidien"),
  c("rl-parle-reunion-debut", "Ouvre une réunion ou une discussion", "Sois la personne qui lance le sujet ou ouvre la discussion aujourd'hui, plutôt que d'attendre.", "quotidien"),
  c("rl-vocal-plutot-texte", "Remplace un texte par un vocal", "La prochaine fois que tu écris un message un peu long, envoie un vocal à la place.", "quotidien"),
  c("rl-clarifie", "Demande une clarification", "Si tu n'as pas compris quelque chose aujourd'hui, demande à voix haute qu'on te réexplique, au lieu de faire semblant.", "quotidien"),
];

/** Deterministic seeded shuffle so the rotation order is stable but not
 * simply sequential — same input, same output, every device and the server
 * agree without needing to sync anything. */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let x = seed;
  const rand = () => {
    x = (x * 1103515245 + 12345) % 2147483648;
    return x / 2147483648;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const ROTATION = seededShuffle(CHALLENGES, 20260101);

/**
 * Today's real-life challenges: a small, rotating selection that cycles
 * through the whole bank before repeating (instead of picking at random,
 * which would repeat the same ones often by chance).
 */
export function dailyChallenges(date: Date, count = 3): RealLifeChallenge[] {
  const dayIndex = Math.floor(date.getTime() / 86_400_000);
  const n = ROTATION.length;
  const start = (dayIndex * count) % n;
  const out: RealLifeChallenge[] = [];
  for (let i = 0; i < count; i++) out.push(ROTATION[(start + i) % n]);
  return out;
}

export function getChallenge(id: string): RealLifeChallenge | undefined {
  return CHALLENGES.find((c) => c.id === id);
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** Consecutive-day streak of completing at least one real-life challenge,
 * same logic as the exercise streak but keyed off completion dates. */
export function realLifeStreak(completed: CompletedChallenge[], now = new Date()): { current: number; best: number } {
  const days = new Set(completed.map((c) => c.date));
  if (days.size === 0) return { current: 0, best: 0 };
  let cursor = days.has(dayKey(now)) ? now : addDays(now, -1);
  let current = 0;
  while (days.has(dayKey(cursor))) { current++; cursor = addDays(cursor, -1); }
  const sorted = [...days].sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const k of sorted) {
    if (prev && dayKey(addDays(new Date(`${prev}T12:00:00`), 1)) === k) run++;
    else run = 1;
    best = Math.max(best, run);
    prev = k;
  }
  return { current, best: Math.max(best, current) };
}
