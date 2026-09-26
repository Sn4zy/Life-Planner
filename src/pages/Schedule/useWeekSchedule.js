import { useCallback, useMemo } from 'react'
import useLocalStorage from '../../hooks/useLocalStorage.js'
import {
  addDays,
  describeEntries,
  formatMonth,
  getGapMinutes,
  parseISODate,
  sortEntries,
  toISODate,
  todayISO,
} from './scheduleUtils.js'

// templates: { [weekday 0-6, Monday = 0]: [{ from: 'YYYY-MM-DD', entries }] }, ascending by `from`
// overrides: { 'YYYY-MM-DD': entries }
const TEMPLATES_KEY = 'schedule.templates'
const OVERRIDES_KEY = 'schedule.overrides'

function templateEntriesOn(versions, iso) {
  if (!versions) return null
  for (let i = versions.length - 1; i >= 0; i -= 1) {
    if (versions[i].from <= iso) return versions[i].entries
  }
  return null
}

function withoutKey(object, key) {
  const next = { ...object }
  delete next[key]
  return next
}

export default function useWeekSchedule(weekStartISO) {
  const [templates, setTemplates] = useLocalStorage(TEMPLATES_KEY, {})
  const [overrides, setOverrides] = useLocalStorage(OVERRIDES_KEY, {})

  const days = useMemo(() => {
    const weekStart = parseISODate(weekStartISO)

    return Array.from({ length: 7 }, (_, weekday) => {
      const date = addDays(weekStart, weekday)
      const iso = toISODate(date)
      const override = overrides[iso]
      const rawEntries = override ?? templateEntriesOn(templates[weekday], iso) ?? []
      const entries = sortEntries(rawEntries)
      const gapMinutes = getGapMinutes(entries)

      return {
        iso,
        weekday,
        dayOfMonth: date.getDate(),
        monthLabel: formatMonth(date),
        entries,
        gapMinutes,
        summary: describeEntries(entries, gapMinutes),
        isOverride: Boolean(override),
      }
    })
  }, [weekStartISO, templates, overrides])

  const currentTemplates = useMemo(
    () => Array.from({ length: 7 }, (_, weekday) => templates[weekday]?.at(-1)?.entries ?? []),
    [templates],
  )

  const setTemplate = useCallback(
    (weekday, entries) => {
      const from = todayISO()
      setTemplates((prev) => {
        const pastVersions = (prev[weekday] ?? []).filter((version) => version.from < from)
        if (!entries.length && !pastVersions.length) return withoutKey(prev, weekday)
        return { ...prev, [weekday]: [...pastVersions, { from, entries }] }
      })
    },
    [setTemplates],
  )

  const setOverride = useCallback(
    (iso, entries) => setOverrides((prev) => ({ ...prev, [iso]: entries })),
    [setOverrides],
  )

  const clearOverride = useCallback(
    (iso) => setOverrides((prev) => withoutKey(prev, iso)),
    [setOverrides],
  )

  return { days, currentTemplates, setTemplate, setOverride, clearOverride }
}
