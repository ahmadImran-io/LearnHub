import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { errMsg } from '../services'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) return setError('Please enter your email and password')
    setLoading(true)
    try {
      await login(form)
      navigate(location.state?.from || '/dashboard', { replace: true })
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-[440px] px-4 py-12 sm:py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-9">
        <span className="mb-2 inline-block text-xs font-extrabold uppercase tracking-[0.13em] text-violet-700">Welcome back</span>
        <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-slate-900">Log in to LearnHub</h1>
        {location.state?.from && <div role="status" className="mb-4 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">Please log in to continue.</div>}
        {error && <div role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <form onSubmit={submit} noValidate className="space-y-5">
          <div>
            <label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
            <input id="login-email" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
          </div>
          <div>
            <label htmlFor="login-password" className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
            <input id="login-password" type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
          </div>
          <button type="submit" className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60" disabled={loading}>{loading ? 'Logging in…' : 'Login'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">No account? <Link to="/register" className="font-semibold text-violet-700">Register</Link></p>
      </div>
    </div>
  )
}
