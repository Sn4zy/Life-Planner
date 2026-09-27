export const BOOKMARKS_STORE = 'bookmarks'
export const BOOKMARK_LISTS_STORE = 'bookmarkLists'

// Sidebar selection value for "show every bookmark"; bookmarks with listId null only appear here.
export const ALL_LISTS = 'all'

export function createId() {
  return globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 11)
}

// Returns '' for empty input, null for anything that isn't a valid http(s) URL.
export function normalizeUrl(value) {
  const trimmed = value.trim()
  if (!trimmed) return ''

  const hasScheme = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed)
  try {
    const url = new URL(hasScheme ? trimmed : `https://${trimmed}`)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}
