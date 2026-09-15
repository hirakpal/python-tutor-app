import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Prism from 'prismjs'
import 'prismjs/components/prism-python'
import { motion } from 'framer-motion'
import { CodeEditor } from './CodeEditor'
import { BuddyCharacter } from './Buddy/BuddyCharacter'
import { DIFFICULTY_COLORS } from '../utils/constants'
import type { Difficulty, Lesson, Module } from '../types'

interface LessonViewProps {
  moduleItem: Module
  lesson: Lesson
  lessonNumber: number
  totalLessons: number
  preferredDifficulty: Difficulty
  onVisit: () => void
  onHint: (hintLevel: number) => void
  onComplete: (accuracy: number, minutes: number) => void
  buddyMood: 'happy' | 'thinking' | 'celebrating' | 'sad' | 'encouraging'
  buddyMessage: string
  setBuddyThinking: (hintLevel: number) => void
  setBuddyExplain: (message: string) => void
  setBuddyCelebrate: (message: string) => void
  setBuddyEncourage: (message: string) => void
}

export function LessonView({
  moduleItem,
  lesson,
  lessonNumber,
  totalLessons,
  preferredDifficulty,
  onVisit,
  onHint,
  onComplete,
  buddyMood,
  buddyMessage,
  setBuddyThinking,
  setBuddyExplain,
  setBuddyCelebrate,
  setBuddyEncourage,
}: LessonViewProps) {
  const [hintLevel, setHintLevel] = useState(0)
  const [code, setCode] = useState(lesson.starterCode)
  const [output, setOutput] = useState('Run your code to see what happens here.')
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [startedAt] = useState(() => Date.now())
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [completed, setCompleted] = useState(false)
  const highlightedExample = useMemo(() => Prism.highlight(lesson.exampleCode, Prism.languages.python, 'python'), [lesson.exampleCode])

  useEffect(() => {
    onVisit()
    const interval = window.setInterval(() => setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000)), 1000)
    return () => window.clearInterval(interval)
  }, [onVisit, startedAt])

  const handleHint = () => {
    const nextLevel = Math.min(3, hintLevel + 1)
    setHintLevel(nextLevel)
    onHint(nextLevel)
    setBuddyThinking(nextLevel)
    setFeedback(lesson.hints[nextLevel - 1])
  }

  const handleExplain = () => {
    setBuddyExplain(lesson.explainMore)
    setFeedback(lesson.explainMore)
  }

  const handleAnswer = () => {
    const normalized = code.toLowerCase()
    const isCorrect = lesson.validationKeywords.every((keyword) => normalized.includes(keyword))
    const accuracy = isCorrect ? 1 : 0.5
    const minutes = Math.max(1, Math.ceil(elapsedSeconds / 60))
    if (isCorrect) {
      setCompleted(true)
      setBuddyCelebrate('Brilliant! You used the lesson pattern and produced working Python.')
      setFeedback('Correct! PyPython awarded lesson XP and marked this checkpoint complete.')
      onComplete(accuracy, minutes)
    } else {
      setBuddyEncourage('You are close — compare your code against the starter and example, then try again.')
      setFeedback('Not quite yet. Add the expected lesson pattern and visible output, then submit again.')
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-white/10 bg-slate-900/70 p-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <Link to="/" className="text-slate-200 no-underline hover:text-accent">Home</Link>
            <span>›</span>
            <Link to={`/module/${moduleItem.id}`} className="text-slate-200 no-underline hover:text-accent">{moduleItem.title}</Link>
            <span>›</span>
            <span>{lesson.title}</span>
          </div>
          <h2 className="text-3xl font-bold text-white">{lesson.title}</h2>
          <p className="text-slate-300">Lesson {lessonNumber} of {totalLessons} • {lesson.summary}</p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <span className={`rounded-full border px-4 py-2 font-semibold ${DIFFICULTY_COLORS[preferredDifficulty]}`}>{preferredDifficulty}</span>
          <span className="rounded-full border border-white/10 px-4 py-2 text-slate-200">⏱️ {elapsedSeconds}s</span>
          <Link to="/" className="rounded-full bg-white/10 px-4 py-2 font-semibold text-white no-underline hover:bg-white/20">Return home</Link>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-accent">Concept</p>
                <h3 className="text-2xl font-bold text-white">Learn the core idea</h3>
              </div>
              <button type="button" onClick={() => navigator.clipboard.writeText(lesson.exampleCode)} className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white hover:border-accent/30">Copy code</button>
            </div>
            <p className="mb-4 text-slate-300">{lesson.concept}</p>
            <div className="overflow-auto rounded-2xl border border-white/10 bg-slate-950/80 p-4">
              <pre className="prism-code text-sm leading-6 text-slate-100"><code dangerouslySetInnerHTML={{ __html: highlightedExample }} /></pre>
            </div>
            <p className="mt-4 text-sm text-slate-400">Output hint: {lesson.outputHint}</p>
          </section>
          <CodeEditor code={code} setCode={setCode} initialCode={lesson.starterCode} output={output} error={error} onRunComplete={(nextOutput, nextError) => { setOutput(nextOutput); setError(nextError) }} />
          <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-accent">Practice</p>
            <h3 className="mt-2 text-2xl font-bold text-white">Try it yourself</h3>
            <p className="mt-3 text-slate-300">Use the starter code to show the topic name and produce readable output connected to the lesson.</p>
            {feedback ? <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-200">{feedback}</div> : null}
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={handleHint} className="rounded-full border border-accent/30 bg-accent/10 px-4 py-3 text-sm font-semibold text-accent">💡 Get Hint</button>
              <button type="button" onClick={handleExplain} className="rounded-full border border-white/10 px-4 py-3 text-sm font-semibold text-white">📚 Explain More</button>
              <button type="button" onClick={() => { setCode(lesson.solutionCode); setFeedback('Solution revealed. Read it, run it, and compare it to your approach.'); setBuddyExplain('Here is the answer path. Study the structure, then remix it in your own words.'); }} className="rounded-full border border-white/10 px-4 py-3 text-sm font-semibold text-white">🎯 See Answer</button>
              <button type="button" onClick={handleAnswer} className="rounded-full bg-beginner px-4 py-3 text-sm font-semibold text-slate-950">Submit Answer</button>
            </div>
          </section>
          {completed ? (
            <motion.section initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-[2rem] border border-beginner/40 bg-beginner/10 p-6">
              <div className="mb-3 flex gap-2 text-3xl"><span>🎉</span><span>✨</span><span>🐍</span></div>
              <h3 className="text-2xl font-bold text-white">Lesson complete!</h3>
              <p className="mt-2 text-slate-200">You earned +50 XP for completion and +10 XP for a correct solution. Keep the streak alive and continue your module.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to={`/module/${moduleItem.id}`} className="rounded-full border border-white/10 px-4 py-3 text-sm font-semibold text-white no-underline">Back to module</Link>
                <Link to="/" className="rounded-full bg-accent px-4 py-3 text-sm font-semibold text-slate-950 no-underline">Celebrate on home</Link>
              </div>
            </motion.section>
          ) : null}
        </div>
        <aside className="space-y-6">
          <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-5">
            <BuddyCharacter mood={buddyMood} message={buddyMessage} />
          </section>
          <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-accent">Quick tips</p>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-300">
              <li>Mirror the example first, then personalize it.</li>
              <li>Short readable outputs make debugging faster.</li>
              <li>Use hints progressively so you still do the thinking.</li>
            </ul>
          </section>
          <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-accent">Achievement preview</p>
            <p className="mt-3 text-sm text-slate-300">Complete lessons without losing your streak to chase Hot Streak, Chapter Master, and Python Grandmaster.</p>
          </section>
        </aside>
      </div>
    </div>
  )
}
