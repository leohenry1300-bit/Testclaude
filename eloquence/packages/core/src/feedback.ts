import type { Dimension, Feedback, Issue, Metrics, Scores } from "./types";

// Human, coach-like feedback generated from measured signals. Every message
// answers: what went well, what to improve, and what to do next.

const STRENGTH_LINES: Record<Dimension, (m: Metrics) => string> = {
  clarte: (m) => `Tes phrases sont nettes (${m.avgSentenceWords.toString().replace(".", ",")} mots en moyenne) : on te suit sans effort.`,
  fluidite: () => "Ton discours coule : peu d'hésitations, les idées s'enchaînent naturellement.",
  confiance: () => "Tu affirmes tes idées sans te justifier. Ça inspire confiance.",
  structure: (m) => m.connectors.length
    ? `Ta réponse est construite : on repère tes étapes grâce à « ${m.connectors.slice(0, 2).join(" », « ")} ».`
    : "Ta réponse suit une progression logique.",
  vocabulaire: () => "Ton vocabulaire est varié et précis, sans répétitions gênantes.",
  debit: (m) => `Ton rythme est agréable à écouter (${m.wpm} mots/min), ni pressé ni traînant.`,
  parasites: (m) => m.fillerCount === 0
    ? "Aucun mot parasite détecté. C'est rare, et ça s'entend."
    : "Très peu de mots parasites : ton propos reste propre.",
};

function weakLine(d: Dimension, m: Metrics, issues: Issue[]): string {
  const topFiller = issues.find((i) => i.kind === "filler");
  switch (d) {
    case "parasites":
      return topFiller
        ? `Les mots parasites prennent de la place : ${m.fillerCount} au total, dont ${topFiller.label} ${topFiller.count} fois.`
        : `Tu utilises ${m.fillerCount} mots parasites, soit ${m.fillerPer100.toString().replace(".", ",")} pour 100 mots.`;
    case "debit":
      if (m.wpm > 165) return `Tu parles vite (${m.wpm} mots/min). Ton auditoire risque de décrocher sur les idées importantes.`;
      if (m.wpm < 120) return `Ton débit est lent (${m.wpm} mots/min). Resserre un peu pour garder l'attention.`;
      return m.accelerations
        ? "Tu accélères par moments, souvent quand tu maîtrises le sujet."
        : "Ton rythme manque un peu de régularité.";
    case "clarte":
      return m.longSentences
        ? `${m.longSentences} phrase${m.longSentences > 1 ? "s sont" : " est"} trop longue${m.longSentences > 1 ? "s" : ""} : l'idée principale se perd en route.`
        : "Certaines idées restent floues. Va plus droit au but.";
    case "fluidite":
      return m.pauseCount
        ? `On sent des hésitations : ${m.pauseCount} silence${m.pauseCount > 1 ? "s" : ""} au milieu des phrases et quelques reprises.`
        : "Quelques hésitations cassent le fil de ta réponse.";
    case "confiance":
      return m.hedges
        ? `Tu nuances trop (${m.hedges} « un peu », « je crois »…). Ton message paraît moins sûr qu'il ne l'est.`
        : "Ta voix manque un peu d'assise. Pose tes fins de phrase vers le bas.";
    case "structure":
      return m.connectors.length === 0
        ? "On ne voit pas bien les étapes de ta réponse : aucun mot de liaison pour guider l'écoute."
        : "Ta réponse manque d'une conclusion claire : l'auditeur ne sait pas quand tu as fini.";
    case "vocabulaire": {
      const rep = Object.entries(m.repetitions).sort((a, b) => b[1] - a[1])[0];
      return rep
        ? `Le mot « ${rep[0]} » revient ${rep[1]} fois. Varier tes mots rendra ton propos plus vivant.`
        : "Ton vocabulaire reste assez général. Des mots plus précis donneraient du relief.";
    }
  }
}

const TIPS: Record<Dimension, string> = {
  parasites: "Quand tu sens un « euh » arriver, ferme la bouche une seconde. Le silence est invisible pour l'auditeur, le « euh » ne l'est pas.",
  debit: "Fais une courte pause après chaque idée importante. Elle laisse le temps à ton message d'arriver.",
  clarte: "Applique la règle « une phrase, une idée ». Si tu dis « et » deux fois, coupe.",
  fluidite: "Pendant que tu finis une idée, prépare la suivante en un mot-clé. Tu hésiteras moins.",
  confiance: "Termine tes phrases avec une intonation descendante : elle transforme une hypothèse en affirmation.",
  structure: "Annonce ton plan dès la première phrase : « Je vois deux raisons… ». Tu t'y tiendras plus facilement.",
  vocabulaire: "Avant de parler, choisis trois mots précis liés au sujet et place-les dans ta réponse.",
};

function retryGoal(d: Dimension, m: Metrics): string {
  switch (d) {
    case "parasites": {
      const target = Math.max(0, Math.floor(m.fillerCount * 0.7));
      return `Refais l'exercice en réduisant tes mots parasites de 30 % : vise ${target} au maximum.`;
    }
    case "debit":
      return m.wpm > 160
        ? `Refais l'exercice en visant 140 à 150 mots/min, avec une vraie pause entre chaque idée.`
        : `Refais l'exercice en gardant le même rythme du début à la fin.`;
    case "clarte":
      return "Refais l'exercice sans aucune phrase de plus de 20 mots.";
    case "fluidite":
      return "Refais l'exercice en t'autorisant les pauses, mais pas les « euh ».";
    case "confiance":
      return "Refais l'exercice sans « un peu », « je pense » ni « peut-être ».";
    case "structure":
      return "Refais l'exercice en trois temps : annonce, développement, conclusion.";
    case "vocabulaire":
      return "Refais l'exercice sans utiliser deux fois le même mot important.";
  }
}

export function buildFeedback(
  scores: Scores,
  m: Metrics,
  issues: Issue[],
  ctx: { usedRatio: number; isText: boolean; readText: boolean },
): Feedback {
  const dims = (Object.keys(scores) as (Dimension | "global")[]).filter((d): d is Dimension => d !== "global");
  const ranked = [...dims].sort((a, b) => scores[b] - scores[a]);
  // Débit can't be judged on typed answers.
  const measurable = ctx.isText ? ranked.filter((d) => d !== "debit") : ranked;
  const best = measurable.slice(0, 2);
  const worst = measurable[measurable.length - 1];

  if (m.wordCount < 8) {
    return {
      headline: "Pas assez de matière pour t'analyser.",
      strengths: "Tu as lancé l'exercice, c'est le plus dur.",
      improvements: "Ta réponse est trop courte pour qu'on mesure ta clarté ou ton rythme.",
      tip: "Commence par reformuler la question : « Ce qui me passionne, c'est… ». Le reste vient souvent tout seul.",
      retry: "Refais l'exercice en parlant au moins 30 secondes, même si ce n'est pas parfait.",
    };
  }

  const strengths = best.map((d) => STRENGTH_LINES[d](m)).join(" ");
  let improvements = weakLine(worst, m, issues);
  if (!ctx.isText && ctx.usedRatio < 0.5) {
    improvements += " Tu as aussi utilisé moins de la moitié du temps disponible : développe davantage tes idées.";
  }

  const g = scores.global;
  const headline =
    g >= 85 ? "Prestation solide. La vraie situation ne devrait plus te faire peur."
    : g >= 75 ? "Bonne base. Un ajustement et ça devient convaincant."
    : g >= 62 ? "Le fond est là. La forme peut encore gagner en aisance."
    : "Un premier jet utile. On sait maintenant quoi travailler.";

  return {
    headline,
    strengths,
    improvements,
    tip: ctx.readText && worst === "structure" ? TIPS.debit : TIPS[worst],
    retry: retryGoal(worst, m),
  };
}
