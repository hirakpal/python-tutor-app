import { useEffect, useMemo, useState } from 'react'
import { api } from '../utils/api'
import { completeLesson, loadProgress, loadProfile, recordHintUsage, recordTimeSpent, saveProfile, saveProgress, syncBadges, visitLesson } from '../utils/progressTracker'
import { curriculum } from '../utils/curriculum'
import type { Difficulty, ProgressState, UserProfile } from '../types'

export const useProgress = () => {
  const [progress, setProgress] = useState<ProgressState>(() => syncBadges(loadProgress()))
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile())
  const [modules, setModules] = useState(curriculum)

  useEffect(() => {
    void api.getLessons().then(setModules)
    void api.getProfile().then((remoteProfile) => setProfile((current) => ({ ...current, ...remoteProfile })))
    void api.getProgress().then((remoteProgress) => setProgress(syncBadges({ ...loadProgress(), ...remoteProgress })))
  }, [])

  useEffect(() => {
    saveProgress(progress)
    void api.updateProgress(progress)
  }, [progress])

  useEffect(() => {
    saveProfile(profile)
  }, [profile])

  const actions = useMemo(
    () => ({
      visitLesson: (moduleId: string, lessonId: string) => setProgress((current) => visitLesson(current, moduleId, lessonId)),
      recordHint: (lessonId: string, hintLevel: number) => setProgress((current) => recordHintUsage(current, lessonId, hintLevel)),
      recordTime: (lessonId: string, minutes: number) => setProgress((current) => recordTimeSpent(current, lessonId, minutes)),
      completeLesson: (moduleId: string, lessonId: string, accuracy: number, minutes: number) => setProgress((current) => completeLesson(current, moduleId, lessonId, accuracy, minutes)),
      updateDifficulty: (difficulty: Difficulty) => setProfile((current) => ({ ...current, preferredDifficulty: difficulty })),
      updateNotifications: (enabled: boolean) => setProfile((current) => ({ ...current, notifications: enabled })),
    }),
    [],
  )

  return { modules, progress, profile, actions }
}
