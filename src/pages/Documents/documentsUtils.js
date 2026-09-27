export const DOCUMENTS_STORE = 'documents'

// Text files above this are stored as blobs and offered as download/view only.
export const MAX_EDITABLE_BYTES = 2 * 1024 * 1024

const TEXT_MIME_PATTERN =
  /^text\/|^application\/(json|ld\+json|xml|xhtml\+xml|javascript|x-javascript|ecmascript|x-sh|x-yaml|yaml|toml|sql|x-tex)$|\+(json|xml)$/i

const TEXT_EXTENSIONS = new Set([
  'txt', 'md', 'markdown', 'csv', 'tsv', 'json', 'jsonc', 'js', 'mjs', 'cjs', 'jsx', 'ts', 'tsx',
  'css', 'scss', 'less', 'html', 'htm', 'xml', 'svg', 'yml', 'yaml', 'toml', 'ini', 'cfg', 'conf',
  'env', 'log', 'py', 'rb', 'go', 'rs', 'java', 'kt', 'c', 'h', 'cpp', 'hpp', 'cs', 'php', 'sh',
  'bat', 'ps1', 'sql', 'tex', 'srt', 'vtt', 'gitignore',
])

function getExtension(name) {
  const dot = name.lastIndexOf('.')
  return dot === -1 ? '' : name.slice(dot + 1).toLowerCase()
}

export function isTextLike(name, type) {
  return TEXT_MIME_PATTERN.test(type) || TEXT_EXTENSIONS.has(getExtension(name))
}

export function createId() {
  return globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 11)
}

// Text records keep a `text` string (editable); everything else keeps the original `blob`.
export async function createDocumentRecord(file) {
  const now = Date.now()
  const base = {
    id: createId(),
    name: file.name,
    type: file.type,
    size: file.size,
    createdAt: now,
    updatedAt: now,
  }

  if (isTextLike(file.name, file.type) && file.size <= MAX_EDITABLE_BYTES) {
    return { ...base, kind: 'text', text: await file.text() }
  }
  return { ...base, kind: 'binary', blob: file }
}

export function getTextByteSize(text) {
  return new Blob([text]).size
}

function getDocumentBlob(doc) {
  return doc.kind === 'text'
    ? new Blob([doc.text], { type: doc.type || 'text/plain' })
    : doc.blob
}

export function downloadDocument(doc) {
  const url = URL.createObjectURL(getDocumentBlob(doc))
  const link = document.createElement('a')
  link.href = url
  link.download = doc.name
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// Scriptable or unknown types open as plain text so they can't run with this app's origin.
export function viewDocument(doc) {
  const blob = getDocumentBlob(doc)
  const safeBlob =
    !blob.type || /html|xml|svg|javascript/i.test(blob.type)
      ? new Blob([blob], { type: 'text/plain' })
      : blob
  const url = URL.createObjectURL(safeBlob)
  window.open(url, '_blank', 'noopener')
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`
}

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatDateTime(timestamp) {
  return dateTimeFormatter.format(new Date(timestamp))
}

export function describeType(doc) {
  if (doc.type) return doc.type
  const extension = getExtension(doc.name)
  return extension ? `.${extension} file` : 'Unknown type'
}
