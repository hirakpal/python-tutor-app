import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ModuleCard } from '../components/ModuleCard'
import { ProgressBar } from '../components/ProgressBar'
import { BuddyCharacter } from '../components/Buddy/BuddyCharacter'
import { DIFFICULTY_COLORS } from '../utils/constants'
import { findNextLesson, getModuleProgress } from '../utils/curriculum'
import type { Difficulty, Module, ProgressState } from '../types'

interface HomeProps {
  modules: Module[]
  progress: ProgressState
  preferredDifficulty: Difficulty
  updateDifficulty: (difficulty: Difficulty) => void
  buddyMood: 'happy' | 'thinking' | 'celebrating' | 'sad' | 'encouraging'
  buddyMessage: string
}

export default function Home({ modules, progress, preferredDifficulty, updateDifficulty, buddyMood, buddyMessage }: HomeProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [difficultyFilter, setDifficultyFilter] = useState('All')
  const [sort, setSort] = useState('Progress')

  const quickStats = useMemo(() => {
    const totalLessons = modules.reduce((total, moduleItem) => total + moduleItem.lessons.length, 0)
    const completed = progress.completedLessonIds.length
    const nextAchievementGoal = completed >= 52 ? 100 : Math.round((completed / 52) * 100)
    return {
      completed,
      totalLessons,
      streak: progress.streak,
      totalMinutes: progress.totalMinutes,
      nextAchievementGoal,
    }
  }, [modules, progress])

  const visibleModules = useMemo(() => {
    const items = modules.filter((moduleItem) => {
      const { percentage } = getModuleProgress(moduleItem, progress.completedLessonIds)
      const status = percentage === 100 ? 'Completed' : percentage > 0 ? 'In Progress' : 'Not Started'
      const searchMatch = `${moduleItem.title} ${moduleItem.description}`.toLowerCase().includes(search.toLowerCase())
      const statusMatch = statusFilter === 'All' || statusFilter === status
      const difficultyMatch = difficultyFilter === 'All' || difficultyFilter === moduleItem.difficulty
      return searchMatch && statusMatch && difficultyMatch
    })

    return items.sort((left, right) => {
      const leftProgress = getModuleProgress(left, progress.completedLessonIds)
      const rightProgress = getModuleProgress(right, progress.completedLessonIds)
      if (sort === 'Alphabetical') return left.title.localeCompare(right.title)
      if (sort === 'Recently Accessed') {
        const leftVisited = Math.max(...left.lessons.map((lesson) => new Date(progress.lessonAttempts[lesson.id]?.lastVisited ?? 0).getTime()), 0)
        const rightVisited = Math.max(...right.lessons.map((lesson) => new Date(progress.lessonAttempts[lesson.id]?.lastVisited ?? 0).getTime()), 0)
        return rightVisited - leftVisited
      }
      return rightProgress.percentage - leftProgress.percentage
    })
  }, [difficultyFilter, modules, progress.completedLessonIds, progress.lessonAttempts, search, sort, statusFilter])

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-glow">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-accent">Premium dashboard</p>
              <h2 className="mt-3 text-4xl font-black text-white">Every Python tutorial chapter, gamified.</h2>
              <p className="mt-4 max-w-3xl text-slate-300">Select a module card, learn at your preferred difficulty, return home any time, and continue right where you stopped thanks to persistent progress history.</p>
            </div>
            <span className={`rounded-full border px-4 py-2 text-sm font-semibold ${DIFFICULTY_COLORS[preferredDifficulty]}`}>{preferredDifficulty} flow active</span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-slate-800/70 p-4"><p className="text-slate-500">Lessons completed</p><p className="mt-2 text-2xl font-bold text-white">{quickStats.completed}/{quickStats.totalLessons}</p></div>
            <div className="rounded-2xl bg-slate-800/70 p-4"><p className="text-slate-500">🔥 Current streak</p><p className="mt-2 text-2xl font-bold text-white">{quickStats.streak} days</p></div>
            <div className="rounded-2xl bg-slate-800/70 p-4"><p className="text-slate-500">Total learning time</p><p className="mt-2 text-2xl font-bold text-white">{quickStats.totalMinutes} min</p></div>
            <div className="rounded-2xl bg-slate-800/70 p-4"><p className="text-slate-500">Next achievement</p><ProgressBar value={quickStats.nextAchievementGoal} tone="success" /></div>
          </div>
        </motion.div>
        <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
          <BuddyCharacter mood={buddyMood} message={buddyMessage} />
        </section>
      </section>

      <section className="mt-8 rounded-[2rem] border border-white/10 bg-slate-900/70 p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {(['Beginner', 'Average', 'Expert', 'God'] as Difficulty[]).map((difficulty) => (
            <button
              key={difficulty}
              type="button"
              onClick={() => updateDifficulty(difficulty)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${preferredDifficulty === difficulty ? 'bg-accent text-slate-950' : 'border border-white/10 text-white'}`}
            >
              {difficulty}
            </button>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_repeat(3,minmax(0,220px))]">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search modules by name" className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-500" />
          <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none"><option>Progress</option><option>Recently Accessed</option><option>Alphabetical</option></select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none"><option>All</option><option>Not Started</option><option>In Progress</option><option>Completed</option></select>
          <select value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none"><option>All</option><option>Beginner</option><option>Average</option><option>Expert</option><option>God</option></select>
        </div>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {visibleModules.map((moduleItem) => {
          const { completed, percentage } = getModuleProgress(moduleItem, progress.completedLessonIds)
          const lastVisited = moduleItem.lessons
            .map((lesson) => progress.lessonAttempts[lesson.id]?.lastVisited)
            .filter(Boolean)
            .sort()
            .at(-1) ?? null
          const nextLesson = findNextLesson(moduleItem.id, progress.completedLessonIds)
          return <ModuleCard key={moduleItem.id} moduleItem={moduleItem} progressPercent={percentage} completedLessons={completed} lastVisited={lastVisited} nextLessonId={nextLesson?.id ?? null} />
        })}
      </section>
    </main>
  )
}
