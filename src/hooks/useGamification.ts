import { useMemo } from 'react'
import { getLevelProgress, getNextAchievementProgress } from '../utils/gamification'
import type { ProgressState } from '../types'

export const useGamification = (progress: ProgressState) => {
  return useMemo(() => {
    const levelProgress = getLevelProgress(progress.xp)
    const nextAchievement = getNextAchievementProgress(progress)
    return { levelProgress, nextAchievement }
  }, [progress])
}
