import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'

// Same key index.html reads before first paint.
const STORAGE_KEY = 'theme.mode'
const LIGHT_QUERY = '(prefers-color-scheme: light)'

function readStoredTheme() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY))
    return stored === 'light' || stored === 'dark' ? stored : null
  } catch {
    return null
  }
}

function subscribeToSystemTheme(onChange) {
  const query = window.matchMedia(LIGHT_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

const getSystemTheme = () => (window.matchMedia(LIGHT_QUERY).matches ? 'light' : 'dark')

// Follows the OS until the user picks a theme; only an explicit pick is stored.
export default function useColorTheme() {
  const systemTheme = useSyncExternalStore(subscribeToSystemTheme, getSystemTheme)
  const [storedTheme, setStoredTheme] = useState(readStoredTheme)
  const theme = storedTheme ?? systemTheme

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggleTheme = useCallback(() => {
    const next = theme === 'light' ? 'dark' : 'light'
    setStoredTheme(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Storage blocked: the choice still applies for this session.
    }
  }, [theme])

  return { theme, toggleTheme }
}
