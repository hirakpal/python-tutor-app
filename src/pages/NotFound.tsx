import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-24 text-center lg:px-6">
      <p className="text-sm uppercase tracking-[0.35em] text-accent">404</p>
      <h2 className="mt-4 text-5xl font-black text-white">Lost in the Python forest?</h2>
      <p className="mt-4 text-slate-300">PyPython can guide you back to the premium dashboard.</p>
      <Link to="/" className="mt-8 inline-flex rounded-full bg-accent px-5 py-3 font-semibold text-slate-950 no-underline">Return home</Link>
    </main>
  )
}
