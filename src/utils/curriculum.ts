import type { Difficulty, Lesson, Module } from '../types'

const difficultyCycle: Difficulty[] = ['Beginner', 'Average', 'Expert', 'God']

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

const buildLesson = (moduleTitle: string, lessonTitle: string, moduleId: string, index: number): Lesson => {
  const difficulty = difficultyCycle[index % difficultyCycle.length]
  const slug = `${moduleId}-${index + 1}`
  const concept = `${lessonTitle} in ${moduleTitle} helps you practice the core idea, see the syntax in context, and connect it back to the official Python tutorial.`
  const exampleCode = `topic = "${lessonTitle}"
chapter = "${moduleTitle}"
print(f"Learning {topic} from {chapter}")
for step in range(1, 3):
    print(f"Step {step}: practice the key pattern")`
  const starterCode = `topic = "${lessonTitle}"
# TODO: create a tiny example connected to this lesson
print(topic)`
  const solutionCode = `topic = "${lessonTitle}"
chapter = "${moduleTitle}"
notes = ["read", "practice", "reflect"]
for note in notes:
    print(f"{chapter}: {topic} -> {note}")`

  return {
    id: slug,
    title: lessonTitle,
    summary: `${lessonTitle} gives you a focused checkpoint inside ${moduleTitle}.`,
    concept,
    difficulty,
    estimatedMinutes: 12 + (index % 4) * 4,
    exampleCode,
    starterCode,
    solutionCode,
    outputHint: 'Expect readable lines that show the lesson topic and a short practice flow.',
    explainMore: `${lessonTitle} becomes easier when you compare the example, starter, and solution code. Notice how the values are named clearly, how the loop or print structure supports the idea, and how small changes reshape the output.`,
    hints: [
      `Think about the main Python structure used in ${lessonTitle}.`,
      `Try adding a variable plus a print or loop that mirrors the example.`,
      `Reuse the chapter/topic pattern and generate at least one visible output line.`,
    ],
    validationKeywords: ['print', 'topic'],
  }
}

export const curriculum: Module[] = moduleBlueprints.map((moduleBlueprint) => ({
  id: moduleBlueprint.id,
  chapter: moduleBlueprint.chapter,
  title: moduleBlueprint.title,
  icon: moduleBlueprint.icon,
  description: moduleBlueprint.description,
  difficulty: difficultyCycle[(moduleBlueprint.chapter - 1) % difficultyCycle.length],
  estimatedMinutes: 60,
  learningObjectives: [...moduleBlueprint.objectives],
  lessons: moduleBlueprint.lessons.map((lessonTitle, index) => buildLesson(moduleBlueprint.title, lessonTitle, moduleBlueprint.id, index)),
}))

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
