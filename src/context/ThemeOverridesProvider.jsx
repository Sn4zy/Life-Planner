import { EMPTY_THEME_OVERRIDES, ThemeOverridesContext } from './ThemeOverridesContext.js'

export default function ThemeOverridesProvider({ children }) {
  return (
    <ThemeOverridesContext value={EMPTY_THEME_OVERRIDES}>
      {children}
    </ThemeOverridesContext>
  )
}
