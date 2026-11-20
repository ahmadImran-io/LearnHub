import { useEffect, useState } from 'react'
import Loader from '../components/Loader'
import { adminService, courseService, errMsg } from '../services'
import { useAuth } from '../context/AuthContext'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [activeTab, setActiveTab] = useState('analytics')

  const loadAll = () =>
    Promise.all([adminService.analytics(), adminService.users(), courseService.list()])
      .then(([a, u, c]) => { setStats(a); setUsers(u); setCourses(c) })
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false))

  useEffect(() => { loadAll() }, [])

  const changeRole = async (id, role) => {
    setError(''); setNotice('')
    try {
      await adminService.setRole(id, role)
      setNotice('Role updated')
      loadAll()
    } catch (e) { setError(errMsg(e)) }
  }

  const removeUser = async (u) => {
    if (!window.confirm(`Delete user ${u.name}? Their courses and enrollments will be removed.`)) return
    try {
      await adminService.removeUser(u._id)
      setNotice('User deleted')
      loadAll()
    } catch (e) { setError(errMsg(e)) }
  }

  const removeCourse = async (c) => {
    if (!window.confirm(`Delete course "${c.title}"?`)) return
    try {
      await courseService.remove(c._id)
      setNotice('Course deleted')
      loadAll()
    } catch (e) { setError(errMsg(e)) }
  }

  if (loading) return <Loader />

  const roleCount = (r) => stats?.usersByRole?.[r] || 0

  const tabs = [
    { id: 'analytics', label: 'Analytics' },
    { id: 'users', label: 'Manage users' },
    { id: 'courses', label: 'Manage courses' },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <span className="mb-2 inline-block text-xs font-extrabold uppercase tracking-[0.13em] text-violet-700">Workspace</span>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Admin dashboard</h1>
      <p className="mb-7 mt-2 text-slate-600">Signed in as {user.name}</p>
      {error && <div role="alert" className="mb-4 flex items-center justify-between rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}<button type="button" aria-label="Dismiss error" onClick={() => setError('')}>×</button></div>}
      {notice && <div role="status" className="mb-4 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}<button type="button" aria-label="Dismiss notice" onClick={() => setNotice('')}>×</button></div>}

      {stats && (
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
          {[['Users', stats.totals.users], ['Courses', stats.totals.courses], ['Enrollments', stats.totals.enrollments],
            ['Students', roleCount('student')], ['Instructors', roleCount('instructor')]].map(([label, n]) => (
            <div key={label} className="stat-card p-5">
              <div className="text-sm font-medium text-slate-500">{label}</div>
              <div className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">{n}</div>
            </div>
          ))}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex overflow-x-auto border-b border-slate-200 px-4" role="tablist" aria-label="Admin sections">
          {tabs.map((tab) => (
            <button key={tab.id} id={`tab-${tab.id}`} type="button" role="tab" aria-selected={activeTab === tab.id} aria-controls={`panel-${tab.id}`} onClick={() => setActiveTab(tab.id)} className={`shrink-0 border-b-2 px-4 py-4 text-sm font-semibold transition ${activeTab === tab.id ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'analytics' && (
          <div id="panel-analytics" role="tabpanel" aria-labelledby="tab-analytics" className="grid gap-5 p-4 lg:grid-cols-[1.4fr_1fr] sm:p-6">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <h2 className="border-b border-slate-100 px-5 py-4 text-base font-bold text-slate-900">Top courses by enrollment</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3 font-bold">Course</th><th className="px-4 py-3 font-bold">Enrollments</th><th className="px-4 py-3 font-bold">Avg. progress</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.topCourses.map((t) => <tr key={t.courseId}><td className="px-4 py-3 font-medium text-slate-800">{t.title}</td><td className="px-4 py-3 text-slate-600">{t.enrollments}</td><td className="px-4 py-3 text-slate-600">{t.avgProgress}%</td></tr>)}
                    {stats.topCourses.length === 0 && <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-500">No enrollments yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 p-5">
              <h2 className="mb-3 text-base font-bold text-slate-900">Courses by category</h2>
              {stats.coursesByCategory.map((c) => (
                <div key={c.category} className="flex items-center justify-between border-b border-slate-100 py-3 text-sm last:border-0"><span className="text-slate-700">{c.category}</span><span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">{c.count}</span></div>
              ))}
              {stats.coursesByCategory.length === 0 && <p className="text-sm text-slate-500">No categories yet.</p>}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div id="panel-users" role="tabpanel" aria-labelledby="tab-users" className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4 font-bold">Name</th><th className="px-5 py-4 font-bold">Email</th><th className="px-5 py-4 font-bold">Role</th><th className="px-5 py-4 font-bold">Joined</th><th className="px-5 py-4" /></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="text-slate-700 hover:bg-violet-50/40">
                    <td className="px-5 py-4 font-semibold text-slate-900">{u.name}</td>
                    <td className="px-5 py-4">{u.email}</td>
                    <td className="px-5 py-4">
                      <select aria-label={`Role for ${u.name}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-400" value={u.role} disabled={u._id === user._id} onChange={(e) => changeRole(u._id, e.target.value)}>
                        <option value="student">student</option><option value="instructor">instructor</option><option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="px-5 py-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-right"><button type="button" className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-40" disabled={u._id === user._id} onClick={() => removeUser(u)}>Delete</button></td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">No users found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'courses' && (
          <div id="panel-courses" role="tabpanel" aria-labelledby="tab-courses" className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4 font-bold">Title</th><th className="px-5 py-4 font-bold">Instructor</th><th className="px-5 py-4 font-bold">Category</th><th className="px-5 py-4 font-bold">Price</th><th className="px-5 py-4" /></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((c) => (
                  <tr key={c._id} className="text-slate-700 hover:bg-violet-50/40">
                    <td className="px-5 py-4 font-semibold text-slate-900">{c.title}</td><td className="px-5 py-4">{c.instructor?.name}</td><td className="px-5 py-4">{c.category}</td><td className="px-5 py-4">{c.price === 0 ? 'Free' : `$${c.price}`}</td>
                    <td className="px-5 py-4 text-right"><button type="button" className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50" onClick={() => removeCourse(c)}>Delete</button></td>
                  </tr>
                ))}
                {courses.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">No courses found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
