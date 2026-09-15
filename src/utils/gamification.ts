import { ACHIEVEMENTS, LEVELS } from './constants'
import { curriculum } from './curriculum'
import type { ProgressState } from '../types'

export const getLevel = (xp: number) => LEVELS.find((level) => xp >= level.minXp && xp < level.maxXp) ?? LEVELS.at(-1)!

export const getLevelProgress = (xp: number) => {
  const level = getLevel(xp)
  const nextLevel = LEVELS.find((candidate) => candidate.minXp > level.minXp)
  if (!nextLevel) {
    return { level, nextLevel: null, percent: 100, remainingXp: 0 }
  }
  const span = nextLevel.minXp - level.minXp
  const percent = Math.min(100, Math.round(((xp - level.minXp) / span) * 100))
  return { level, nextLevel, percent, remainingXp: Math.max(0, nextLevel.minXp - xp) }
}

export const deriveAchievements = (progress: ProgressState) => {
  const completedLessons = progress.completedLessonIds.length
  const days = Object.values(progress.dailyActivity)
  const chapterMaster = curriculum.some((moduleItem) => moduleItem.lessons.every((lesson) => progress.completedLessonIds.includes(lesson.id)))
  const speedLearner = days.some((entry) => entry.lessons >= 5)
  const perfectScore = Object.values(progress.lessonAttempts).some((attempt) => attempt.bestAccuracy >= 1)
  const nightOwl = Object.values(progress.lessonAttempts).some((attempt) => {
    if (!attempt.lastVisited) return false
    return new Date(attempt.lastVisited).getHours() >= 22
  })

  return ACHIEVEMENTS.filter((achievement) => {
    switch (achievement.id) {
      case 'first-step':
        return completedLessons >= 1
      case 'hot-streak':
        return progress.streak >= 7
      case 'hint-master':
        return progress.hintCount >= 50
      case 'speed-learner':
        return speedLearner
      case 'chapter-master':
        return chapterMaster
      case 'python-grandmaster':
        return completedLessons >= 52
      case 'perfect-score':
        return perfectScore
      case 'night-owl':
        return nightOwl
      case 'consistent':
        return progress.streak >= 30
      default:
        return false
    }
  })
}

export const getNextAchievementProgress = (progress: ProgressState) => {
  const unlockedIds = new Set(progress.badges.map((badge) => badge.id))
  const targets = [
    { id: 'first-step', value: progress.completedLessonIds.length, goal: 1, label: 'Complete 1 lesson' },
    { id: 'hot-streak', value: progress.streak, goal: 7, label: 'Reach a 7-day streak' },
    { id: 'hint-master', value: progress.hintCount, goal: 50, label: 'Use 50 hints' },
    { id: 'consistent', value: progress.streak, goal: 30, label: 'Reach a 30-day streak' },
    { id: 'python-grandmaster', value: progress.completedLessonIds.length, goal: 52, label: 'Complete all 52 lessons' },
  ]
  const nextTarget = targets.find((target) => !unlockedIds.has(target.id)) ?? targets.at(-1)!
  return {
    label: nextTarget.label,
    current: Math.min(nextTarget.goal, nextTarget.value),
    goal: nextTarget.goal,
    percent: Math.round((Math.min(nextTarget.goal, nextTarget.value) / nextTarget.goal) * 100),
  }
}
