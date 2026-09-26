export const WEEKDAYS = [
  { long: 'Monday', short: 'Mon' },
  { long: 'Tuesday', short: 'Tue' },
  { long: 'Wednesday', short: 'Wed' },
  { long: 'Thursday', short: 'Thu' },
  { long: 'Friday', short: 'Fri' },
  { long: 'Saturday', short: 'Sat' },
  { long: 'Sunday', short: 'Sun' },
]

export const MAX_ENTRIES_PER_DAY = 2

export const PALETTE = [
  { id: 'crimson', name: 'Crimson', value: '#e5484d' },
  { id: 'amber', name: 'Amber', value: '#f5a524' },
  { id: 'emerald', name: 'Emerald', value: '#3fb68b' },
  { id: 'teal', name: 'Teal', value: '#2bb6c4' },
  { id: 'azure', name: 'Azure', value: '#4c8dff' },
  { id: 'violet', name: 'Violet', value: '#9b7bff' },
  { id: 'rose', name: 'Rose', value: '#f472b6' },
  { id: 'bone', name: 'Bone', value: '#d6d3cc' },
]

const PALETTE_BY_ID = Object.fromEntries(PALETTE.map((color) => [color.id, color]))

export function getColorValue(colorId) {
  return (PALETTE_BY_ID[colorId] ?? PALETTE[0]).value
}
