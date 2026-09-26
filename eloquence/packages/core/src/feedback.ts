import type { CategoryId, Dimension, Feedback, Issue, Metrics, QuotedExample, Scores } from "./types";

// Human, coach-like feedback generated from measured signals. Every response
// follows the same contract: at most 3 strengths, at most 3 weaknesses, a
// real quote from what was actually said, why it's a problem, a concrete
// technique to fix it, and a quantified goal for the next attempt.
// The coach is demanding, precise and never inflates a mediocre answer.

const STRENGTH_LINES: Record<Dimension, (m: Metrics) => string> = {
  clarte: (m) => `Phrases nettes (${m.avgSentenceWords.toString().replace(".", ",")} mots en moyenne) : on te suit sans effort.`,
  fluidite: () => "Peu d'hésitations : les idées s'enchaînent sans rupture de rythme.",
  confiance: () => "Tu affirmes tes idées sans les justifier à outrance. Ça inspire confiance.",
  structure: (m) => m.connectors.length
    ? `Progression lisible, portée par « ${m.connectors.slice(0, 2).join(" », « ")} ».`
    : "Une progression logique, du début à la fin.",
  vocabulaire: () => "Vocabulaire varié et précis, sans répétitions gênantes.",
  debit: (m) => `Rythme agréable (${m.wpm} mots/min), ni pressé ni traînant.`,
  parasites: (m) => m.fillerCount === 0 ? "Aucun mot parasite détecté. C'est rare." : "Très peu de mots parasites.",
  argumentation: (m) => m.exampleMarkers > 0 ? "Chaque idée s'appuie sur un exemple concret." : "Argumentation posée et suivie.",
  grammaire: () => "Aucune tournure fautive relevée.",
  persuasion: (m) => m.ctaMarkers > 0 ? "Le message pousse clairement à l'action." : "Un message net qui donne envie d'y croire.",
  concision: () => "Tu vas à l'essentiel sans tourner autour du sujet.",
};

function weakLine(d: Dimension, m: Metrics, issues: Issue[]): string {
  const topFiller = issues.find((i) => i.kind === "filler");
  switch (d) {
    case "parasites":
      return topFiller
        ? `${m.fillerCount} mots parasites au total, dont ${topFiller.label} ${topFiller.count} fois.`
        : `${m.fillerCount} mots parasites, soit ${m.fillerPer100.toString().replace(".", ",")} pour 100 mots.`;
    case "debit":
      if (m.wpm > 165) return `Débit élevé (${m.wpm} mots/min) : les idées importantes risquent de se perdre.`;
      if (m.wpm < 120) return `Débit lent (${m.wpm} mots/min) : l'attention peut décrocher.`;
      return m.accelerations ? "Des accélérations soudaines cassent le rythme." : "Le rythme manque de régularité.";
    case "clarte":
      return m.longSentences
        ? `${m.longSentences} phrase${m.longSentences > 1 ? "s" : ""} trop longue${m.longSentences > 1 ? "s" : ""} : l'idée principale s'y dilue.`
        : "Certaines formulations restent floues.";
    case "fluidite":
      return m.pauseCount ? `${m.pauseCount} silence${m.pauseCount > 1 ? "s" : ""} au milieu des phrases, révélateurs d'hésitation.` : "Des hésitations cassent le fil.";
    case "confiance":
      return m.hedges ? `${m.hedges} formule${m.hedges > 1 ? "s" : ""} d'excuse (« un peu », « je crois »…) qui affaiblissent le propos.` : "La voix manque d'assise en fin de phrase.";
    case "structure":
      return m.connectors.length === 0
        ? "Aucun mot de liaison : les étapes du raisonnement ne sont pas signalées."
        : "Pas de conclusion nette : on ne sait pas quand tu as fini.";
    case "vocabulaire": {
      const rep = Object.entries(m.repetitions).sort((a, b) => b[1] - a[1])[0];
      return rep ? `« ${rep[0]} » revient ${rep[1]} fois. Le vocabulaire manque de variété à cet endroit.` : "Vocabulaire assez général, peu de mots précis.";
    }
    case "argumentation":
      return m.exampleMarkers === 0
        ? "Aucun exemple concret pour appuyer les affirmations."
        : "Pas de nuance ni de contre-argument anticipé : l'argumentation reste à sens unique.";
    case "grammaire": {
      const g = m.grammarFlags[0];
      return g ? `${g.label} : tournure à corriger.` : "Quelques tournures orales approximatives.";
    }
    case "persuasion":
      return m.ctaMarkers === 0 ? "Aucun appel à l'action : le message informe mais ne pousse pas à agir." : "Le message manque de preuves concrètes pour convaincre.";
    case "concision":
      return `Réponse longue (${m.wordCount} mots) pour le nombre d'idées réellement développées.`;
  }
}

const TECHNIQUE_BY_CATEGORY: Partial<Record<CategoryId, string>> = {
  entretien: "Utilise la méthode STAR : Situation, Tâche, Action, Résultat. Elle structure n'importe quelle question d'entretien en 30 secondes de préparation mentale.",
  debat: "Applique le modèle de Toulmin : une thèse claire, une preuve, la règle qui relie les deux (« et c'est pourquoi… »), puis une réponse à l'objection la plus évidente.",
  storytelling: "Suis la Story Spine (structure Pixar) : « À l'origine… », « Jusqu'au jour où… », « À cause de ça… », « Et depuis… ». Elle donne une tension et une chute à n'importe quelle anecdote.",
  pitch: "Utilise le PREP : Point (ton message en une phrase), Raison, Exemple, Point (tu le répètes). C'est la structure la plus rapide pour improviser une réponse solide.",
  presentation: "Annonce ton plan en une phrase dès le début (« Je vais développer trois points… »), puis respecte cet ordre. L'auditoire retient un plan annoncé deux fois plus qu'un plan implicite.",
  pro: "Utilise le PREP : Point, Raison, Exemple, Point. Une idée, une preuve, on referme.",
};

const TIPS: Record<Dimension, string> = {
  parasites: "Quand un « euh » arrive, ferme la bouche une seconde. Le silence est invisible pour l'auditeur, le « euh » ne l'est pas. Les coachs recommandent un exercice à zéro tolérance de 60 secondes, répété plusieurs jours de suite : la plupart des gens réduisent nettement leurs tics en 2 à 4 semaines de pratique régulière.",
  debit: "Fais une courte pause après chaque idée importante. Elle laisse le temps à ton message d'arriver, et te donne une seconde pour préparer la suite.",
  clarte: "Applique la règle « une phrase, une idée ». Si tu dis « et » deux fois dans la même phrase, coupe-la en deux.",
  fluidite: "Pendant que tu finis une idée, prépare la suivante en un mot-clé. Tu hésiteras moins au moment de l'enchaîner.",
  confiance: "Termine tes phrases avec une intonation descendante : elle transforme une hypothèse en affirmation.",
  structure: "Annonce ton plan dès la première phrase : « Je vois deux raisons… ». Tu t'y tiendras plus facilement.",
  vocabulaire: "Avant de parler, choisis trois mots précis liés au sujet et place-les dans ta réponse.",
  argumentation: "Ajoute systématiquement un exemple concret après chaque affirmation, puis anticipe l'objection la plus évidente avec un « certes… mais ».",
  grammaire: "Ralentis légèrement sur les tournures que tu sais fragiles : à l'oral, le débit est souvent la cause de l'erreur, pas la connaissance de la règle.",
  persuasion: "Termine par une action précise à accomplir (« essayez », « je vous propose de… ») plutôt qu'une simple information.",
  concision: "Fixe-toi un nombre d'idées avant de parler (deux ou trois), et arrête-toi dès qu'elles sont développées.",
};

function retryGoal(d: Dimension, m: Metrics): string {
  switch (d) {
    case "parasites": {
      const target = Math.max(0, Math.floor(m.fillerCount * 0.7));
      return `Refais l'exercice en réduisant tes mots parasites de 30 % : vise ${target} au maximum.`;
    }
    case "debit":
      return m.wpm > 160 ? "Refais l'exercice en visant 140 à 150 mots/min, avec une vraie pause entre chaque idée." : "Refais l'exercice en gardant le même rythme du début à la fin.";
    case "clarte": return "Refais l'exercice sans aucune phrase de plus de 20 mots.";
    case "fluidite": return "Refais l'exercice en t'autorisant les pauses, mais pas les « euh ».";
    case "confiance": return "Refais l'exercice sans « un peu », « je pense » ni « peut-être ».";
    case "structure": return "Refais l'exercice en trois temps : annonce, développement, conclusion.";
    case "vocabulaire": return "Refais l'exercice sans utiliser deux fois le même mot important.";
    case "argumentation": return "Refais l'exercice avec un exemple concret et une objection anticipée.";
    case "grammaire": return "Refais l'exercice en ralentissant sur les tournures les plus complexes.";
    case "persuasion": return "Refais l'exercice en terminant par une action précise à accomplir.";
    case "concision": return `Refais l'exercice en moins de ${Math.max(60, Math.round(m.wordCount * 0.8))} mots.`;
  }
}

export function buildFeedback(
  scores: Scores,
  m: Metrics,
  issues: Issue[],
  example: QuotedExample | null,
  ctx: { usedRatio: number; isText: boolean; readText: boolean; category?: CategoryId },
): Feedback {
  const dims = (Object.keys(scores) as (Dimension | "global")[]).filter((d): d is Dimension => d !== "global");
  const ranked = [...dims].sort((a, b) => scores[b] - scores[a]);
  const measurable = ctx.isText ? ranked.filter((d) => d !== "debit") : ranked;
  const best = measurable.slice(0, 3).filter((d) => scores[d] >= 60);
  const worstRanked = [...measurable].reverse();
  const worst3 = worstRanked.slice(0, 3).filter((d) => scores[d] < 85);
  const worst = worst3[0] ?? worstRanked[0];

  if (m.wordCount < 8) {
    return {
      headline: "Pas assez de matière pour t'analyser.",
      strengths: ["Tu as lancé l'exercice — c'est le plus dur."],
      weaknesses: ["Ta réponse est trop courte pour qu'on mesure quoi que ce soit."],
      example: null,
      why: "Sous 8 mots, aucun signal fiable ne se dégage : ni structure, ni rythme, ni vocabulaire.",
      howToFix: "Commence par reformuler la question : « Ce qui me passionne, c'est… ». Le reste vient souvent tout seul.",
      goal: "Refais l'exercice en parlant au moins 30 secondes, même si ce n'est pas parfait.",
    };
  }

  const strengths = (best.length ? best : measurable.slice(0, 1)).map((d) => STRENGTH_LINES[d](m)).slice(0, 3);
  const weaknesses = (worst3.length ? worst3 : [worst]).map((d) => weakLine(d, m, issues)).slice(0, 3);
  if (!ctx.isText && ctx.usedRatio < 0.5 && weaknesses.length < 3) {
    weaknesses.push("Moins de la moitié du temps disponible utilisé : les idées manquent de développement.");
  }

  const g = scores.global;
  const headline =
    g >= 85 ? "Prestation solide. La vraie situation ne devrait plus te faire peur."
    : g >= 75 ? "Bonne base. Un ajustement et ça devient convaincant."
    : g >= 62 ? "Le fond est là. La forme peut encore gagner en aisance."
    : "Un premier jet utile. On sait maintenant précisément quoi travailler.";

  const technique = ctx.category ? TECHNIQUE_BY_CATEGORY[ctx.category] : undefined;
  const howToFix = technique && worst === "structure" ? technique : ctx.readText && worst === "structure" ? TIPS.debit : TIPS[worst];

  const why = exampleWhy(worst, example);

  return { headline, strengths, weaknesses, example, why, howToFix, goal: retryGoal(worst, m) };
}

function exampleWhy(worst: Dimension, example: QuotedExample | null): string {
  if (!example) {
    return "Ce point revient assez souvent dans ta réponse pour peser sur le score global : il vaut la peine d'être corrigé en priorité.";
  }
  switch (example.issue) {
    case "filler": return "Un mot parasite ne porte aucune information : il occupe la place d'un silence, qui lui, passerait pour de la réflexion.";
    case "repetition": return "Répéter le même mot appauvrit le message et donne l'impression que le vocabulaire manque, même quand ce n'est pas le cas.";
    case "long_sentence": return "Une phrase trop longue oblige l'auditeur à tenir plusieurs idées en mémoire avant d'arriver au point final : il en perd une partie.";
    case "hedge": return "Une formule d'excuse fait douter de ce que tu affirmes, même quand le contenu est juste.";
    case "vague": return "Un mot flou laisse l'auditeur remplir les blancs lui-même — souvent avec autre chose que ce que tu voulais dire.";
    case "grammar": return "Une tournure fautive détourne l'attention du message vers la forme, surtout à l'écrit ou dans un cadre formel.";
    default: return "Ce point revient assez souvent pour peser sur le score global.";
  }
}
