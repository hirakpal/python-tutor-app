import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { LessonView } from '../components/LessonView'
import { moduleMap } from '../utils/curriculum'
import type { Difficulty, ProgressState } from '../types'

interface LessonPageProps {
  progress: ProgressState
  preferredDifficulty: Difficulty
  visitLesson: (moduleId: string, lessonId: string) => void
  recordHint: (lessonId: string, hintLevel: number) => void
  completeLesson: (moduleId: string, lessonId: string, accuracy: number, minutes: number) => void
  buddyMood: 'happy' | 'thinking' | 'celebrating' | 'sad' | 'encouraging'
  buddyMessage: string
  setBuddyThinking: (hintLevel: number) => void
  setBuddyExplain: (message: string) => void
  setBuddyCelebrate: (message: string) => void
  setBuddyEncourage: (message: string) => void
}

export default function LessonPage({ preferredDifficulty, visitLesson, recordHint, completeLesson, buddyMood, buddyMessage, setBuddyThinking, setBuddyExplain, setBuddyCelebrate, setBuddyEncourage }: LessonPageProps) {
  const { moduleId, lessonId } = useParams()
  const moduleItem = moduleId ? moduleMap.get(moduleId) : null
  const lessonData = useMemo(() => moduleItem?.lessons.find((lesson) => lesson.id === lessonId) ?? null, [lessonId, moduleItem])

  if (!moduleItem || !lessonData) {
    return <div className="mx-auto max-w-4xl px-4 py-12 text-center text-white">Lesson not found.</div>
  }

  return (
    <LessonView
      moduleItem={moduleItem}
      lesson={lessonData}
      lessonNumber={moduleItem.lessons.findIndex((lesson) => lesson.id === lessonData.id) + 1}
      totalLessons={moduleItem.lessons.length}
      preferredDifficulty={preferredDifficulty}
      onVisit={() => visitLesson(moduleItem.id, lessonData.id)}
      onHint={(hintLevel) => recordHint(lessonData.id, hintLevel)}
      onComplete={(accuracy, minutes) => completeLesson(moduleItem.id, lessonData.id, accuracy, minutes)}
      buddyMood={buddyMood}
      buddyMessage={buddyMessage}
      setBuddyThinking={setBuddyThinking}
      setBuddyExplain={setBuddyExplain}
      setBuddyCelebrate={setBuddyCelebrate}
      setBuddyEncourage={setBuddyEncourage}
    />
  )
}
