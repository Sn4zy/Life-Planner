import { createContext } from 'react'

export const EMPTY_THEME_OVERRIDES = { overrides: {} }

export const ThemeOverridesContext = createContext(EMPTY_THEME_OVERRIDES)
