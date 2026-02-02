import { createContext, useContext, useEffect, useState } from 'react'

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', mode: 'light' },
  { value: 'dark', label: 'Dark', mode: 'dark' },
  { value: 'system', label: 'System', mode: 'system' },
  { value: 'blue', label: 'Blue', mode: 'light', themeClass: 'theme-blue' },
  { value: 'rose', label: 'Rose', mode: 'light', themeClass: 'theme-rose' },
  { value: 'green', label: 'Green', mode: 'light', themeClass: 'theme-green' },
  { value: 'violet', label: 'Violet', mode: 'light', themeClass: 'theme-violet' },
  { value: 'amber', label: 'Amber', mode: 'light', themeClass: 'theme-amber' },
  { value: 'dark-blue', label: 'Dark Blue', mode: 'dark', themeClass: 'theme-blue' },
  { value: 'dark-rose', label: 'Dark Rose', mode: 'dark', themeClass: 'theme-rose' },
  { value: 'dark-green', label: 'Dark Green', mode: 'dark', themeClass: 'theme-green' },
  { value: 'dark-violet', label: 'Dark Violet', mode: 'dark', themeClass: 'theme-violet' },
]

const ThemeProviderContext = createContext({
  theme: 'system',
  setTheme: () => null,
  themeOptions: THEME_OPTIONS,
})

function getSystemMode() {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children, defaultTheme = 'system', storageKey = 'trainee-ui-theme', ...props }) {
  const [theme, setThemeState] = useState(
    () => (typeof window !== 'undefined' && localStorage.getItem(storageKey)) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement
    const themeClasses = ['light', 'dark', 'theme-blue', 'theme-rose', 'theme-green', 'theme-violet', 'theme-amber']
    themeClasses.forEach((c) => root.classList.remove(c))

    const option = THEME_OPTIONS.find((o) => o.value === theme)
    if (!option) {
      root.classList.add(theme === 'dark' ? 'dark' : 'light')
      return
    }

    if (option.value === 'system') {
      const mode = getSystemMode()
      root.classList.add(mode)
      return
    }

    if (option.themeClass) {
      root.classList.add(option.mode, option.themeClass)
      return
    }

    if (option.value === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.add('light')
    }
  }, [theme])

  const value = {
    theme,
    setTheme: (newTheme) => {
      if (typeof window !== 'undefined') localStorage.setItem(storageKey, newTheme)
      setThemeState(newTheme)
    },
    themeOptions: THEME_OPTIONS,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}

export { THEME_OPTIONS }
