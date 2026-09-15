import { ACHIEVEMENTS } from '../utils/constants'
import { curriculum, getModuleProgress } from '../utils/curriculum'
import { ProgressBar } from '../components/ProgressBar'
import type { ProgressState } from '../types'

interface AnalyticsProps {
  progress: ProgressState
}

export default function Analytics({ progress }: AnalyticsProps) {
  const dailyEntries = Object.values(progress.dailyActivity).sort((left, right) => left.date.localeCompare(right.date)).slice(-30)
  const highestDailyXp = dailyEntries.reduce((max, entry) => Math.max(max, entry.xp), 0)
  const fastestLesson = Object.values(progress.lessonAttempts)
    .filter((attempt) => attempt.completed)
    .reduce((best, attempt) => Math.min(best, attempt.timeSpentMinutes || Infinity), Infinity)

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'python-tutor-progress.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-glow">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-accent">Analytics dashboard</p>
          <h2 className="mt-3 text-4xl font-black text-white">Your Python momentum, visualized.</h2>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={exportJson} className="rounded-full border border-white/10 px-5 py-3 font-semibold text-white">Export JSON</button>
          <button type="button" onClick={() => window.print()} className="rounded-full bg-accent px-5 py-3 font-semibold text-slate-950">Export PDF</button>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.5rem] bg-slate-900/70 p-5"><p className="text-slate-500">Total lessons</p><p className="mt-2 text-3xl font-bold text-white">{progress.completedLessonIds.length}/52</p></div>
        <div className="rounded-[1.5rem] bg-slate-900/70 p-5"><p className="text-slate-500">Average lesson time</p><p className="mt-2 text-3xl font-bold text-white">{progress.completedLessonIds.length ? Math.round(progress.totalMinutes / progress.completedLessonIds.length) : 0} min</p></div>
        <div className="rounded-[1.5rem] bg-slate-900/70 p-5"><p className="text-slate-500">Fastest lesson</p><p className="mt-2 text-3xl font-bold text-white">{fastestLesson === Infinity ? 0 : fastestLesson} min</p></div>
        <div className="rounded-[1.5rem] bg-slate-900/70 p-5"><p className="text-slate-500">Highest daily XP</p><p className="mt-2 text-3xl font-bold text-white">{highestDailyXp}</p></div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
          <h3 className="text-2xl font-bold text-white">Progress by chapter</h3>
          <div className="mt-5 space-y-4">
            {curriculum.map((moduleItem) => {
              const { percentage } = getModuleProgress(moduleItem, progress.completedLessonIds)
              return <ProgressBar key={moduleItem.id} value={percentage} label={moduleItem.title} tone={percentage === 100 ? 'success' : 'info'} />
            })}
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
          <h3 className="text-2xl font-bold text-white">Weekly activity heatmap</h3>
          <div className="mt-5 grid grid-cols-5 gap-3">
            {Array.from({ length: 10 }, (_, index) => dailyEntries[index] ?? null).map((entry, index) => (
              <div key={entry?.date ?? index} className="rounded-2xl bg-slate-950/70 p-4 text-center">
                <div className={`mx-auto mb-3 h-12 w-12 rounded-2xl ${entry ? 'bg-accent/40' : 'bg-white/5'}`} />
                <p className="text-xs text-slate-400">{entry?.date?.slice(5) ?? '--'}</p>
                <p className="text-sm text-white">{entry?.lessons ?? 0} lessons</p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-950/70 p-4"><p className="text-slate-500">Current streak</p><p className="mt-2 text-2xl font-bold text-white">🔥 {progress.streak}</p></div>
            <div className="rounded-2xl bg-slate-950/70 p-4"><p className="text-slate-500">Time-of-day pattern</p><p className="mt-2 text-sm text-slate-200">Night Owl unlock watches for sessions after 10 PM.</p></div>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
        <h3 className="text-2xl font-bold text-white">Achievement radar</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-3 xl:grid-cols-5">
          {ACHIEVEMENTS.map((achievement) => {
            const unlocked = progress.badges.some((badge) => badge.id === achievement.id)
            return (
              <div key={achievement.id} className={`rounded-2xl border p-4 ${unlocked ? 'border-accent/40 bg-accent/10' : 'border-white/10 bg-slate-950/70'}`}>
                <div className="text-3xl">{achievement.icon}</div>
                <h4 className="mt-3 font-semibold text-white">{achievement.title}</h4>
                <p className="mt-2 text-sm text-slate-300">{achievement.description}</p>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}
