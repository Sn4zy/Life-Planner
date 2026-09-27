import { memo } from 'react'
import { formatBytes, formatDateTime } from './documentsUtils.js'

function FileIcon({ isText }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      {isText && <path d="M9 13h6M9 17h4" />}
    </svg>
  )
}

function DocumentListItem({ doc, selected, onSelect }) {
  return (
    <li>
      <button
        type="button"
        className="documents-item"
        aria-current={selected ? 'true' : undefined}
        onClick={() => onSelect(doc.id)}
      >
        <span className="documents-item__icon">
          <FileIcon isText={doc.kind === 'text'} />
        </span>
        <span className="documents-item__text">
          <span className="documents-item__name">{doc.name}</span>
          <span className="documents-item__meta">
            {formatBytes(doc.size)} · {formatDateTime(doc.updatedAt)}
          </span>
        </span>
      </button>
    </li>
  )
}

export default memo(DocumentListItem)
