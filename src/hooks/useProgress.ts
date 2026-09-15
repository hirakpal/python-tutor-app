import { useEffect, useMemo, useState } from 'react'
import { api } from '../utils/api'
import { completeLesson, loadProgress, loadProfile, recordHintUsage, recordTimeSpent, saveProfile, saveProgress, syncBadges, visitLesson } from '../utils/progressTracker'
import { buildCurriculum } from '../utils/curriculum'
import type { Difficulty, ProgressState, UserProfile } from '../types'

export const useProgress = () => {
  const [initialProfile] = useState<UserProfile>(() => loadProfile())
  const [progress, setProgress] = useState<ProgressState>(() => syncBadges(loadProgress()))
  const [profile, setProfile] = useState<UserProfile>(initialProfile)
  const [modules, setModules] = useState(() => buildCurriculum(initialProfile.preferredDifficulty))
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    let isCancelled = false
    void api.getLessons().then((remoteModules) => {
      if (!isCancelled && Array.isArray(remoteModules) && remoteModules.length > 0) {
        setModules(remoteModules)
      }
    })
    void Promise.all([api.getProfile(), api.getProgress()]).then(([remoteProfile, remoteProgress]) => {
      if (isCancelled) return
      setProfile((current) => ({ ...remoteProfile, ...current }))
      setProgress((current) => syncBadges({ ...remoteProgress, ...current }))
      setIsHydrated(true)
    })
    return () => {
      isCancelled = true
    }
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    saveProgress(progress)
    void api.updateProgress(progress)
  }, [isHydrated, progress])

  useEffect(() => {
    if (!isHydrated) return
    saveProfile(profile)
  }, [isHydrated, profile])

  useEffect(() => {
    setModules(buildCurriculum(profile.preferredDifficulty))
  }, [profile.preferredDifficulty])

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
