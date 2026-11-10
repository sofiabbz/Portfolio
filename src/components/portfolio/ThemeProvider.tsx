import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export const THEME_STORAGE_KEY = 'sb-theme'

/**
 * Fluxo do tema:
 * 1. SSR renderiza sempre "dark" (default).
 * 2. Um script inline no <head> (ver __root.tsx) lê localStorage ANTES da hidratação
 *    e ajusta data-theme no <html>, evitando flash.
 * 3. Depois do mount, este provider lê o data-theme já aplicado e sincroniza o estado React.
 * Nenhum acesso a window/localStorage acontece durante o render.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')

  useEffect(() => {
    const applied = document.documentElement.dataset.theme
    if (applied === 'light' || applied === 'dark') setThemeState(applied)
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // localStorage pode estar bloqueado (modo privado); a troca ainda funciona na sessão
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme precisa estar dentro de <ThemeProvider>')
  return ctx
}
