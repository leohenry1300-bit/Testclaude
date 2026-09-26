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

/** Words that signal a counter-argument / nuance was considered. */
export const COUNTER_ARGUMENT_MARKERS = [
  "cependant", "pourtant", "néanmoins", "certes", "toutefois", "on pourrait objecter",
  "on pourrait penser que", "à l'inverse", "au contraire", "mais il faut aussi",
  "malgré tout", "en revanche", "il est vrai que", "on pourrait me dire",
];

/** Words that signal a concrete example was given. */
export const EXAMPLE_MARKERS = [
  "par exemple", "prenons le cas", "on peut citer", "comme le montre", "à titre d'exemple",
  "un exemple concret", "j'ai vécu", "j'ai déjà vu", "je pense notamment à", "prends le cas de",
];

/** Persuasion / call-to-action markers (pitch, vente, négociation). */
export const CTA_MARKERS = [
  "je vous propose", "je te propose", "essayez", "essaie", "imaginez", "imagine",
  "vous gagnerez", "tu gagneras", "ça vous permettra", "ça te permettra", "faites-moi confiance",
  "je peux vous garantir", "n'attendez plus", "commençons", "on commence quand",
];

/** Common oral French slips. Deliberately conservative: only patterns that
 * are near-universally considered mistakes, to avoid false positives. */
export interface GrammarPattern {
  regex: RegExp;
  label: string;
  fix: string;
}

export const GRAMMAR_PATTERNS: GrammarPattern[] = [
  { regex: /\bmalgr[ée] que\b/gi, label: "« malgré que »", fix: "« bien que » ou « malgré le fait que » (suivi du subjonctif)." },
  { regex: /\bau jour d'aujourd'hui\b/gi, label: "« au jour d'aujourd'hui »", fix: "« aujourd'hui » suffit, la formule est redondante." },
  { regex: /\bsi j'aurais\b/gi, label: "« si j'aurais »", fix: "« si j'avais » — pas de conditionnel après « si »." },
  { regex: /\bau final\b/gi, label: "« au final »", fix: "« finalement » ou « en définitive »." },
  { regex: /\bpallier à\b/gi, label: "« pallier à »", fix: "« pallier » se construit sans préposition : « pallier un problème »." },
  { regex: /\baprès qu'il (?:soit|ait|vienne|parte)\b/gi, label: "« après que » + subjonctif", fix: "« après que » se construit avec l'indicatif : « après qu'il est venu »." },
  { regex: /\bce que je m'en rappelle\b/gi, label: "« ce que je m'en rappelle »", fix: "« ce dont je me rappelle » ou « ce que je m'en souviens »." },
  { regex: /\bl'opportunité de\b.{0,20}\bpour\b/gi, label: "« opportunité… pour »", fix: "« opportunité de » suffit, sans « pour »." },
  { regex: /\bsuite à\b/gi, label: "« suite à »", fix: "à l'oral formel, « à la suite de » ou « en raison de » est plus précis." },
  { regex: /\bpar contre\b/gi, label: "« par contre »", fix: "correct à l'oral courant, mais « en revanche » est plus soutenu en contexte pro." },
  { regex: /\bavoir affaire à\b.{0,10}\bde\b/gi, label: "« avoir affaire à de »", fix: "« avoir affaire à » se construit sans « de »." },
  { regex: /\bquoiqu'il en soit\b/gi, label: "« quoiqu'il en soit »", fix: "« quoi qu'il en soit » (deux mots, pronom relatif)." },
];

export const STOPWORDS = new Set(
  `a à au aux avec ce ces c' ça cela celle celui cet cette d' dans de des du elle elles en et est été être eu il ils j' je l' la le les leur leurs lui m' ma mais me même mes moi mon n' ne ni nos notre nous on ou où par pas pour qu' que qui s' sa sans se ses si son sont sur t' ta te tes toi ton tu un une vos votre vous y ai as avons avez ont suis es sommes êtes était étais avait avais fait faire plus très bien aussi comme tout tous toute toutes donc alors quand quoi dont là ici c est ça va vais veux peut peux faut chose choses autre autres quelque quelques beaucoup trop encore déjà vraiment juste parce entre après avant depuis pendant chez vers sous sur non oui ok`
    .split(/\s+/),
);
