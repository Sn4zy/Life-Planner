import { useCallback, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import EditableBox from '../../components/EditableBox/EditableBox.jsx'
import EditableSurface from '../../components/EditableBox/EditableSurface.jsx'
import EditableText from '../../components/EditableBox/EditableText.jsx'
import useIndexedDB from '../../hooks/useIndexedDB.js'
import { revealVariants, staggerDelay } from '../../lib/motion.js'
import DocumentListItem from './DocumentListItem.jsx'
import DocumentViewer from './DocumentViewer.jsx'
import { DOCUMENTS_STORE, createDocumentRecord, getTextByteSize } from './documentsUtils.js'
import './Documents.css'

const DISCARD_PROMPT = 'You have unsaved changes in the open document. Discard them?'

function confirmLeave(dirtyRef) {
  return !dirtyRef.current || window.confirm(DISCARD_PROMPT)
}

export default function Documents() {
  const { items, status, error, putItem, removeItem } = useIndexedDB(DOCUMENTS_STORE)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const dirtyRef = useRef(false)

  const filteredDocuments = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const sorted = [...items].sort((a, b) => b.updatedAt - a.updatedAt)
    return needle ? sorted.filter((doc) => doc.name.toLowerCase().includes(needle)) : sorted
  }, [items, query])

  const selectedDocument = selectedId ? items.find((doc) => doc.id === selectedId) : null

  const handleDirtyChange = useCallback((dirty) => {
    dirtyRef.current = dirty
  }, [])

  const handleSearchChange = useCallback((event) => setQuery(event.target.value), [])

  const handleSelect = useCallback(
    (id) => {
      if (id === selectedId || !confirmLeave(dirtyRef)) return
      setSelectedId(id)
    },
    [selectedId],
  )

  const handleClose = useCallback(() => {
    if (confirmLeave(dirtyRef)) setSelectedId(null)
  }, [])

  const handleUpload = useCallback(
    async (event) => {
      const files = [...(event.target.files ?? [])]
      event.target.value = ''
      if (!files.length || !confirmLeave(dirtyRef)) return

      setUploading(true)
      setUploadError('')
      let lastId = null
      try {
        for (const file of files) {
          const record = await createDocumentRecord(file)
          await putItem(record)
          lastId = record.id
        }
      } catch (uploadFailure) {
        setUploadError(
          `Upload failed${uploadFailure?.message ? `: ${uploadFailure.message}` : '.'} The browser may be out of storage space.`,
        )
      }
      if (lastId) setSelectedId(lastId)
      setUploading(false)
    },
    [putItem],
  )

  const handleSave = useCallback(
    (doc, text) =>
      putItem({ ...doc, text, size: getTextByteSize(text), updatedAt: Date.now() }),
    [putItem],
  )

  const handleDelete = useCallback(
    async (id) => {
      await removeItem(id)
      setSelectedId((current) => (current === id ? null : current))
    },
    [removeItem],
  )

  return (
    <section className="documents">
      <header className="documents__header">
        <div className="documents__heading">
          <p className="eyebrow">Files{status === 'ready' ? ` · ${items.length}` : ''}</p>
          <h1 className="documents__title">Documents</h1>
        </div>
        <label className={`documents__upload${uploading ? ' documents__upload--busy' : ''}`}>
          <input
            type="file"
            multiple
            className="visually-hidden"
            disabled={uploading}
            onChange={handleUpload}
          />
          {uploading ? 'Uploading…' : '+ Upload files'}
        </label>
      </header>

      {status === 'error' && (
        <p className="documents__message glass" role="alert">
          Couldn’t open browser storage, so documents can’t be loaded or kept. {error?.message}
        </p>
      )}
      {uploadError && (
        <p className="documents__message glass" role="alert">{uploadError}</p>
      )}

      <div className="documents__layout">
        <motion.div
          className="documents__list-slot"
          custom={staggerDelay(0)}
          variants={revealVariants}
          initial="hidden"
          animate="visible"
        >
          <EditableBox id="documents.list" label="Documents list" className="documents__editable" passThrough>
            <EditableSurface className="documents__list-panel glass">
              <div className="documents__search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="M16 16l4 4" />
                </svg>
                <label htmlFor="documents-search" className="visually-hidden">Search by filename</label>
                <input
                  id="documents-search"
                  type="search"
                  placeholder="Search by filename"
                  value={query}
                  onChange={handleSearchChange}
                />
              </div>

              {filteredDocuments.length > 0 ? (
                <ul className="documents__list">
                  {filteredDocuments.map((doc) => (
                    <DocumentListItem
                      key={doc.id}
                      doc={doc}
                      selected={doc.id === selectedId}
                      onSelect={handleSelect}
                    />
                  ))}
                </ul>
              ) : (
                status === 'ready' && (
                  <p className="documents__list-empty">
                    {items.length
                      ? `No files match “${query.trim()}”.`
                      : 'No documents yet. Upload any file to keep it here.'}
                  </p>
                )
              )}
            </EditableSurface>
          </EditableBox>
        </motion.div>

        <motion.div
          className="documents__viewer-slot"
          custom={staggerDelay(1)}
          variants={revealVariants}
          initial="hidden"
          animate="visible"
        >
          <EditableBox id="documents.viewer" label="Document panel" className="documents__editable" passThrough>
            {selectedDocument ? (
              <DocumentViewer
                key={selectedDocument.id}
                doc={selectedDocument}
                onSave={handleSave}
                onDelete={handleDelete}
                onClose={handleClose}
                onDirtyChange={handleDirtyChange}
              />
            ) : (
              <EditableSurface className="documents-viewer documents-viewer--empty glass">
                <EditableText id="documents.viewer.empty" as="p">Select a document to open it.</EditableText>
              </EditableSurface>
            )}
          </EditableBox>
        </motion.div>
      </div>
    </section>
  )
}
