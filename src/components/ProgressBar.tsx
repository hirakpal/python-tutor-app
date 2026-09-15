interface ProgressBarProps {
  value: number
  label?: string
  tone?: 'accent' | 'success' | 'info'
}

const toneClasses = {
  accent: 'from-accent to-yellow-300',
  success: 'from-beginner to-emerald-300',
  info: 'from-average to-cyan-300',
}

export function ProgressBar({ value, label, tone = 'accent' }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      {label ? <div className="flex items-center justify-between text-sm text-slate-300"><span>{label}</span><span>{value}%</span></div> : null}
      <div className="h-3 overflow-hidden rounded-full bg-slate-800/90">
        <div className={`h-full rounded-full bg-gradient-to-r ${toneClasses[tone]} transition-all duration-500`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  )
}
