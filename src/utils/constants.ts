import type { AchievementDefinition, Difficulty } from '../types'

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Beginner: 'bg-beginner/20 text-beginner border-beginner/40',
  Average: 'bg-average/20 text-average border-average/40',
  Expert: 'bg-expert/20 text-expert border-expert/40',
  God: 'bg-god/20 text-god border-god/40',
}

export const LEVELS = [
  { name: 'Beginner', minXp: 0, maxXp: 500, color: 'text-beginner' },
  { name: 'Intermediate', minXp: 500, maxXp: 1500, color: 'text-average' },
  { name: 'Advanced', minXp: 1500, maxXp: 3000, color: 'text-cyan-300' },
  { name: 'Expert', minXp: 3000, maxXp: 5000, color: 'text-expert' },
  { name: 'Master', minXp: 5000, maxXp: Infinity, color: 'text-accent' },
] as const

export const ACHIEVEMENTS: AchievementDefinition[] = [
  { id: 'first-step', icon: '🏆', title: 'First Step', description: 'Complete your 1st lesson.' },
  { id: 'hot-streak', icon: '🔥', title: 'Hot Streak', description: 'Reach a 7-day learning streak.' },
  { id: 'hint-master', icon: '💡', title: 'Hint Master', description: 'Use 50 hints while staying persistent.' },
  { id: 'speed-learner', icon: '🚀', title: 'Speed Learner', description: 'Complete 5 lessons in one day.' },
  { id: 'chapter-master', icon: '📚', title: 'Chapter Master', description: 'Finish all lessons in any single chapter.' },
  { id: 'python-grandmaster', icon: '👑', title: 'Python Grandmaster', description: 'Complete all 52 lessons.' },
  { id: 'perfect-score', icon: '⭐', title: 'Perfect Score', description: 'Reach 100% accuracy in a session.' },
  { id: 'night-owl', icon: '🌙', title: 'Night Owl', description: 'Learn after 10 PM.' },
  { id: 'consistent', icon: '🎯', title: 'Consistent', description: 'Keep a 30-day learning streak alive.' },
]

export const HOME_GREETING = 'Welcome back to your premium Python journey.'
export const STORAGE_KEYS = {
  progress: 'python-tutor-progress-v1',
  profile: 'python-tutor-profile-v1',
}
