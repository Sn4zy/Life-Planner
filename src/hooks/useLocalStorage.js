import { useEffect, useState } from 'react'

function readStoredValue(key, initialValue) {
  const fallback = typeof initialValue === 'function' ? initialValue() : initialValue

  try {
    const stored = window.localStorage.getItem(key)
    return stored === null ? fallback : JSON.parse(stored)
  } catch {
    return fallback
  }
}

// Assumes a stable `key` for the lifetime of the component.
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readStoredValue(key, initialValue))

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage full or unavailable (e.g. private mode): keep the in-memory value.
    }
  }, [key, value])

  return [value, setValue]
}
