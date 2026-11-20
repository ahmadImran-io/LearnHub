import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Loader from '../components/Loader'
import { enrollmentService, errMsg } from '../services'
import { useAuth } from '../context/AuthContext'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    enrollmentService
      .myCourses()
      .then(setEnrollments)
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false))
  }, [])

  const completed = enrollments.filter((e) => e.progress === 100).length

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <span className="mb-2 inline-block text-xs font-extrabold uppercase tracking-[0.13em] text-violet-700">Your learning space</span>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Hi {user.name} 👋</h1>
      <p className="mb-7 mt-2 text-slate-600">Your enrolled courses and learning progress</p>
      {error && <div role="alert" className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {loading ? <Loader /> : (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[['Enrolled', enrollments.length], ['Completed', completed], ['In progress', enrollments.length - completed]].map(([label, count]) => (
              <div key={label} className="stat-card p-5">
                <div className="text-sm font-medium text-slate-500">{label}</div>
                <div className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">{count}</div>
              </div>
            ))}
          </div>
          {enrollments.length === 0 ? (
            <div className="rounded-2xl border border-violet-100 bg-violet-50 p-6 text-sm text-violet-900">
              You have not enrolled in any course yet. <Link to="/courses" className="font-bold text-violet-700">Browse courses</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {enrollments.map((e) => (
                <article key={e._id} className="course-card p-5">
                  <h2 className="text-lg font-bold tracking-tight text-slate-900">{e.course.title}</h2>
                  <div className="mb-4 mt-2 text-sm text-slate-500">By {e.course.instructor?.name} · {e.completedLessons.length}/{e.course.lessons.length} lessons</div>
                  <div className="mb-2 flex justify-between text-xs font-semibold text-slate-600"><span>Progress</span><span>{e.progress}%</span></div>
                  <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400" style={{ width: `${e.progress}%` }} /></div>
                  <Link to={`/courses/${e.course._id}`} className="inline-block rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-bold text-white no-underline transition hover:bg-violet-700">{e.progress === 100 ? 'Review course' : 'Continue learning'}</Link>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
