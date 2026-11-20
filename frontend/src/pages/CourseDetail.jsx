import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Loader from '../components/Loader'
import { courseService, enrollmentService, errMsg } from '../services'
import { useAuth } from '../context/AuthContext'

export default function CourseDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [enrollment, setEnrollment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    try {
      setCourse(await courseService.get(id))
      if (user?.role === 'student') {
        const mine = await enrollmentService.myCourses()
        setEnrollment(mine.find((e) => e.course._id === id) || null)
      }
    } catch (e) {
      setError(errMsg(e))
    } finally {
      setLoading(false)
    }
  }, [id, user])

  useEffect(() => { load() }, [load])

  const enroll = async () => {
    if (!user) return navigate('/login', { state: { from: `/courses/${id}` } })
    setError(''); setMessage('')
    try {
      await enrollmentService.enroll(id)
      setMessage('You are now enrolled in this course!')
      load()
    } catch (e) {
      setError(errMsg(e))
    }
  }

  const toggleLesson = async (lessonId, done) => {
    try {
      const updated = await enrollmentService.setProgress(id, lessonId, !done)
      setEnrollment({ ...enrollment, ...updated })
    } catch (e) {
      setError(errMsg(e))
    }
  }

  if (loading) return <Loader />
  if (!course) return <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error || 'Course not found'}</div></div>

  const done = new Set((enrollment?.completedLessons || []).map(String))

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Link to="/courses" className="text-sm font-semibold text-violet-700 no-underline hover:text-violet-900">← Back to courses</Link>
      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <span className="mb-3 inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">{course.category}</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{course.title}</h1>
          <p className="mt-2 text-sm text-slate-500">By {course.instructor?.name}</p>
          <p className="mt-5 max-w-3xl leading-7 text-slate-700">{course.description}</p>

          {error && <div role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          {message && <div role="status" className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div>}

          <div className="mb-4 mt-9 flex items-end justify-between">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Course lessons <span className="text-sm font-medium text-slate-500">({course.lessons.length})</span></h2>
            {enrollment && <span className="text-sm font-semibold text-violet-700">{enrollment.progress}% complete</span>}
          </div>
          {enrollment && <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all" style={{ width: `${enrollment.progress}%` }} /></div>}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {course.lessons.length === 0 && <div className="px-5 py-4 text-sm text-slate-500">No lessons published yet.</div>}
            {course.lessons.map((l, i) => (
              <div key={l._id} className="border-b border-slate-100 px-5 py-4 last:border-b-0">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <strong className="text-sm font-semibold text-slate-800">{i + 1}. {l.title}</strong>
                  {enrollment ? (
                    <button type="button" className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${done.has(l._id) ? 'bg-emerald-50 text-emerald-700' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'}`} onClick={() => toggleLesson(l._id, done.has(l._id))}>
                      {done.has(l._id) ? '✓ Completed' : 'Mark complete'}
                    </button>
                  ) : !course.canSeeContent && <span className="text-xs text-slate-500">🔒 Enroll to unlock</span>}
                </div>
                {course.canSeeContent && l.content && <div className="mt-2 text-sm leading-6 text-slate-600">{l.content}</div>}
                {course.canSeeContent && l.videoUrl && <a className="mt-2 inline-block text-sm font-semibold text-violet-700" href={l.videoUrl} target="_blank" rel="noreferrer">Watch video ↗</a>}
              </div>
            ))}
          </div>
        </div>

        <aside className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900">{course.price === 0 ? 'Free' : `$${course.price}`}</div>
            <p className="mb-5 mt-1 text-sm text-slate-500">{course.lessons.length} lessons · Learn at your own pace</p>
            {enrollment ? (
              <button type="button" className="w-full rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700" disabled>✓ Enrolled</button>
            ) : user && user.role !== 'student' ? (
              <p className="mb-0 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">Only students can enroll. You are signed in as {user.role}.</p>
            ) : (
              <button type="button" className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700" onClick={enroll}>{user ? 'Enroll now' : 'Login to enroll'}</button>
            )}
        </aside>
      </div>
    </div>
  )
}
