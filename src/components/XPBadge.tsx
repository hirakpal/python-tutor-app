import { ProgressBar } from './ProgressBar'

interface XPBadgeProps {
  levelName: string
  percent: number
  xp: number
  remainingXp: number
}

export function XPBadge({ levelName, percent, xp, remainingXp }: XPBadgeProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-glow">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Current level</p>
          <h3 className="text-xl font-bold text-white">{levelName}</h3>
        </div>
        <div className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">{xp} XP</div>
      </div>
      <ProgressBar value={percent} label={remainingXp > 0 ? `${remainingXp} XP to next level` : 'Master level unlocked'} tone="accent" />
    </div>
  )
}
