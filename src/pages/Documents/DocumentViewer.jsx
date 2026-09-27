import { useEffect, useRef, useState } from 'react'
import EditableSurface from '../../components/EditableBox/EditableSurface.jsx'
import {
  MAX_EDITABLE_BYTES,
  describeType,
  downloadDocument,
  formatBytes,
  formatDateTime,
  isTextLike,
  viewDocument,
} from './documentsUtils.js'

const COPY_LABELS = { idle: 'Copy contents', copied: 'Copied', failed: 'Copy failed' }

export default function DocumentViewer({ doc, onSave, onDelete, onClose, onDirtyChange }) {
  const isText = doc.kind === 'text'
  const [draft, setDraft] = useState(isText ? doc.text : '')
  const [copyState, setCopyState] = useState('idle')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const panelRef = useRef(null)
  const dirty = isText && draft !== doc.text

  useEffect(() => {
    panelRef.current?.scrollIntoView({ block: 'nearest' })
  }, [])

  useEffect(() => {
    onDirtyChange(dirty)
    return () => onDirtyChange(false)
  }, [dirty, onDirtyChange])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draft)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
    setTimeout(() => setCopyState('idle'), 1800)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await onSave(doc, draft)
    } catch (saveError) {
      setError(saveError?.message || 'Couldn’t save this document.')
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true)
      return
    }
    try {
      await onDelete(doc.id)
    } catch (deleteError) {
      setError(deleteError?.message || 'Couldn’t delete this document.')
      setConfirmingDelete(false)
    }
  }

  const tooLargeToEdit = !isText && isTextLike(doc.name, doc.type) && doc.size > MAX_EDITABLE_BYTES

  return (
    <EditableSurface
      as="article"
      ref={panelRef}
      className="documents-viewer glass"
      aria-labelledby="documents-viewer-title"
    >
      <header className="documents-viewer__header">
        <div className="documents-viewer__heading">
          <h2 id="documents-viewer-title" className="documents-viewer__title">{doc.name}</h2>
          <p className="documents-viewer__meta">
            {describeType(doc)} · {formatBytes(doc.size)}
          </p>
          <p className="documents-viewer__meta">
            Added {formatDateTime(doc.createdAt)}
            {doc.updatedAt !== doc.createdAt && ` · Edited ${formatDateTime(doc.updatedAt)}`}
          </p>
        </div>
        <button
          type="button"
          className="documents-viewer__close"
          aria-label="Close document"
          onClick={onClose}
        >
          ×
        </button>
      </header>

      {isText ? (
        <>
          <label htmlFor="documents-viewer-editor" className="visually-hidden">
            Contents of {doc.name}
          </label>
          <textarea
            id="documents-viewer-editor"
            className="documents-viewer__editor"
            spellCheck={false}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
        </>
      ) : (
        <p className="documents-viewer__note">
          {tooLargeToEdit
            ? `This text file is larger than ${formatBytes(MAX_EDITABLE_BYTES)}, so it can’t be edited here. View or download it instead.`
            : 'This file type can’t be shown here. View it in a new tab or download it.'}
        </p>
      )}

      {error && <p className="documents-viewer__error" role="alert">{error}</p>}

      <footer className="documents-viewer__actions">
        {isText ? (
          <>
            <button
              type="button"
              className="documents-btn documents-btn--primary"
              disabled={!dirty || saving}
              onClick={handleSave}
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <button type="button" className="documents-btn" onClick={handleCopy}>
              {COPY_LABELS[copyState]}
            </button>
          </>
        ) : (
          <button
            type="button"
            className="documents-btn documents-btn--primary"
            onClick={() => viewDocument(doc)}
          >
            View
          </button>
        )}
        <button type="button" className="documents-btn" onClick={() => downloadDocument(doc)}>
          Download
        </button>
        <button
          type="button"
          className={`documents-btn documents-btn--danger${
            confirmingDelete ? ' documents-btn--armed' : ''
          }`}
          onClick={handleDelete}
        >
          {confirmingDelete ? 'Confirm delete' : 'Delete'}
        </button>
        {dirty && <span className="documents-viewer__dirty">Unsaved changes</span>}
      </footer>
    </EditableSurface>
  )
}
