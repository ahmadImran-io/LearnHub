import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CourseCard from '../components/CourseCard'
import Loader from '../components/Loader'
import { courseService, errMsg } from '../services'

export default function CourseList() {
  const [courses, setCourses] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load the category options once
  useEffect(() => {
    courseService.list().then((all) => setCategories([...new Set(all.map((c) => c.category))])).catch(() => {})
  }, [])

  // Re-fetch whenever the filters change (debounced for typing)
  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => {
      courseService
        .list({ search, category })
        .then((data) => { setCourses(data); setError('') })
        .catch((e) => setError(errMsg(e)))
        .finally(() => setLoading(false))
    }, 250)
    return () => clearTimeout(t)
  }, [search, category])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mb-7">
        <span className="mb-2 inline-block text-xs font-extrabold uppercase tracking-[0.13em] text-violet-700">Explore LearnHub</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">All courses</h1>
        <p className="mt-2 text-slate-600">Find the right course to grow your skills and keep moving forward.</p>
      </div>
      <div className="mb-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[2fr_1fr]">
        <label className="sr-only" htmlFor="course-search">Search courses</label>
        <input id="course-search" placeholder="Search courses…" value={search} onChange={(e) => setSearch(e.target.value)} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
        <label className="sr-only" htmlFor="course-category">Filter by category</label>
        <select id="course-category" value={category} onChange={(e) => setCategory(e.target.value)} className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {error && <div role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {loading ? (
        <Loader />
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">
          <p className="mb-3">No courses match your search.</p>
          <Link to="/courses" onClick={() => { setSearch(''); setCategory('') }} className="font-semibold text-violet-700">Clear filters</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => <CourseCard key={c._id} course={c} />)}
        </div>
      )}
    </div>
  )
}
