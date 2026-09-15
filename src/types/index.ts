export type Difficulty = 'Beginner' | 'Average' | 'Expert' | 'God'
export type BuddyMood = 'happy' | 'thinking' | 'celebrating' | 'sad' | 'encouraging'

export interface Lesson {
  id: string
  title: string
  summary: string
  concept: string
  difficulty: Difficulty
  estimatedMinutes: number
  exampleCode: string
  starterCode: string
  solutionCode: string
  outputHint: string
  explainMore: string
  hints: [string, string, string]
  validationKeywords: string[]
}

export interface Module {
  id: string
  chapter: number
  title: string
  icon: string
  description: string
  difficulty: Difficulty
  estimatedMinutes: number
  learningObjectives: string[]
  lessons: Lesson[]
}

export interface LessonAttempt {
  completed: boolean
  correctAnswers: number
  bestAccuracy: number
  hintLevelUsed: number
  lastVisited: string | null
  timeSpentMinutes: number
}

export interface DailyActivity {
  date: string
  minutes: number
  xp: number
  lessons: number
}

export interface BadgeUnlock {
  id: string
  unlockedAt: string
}

export interface ProgressState {
  completedLessonIds: string[]
  currentModuleId: string | null
  currentLessonId: string | null
  xp: number
  streak: number
  lastActiveDate: string | null
  totalMinutes: number
  hintCount: number
  streakFreezes: number
  badges: BadgeUnlock[]
  dailyActivity: Record<string, DailyActivity>
  lessonAttempts: Record<string, LessonAttempt>
}

export interface UserProfile {
  username: string
  avatar: string
  preferredDifficulty: Difficulty
  notifications: boolean
  theme: 'dark' | 'light'
}

export interface AchievementDefinition {
  id: string
  icon: string
  title: string
  description: string
}
