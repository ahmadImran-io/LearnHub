import { useEffect, useRef } from 'react'

export default function Dialog({ title, onClose, children, wide = false }) {
  const closeButton = useRef(null)
  const dialog = useRef(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key === 'Tab') {
        const focusable = dialog.current?.querySelectorAll('a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)')
        if (!focusable?.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus?.()
    }
  }, [onClose])

  return (
    <div className="modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section ref={dialog} role="dialog" aria-modal="true" aria-labelledby="dialog-title" className={`w-full overflow-hidden rounded-2xl bg-white shadow-2xl ${wide ? 'max-w-2xl' : 'max-w-lg'}`}>
        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 id="dialog-title" className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
          <button ref={closeButton} type="button" aria-label="Close dialog" className="grid size-9 place-items-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" onClick={onClose}>×</button>
        </header>
        {children}
      </section>
    </div>
  )
}
