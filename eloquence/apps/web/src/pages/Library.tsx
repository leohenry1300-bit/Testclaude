import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight, Mic } from "lucide-react";
import { LIBRARY_COURSES, getLesson, getExercise, getGame, buildGameActivity, lessonsByCourse } from "@eloquence/core";
import { useAccount } from "../lib/store";
import { useLaunchActivity } from "../lib/launch";
import { Icon, TopBar } from "../components/ui";

export function Library() {
  return (
    <div className="page no-nav">
      <TopBar title="Bibliothèque" />
      <p className="muted center">Des mini-cours courts et pratiques, chacun suivi d'un exercice pour passer à l'action.</p>
      <div className="cat-grid">
        {LIBRARY_COURSES.map((c) => (
          <Link key={c.id} to={`/bibliotheque/${c.id}`} className="cat-tile">
            <span className="c-ic"><Icon name={c.icon} /></span>
            <span><span className="c-title">{c.title}</span><br /><span className="c-sub">{lessonsByCourse(c.id).length} leçons</span></span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function LibraryCourse() {
  const { courseId = "" } = useParams();
  const lessons = lessonsByCourse(courseId);
  const title = LIBRARY_COURSES.find((c) => c.id === courseId)?.title ?? "Cours";
  return (
    <div className="page no-nav">
      <TopBar title={title} />
      <div className="list">
        {lessons.map((l) => (
          <Link key={l.id} to={`/bibliotheque/lecon/${l.id}`} className="list-item">
            <span className="grow li-title">{l.title}</span>
            <ChevronRight size={18} className="li-end" />
          </Link>
        ))}
      </div>
    </div>
  );
}

export function LessonDetail() {
  const { lessonId = "" } = useParams();
  const lesson = getLesson(lessonId);
  const { markLibraryRead } = useAccount();
  const launch = useLaunchActivity();

  useEffect(() => { if (lesson) void markLibraryRead(lesson.id).catch(() => undefined); }, [lesson, markLibraryRead]);

  if (!lesson) return <div className="page no-nav"><TopBar title="Leçon" /><p className="muted center">Leçon introuvable.</p></div>;

  const exercise = getExercise(lesson.linkedActivityId);
  const game = !exercise ? getGame(lesson.linkedActivityId) : undefined;

  return (
    <div className="page no-nav">
      <TopBar title="Leçon" />
      <article className="card">
        <h1 className="display" style={{ fontSize: 24, marginBottom: 14 }}>{lesson.title}</h1>
        <p style={{ lineHeight: 1.7 }}>{lesson.body}</p>
      </article>
      {exercise && (
        <button className="btn btn-primary btn-lg btn-block" onClick={() => launch(exercise, { source: "catalogue" })}><Mic size={18} />Passer à la pratique : {exercise.title}</button>
      )}
      {game && (
        <button className="btn btn-primary btn-lg btn-block" onClick={() => { const built = buildGameActivity(game); launch(built.exercise, { source: "jeu", constraint: built.constraint }); }}><Mic size={18} />Passer à la pratique : {game.title}</button>
      )}
    </div>
  );
}
