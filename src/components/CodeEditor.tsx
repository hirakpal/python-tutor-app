import { useMemo, useState } from 'react'
import Prism from 'prismjs'
import 'prismjs/components/prism-python'

declare global {
  interface Window {
    loadPyodide?: (config?: { indexURL?: string }) => Promise<{
      runPythonAsync: (code: string) => Promise<unknown>
      setStdout: (handlers: { batched: (value: string) => void }) => void
      setStderr: (handlers: { batched: (value: string) => void }) => void
    }>
    pyodide?: {
      runPythonAsync: (code: string) => Promise<unknown>
      setStdout: (handlers: { batched: (value: string) => void }) => void
      setStderr: (handlers: { batched: (value: string) => void }) => void
    }
  }
}

interface CodeEditorProps {
  code: string
  setCode: (value: string) => void
  initialCode: string
  output: string
  error: string | null
  onRunComplete: (output: string, error: string | null) => void
}

const loadPyodideRuntime = async () => {
  if (window.pyodide) return window.pyodide
  if (!window.loadPyodide) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js'
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Unable to load Pyodide runtime.'))
      document.body.append(script)
    })
  }
  if (!window.loadPyodide) {
    throw new Error('Pyodide loader is unavailable.')
  }
  window.pyodide = await window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/' })
  return window.pyodide
}

export function CodeEditor({ code, setCode, initialCode, output, error, onRunComplete }: CodeEditorProps) {
  const [isRunning, setIsRunning] = useState(false)
  const highlightedCode = useMemo(() => Prism.highlight(code, Prism.languages.python, 'python'), [code])
  const lineNumbers = useMemo(() => Array.from({ length: Math.max(1, code.split('\n').length) }, (_, index) => index + 1), [code])

  const runCode = async () => {
    setIsRunning(true)
    try {
      const pyodide = await loadPyodideRuntime()
      let stdout = ''
      let stderr = ''
      pyodide.setStdout({ batched: (value) => { stdout += `${value}\n` } })
      pyodide.setStderr({ batched: (value) => { stderr += `${value}\n` } })
      await pyodide.runPythonAsync(code)
      onRunComplete(stdout.trim() || 'Code ran successfully with no output.', stderr.trim() || null)
    } catch (runError) {
      const message = runError instanceof Error ? runError.message : 'Unknown execution error'
      onRunComplete(output, message)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-900/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Interactive Code Lab</h3>
          <p className="text-sm text-slate-400">Edit, run, copy, or reset the code while PyPython cheers you on.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => navigator.clipboard.writeText(code)} className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white hover:border-accent/30">
            Copy code
          </button>
          <button type="button" onClick={() => setCode(initialCode)} className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white hover:border-accent/30">
            Reset code
          </button>
          <button type="button" onClick={() => void runCode()} disabled={isRunning} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60">
            {isRunning ? 'Running…' : 'Run code'}
          </button>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
          <div className="grid grid-cols-[auto_1fr]">
            <div className="border-r border-white/10 bg-slate-900/80 px-3 py-4 text-right text-xs leading-6 text-slate-500">
              {lineNumbers.map((lineNumber) => (
                <div key={lineNumber}>{lineNumber}</div>
              ))}
            </div>
            <textarea
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="min-h-[280px] w-full resize-y border-0 bg-transparent px-4 py-4 text-sm leading-6 text-slate-100 outline-none"
              spellCheck={false}
              aria-label="Python code editor"
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="overflow-auto rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-slate-500">Live syntax preview</p>
            <pre className="prism-code overflow-auto text-sm leading-6 text-slate-100"><code dangerouslySetInnerHTML={{ __html: highlightedCode }} /></pre>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-slate-500">Output console</p>
            <pre className="min-h-[120px] whitespace-pre-wrap text-sm leading-6 text-slate-200">{error ? `PyPython spotted an error:\n${error}` : output}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
