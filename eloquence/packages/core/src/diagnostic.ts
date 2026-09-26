import type { Dimension, DiagnosticReport, DiagnosticStepResult, Level, Scores } from "./types";
import type { Exercise } from "./exercises";
import { getExercise } from "./exercises";
import { DIMENSIONS, DIMENSION_LABELS, globalScore } from "./analysis";
import { generateTopicActivity, allSubjects } from "./topics";
import { weakestDimension, strongestDimension } from "./progress";

// The initial level test: eight short, varied exercises that together give
// an honest first read on where you stand. Some are fixed catalogue
// exercises, some are generated fresh each time (improvisation, culture,
// question difficile) so the diagnostic never feels canned on a retake.

export interface DiagnosticStepDef {
  id: string;
  title: string;
  description: string;
}

export const DIAGNOSTIC_STEPS: DiagnosticStepDef[] = [
  { id: "presentation", title: "Présentation", description: "Présente-toi pendant 90 secondes." },
  { id: "improvisation", title: "Improvisation", description: "Un sujet aléatoire. Parle 60 secondes, sans préparation." },
  { id: "argumentation", title: "Argumentation", description: "Défends une position en 90 secondes." },
  { id: "explication", title: "Explication", description: "Explique un concept simplement, comme à quelqu'un qui ne le connaît pas." },
  { id: "question", title: "Question difficile", description: "Une question inattendue. Réponds du tac au tac." },
  { id: "storytelling", title: "Storytelling", description: "Raconte une expérience qui t'a marqué." },
  { id: "entretien", title: "Entretien", description: "Une question d'entretien classique." },
  { id: "culture", title: "Culture générale", description: "Une question de culture générale, au hasard." },
];

/** Resolves the actual runnable activity for a diagnostic step. */
export function diagnosticActivity(stepId: string): Exercise {
  switch (stepId) {
    case "presentation": return getExercise("entretien-90s")!;
    case "argumentation": return getExercise("debat-teletravail")!;
    case "storytelling": return getExercise("story-experience")!;
    case "entretien": return getExercise("entretien-qualite")!;
    case "improvisation": {
      const t = allSubjects("quotidien")[Math.floor(Math.random() * allSubjects("quotidien").length)];
      return generateTopicActivity(t, "opinion");
    }
    case "explication": {
      const pool = allSubjects("sciences").concat(allSubjects("technologie"));
      return generateTopicActivity(pool[Math.floor(Math.random() * pool.length)], "eli5");
    }
    case "question": {
      const pool = allSubjects("philosophie");
      return generateTopicActivity(pool[Math.floor(Math.random() * pool.length)], "opinion");
    }
    case "culture": {
      const pool = allSubjects("histoire").concat(allSubjects("geographie"), allSubjects("economie"));
      return generateTopicActivity(pool[Math.floor(Math.random() * pool.length)], "expliquer");
    }
    default: return getExercise("impro-passion")!;
  }
}

export function buildDiagnosticReport(steps: DiagnosticStepResult[], now = new Date()): DiagnosticReport {
  const avg = { global: 0 } as Scores;
  for (const d of DIMENSIONS) avg[d] = 0;
  for (const s of steps) {
    avg.global += s.scores.global;
    for (const d of DIMENSIONS) avg[d] += s.scores[d];
  }
  const n = Math.max(1, steps.length);
  avg.global = Math.round(avg.global / n);
  for (const d of DIMENSIONS) avg[d] = Math.round(avg[d] / n);

  const level: Level = avg.global >= 82 ? "tres_a_l_aise" : avg.global >= 68 ? "a_l_aise" : avg.global >= 50 ? "intermediaire" : "debutant";
  const weakest = weakestDimension(avg)!;
  const strongest = strongestDimension(avg)!;

  const LEVEL_TEXT: Record<Level, string> = {
    debutant: "Tu pars d'une base à construire — c'est le meilleur moment pour prendre de bonnes habitudes.",
    intermediaire: "Tu te débrouilles déjà bien, avec quelques réflexes à automatiser.",
    a_l_aise: "Tu es globalement à l'aise à l'oral. Le travail portera sur l'affinage.",
    tres_a_l_aise: "Très bon niveau de départ. On va chercher la précision et l'impact.",
  };

  const summary = `${LEVEL_TEXT[level]} Ton point fort actuel : ${DIMENSION_LABELS[strongest]}. Le levier prioritaire : ${DIMENSION_LABELS[weakest]}.`;

  return { completedAt: now.toISOString(), steps, averageScores: avg, level, strongest, weakest, summary };
}

export function globalFromSteps(scores: Record<Dimension, number>): number {
  return globalScore(scores);
}
