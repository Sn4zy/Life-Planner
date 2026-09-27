import { useContext } from 'react'
import { EditModeContext } from '../context/EditModeContext.js'

export default function useEditMode() {
  return useContext(EditModeContext)
}
