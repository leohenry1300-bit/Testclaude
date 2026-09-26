import { useNavigate } from "react-router-dom";
import type { Exercise } from "@eloquence/core";
import type { ExerciseNavState } from "../pages/Exercise";

/** Launches any activity — catalogue exercise, game, generated topic,
 * diagnostic step or quick-session item — through the same runner page. */
export function useLaunchActivity() {
  const nav = useNavigate();
  return (activity: Exercise, opts: Omit<ExerciseNavState, "activity"> = {}) => {
    nav(`/exercice/${activity.id}`, { state: { activity, ...opts } satisfies ExerciseNavState });
  };
}
