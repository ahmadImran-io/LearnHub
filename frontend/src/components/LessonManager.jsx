import { useState } from 'react'
import Dialog from './Dialog'
import { courseService, errMsg } from '../services'

// Instructor tool: view, add and delete a course's lessons
export default function LessonManager({ course, onClose, onChanged }) {
  const [lessons, setLessons] = useState(course.lessons || [])
  const [form, setForm] = useState({ title: '', content: '', videoUrl: '' })
  const [error, setError] = useState('')

  const add = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const lesson = await courseService.addLesson(course._id, form)
      const next = [...lessons, lesson]
      setLessons(next)
      setForm({ title: '', content: '', videoUrl: '' })
      onChanged(course._id, next)
    } catch (err) {
      setError(errMsg(err))
    }
  }

  const remove = async (id) => {
    try {
      await courseService.removeLesson(course._id, id)
      const next = lessons.filter((l) => l._id !== id)
      setLessons(next)
      onChanged(course._id, next)
    } catch (err) {
      setError(errMsg(err))
    }
  }

  const fieldClass = 'mb-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100'

  return (
    <Dialog title={`Lessons – ${course.title}`} onClose={onClose} wide>
      <div className="max-h-[75vh] overflow-y-auto p-6">
        {error && <div role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <div className="mb-6 overflow-hidden rounded-xl border border-slate-200">
          {lessons.length === 0 && <div className="px-4 py-3 text-sm text-slate-500">No lessons yet.</div>}
          {lessons.map((l, i) => (
            <div key={l._id} className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 last:border-0">
              <span className="text-sm font-medium text-slate-700">{i + 1}. {l.title}</span>
              <button type="button" className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50" onClick={() => remove(l._id)}>Delete</button>
            </div>
          ))}
        </div>
        <form onSubmit={add}>
          <h3 className="mb-3 text-base font-bold text-slate-900">Add a lesson</h3>
          <input aria-label="Lesson title" className={fieldClass} placeholder="Lesson title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea aria-label="Lesson notes or content" className={fieldClass} rows={3} placeholder="Lesson notes / content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          <input aria-label="Video URL" className={fieldClass} placeholder="Video URL (optional)" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
          <button type="submit" className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-700">Add lesson</button>
        </form>
      </div>
    </Dialog>
  )
}
