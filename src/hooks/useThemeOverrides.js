import { useContext } from 'react'
import { ThemeOverridesContext } from '../context/ThemeOverridesContext.js'

export default function useThemeOverrides() {
  return useContext(ThemeOverridesContext)
}
