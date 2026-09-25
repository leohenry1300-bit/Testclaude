// French lexicons used by the analysis engine. Kept separate so they can be
// tuned (or swapped for another language) without touching the scoring code.

/** Always counted as fillers, wherever they appear. */
export const FILLERS_ALWAYS: string[] = [
  "euh", "euhh", "euuh", "heu", "hum", "hmm", "mmh", "bah", "ben", "beh",
  "du coup", "en fait", "genre", "tu vois", "vous voyez", "tu sais",
  "en gros", "comment dire", "je veux dire", "j'veux dire", "disons",
];

/**
 * Legit words that become verbal tics: counted when stuck to another filler,
 * at the end of a sentence ("quoi", "voilà"), or when over-used.
 */
export const FILLERS_CONTEXTUAL: string[] = ["donc", "voilà", "quoi", "bon", "bref", "enfin", "alors", "ouais"];

/** Words that are pure hesitation sounds (weigh on fluency). */
export const HESITATION_SOUNDS = new Set(["euh", "euhh", "euuh", "heu", "hum", "hmm", "mmh", "bah", "ben", "beh"]);

export const HEDGES: string[] = [
  "je sais pas", "j'sais pas", "je ne sais pas", "peut-être", "un peu",
  "je crois", "en quelque sorte", "j'ai l'impression", "je dirais",
  "normalement", "plus ou moins", "si on veut", "j'espère",
];

export const VAGUE: string[] = [
  "truc", "trucs", "machin", "machins", "des choses comme ça", "et tout",
  "tout ça", "etc", "et cetera", "des trucs", "quelque chose comme ça",
];

export const CONNECTORS: string[] = [
  "tout d'abord", "d'abord", "premièrement", "deuxièmement", "troisièmement",
  "ensuite", "puis", "pour commencer", "pour conclure", "en conclusion",
  "finalement", "en résumé", "par exemple", "parce que", "car",
  "c'est pourquoi", "cependant", "pourtant", "en revanche", "d'une part",
  "d'autre part", "en effet", "ainsi", "grâce à", "c'est-à-dire",
  "premier point", "deuxième point", "dernier point", "de plus", "en plus",
  "néanmoins", "au contraire", "autrement dit", "en somme", "pour résumer",
];

export const CONCLUSION_MARKERS = ["pour conclure", "en conclusion", "finalement", "en résumé", "pour résumer", "en somme"];

export const STOPWORDS = new Set(
  `a à au aux avec ce ces c' ça cela celle celui cet cette d' dans de des du elle elles en et est été être eu il ils j' je l' la le les leur leurs lui m' ma mais me même mes moi mon n' ne ni nos notre nous on ou où par pas pour qu' que qui s' sa sans se ses si son sont sur t' ta te tes toi ton tu un une vos votre vous y ai as avons avez ont suis es sommes êtes était étais avait avais fait faire plus très bien aussi comme tout tous toute toutes donc alors quand quoi dont là ici c est ça va vais veux peut peux faut chose choses autre autres quelque quelques beaucoup trop encore déjà vraiment juste parce entre après avant depuis pendant chez vers sous sur non oui ok`
    .split(/\s+/),
);
