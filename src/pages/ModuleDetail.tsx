import { Link, useParams } from 'react-router-dom'
import { DIFFICULTY_COLORS } from '../utils/constants'
import { findNextLesson, getModuleProgress } from '../utils/curriculum'
import type { Difficulty, Module, ProgressState } from '../types'

interface ModuleDetailProps {
  modules: Module[]
  progress: ProgressState
  preferredDifficulty: Difficulty
}

export default function ModuleDetail({ modules, progress, preferredDifficulty }: ModuleDetailProps) {
  const { moduleId } = useParams()
  const moduleItem = modules.find((moduleCandidate) => moduleCandidate.id === moduleId) ?? null

  if (!moduleItem) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center lg:px-6">
        <h2 className="text-3xl font-bold text-white">Module not found</h2>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-accent px-5 py-3 font-semibold text-slate-950 no-underline">Back to dashboard</Link>
      </div>
    )
  }

  const progressSummary = getModuleProgress(moduleItem, progress.completedLessonIds)
  const nextLesson = findNextLesson(moduleItem.id, progress.completedLessonIds)

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
      <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-glow">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-accent">Chapter {moduleItem.chapter}</p>
            <h2 className="mt-3 text-4xl font-black text-white">{moduleItem.icon} {moduleItem.title}</h2>
            <p className="mt-4 max-w-3xl text-slate-300">{moduleItem.description}</p>
          </div>
          <div className="space-y-3 text-right">
            <span className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${DIFFICULTY_COLORS[preferredDifficulty]}`}>{preferredDifficulty} flow active</span>
            <p className="text-sm text-slate-400">{progressSummary.completed}/{moduleItem.lessons.length} lessons complete</p>
            <Link to={nextLesson ? `/lesson/${moduleItem.id}/${nextLesson.id}` : '/'} className="inline-flex rounded-full bg-accent px-5 py-3 font-semibold text-slate-950 no-underline">{nextLesson ? 'Continue module' : 'Review dashboard'}</Link>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {moduleItem.learningObjectives.map((objective) => (
            <div key={objective} className="rounded-2xl bg-slate-800/70 p-4 text-sm text-slate-200">✅ {objective}</div>
          ))}
        </div>
      </section>

      <section className="mt-8 space-y-4">
        {moduleItem.lessons.map((lesson, index) => {
          const attempt = progress.lessonAttempts[lesson.id]
          const done = progress.completedLessonIds.includes(lesson.id)
          return (
            <div key={lesson.id} className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Lesson {index + 1}</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{lesson.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{lesson.summary}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                  <span>{done ? '✓ Completed' : attempt ? '⏳ In progress' : '○ Not started'}</span>
                  <span className={`rounded-full border px-3 py-1 font-semibold ${DIFFICULTY_COLORS[lesson.difficulty]}`}>{lesson.difficulty}</span>
                  <span>{lesson.estimatedMinutes} min</span>
                  <span>{attempt?.lastVisited ? new Date(attempt.lastVisited).toLocaleString() : 'Never opened'}</span>
                  <Link to={`/lesson/${moduleItem.id}/${lesson.id}`} className="rounded-full bg-white/10 px-4 py-2 font-semibold text-white no-underline hover:bg-accent/20">{done ? 'Review' : 'Start lesson'}</Link>
                </div>
              </div>
            </div>
          )
        })}
      </section>

      <div className="mt-8">
        <Link to="/" className="rounded-full border border-white/10 px-5 py-3 font-semibold text-white no-underline hover:border-accent/30">Back to dashboard</Link>
      </div>
    </main>
  )
}
