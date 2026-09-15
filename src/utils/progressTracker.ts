import { STORAGE_KEYS } from './constants'
import { curriculum, findNextLesson } from './curriculum'
import { deriveAchievements } from './gamification'
import type { DailyActivity, ProgressState, UserProfile } from '../types'

const todayKey = () => new Date().toISOString().slice(0, 10)
const defaultLessonId = curriculum[0]?.lessons[0]?.id ?? null
const defaultModuleId = curriculum[0]?.id ?? null

export const defaultProfile: UserProfile = {
  username: 'Code Explorer',
  avatar: '🐍',
  preferredDifficulty: 'Beginner',
  notifications: true,
  theme: 'dark',
}

export const createInitialProgress = (): ProgressState => ({
  completedLessonIds: [],
  currentModuleId: defaultModuleId,
  currentLessonId: defaultLessonId,
  xp: 0,
  streak: 0,
  lastActiveDate: null,
  totalMinutes: 0,
  hintCount: 0,
  streakFreezes: 1,
  badges: [],
  dailyActivity: {},
  lessonAttempts: {},
})

export const loadProgress = (): ProgressState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.progress)
    if (!saved) return createInitialProgress()
    return { ...createInitialProgress(), ...JSON.parse(saved) }
  } catch {
    return createInitialProgress()
  }
}

export const saveProgress = (progress: ProgressState) => {
  localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progress))
}

export const loadProfile = (): UserProfile => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.profile)
    if (!saved) return defaultProfile
    return { ...defaultProfile, ...JSON.parse(saved) }
  } catch {
    return defaultProfile
  }
}

export const saveProfile = (profile: UserProfile) => {
  localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile))
}

const ensureDailyActivity = (progress: ProgressState, date = todayKey()): DailyActivity => {
  return progress.dailyActivity[date] ?? { date, minutes: 0, xp: 0, lessons: 0 }
}

export const syncDailyState = (progress: ProgressState) => {
  const today = todayKey()
  if (progress.lastActiveDate === today) return progress

  const nextProgress = { ...progress, dailyActivity: { ...progress.dailyActivity } }
  if (!nextProgress.lastActiveDate) {
    nextProgress.streak = 1
    nextProgress.xp += 5
  } else {
    const previous = new Date(nextProgress.lastActiveDate)
    const current = new Date(today)
    const deltaDays = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24))
    if (deltaDays === 1) {
      nextProgress.streak += 1
      nextProgress.xp += 5
    } else if (deltaDays > 1) {
      if (nextProgress.streakFreezes > 0) {
        nextProgress.streakFreezes -= 1
      } else {
        nextProgress.streak = 1
      }
      nextProgress.xp += 5
    }
  }
  nextProgress.lastActiveDate = today
  nextProgress.dailyActivity[today] = ensureDailyActivity(nextProgress, today)
  return nextProgress
}

export const syncBadges = (progress: ProgressState) => {
  const existing = new Set(progress.badges.map((badge) => badge.id))
  const now = new Date().toISOString()
  const additions = deriveAchievements(progress)
    .filter((achievement) => !existing.has(achievement.id))
    .map((achievement) => ({ id: achievement.id, unlockedAt: now }))
  return additions.length ? { ...progress, badges: [...progress.badges, ...additions] } : progress
}

export const visitLesson = (progress: ProgressState, moduleId: string, lessonId: string) => {
  const nextProgress = syncDailyState({ ...progress, lessonAttempts: { ...progress.lessonAttempts } })
  nextProgress.currentModuleId = moduleId
  nextProgress.currentLessonId = lessonId
  const attempt = nextProgress.lessonAttempts[lessonId] ?? {
    completed: false,
    correctAnswers: 0,
    bestAccuracy: 0,
    hintLevelUsed: 0,
    lastVisited: null,
    timeSpentMinutes: 0,
  }
  nextProgress.lessonAttempts[lessonId] = { ...attempt, lastVisited: new Date().toISOString() }
  return nextProgress
}

export const recordHintUsage = (progress: ProgressState, lessonId: string, hintLevel: number) => {
  const nextProgress = syncDailyState({ ...progress, lessonAttempts: { ...progress.lessonAttempts } })
  const attempt = nextProgress.lessonAttempts[lessonId] ?? {
    completed: false,
    correctAnswers: 0,
    bestAccuracy: 0,
    hintLevelUsed: 0,
    lastVisited: null,
    timeSpentMinutes: 0,
  }
  nextProgress.hintCount += 1
  nextProgress.lessonAttempts[lessonId] = { ...attempt, hintLevelUsed: Math.max(attempt.hintLevelUsed, hintLevel), lastVisited: new Date().toISOString() }
  return syncBadges(nextProgress)
}

export const recordTimeSpent = (progress: ProgressState, lessonId: string, minutes: number) => {
  if (minutes <= 0) return progress
  const nextProgress = syncDailyState({ ...progress, lessonAttempts: { ...progress.lessonAttempts }, dailyActivity: { ...progress.dailyActivity } })
  const today = todayKey()
  const attempt = nextProgress.lessonAttempts[lessonId] ?? {
    completed: false,
    correctAnswers: 0,
    bestAccuracy: 0,
    hintLevelUsed: 0,
    lastVisited: null,
    timeSpentMinutes: 0,
  }
  const activity = ensureDailyActivity(nextProgress, today)
  nextProgress.totalMinutes += minutes
  nextProgress.dailyActivity[today] = { ...activity, minutes: activity.minutes + minutes }
  nextProgress.lessonAttempts[lessonId] = { ...attempt, timeSpentMinutes: attempt.timeSpentMinutes + minutes, lastVisited: new Date().toISOString() }
  return nextProgress
}

export const completeLesson = (progress: ProgressState, moduleId: string, lessonId: string, accuracy: number, minutes: number) => {
  let nextProgress = recordTimeSpent(progress, lessonId, minutes)
  nextProgress = syncDailyState({ ...nextProgress, lessonAttempts: { ...nextProgress.lessonAttempts }, dailyActivity: { ...nextProgress.dailyActivity } })
  const today = todayKey()
  const activity = ensureDailyActivity(nextProgress, today)
  const attempt = nextProgress.lessonAttempts[lessonId] ?? {
    completed: false,
    correctAnswers: 0,
    bestAccuracy: 0,
    hintLevelUsed: 0,
    lastVisited: null,
    timeSpentMinutes: 0,
  }
  if (!nextProgress.completedLessonIds.includes(lessonId)) {
    nextProgress.completedLessonIds = [...nextProgress.completedLessonIds, lessonId]
    nextProgress.xp += 50
    nextProgress.dailyActivity[today] = { ...activity, lessons: activity.lessons + 1, xp: activity.xp + 50 }
  }
  if (accuracy >= 1) {
    nextProgress.xp += 10
    nextProgress.dailyActivity[today] = { ...nextProgress.dailyActivity[today], xp: nextProgress.dailyActivity[today].xp + 10 }
  }
  nextProgress.lessonAttempts[lessonId] = {
    ...attempt,
    completed: true,
    correctAnswers: attempt.correctAnswers + 1,
    bestAccuracy: Math.max(attempt.bestAccuracy, accuracy),
    lastVisited: new Date().toISOString(),
  }

  const nextLesson = findNextLesson(moduleId, nextProgress.completedLessonIds)
  nextProgress.currentModuleId = moduleId
  nextProgress.currentLessonId = nextLesson?.id ?? nextProgress.currentLessonId
  return syncBadges(nextProgress)
}
