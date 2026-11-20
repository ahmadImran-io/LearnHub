import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Loader from '../components/Loader'
import CourseFormModal from '../components/CourseFormModal'
import LessonManager from '../components/LessonManager'
import { courseService, errMsg } from '../services'
import { useAuth } from '../context/AuthContext'

export default function InstructorDashboard() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [formCourse, setFormCourse] = useState(undefined) // undefined = closed, null = create, object = edit
  const [lessonCourse, setLessonCourse] = useState(null)

  useEffect(() => {
    courseService
      .mine()
      .then(setCourses)
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false))
  }, [])

  const saved = (course) => {
    const exists = courses.some((c) => c._id === course._id)
    setCourses(exists ? courses.map((c) => (c._id === course._id ? course : c)) : [course, ...courses])
    setNotice(exists ? 'Course updated' : 'Course created')
    setFormCourse(undefined)
  }

  const remove = async (course) => {
    if (!window.confirm(`Delete "${course.title}"? Enrollments will be removed too.`)) return
    try {
      await courseService.remove(course._id)
      setCourses(courses.filter((c) => c._id !== course._id))
      setNotice('Course deleted')
    } catch (e) {
      setError(errMsg(e))
    }
  }

  const lessonsChanged = (id, lessons) => setCourses(courses.map((c) => (c._id === id ? { ...c, lessons } : c)))

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="mb-2 inline-block text-xs font-extrabold uppercase tracking-[0.13em] text-violet-700">Teach on LearnHub</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Instructor dashboard</h1>
          <span className="mt-1 inline-block text-sm text-slate-500">Welcome, {user.name}</span>
        </div>
        <button type="button" className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700" onClick={() => setFormCourse(null)}>+ New course</button>
      </div>
      {error && <div role="alert" className="mb-4 flex items-center justify-between rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}<button type="button" aria-label="Dismiss error" onClick={() => setError('')}>×</button></div>}
      {notice && <div role="status" className="mb-4 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}<button type="button" aria-label="Dismiss notice" onClick={() => setNotice('')}>×</button></div>}

      {loading ? <Loader /> : courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <h2 className="text-lg font-bold text-slate-900">Your teaching journey starts here</h2>
          <p className="mt-2 text-sm text-slate-500">You have not created any courses yet.</p>
          <button type="button" className="mt-5 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-700" onClick={() => setFormCourse(null)}>Create your first course</button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4 font-bold">Title</th><th className="px-5 py-4 font-bold">Category</th><th className="px-5 py-4 font-bold">Price</th><th className="px-5 py-4 font-bold">Lessons</th><th className="px-5 py-4 text-right font-bold">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map((c) => (
                <tr key={c._id} className="text-slate-700 transition hover:bg-violet-50/40">
                  <td className="px-5 py-4 font-semibold"><Link to={`/courses/${c._id}`} className="text-violet-700 no-underline hover:text-violet-900">{c.title}</Link></td>
                  <td className="px-5 py-4">{c.category}</td>
                  <td className="px-5 py-4">{c.price === 0 ? 'Free' : `$${c.price}`}</td>
                  <td className="px-5 py-4">{c.lessons.length}</td>
                  <td className="space-x-2 px-5 py-4 text-right">
                    <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50" onClick={() => setLessonCourse(c)}>Lessons</button>
                    <button type="button" className="rounded-lg border border-violet-200 px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-50" onClick={() => setFormCourse(c)}>Edit</button>
                    <button type="button" className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50" onClick={() => remove(c)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CourseFormModal show={formCourse !== undefined} course={formCourse} onClose={() => setFormCourse(undefined)} onSaved={saved} />
      {lessonCourse && <LessonManager course={lessonCourse} onClose={() => setLessonCourse(null)} onChanged={lessonsChanged} />}
    </div>
  )
}
