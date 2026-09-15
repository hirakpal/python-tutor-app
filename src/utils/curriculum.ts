import type { Difficulty, Lesson, Module } from '../types'

const moduleBlueprints = [
  {
    chapter: 1,
    id: 'whetting-your-appetite',
    title: 'Whetting Your Appetite',
    icon: '🐍',
    description: 'See why Python feels friendly, expressive, and productive from the very first line.',
    objectives: ['Understand Python\'s strengths', 'Write first expressions', 'Connect ideas to real projects'],
    lessons: ['Why Python Feels Readable', 'Running Your First Expression', 'Using Python for Real Tasks', 'Your First Learning Quest'],
  },
  {
    chapter: 2,
    id: 'using-the-python-interpreter',
    title: 'Using the Python Interpreter',
    icon: '💻',
    description: 'Learn how to launch Python, work interactively, and move comfortably between prompts and scripts.',
    objectives: ['Start the interpreter', 'Use interactive mode', 'Understand script execution'],
    lessons: ['Launching Python', 'Interactive Prompt Basics', 'Command Line Scripts', 'Editing and Retry Flow'],
  },
  {
    chapter: 3,
    id: 'informal-introduction',
    title: 'An Informal Introduction to Python',
    icon: '✨',
    description: 'Practice numbers, strings, and tiny experiments that make Python feel playful and practical.',
    objectives: ['Work with numbers', 'Manipulate strings', 'Build confidence with variables'],
    lessons: ['Numbers and Operators', 'String Literals', 'Formatted Output', 'Lists in First Programs'],
  },
  {
    chapter: 4,
    id: 'more-control-flow-tools',
    title: 'More Control Flow Tools',
    icon: '🎛️',
    description: 'Master conditions, loops, ranges, and functions to control how your programs think and act.',
    objectives: ['Use if and match style logic', 'Loop with confidence', 'Define reusable functions'],
    lessons: ['if Statements', 'for and range', 'Loop Control Tools', 'Defining Functions'],
  },
  {
    chapter: 5,
    id: 'data-structures',
    title: 'Data Structures',
    icon: '🧠',
    description: 'Explore lists, stacks, queues, sets, dictionaries, and the patterns that power everyday Python.',
    objectives: ['Operate on lists', 'Compare data structures', 'Choose the right collection'],
    lessons: ['List Methods', 'Comprehensions', 'Tuples and Sequences', 'Sets and Dictionaries'],
  },
  {
    chapter: 6,
    id: 'modules',
    title: 'Modules',
    icon: '📦',
    description: 'Organize code into reusable modules and explore how imports keep projects tidy.',
    objectives: ['Import modules', 'Explore namespaces', 'Package reusable code'],
    lessons: ['Import Basics', 'Module Search Path', 'Namespaces', 'Building Tiny Packages'],
  },
  {
    chapter: 7,
    id: 'input-and-output',
    title: 'Input and Output',
    icon: '📝',
    description: 'Format text cleanly, read from files, and produce outputs that are friendly to people and machines.',
    objectives: ['Format output', 'Work with f-strings', 'Read and write files'],
    lessons: ['Fancier Output Formatting', 'String Formatting Tools', 'Reading Files', 'Writing Files'],
  },
  {
    chapter: 8,
    id: 'errors-and-exceptions',
    title: 'Errors and Exceptions',
    icon: '🛟',
    description: 'Handle mistakes gracefully and learn how Python communicates problems so you can recover well.',
    objectives: ['Read tracebacks', 'Use try/except', 'Raise helpful errors'],
    lessons: ['Reading Tracebacks', 'Handling Exceptions', 'Raising Exceptions', 'Cleanup with finally'],
  },
  {
    chapter: 9,
    id: 'classes',
    title: 'Classes',
    icon: '🏗️',
    description: 'Build objects, manage state, and model behavior with clean, reusable class designs.',
    objectives: ['Define classes', 'Use methods and state', 'Understand inheritance'],
    lessons: ['Class Basics', 'Instance Attributes', 'Methods and dunder style', 'Inheritance'],
  },
  {
    chapter: 10,
    id: 'standard-library',
    title: 'A Brief Tour of the Standard Library',
    icon: '🧰',
    description: 'Meet batteries-included tools that make common tasks quicker and more delightful.',
    objectives: ['Use built-in modules', 'Solve common tasks', 'Explore practical helpers'],
    lessons: ['Working with os and sys', 'Dates and Math Helpers', 'Random and Statistics', 'Quality-of-life Utilities'],
  },
  {
    chapter: 11,
    id: 'standard-library-part-two',
    title: 'A Brief Tour of the Standard Library — Part II',
    icon: '🚀',
    description: 'Go deeper with advanced library patterns for structured data, logging, and internet-friendly tools.',
    objectives: ['Use richer data tools', 'Capture logs', 'Process structured text'],
    lessons: ['Structured Data Tools', 'Logging Basics', 'Templating and repr tools', 'Networking Helpers'],
  },
  {
    chapter: 12,
    id: 'virtual-environments-and-packages',
    title: 'Virtual Environments and Packages',
    icon: '🌐',
    description: 'Create isolated Python environments and install packages without tangling your projects.',
    objectives: ['Create environments', 'Install packages', 'Understand dependency isolation'],
    lessons: ['Why Virtual Environments Matter', 'Creating a venv', 'Installing Packages', 'Sharing Dependencies'],
  },
  {
    chapter: 13,
    id: 'what-now',
    title: 'What Now?',
    icon: '🗺️',
    description: 'Map your next steps, revisit key areas, and turn tutorial knowledge into a sustainable practice.',
    objectives: ['Plan next steps', 'Choose projects', 'Build a long-term habit'],
    lessons: ['Choosing Your Next Topic', 'Reading Docs Efficiently', 'Building Mini Projects', 'Continuing the Journey'],
  },
] as const

interface LessonTemplate {
  concept: string
  exampleCode: string
  starterCode: string
  solutionCode: string
  outputHint: string
  explainMore: string
  hints: [string, string, string]
  validationKeywords: string[]
}

const buildLessonTemplate = (moduleTitle: string, lessonTitle: string, difficulty: Difficulty): LessonTemplate => {
  const lessonLower = lessonTitle.toLowerCase()
  const difficultyPrompt: Record<Difficulty, string> = {
    Beginner: 'Start small and focus on one clear output line.',
    Average: 'Add one small extension after the base solution works.',
    Expert: 'Refactor names or flow for readability after solving.',
    God: 'Challenge yourself to make the code concise and elegant.',
  }

  if (lessonLower.includes('file')) {
    return {
      concept: `${lessonTitle} in ${moduleTitle} shows how text streams can be read and written in sequence.`,
      exampleCode: `from io import StringIO
source = StringIO("python\\nacademy\\n")
first = source.readline().strip()
print(f"First line: {first}")`,
      starterCode: `from io import StringIO
source = StringIO("python\\nacademy\\n")
# TODO: read one line and print it`,
      solutionCode: `from io import StringIO
source = StringIO("python\\nacademy\\n")
first = source.readline().strip()
print(f"Read line: {first}")`,
      outputHint: 'Expect output that confirms one line was read from the stream.',
      explainMore: `${difficultyPrompt[difficulty]} Reading APIs return text, then string cleanup like strip() prepares that text for display.`,
      hints: [
        'Use readline() on the stream object.',
        'Store the result in a variable before printing.',
        'Clean trailing newline characters with strip().',
      ],
      validationKeywords: ['readline', 'print'],
    }
  }

  if (lessonLower.includes('exception') || lessonLower.includes('traceback') || lessonLower.includes('finally')) {
    return {
      concept: `${lessonTitle} in ${moduleTitle} introduces safe execution paths with try/except handling.`,
      exampleCode: `value = "42"
try:
    result = int(value)
    print(f"Converted: {result}")
except ValueError:
    print("Conversion failed")`,
      starterCode: `value = "42"
# TODO: wrap conversion in try/except
print(value)`,
      solutionCode: `value = "42"
try:
    result = int(value)
    print(f"Converted: {result}")
except ValueError:
    print("Conversion failed")`,
      outputHint: 'Expect a converted value or a graceful fallback message.',
      explainMore: `${difficultyPrompt[difficulty]} try handles risky code and except keeps the app responsive when errors occur.`,
      hints: [
        'Start with try: before conversion.',
        'Catch ValueError with except.',
        'Print a friendly message in both success and fallback paths.',
      ],
      validationKeywords: ['try:', 'except'],
    }
  }

  if (lessonLower.includes('class') || lessonLower.includes('inheritance') || lessonLower.includes('method')) {
    return {
      concept: `${lessonTitle} in ${moduleTitle} demonstrates how classes bundle data and behavior together.`,
      exampleCode: `class Buddy:
    def __init__(self, name):
        self.name = name

    def cheer(self):
        print(f"{self.name} says keep coding!")`,
      starterCode: `class Buddy:
    # TODO: add __init__ and cheer
    pass`,
      solutionCode: `class Buddy:
    def __init__(self, name):
        self.name = name

    def cheer(self):
        print(f"{self.name} says keep coding!")

Buddy("PyPython").cheer()`,
      outputHint: 'Expect a class method call that prints a message.',
      explainMore: `${difficultyPrompt[difficulty]} Keep instance data in __init__ and expose behavior through clear methods.`,
      hints: [
        'Define __init__(self, ...).',
        'Store a value on self.',
        'Call a method on an instance and print from it.',
      ],
      validationKeywords: ['class ', 'def '],
    }
  }

  if (lessonLower.includes('import') || lessonLower.includes('module') || lessonLower.includes('library') || lessonLower.includes('math') || lessonLower.includes('random') || lessonLower.includes('statistics') || lessonLower.includes('logging')) {
    return {
      concept: `${lessonTitle} in ${moduleTitle} shows how imports unlock reusable tools from Python's standard library.`,
      exampleCode: `import math
values = [9, 16, 25]
roots = [math.sqrt(number) for number in values]
print(roots)`,
      starterCode: `import math
values = [9, 16, 25]
# TODO: compute square roots and print them`,
      solutionCode: `import math
values = [9, 16, 25]
roots = [math.sqrt(number) for number in values]
print(roots)`,
      outputHint: 'Expect output containing transformed values from an imported helper.',
      explainMore: `${difficultyPrompt[difficulty]} Imports keep code modular while avoiding reimplementation of common utilities.`,
      hints: [
        'Call a function from the imported module.',
        'Loop or use a comprehension over values.',
        'Print the transformed result.',
      ],
      validationKeywords: ['import ', 'print'],
    }
  }

  if (lessonLower.includes('list') || lessonLower.includes('tuple') || lessonLower.includes('set') || lessonLower.includes('dict') || lessonLower.includes('sequence') || lessonLower.includes('comprehension')) {
    return {
      concept: `${lessonTitle} in ${moduleTitle} focuses on structuring and transforming grouped data.`,
      exampleCode: `words = ["python", "buddy", "lesson"]
lengths = {word: len(word) for word in words}
print(lengths)`,
      starterCode: `words = ["python", "buddy", "lesson"]
# TODO: build a collection transformation
print(words)`,
      solutionCode: `words = ["python", "buddy", "lesson"]
lengths = {word: len(word) for word in words}
print(lengths)`,
      outputHint: 'Expect transformed collection output, not only the original list.',
      explainMore: `${difficultyPrompt[difficulty]} Data structures become powerful when you transform values into a new shape.`,
      hints: [
        'Create a new collection from words.',
        'Use len() to compute derived values.',
        'Print the transformed collection.',
      ],
      validationKeywords: ['for ', 'print'],
    }
  }

  return {
    concept: `${lessonTitle} in ${moduleTitle} helps you practice the named tutorial skill with clear input and output flow.`,
    exampleCode: `topic = "${lessonTitle}"
chapter = "${moduleTitle}"
steps = ["read", "practice", "share"]
for step in steps:
    print(f"{topic}: {step}")`,
    starterCode: `topic = "${lessonTitle}"
# TODO: create a loop that prints learning steps
print(topic)`,
    solutionCode: `topic = "${lessonTitle}"
chapter = "${moduleTitle}"
steps = ["read", "practice", "share"]
for step in steps:
    print(f"{chapter} -> {topic}: {step}")`,
    outputHint: 'Expect multiple readable lines tied to the lesson topic.',
    explainMore: `${difficultyPrompt[difficulty]} Use variables for clarity and a loop for repeated output.`,
    hints: [
      `Start by storing "${lessonTitle}" in a variable.`,
      'Add a list of short steps and iterate through it.',
      'Print a formatted line inside the loop.',
    ],
    validationKeywords: ['for ', 'print'],
  }
}

const buildLesson = (moduleTitle: string, lessonTitle: string, moduleId: string, index: number, difficulty: Difficulty): Lesson => {
  const slug = `${moduleId}-${index + 1}`
  const template = buildLessonTemplate(moduleTitle, lessonTitle, difficulty)

  return {
    id: slug,
    title: lessonTitle,
    summary: `${lessonTitle} gives you a focused checkpoint inside ${moduleTitle}.`,
    concept: template.concept,
    difficulty,
    estimatedMinutes: 12 + (index % 4) * 4,
    exampleCode: template.exampleCode,
    starterCode: template.starterCode,
    solutionCode: template.solutionCode,
    outputHint: template.outputHint,
    explainMore: template.explainMore,
    hints: template.hints,
    validationKeywords: template.validationKeywords,
  }
}

export const buildCurriculum = (preferredDifficulty: Difficulty = 'Beginner'): Module[] => (
  moduleBlueprints.map((moduleBlueprint) => ({
    id: moduleBlueprint.id,
    chapter: moduleBlueprint.chapter,
    title: moduleBlueprint.title,
    icon: moduleBlueprint.icon,
    description: moduleBlueprint.description,
    difficulty: preferredDifficulty,
    estimatedMinutes: 60,
    learningObjectives: [...moduleBlueprint.objectives],
    lessons: moduleBlueprint.lessons.map((lessonTitle, index) => buildLesson(moduleBlueprint.title, lessonTitle, moduleBlueprint.id, index, preferredDifficulty)),
  }))
)

export const curriculum: Module[] = buildCurriculum()

export const moduleMap = new Map(curriculum.map((moduleItem) => [moduleItem.id, moduleItem]))
export const lessonMap = new Map(curriculum.flatMap((moduleItem) => moduleItem.lessons.map((lesson) => [lesson.id, { module: moduleItem, lesson }])))
export const totalLessons = curriculum.reduce((total, moduleItem) => total + moduleItem.lessons.length, 0)

export const getModuleProgress = (moduleItem: Module, completedLessonIds: string[]) => {
  const completed = moduleItem.lessons.filter((lesson) => completedLessonIds.includes(lesson.id)).length
  const percentage = Math.round((completed / moduleItem.lessons.length) * 100)
  return { completed, percentage }
}

export const findNextLesson = (moduleId: string, completedLessonIds: string[]) => {
  const moduleItem = moduleMap.get(moduleId)
  if (!moduleItem) return null
  return moduleItem.lessons.find((lesson) => !completedLessonIds.includes(lesson.id)) ?? moduleItem.lessons.at(-1) ?? null
}
