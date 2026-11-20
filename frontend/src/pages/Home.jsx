import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CourseCard from '../components/CourseCard'
import Loader from '../components/Loader'
import { courseService, errMsg } from '../services'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    courseService
      .list()
      .then((data) => setCourses(data.slice(0, 3)))
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <section className="hero mb-12 grid min-h-[370px] grid-cols-1 items-center gap-5 p-7 sm:p-10 lg:grid-cols-[1.2fr_0.8fr] lg:p-[4.5rem]">
        <div className="relative max-w-[610px]">
          <span className="mb-4 inline-block text-xs font-extrabold uppercase tracking-[0.13em] text-violet-200">Your next chapter starts here</span>
          <h1 className="mb-4 text-4xl font-extrabold leading-[1.06] tracking-[-0.065em] text-white sm:text-5xl lg:text-6xl">Make learning your superpower.</h1>
          <p className="max-w-[550px] text-base leading-7 text-white/80 sm:text-lg">Explore practical courses, learn at your own pace, and turn your curiosity into skills that move you forward.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/courses" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-violet-800 no-underline shadow transition hover:-translate-y-0.5 hover:bg-violet-50">Explore courses <span aria-hidden="true">→</span></Link>
            {!user && <Link to="/register" className="rounded-xl border border-white/50 px-5 py-3 text-sm font-bold text-white no-underline transition hover:bg-white/10">Join LearnHub</Link>}
          </div>
        </div>
        <div className="relative grid min-h-[210px] place-items-center sm:min-h-[250px]" aria-hidden="true">
          <div className="hero-art-glow" />
          <div className="hero-learning-card">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-[13px] bg-violet-100 text-xl text-violet-700">✦</span>
              <div>
                <div className="text-xs text-slate-500">YOUR LEARNING PATH</div>
                <div className="font-bold">Creative coding</div>
              </div>
            </div>
            <div className="text-xs text-slate-500">A little progress adds up.</div>
            <div className="learning-progress"><span /></div>
            <div className="flex justify-between text-xs text-slate-500"><span>Keep going</span><strong>72%</strong></div>
          </div>
        </div>
      </section>

      <section aria-labelledby="latest-courses-title">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-2 inline-block text-xs font-extrabold uppercase tracking-[0.13em] text-violet-700">Picked for curious minds</span>
            <h2 id="latest-courses-title" className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Find your next favorite course</h2>
            <p className="mt-2 text-slate-600">Fresh ideas and practical skills, ready when you are.</p>
          </div>
          <Link to="/courses" className="self-start rounded-lg border border-violet-200 px-4 py-2.5 text-sm font-semibold text-violet-700 no-underline transition hover:bg-violet-50 sm:self-auto">See all courses <span aria-hidden="true">→</span></Link>
        </div>
      {loading && <Loader />}
      {error && <div role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => (
          <CourseCard key={c._id} course={c} />
        ))}
      </div>
      {!loading && !error && courses.length === 0 && <p className="text-slate-500">No courses yet.</p>}
      </section>
    </div>
  )
}
