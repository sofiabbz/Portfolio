import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, htmlLang, type Language, type Localized } from '@/content/i18n'
import { seo } from '@/content/portfolio'

interface LanguageContextValue {
  lang: Language
  setLang: (lang: Language) => void
  toggleLang: () => void
  /** Escolhe entre dois valores inline: t('Olá', 'Hello'). */
  t: <T,>(pt: T, en: T) => T
  /** Resolve um campo { pt, en } do conteúdo: tx(profile.tagline). */
  tx: <T,>(value: Localized<T>) => T
}

// Valor padrão em PT: componentes renderizados sem provider (ex.: testes) continuam funcionando.
const LanguageContext = createContext<LanguageContextValue>({
  lang: DEFAULT_LANGUAGE,
  setLang: () => {},
  toggleLang: () => {},
  t: (pt) => pt,
  tx: (value) => value.pt,
})

/**
 * Fluxo do idioma:
 * 1. SSR e primeira renderização no cliente usam sempre "pt" (sem mismatch de hidratação).
 * 2. Depois do mount, lê localStorage["sofia-lang"] e troca se for "en".
 *    A boot screen cobre esse instante, então a troca não aparece como flash.
 * 3. Toda mudança atualiza <html lang> e o <title> reativamente.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(DEFAULT_LANGUAGE)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY)
      if (saved === 'pt' || saved === 'en') setLangState(saved)
    } catch {
      // localStorage bloqueado: fica no padrão
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = htmlLang[lang]
    document.title = seo.title[lang]
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (meta) meta.content = seo.description[lang]
  }, [lang])

  const setLang = useCallback((next: Language) => {
    setLangState(next)
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, next)
    } catch {
      // sem persistência, mas a troca vale para a sessão
    }
  }, [])

  const toggleLang = useCallback(() => setLang(lang === 'pt' ? 'en' : 'pt'), [lang, setLang])

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      toggleLang,
      t: (pt, en) => (lang === 'pt' ? pt : en),
      tx: (v) => v[lang],
    }),
    [lang, setLang, toggleLang],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext)
}
