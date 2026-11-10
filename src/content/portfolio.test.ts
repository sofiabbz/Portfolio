import { describe, expect, it } from 'vitest'
import { contacts, experience, profile, projects } from './portfolio'
import { sections } from './navigation'

describe('conteúdo', () => {
  it('contatos corretos', () => {
    expect(contacts.github).toBe('https://github.com/sofiabbz')
    expect(contacts.linkedin).toBe('https://www.linkedin.com/in/sofia-bezerra-belem')
    expect(contacts.email).toBe('sofiabezlem@gmail.com')
    expect(profile.cvHref).toBe('/CurriculoSofiaBezerra.pdf')
  })

  it('timeline tem exatamente duas entradas, mais recente primeiro', () => {
    expect(experience).toHaveLength(2)
    expect(experience[0]?.current).toBe(true)
    expect(experience[0]?.title.pt).toBe('Desenvolvimento Web')
    expect(experience[0]?.title.en).toBe('Web Development')
    // Datas são dela e mudam; só garantimos o formato "início → fim" nos dois idiomas
    expect(experience[1]?.period.pt).toMatch(/→/)
    expect(experience[1]?.period.en).toMatch(/→/)
  })

  it('projetos sem demo confirmada ficam com demoUrl nulo', () => {
    const byId = Object.fromEntries(projects.map((p) => [p.id, p]))
    expect(byId.canopi?.demoUrl).toBe('https://canopi-atlas.vercel.app')
    expect(byId.chamaki?.demoUrl).toBeNull()
    expect(byId.orbec?.demoUrl).toBeNull()
  })

  it('seções seguem a ordem da página, com rótulo nos dois idiomas', () => {
    expect(sections.map((s) => s.id)).toEqual(['inicio', 'sobre', 'experiencia', 'projetos', 'skills', 'fotografia', 'contato'])
    for (const s of sections) {
      expect(s.label.pt.length).toBeGreaterThan(0)
      expect(s.label.en.length).toBeGreaterThan(0)
    }
  })

  it('todo texto localizado tem as duas versões preenchidas', () => {
    const check = (value: unknown, path: string) => {
      if (value && typeof value === 'object' && 'pt' in value && 'en' in value) {
        const v = value as { pt: unknown; en: unknown }
        expect(v.pt, path).toBeTruthy()
        expect(v.en, path).toBeTruthy()
        return
      }
      if (Array.isArray(value)) value.forEach((item, i) => check(item, `${path}[${i}]`))
      else if (value && typeof value === 'object') Object.entries(value).forEach(([k, v]) => check(v, `${path}.${k}`))
    }
    check({ projects, experience }, 'content')
  })
})
