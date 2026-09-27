import { createContext } from 'react'

// Fields an override may hold:
// x/y: px offset from the natural position · width/height: px
// backgroundColor/color: CSS colors · opacity: 0–1
// backgroundImage: id of a blob in the IndexedDB `assets` store
// text: replacement string for an EditableText (the editable-text field)
export const OVERRIDE_FIELDS = [
  'x',
  'y',
  'width',
  'height',
  'backgroundColor',
  'color',
  'opacity',
  'backgroundImage',
  'text',
]

const noop = () => {}

export const ThemeOverridesContext = createContext({
  overrides: {},
  setOverride: noop,
  clearOverride: noop,
})
