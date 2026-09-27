import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { EditModeContext } from './EditModeContext.js'

const KEEPS_SELECTION = '.editable-box, [data-edit-ignore], [data-edit-inspector]'

export default function EditModeProvider({ children }) {
  const { pathname } = useLocation()
  const [isEditing, setIsEditing] = useState(false)
  const [selection, setSelection] = useState(null)

  // Selection belongs to the page it was made on, so navigating away hides it without an effect.
  const selected = isEditing && selection?.path === pathname ? selection : null

  const setEditing = useCallback((editing) => {
    setIsEditing(editing)
    setSelection(null)
  }, [])

  const toggleEditing = useCallback(() => {
    setIsEditing((editing) => !editing)
    setSelection(null)
  }, [])

  const select = useCallback(
    (id, label = id) => setSelection(id ? { id, label, path: pathname } : null),
    [pathname],
  )

  const deselect = useCallback(
    (id) => setSelection((current) => (current?.id === id ? null : current)),
    [],
  )

  useEffect(() => {
    if (!isEditing) return undefined

    const handlePointerDown = (event) => {
      if (event.target instanceof Element && event.target.closest(KEEPS_SELECTION)) return
      setSelection(null)
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setSelection(null)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isEditing])

  const value = useMemo(
    () => ({ isEditing, setEditing, toggleEditing, selected, select, deselect }),
    [isEditing, setEditing, toggleEditing, selected, select, deselect],
  )

  return <EditModeContext value={value}>{children}</EditModeContext>
}
