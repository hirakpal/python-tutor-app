import { Link, NavLink } from 'react-router-dom'
import { XPBadge } from './XPBadge'

interface HeaderProps {
  username: string
  avatar: string
  levelName: string
  xp: number
  levelPercent: number
  remainingXp: number
}

export function Header({ username, avatar, levelName, xp, levelPercent, remainingXp }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 text-white no-underline">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/20 text-2xl">🐍</span>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Python Tutor Premium</p>
                <h1 className="text-xl font-bold">PyPython Academy</h1>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
            <span className="text-2xl">{avatar}</span>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Learner</p>
              <p className="font-semibold text-white">{username}</p>
            </div>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_320px] lg:items-start">
          <nav className="flex flex-wrap gap-2">
            {[
              ['/', 'Home'],
              ['/analytics', 'Analytics'],
              ['/profile', 'Profile'],
            ].map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded-full border px-4 py-2 text-sm font-medium no-underline ${
                    isActive ? 'border-accent/40 bg-accent/10 text-accent' : 'border-white/10 bg-slate-900/40 text-slate-200 hover:border-accent/30 hover:text-white'
                  }`
                }
                end={to === '/'}
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <XPBadge levelName={levelName} xp={xp} percent={levelPercent} remainingXp={remainingXp} />
        </div>
      </div>
    </header>
  )
}
