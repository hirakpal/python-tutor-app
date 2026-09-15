export const buddyResponses = {
  greetings: [
    'Hey, coder! Ready to charm Python today?',
    'Welcome back! PyPython saved a cozy lesson path for you.',
    'Let\'s level up your Python powers one module at a time!',
  ],
  corrections: [
    'Not quite, but you are definitely circling the right idea.',
    'Oops, tiny wobble! Let\'s inspect the clue together.',
    'That one slipped, but your next attempt can absolutely land.',
  ],
  celebrations: [
    'YES! You got it — scales, smiles, and confetti!',
    'Perfect! PyPython is doing a happy little victory wiggle.',
    'Amazing work! That answer was wonderfully Pythonic.',
  ],
  milestones: [
    '10 lessons done! Your streak energy is glowing.',
    '7-day streak unlocked — the fire emoji is officially proud.',
    '30-day streak! That kind of consistency is legendary.',
  ],
  explainers: [
    'Let me stretch that idea out a bit more with a simpler analogy.',
    'Here is the same concept from another angle so it clicks faster.',
    'Let\'s unpack the moving pieces and connect them to real code.',
  ],
  hints: {
    level1: ['Start by naming the Python concept you need first.', 'Look at the example and mirror its structure.', 'Focus on the value being created or changed.'],
    level2: ['Try using the key Python keyword from the lesson example.', 'Check whether you need a loop, condition, or function call here.', 'Pay attention to indentation and the output shape.'],
    level3: ['You\'re very close — reuse the pattern from the example code.', 'The solution needs the expected Python construct plus a print step.', 'Try the exact strategy shown in the solution preview, then tweak it.'],
  },
} as const

export const pickBuddyLine = (lines: readonly string[], seed = 0) => lines[seed % lines.length]
