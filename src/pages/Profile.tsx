import { useMemo } from 'react'
import { AchievementBadge } from '../components/AchievementBadge'
import { ProgressBar } from '../components/ProgressBar'
import type { Difficulty, ProgressState, UserProfile } from '../types'

interface ProfileProps {
  progress: ProgressState
  profile: UserProfile
  updateDifficulty: (difficulty: Difficulty) => void
  updateNotifications: (enabled: boolean) => void
}

export default function Profile({ progress, profile, updateDifficulty, updateNotifications }: ProfileProps) {
  const activity = useMemo(() => Object.values(progress.dailyActivity).sort((left, right) => left.date.localeCompare(right.date)).slice(-30), [progress.dailyActivity])

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify({ profile, progress }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'python-tutor-profile.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const shareProgress = async () => {
    const message = `I have completed ${progress.completedLessonIds.length} Python Tutor lessons and kept a ${progress.streak}-day streak!`
    if (navigator.share) {
      await navigator.share({ title: 'PyPython Academy', text: message })
      return
    }
    await navigator.clipboard.writeText(message)
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-glow">
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-20 place-items-center rounded-[2rem] bg-accent/15 text-4xl">{profile.avatar}</div>
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Learner profile</p>
              <h2 className="mt-2 text-3xl font-black text-white">{profile.username}</h2>
              <p className="mt-2 text-slate-300">Current streak: 🔥 {progress.streak} • Total study time: {progress.totalMinutes} minutes</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-950/70 p-4"><p className="text-slate-500">Lessons</p><p className="mt-2 text-2xl font-bold text-white">{progress.completedLessonIds.length}</p></div>
            <div className="rounded-2xl bg-slate-950/70 p-4"><p className="text-slate-500">Hints used</p><p className="mt-2 text-2xl font-bold text-white">{progress.hintCount}</p></div>
            <div className="rounded-2xl bg-slate-950/70 p-4"><p className="text-slate-500">Freeze pass</p><p className="mt-2 text-2xl font-bold text-white">{progress.streakFreezes}</p></div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={downloadJson} className="rounded-full border border-white/10 px-5 py-3 font-semibold text-white">Download JSON</button>
            <button type="button" onClick={() => window.print()} className="rounded-full border border-white/10 px-5 py-3 font-semibold text-white">Download PDF report</button>
            <button type="button" onClick={() => void shareProgress()} className="rounded-full bg-accent px-5 py-3 font-semibold text-slate-950">Share progress</button>
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-accent">Activity graph</p>
          <h3 className="mt-3 text-3xl font-black text-white">Last 30 days</h3>
          <div className="mt-6 grid grid-cols-6 gap-3">
            {Array.from({ length: 30 }, (_, index) => activity[index] ?? null).map((entry, index) => (
              <div key={entry?.date ?? index} className="rounded-2xl bg-slate-950/70 p-3 text-center">
                <div className="mx-auto mb-3 flex h-24 w-8 items-end rounded-full bg-white/5 p-1">
                  <div className="w-full rounded-full bg-gradient-to-t from-average to-accent" style={{ height: `${Math.min(100, (entry?.minutes ?? 0) * 4)}%` }} />
                </div>
                <p className="text-[10px] text-slate-500">{entry?.date?.slice(5) ?? '--'}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
          <h3 className="text-2xl font-bold text-white">Settings</h3>
          <div className="mt-5 space-y-5">
            <div>
              <label className="mb-2 block text-sm text-slate-400">Difficulty preference</label>
              <div className="flex flex-wrap gap-2">
                {(['Beginner', 'Average', 'Expert', 'God'] as Difficulty[]).map((difficulty) => (
                  <button key={difficulty} type="button" onClick={() => updateDifficulty(difficulty)} className={`rounded-full px-4 py-2 text-sm font-semibold ${profile.preferredDifficulty === difficulty ? 'bg-accent text-slate-950' : 'border border-white/10 text-white'}`}>
                    {difficulty}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-400">Notifications</label>
              <button type="button" onClick={() => updateNotifications(!profile.notifications)} className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white">
                {profile.notifications ? 'Notifications enabled' : 'Notifications disabled'}
              </button>
            </div>
            <div>
              <p className="text-sm text-slate-400">Theme</p>
              <p className="mt-2 rounded-2xl bg-slate-950/70 p-4 text-sm text-slate-200">Dark premium mode is active for comfortable study sessions.</p>
            </div>
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
          <h3 className="text-2xl font-bold text-white">Recent achievements</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {progress.badges.length ? progress.badges.map((badge) => <AchievementBadge key={badge.id} badgeId={badge.id} unlockedAt={badge.unlockedAt} />) : <p className="text-slate-300">Complete your first lesson to unlock badges here.</p>}
          </div>
          <div className="mt-6">
            <ProgressBar value={Math.round((progress.completedLessonIds.length / 52) * 100)} label="Road to Python Grandmaster" tone="success" />
          </div>
        </div>
      </section>
    </main>
  )
}
