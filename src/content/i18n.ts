// Tipos base da internacionalização. Todo texto visível do site é um par { pt, en }.

export type Language = 'pt' | 'en'

export const LANGUAGES: ReadonlyArray<Language> = ['pt', 'en']
export const DEFAULT_LANGUAGE: Language = 'pt'
export const LANGUAGE_STORAGE_KEY = 'sofia-lang'

/** Um valor com versão em português e em inglês (string, lista, o que for). */
export interface Localized<T = string> {
  pt: T
  en: T
}

/** Resolve um par { pt, en } para o idioma pedido. */
export function pick<T>(value: Localized<T>, lang: Language): T {
  return value[lang]
}

/** Código BCP-47 usado no atributo lang do <html>. */
export const htmlLang: Record<Language, string> = {
  pt: 'pt-BR',
  en: 'en',
}
