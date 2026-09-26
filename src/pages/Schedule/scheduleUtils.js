const pad = (value) => String(value).padStart(2, '0')

export function toISODate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function parseISODate(iso) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

export function startOfWeek(date) {
  const mondayOffset = (date.getDay() + 6) % 7
  return addDays(date, -mondayOffset)
}

export function todayISO() {
  return toISODate(new Date())
}

export function currentWeekStartISO() {
  return toISODate(startOfWeek(new Date()))
}

export function shiftWeekISO(weekStartISO, weeks) {
  return toISODate(addDays(parseISODate(weekStartISO), weeks * 7))
}

const rangeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export function formatWeekRange(weekStartISO) {
  const start = parseISODate(weekStartISO)
  return rangeFormatter.formatRange(start, addDays(start, 6))
}

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short' })
const longDateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})

export function formatMonth(date) {
  return monthFormatter.format(date)
}

export function formatLongDate(iso) {
  return longDateFormatter.format(parseISODate(iso))
}

export function toMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function formatDuration(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (!hours) return `${minutes}m`
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`
}

export function formatTimeRange({ start, end }) {
  if (start && end) return `${start}–${end}`
  if (start) return `from ${start}`
  if (end) return `until ${end}`
  return ''
}

export function sortEntries(entries) {
  return [...entries].sort((a, b) => {
    if (a.start && b.start) return toMinutes(a.start) - toMinutes(b.start)
    if (a.start) return -1
    if (b.start) return 1
    return 0
  })
}

const isFullyTimed = (entry) => Boolean(entry.start && entry.end)

// Expects entries already sorted by start time.
export function getGapMinutes(sortedEntries) {
  if (sortedEntries.length < 2) return null
  const [first, second] = sortedEntries
  if (!isFullyTimed(first) || !isFullyTimed(second)) return null
  return toMinutes(second.start) - toMinutes(first.end)
}

export function formatGap(gapMinutes) {
  if (gapMinutes > 0) return `gap ${formatDuration(gapMinutes)}`
  if (gapMinutes === 0) return 'back to back'
  return 'overlap'
}

export function describeEntries(sortedEntries, gapMinutes) {
  const parts = sortedEntries.map((entry) =>
    [entry.label, formatTimeRange(entry)].filter(Boolean).join(' '),
  )
  if (gapMinutes !== null) parts.splice(1, 0, formatGap(gapMinutes))
  return parts.join(' · ')
}

export function createId() {
  return globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 11)
}
