import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Header } from './components/Header'
import { useBuddy } from './hooks/useBuddy'
import { useGamification } from './hooks/useGamification'
import { useProgress } from './hooks/useProgress'

const Home = lazy(() => import('./pages/Home'))
const ModuleDetail = lazy(() => import('./pages/ModuleDetail'))
const Lesson = lazy(() => import('./pages/Lesson'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Profile = lazy(() => import('./pages/Profile'))
const NotFound = lazy(() => import('./pages/NotFound'))

function App() {
  const { modules, progress, profile, actions } = useProgress()
  const { levelProgress } = useGamification(progress)
  const buddy = useBuddy()

  useEffect(() => {
    if (progress.completedLessonIds.length > 0 && progress.completedLessonIds.length % 10 === 0) {
      buddy.actions.milestone(progress.completedLessonIds.length)
    } else {
      buddy.actions.greet(progress.completedLessonIds.length + progress.streak)
    }
  }, [buddy.actions, progress.completedLessonIds.length, progress.streak])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-transparent">
        <Header
          username={profile.username}
          avatar={profile.avatar}
          levelName={levelProgress.level.name}
          xp={progress.xp}
          levelPercent={levelProgress.percent}
          remainingXp={levelProgress.remainingXp}
        />
        <Suspense fallback={<div className="px-4 py-12 text-center text-slate-300">Loading your premium learning space…</div>}>
          <Routes>
            <Route
              path="/"
              element={<Home modules={modules} progress={progress} preferredDifficulty={profile.preferredDifficulty} updateDifficulty={actions.updateDifficulty} buddyMood={buddy.mood} buddyMessage={buddy.message} />}
            />
            <Route path="/module/:moduleId" element={<ModuleDetail modules={modules} progress={progress} preferredDifficulty={profile.preferredDifficulty} />} />
            <Route
              path="/lesson/:moduleId/:lessonId"
              element={
                <Lesson
                  progress={progress}
                  modules={modules}
                  preferredDifficulty={profile.preferredDifficulty}
                  visitLesson={actions.visitLesson}
                  recordHint={actions.recordHint}
                  completeLesson={actions.completeLesson}
                  buddyMood={buddy.mood}
                  buddyMessage={buddy.message}
                  setBuddyThinking={buddy.actions.think}
                  setBuddyExplain={(message) => buddy.actions.custom('happy', message)}
                  setBuddyCelebrate={(message) => buddy.actions.custom('celebrating', message)}
                  setBuddyEncourage={(message) => buddy.actions.custom('encouraging', message)}
                />
              }
            />
            <Route path="/analytics" element={<Analytics progress={progress} />} />
            <Route
              path="/profile"
              element={<Profile progress={progress} profile={profile} updateDifficulty={actions.updateDifficulty} updateNotifications={actions.updateNotifications} />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  )
}

export default App
