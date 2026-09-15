import { ACHIEVEMENTS } from '../utils/constants'

interface AchievementBadgeProps {
  badgeId: string
  unlockedAt?: string
}

export function AchievementBadge({ badgeId, unlockedAt }: AchievementBadgeProps) {
  const badge = ACHIEVEMENTS.find((entry) => entry.id === badgeId)
  if (!badge) return null

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
      <div className="mb-2 text-3xl">{badge.icon}</div>
      <h4 className="font-semibold text-white">{badge.title}</h4>
      <p className="text-sm text-slate-300">{badge.description}</p>
      {unlockedAt ? <p className="mt-2 text-xs text-slate-500">Unlocked {new Date(unlockedAt).toLocaleDateString()}</p> : null}
    </div>
  )
}
