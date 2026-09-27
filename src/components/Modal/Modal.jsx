import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import EditableBox from '../EditableBox/EditableBox.jsx'
import EditableSurface from '../EditableBox/EditableSurface.jsx'
import './Modal.css'

const panelMotion = {
  initial: { opacity: 0, scale: 0.94, y: 16 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 8 },
  transition: { type: 'spring', stiffness: 380, damping: 30 },
}

export default function Modal({ open, onClose, labelledBy, editableId, editableLabel, children }) {
  useEffect(() => {
    if (!open) return undefined

    const previouslyFocused = document.activeElement
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [open, onClose])

  const panel = <EditableSurface className="modal__panel glass">{children}</EditableSurface>

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose()
          }}
        >
          <motion.div
            className="modal__panel-motion"
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            {...panelMotion}
          >
            {editableId ? (
              <EditableBox id={editableId} label={editableLabel} className="modal__editable" passThrough>
                {panel}
              </EditableBox>
            ) : (
              panel
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
