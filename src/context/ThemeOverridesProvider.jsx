import { useCallback, useMemo } from 'react'
import useLocalStorage from '../hooks/useLocalStorage.js'
import { OVERRIDE_FIELDS, ThemeOverridesContext } from './ThemeOverridesContext.js'

const STORAGE_KEY = 'theme.overrides'

function pickOverrideFields(patch) {
  return Object.fromEntries(
    Object.entries(patch).filter(([field]) => OVERRIDE_FIELDS.includes(field)),
  )
}

function withoutId(overrides, id) {
  if (!(id in overrides)) return overrides
  const next = { ...overrides }
  delete next[id]
  return next
}

export default function ThemeOverridesProvider({ children }) {
  const [overrides, setOverrides] = useLocalStorage(STORAGE_KEY, {})

  // A field set to undefined is removed; an override left with no fields is dropped entirely.
  const setOverride = useCallback(
    (id, patch) =>
      setOverrides((prev) => {
        const merged = { ...prev[id], ...pickOverrideFields(patch) }
        for (const field of Object.keys(merged)) {
          if (merged[field] === undefined) delete merged[field]
        }
        return Object.keys(merged).length ? { ...prev, [id]: merged } : withoutId(prev, id)
      }),
    [setOverrides],
  )

  const clearOverride = useCallback(
    (id) => setOverrides((prev) => withoutId(prev, id)),
    [setOverrides],
  )

  const value = useMemo(
    () => ({ overrides, setOverride, clearOverride }),
    [overrides, setOverride, clearOverride],
  )

  return <ThemeOverridesContext value={value}>{children}</ThemeOverridesContext>
}
