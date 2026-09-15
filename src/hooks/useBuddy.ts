import { useMemo, useState } from 'react'
import { buddyResponses, pickBuddyLine } from '../utils/buddyResponses'
import type { BuddyMood } from '../types'

export const useBuddy = () => {
  const [mood, setMood] = useState<BuddyMood>('happy')
  const [message, setMessage] = useState(() => pickBuddyLine(buddyResponses.greetings))

  const actions = useMemo(
    () => ({
      greet: (seed = Date.now()) => {
        setMood('happy')
        setMessage(pickBuddyLine(buddyResponses.greetings, seed))
      },
      encourage: (seed = Date.now()) => {
        setMood('encouraging')
        setMessage(pickBuddyLine(buddyResponses.corrections, seed))
      },
      celebrate: (seed = Date.now()) => {
        setMood('celebrating')
        setMessage(pickBuddyLine(buddyResponses.celebrations, seed))
      },
      think: (hintLevel = 1) => {
        setMood('thinking')
        const lines = hintLevel === 1 ? buddyResponses.hints.level1 : hintLevel === 2 ? buddyResponses.hints.level2 : buddyResponses.hints.level3
        setMessage(pickBuddyLine(lines, hintLevel))
      },
      explain: (seed = Date.now()) => {
        setMood('happy')
        setMessage(pickBuddyLine(buddyResponses.explainers, seed))
      },
      milestone: (seed = Date.now()) => {
        setMood('celebrating')
        setMessage(pickBuddyLine(buddyResponses.milestones, seed))
      },
      custom: (nextMood: BuddyMood, nextMessage: string) => {
        setMood(nextMood)
        setMessage(nextMessage)
      },
    }),
    [],
  )

  return { mood, message, actions }
}
