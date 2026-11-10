import type { Localized } from './i18n'

// Fonte única da verdade para as seções da página.
// O sumário lateral, a command palette, os títulos das seções e as âncoras
// leem daqui, então adicionar/reordenar/traduzir uma seção acontece em um lugar só.
export type SectionId =
  | 'inicio'
  | 'sobre'
  | 'experiencia'
  | 'projetos'
  | 'skills'
  | 'fotografia'
  | 'contato'

export interface Section {
  id: SectionId
  index: string
  label: Localized
}

export const sections: ReadonlyArray<Section> = [
  { id: 'inicio', index: '00', label: { pt: 'Início', en: 'Home' } },
  { id: 'sobre', index: '01', label: { pt: 'Sobre', en: 'About' } },
  { id: 'experiencia', index: '02', label: { pt: 'Experiência', en: 'Experience' } },
  { id: 'projetos', index: '03', label: { pt: 'Projetos', en: 'Projects' } },
  { id: 'skills', index: '04', label: { pt: 'Skills', en: 'Skills' } },
  { id: 'fotografia', index: '05', label: { pt: 'Fotografia', en: 'Photography' } },
  { id: 'contato', index: '06', label: { pt: 'Contato', en: 'Contact' } },
]

/** Altura da faixa fixa do topo (36px) + linha de progresso (2px); compensa o scroll até uma âncora. */
export const TOP_BAR_HEIGHT = 36
export const TOP_BAR_OFFSET = TOP_BAR_HEIGHT + 2
