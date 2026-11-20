import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { errMsg } from '../services'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'student' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    // client-side validation with clear messages
    if (form.name.trim().length < 2) return setError('Name must be at least 2 characters')
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Please enter a valid email address')
    if (form.password.length < 6) return setError('Password must be at least 6 characters')
    if (form.password !== form.confirm) return setError('Passwords do not match')

    setLoading(true)
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: form.role })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-[480px] px-4 py-12 sm:py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-9">
        <span className="mb-2 inline-block text-xs font-extrabold uppercase tracking-[0.13em] text-violet-700">Get started</span>
        <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-slate-900">Create your account</h1>
        {error && <div role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <form onSubmit={submit} noValidate className="space-y-4">
          <div>
            <label htmlFor="register-name" className="mb-2 block text-sm font-semibold text-slate-700">Full name</label>
            <input id="register-name" name="name" autoComplete="name" value={form.name} onChange={change} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
          </div>
          <div>
            <label htmlFor="register-email" className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
            <input id="register-email" type="email" name="email" autoComplete="email" value={form.email} onChange={change} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
          </div>
          <div>
            <label htmlFor="register-password" className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
            <input id="register-password" type="password" name="password" autoComplete="new-password" value={form.password} onChange={change} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
          </div>
          <div>
            <label htmlFor="register-confirm" className="mb-2 block text-sm font-semibold text-slate-700">Confirm password</label>
            <input id="register-confirm" type="password" name="confirm" autoComplete="new-password" value={form.confirm} onChange={change} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
          </div>
          <div>
            <label htmlFor="register-role" className="mb-2 block text-sm font-semibold text-slate-700">I am a…</label>
            <select id="register-role" name="role" value={form.role} onChange={change} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100">
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
            </select>
          </div>
          <button type="submit" className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60" disabled={loading}>{loading ? 'Creating account…' : 'Register'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">Already registered? <Link to="/login" className="font-semibold text-violet-700">Login</Link></p>
      </div>
    </div>
  )
}
