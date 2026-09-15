import { motion } from 'framer-motion'
import { BuddyChat } from './BuddyChat'
import type { BuddyMood } from '../../types'

interface BuddyCharacterProps {
  mood: BuddyMood
  message: string
  compact?: boolean
}

const moodFace: Record<BuddyMood, { eyeY: number; mouth: string }> = {
  happy: { eyeY: 0, mouth: 'M42 70c8 8 28 8 36 0' },
  thinking: { eyeY: -2, mouth: 'M44 72c7-4 20-4 28 0' },
  celebrating: { eyeY: -3, mouth: 'M40 68c8 12 32 12 40 0' },
  sad: { eyeY: 2, mouth: 'M42 76c7-8 27-8 34 0' },
  encouraging: { eyeY: 1, mouth: 'M42 71c9 6 25 6 34 0' },
}

export function BuddyCharacter({ mood, message, compact = false }: BuddyCharacterProps) {
  const face = moodFace[mood]

  return (
    <div className="space-y-4">
      <motion.div
        className="mx-auto w-full max-w-xs rounded-[2rem] border border-white/10 bg-gradient-to-br from-emerald-500/20 to-cyan-400/10 p-5"
        animate={
          mood === 'celebrating'
            ? { y: [0, -10, 0], rotate: [0, -3, 3, 0] }
            : mood === 'thinking'
              ? { rotate: [0, -2, 2, 0] }
              : { y: [0, -4, 0] }
        }
        transition={{ duration: compact ? 1.5 : 2.2, repeat: Infinity }}
      >
        <svg viewBox="0 0 120 120" className="mx-auto w-full max-w-[220px]" role="img" aria-label="PyPython buddy mascot">
          <defs>
            <linearGradient id="snake" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#14B8A6" />
            </linearGradient>
          </defs>
          <path d="M63 18c22 0 37 14 37 31 0 9-4 17-12 23 4 5 6 11 6 18 0 13-11 22-26 22-16 0-28-10-28-23 0-8 4-15 10-20-8-6-13-14-13-24 0-15 12-27 26-27z" fill="url(#snake)" />
          <circle cx="50" cy="44" r="9" fill="white" />
          <circle cx="76" cy="44" r="9" fill="white" />
          <circle cx="52" cy={46 + face.eyeY} r="3" fill="#0F172A" />
          <circle cx="74" cy={46 + face.eyeY} r="3" fill="#0F172A" />
          <path d={face.mouth} stroke="#0F172A" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M90 84c6 5 10 10 12 15" stroke="#5EEAD4" strokeWidth="6" strokeLinecap="round" />
          <path d="M26 84c-4 4-6 8-7 12" stroke="#5EEAD4" strokeWidth="6" strokeLinecap="round" />
        </svg>
      </motion.div>
      <BuddyChat message={message} />
    </div>
  )
}
