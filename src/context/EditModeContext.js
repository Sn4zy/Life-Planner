import { createContext } from 'react'

const noop = () => {}

export const EditModeContext = createContext({
  isEditing: false,
  setEditing: noop,
  toggleEditing: noop,
  selected: null,
  select: noop,
  deselect: noop,
})
