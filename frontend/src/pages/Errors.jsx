import { Link } from 'react-router-dom'

export const NotFound = () => (
  <div className="mx-auto max-w-7xl px-4 py-20 text-center">
    <span className="text-sm font-bold uppercase tracking-widest text-violet-700">Error 404</span>
    <h1 className="mt-3 text-5xl font-extrabold tracking-tight text-slate-900">Page not found</h1>
    <p className="mt-3 text-slate-600">The page you are looking for does not exist.</p>
    <Link to="/" className="mt-6 inline-block rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white no-underline hover:bg-violet-700">Go home</Link>
  </div>
)

export const Unauthorized = () => (
  <div className="mx-auto max-w-7xl px-4 py-20 text-center">
    <span className="text-4xl" aria-hidden="true">🚫</span>
    <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900">Access denied</h1>
    <p className="mt-3 text-slate-600">Your role does not have permission to view this page.</p>
    <Link to="/dashboard" className="mt-6 inline-block rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white no-underline hover:bg-violet-700">Back to my dashboard</Link>
  </div>
)
