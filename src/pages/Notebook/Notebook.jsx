import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import EditableBox from '../../components/EditableBox/EditableBox.jsx'
import EditableSurface from '../../components/EditableBox/EditableSurface.jsx'
import useDebouncedCallback from '../../hooks/useDebouncedCallback.js'
import { revealVariants } from '../../lib/motion.js'
import './Notebook.css'

const STORAGE_KEY = 'notebook.content'
const SAVE_DELAY_MS = 500

const STATUS_LABELS = {
  saved: 'Saved',
  pending: 'Saving…',
  error: 'Couldn’t save: browser storage is full or blocked',
}

function readNote() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === null ? '' : JSON.parse(stored)
  } catch {
    return ''
  }
}

export default function Notebook() {
  const [text, setText] = useState(readNote)
  const [status, setStatus] = useState('saved')

  // Writes directly (not via useLocalStorage) so the unmount flush still persists.
  const persist = useCallback((value) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      setStatus('saved')
    } catch {
      setStatus('error')
    }
  }, [])

  const { run: scheduleSave, flush } = useDebouncedCallback(persist, SAVE_DELAY_MS)

  useEffect(() => {
    window.addEventListener('pagehide', flush)
    return () => window.removeEventListener('pagehide', flush)
  }, [flush])

  const handleChange = useCallback(
    (event) => {
      const { value } = event.target
      setText(value)
      setStatus('pending')
      scheduleSave(value)
    },
    [scheduleSave],
  )

  return (
    <section className="notebook">
      <header className="notebook__header">
        <div className="notebook__heading">
          <p className="eyebrow">Free write</p>
          <h1 className="notebook__title">Notebook</h1>
        </div>
        <p className={`notebook__status notebook__status--${status}`} role="status">
          <span className="notebook__status-dot" aria-hidden="true" />
          {STATUS_LABELS[status]}
        </p>
      </header>

      <motion.div variants={revealVariants} initial="hidden" animate="visible">
        <EditableBox id="notebook.panel" label="Notebook panel" className="notebook__editable" passThrough>
          <EditableSurface className="notebook__panel glass">
            <label htmlFor="notebook-text" className="visually-hidden">Notebook</label>
            <textarea
              id="notebook-text"
              className="notebook__textarea"
              placeholder="Start writing…"
              value={text}
              onChange={handleChange}
            />
          </EditableSurface>
        </EditableBox>
      </motion.div>
    </section>
  )
}
