import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { DIFFICULTY_COLORS } from '../utils/constants'
import { ProgressBar } from './ProgressBar'
import type { Module } from '../types'

interface ModuleCardProps {
  moduleItem: Module
  progressPercent: number
  completedLessons: number
  lastVisited: string | null
  nextLessonId: string | null
}

export function ModuleCard({ moduleItem, progressPercent, completedLessons, lastVisited, nextLessonId }: ModuleCardProps) {
  const status = progressPercent === 100 ? 'Completed' : progressPercent > 0 ? 'In Progress' : 'Not Started'

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      className="rounded-[2rem] border border-white/10 bg-slate-900/75 p-5 shadow-glow"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="mb-3 text-3xl">{moduleItem.icon}</div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Chapter {moduleItem.chapter}</p>
          <h3 className="mt-2 text-xl font-bold text-white">{moduleItem.title}</h3>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${DIFFICULTY_COLORS[moduleItem.difficulty]}`}>{moduleItem.difficulty}</span>
      </div>
      <p className="mb-4 text-sm leading-6 text-slate-300">{moduleItem.description}</p>
      <div className="mb-4 grid grid-cols-2 gap-3 text-sm text-slate-300">
        <div className="rounded-2xl bg-slate-800/70 p-3">
          <p className="text-slate-500">Lessons</p>
          <p className="mt-1 font-semibold text-white">{completedLessons}/{moduleItem.lessons.length}</p>
        </div>
        <div className="rounded-2xl bg-slate-800/70 p-3">
          <p className="text-slate-500">Est. time</p>
          <p className="mt-1 font-semibold text-white">{moduleItem.estimatedMinutes} min</p>
        </div>
      </div>
      <div className="mb-4 rounded-2xl bg-slate-800/60 p-4">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-slate-400">Status</span>
          <span className="font-semibold text-white">{status}</span>
        </div>
        <ProgressBar value={progressPercent} tone={progressPercent === 100 ? 'success' : 'info'} />
      </div>
      <div className="mb-5 flex items-center justify-between text-xs text-slate-400">
        <span>{lastVisited ? `Last visited ${new Date(lastVisited).toLocaleString()}` : 'Fresh module waiting for you'}</span>
        <span>{nextLessonId ? 'Continue available' : 'Review complete'}</span>
      </div>
      <div className="flex gap-3">
        <Link to={`/module/${moduleItem.id}`} className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white no-underline hover:border-accent/30 hover:bg-accent/10">
          Explore
        </Link>
        <Link to={nextLessonId ? `/lesson/${moduleItem.id}/${nextLessonId}` : `/module/${moduleItem.id}`} className="flex-1 rounded-2xl bg-accent px-4 py-3 text-center text-sm font-semibold text-slate-950 no-underline hover:brightness-110">
          {progressPercent > 0 ? 'Continue' : 'Start'}
        </Link>
      </div>
    </motion.article>
  )
}
