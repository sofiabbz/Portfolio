import { describe, expect, it } from 'vitest'
import { tokenize, tokenizeLines } from './code-tokens'
import { heroCode as heroCodeLocalized } from '@/content/portfolio'

const heroCode = heroCodeLocalized.pt

describe('tokenize', () => {
  it('preserva todos os caracteres, inclusive espaços', () => {
    const joined = tokenize(heroCode).map((t) => t.value).join('')
    expect(joined).toBe(heroCode)
  })

  it('preserva o texto em todos os prefixos (strings incompletas durante a digitação)', () => {
    for (let i = 0; i <= heroCode.length; i += 1) {
      const slice = heroCode.slice(0, i)
      const joined = tokenize(slice).map((t) => t.value).join('')
      expect(joined).toBe(slice)
    }
  })

  it('colore const como keyword, Dev como tipo e strings como string', () => {
    const tokens = tokenize('const sofia: Dev = { nome: "Sofia" }')
    expect(tokens.find((t) => t.value === 'const')?.kind).toBe('keyword')
    expect(tokens.find((t) => t.value === 'Dev')?.kind).toBe('type')
    expect(tokens.find((t) => t.value === '"Sofia"')?.kind).toBe('string')
    expect(tokens.find((t) => t.value === '{')?.kind).toBe('brace')
    expect(tokens.find((t) => t.value === ':')?.kind).toBe('punct')
  })

  it('trata string sem aspas de fechamento como string até o fim', () => {
    const tokens = tokenize('nome: "Sofi')
    const last = tokens[tokens.length - 1]
    expect(last?.kind).toBe('string')
    expect(last?.value).toBe('"Sofi')
  })

  it('tokenizeLines divide por linha e mantém o conteúdo', () => {
    const lines = tokenizeLines(heroCode)
    expect(lines).toHaveLength(6)
    const rebuilt = lines.map((line) => line.map((t) => t.value).join('')).join('\n')
    expect(rebuilt).toBe(heroCode)
  })
})
