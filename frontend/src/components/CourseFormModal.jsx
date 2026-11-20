import { useEffect, useState } from 'react'
import Dialog from './Dialog'
import { courseService, errMsg } from '../services'

const empty = { title: '', description: '', category: '', price: 0 }

// Used for both creating (course = null) and editing a course
export default function CourseFormModal({ show, course, onClose, onSaved }) {
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (show) {
      setForm(course ? { title: course.title, description: course.description, category: course.category, price: course.price } : empty)
      setError('')
    }
  }, [show, course])

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = { ...form, price: Number(form.price) }
      const saved = course ? await courseService.update(course._id, payload) : await courseService.create(payload)
      onSaved(saved)
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setSaving(false)
    }
  }

  if (!show) return null

  const fieldClass = 'mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100'

  return (
    <Dialog title={course ? 'Edit course' : 'Create course'} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className="space-y-4 px-6 py-5">
          {error && <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <div>
            <label htmlFor="course-title" className="text-sm font-semibold text-slate-700">Title</label>
            <input id="course-title" name="title" value={form.title} onChange={change} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="course-description" className="text-sm font-semibold text-slate-700">Description</label>
            <textarea id="course-description" rows={3} name="description" value={form.description} onChange={change} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="course-category" className="text-sm font-semibold text-slate-700">Category</label>
            <input id="course-category" name="category" value={form.category} onChange={change} placeholder="e.g. Web Development" className={fieldClass} />
          </div>
          <div>
            <label htmlFor="course-price" className="text-sm font-semibold text-slate-700">Price (USD, 0 = free)</label>
            <input id="course-price" type="number" min="0" name="price" value={form.price} onChange={change} className={fieldClass} />
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button type="button" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={onClose}>Cancel</button>
          <button type="submit" className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </Dialog>
  )
}
