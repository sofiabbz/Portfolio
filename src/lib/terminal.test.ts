import { describe, expect, it } from 'vitest'
import { runCommand } from './terminal'
import { contacts, profile } from '@/content/portfolio'

describe('runCommand', () => {
  it('comando desconhecido retorna erro e sugere help', () => {
    const result = runCommand('abracadabra')
    expect(result.lines[0]?.kind).toBe('error')
    expect(result.lines.some((l) => l.text.includes('help'))).toBe(true)
    expect(result.effect).toBeUndefined()
  })

  it('clear e cls produzem efeito clear', () => {
    expect(runCommand('clear').effect).toEqual({ type: 'clear' })
    expect(runCommand('CLS').effect).toEqual({ type: 'clear' })
  })

  it('fotos e galeria abrem a galeria', () => {
    expect(runCommand('fotos').effect).toEqual({ type: 'open-gallery' })
    expect(runCommand('galeria').effect).toEqual({ type: 'open-gallery' })
  })

  it('github, linkedin e cv apontam para os destinos corretos', () => {
    expect(runCommand('github').effect).toEqual({ type: 'open-url', url: contacts.github })
    expect(runCommand('linkedin').effect).toEqual({ type: 'open-url', url: contacts.linkedin })
    expect(runCommand('cv').effect).toEqual({ type: 'open-cv', href: profile.cvHref })
  })

  it('email pede cópia sem afirmar sucesso na própria linha', () => {
    const result = runCommand('email')
    expect(result.effect).toEqual({ type: 'copy-email', email: contacts.email })
    expect(result.lines.some((l) => /copiado/i.test(l.text))).toBe(false)
  })

  it('echo repete o argumento, removendo aspas externas', () => {
    expect(runCommand('echo "oi mundo"').lines[0]?.text).toBe('oi mundo')
    expect(runCommand('echo oi').lines[0]?.text).toBe('oi')
  })

  it('sudo contratar gera efeito hire e inclui o e-mail', () => {
    const result = runCommand('sudo contratar')
    expect(result.effect).toEqual({ type: 'hire' })
    expect(result.lines.some((l) => l.text.includes(contacts.email))).toBe(true)
  })

  it('entrada vazia não produz nada', () => {
    expect(runCommand('   ')).toEqual({ lines: [] })
  })

  it('help (e o alias ajuda) lista todos os comandos e a dica do sudo', () => {
    for (const cmd of ['help', 'ajuda']) {
      const texts = runCommand(cmd).lines.map((l) => l.text).join('\n')
      for (const name of ['whoami', 'projetos', 'skills', 'github', 'linkedin', 'email', 'fotos', 'cv', 'clear', 'echo']) {
        expect(texts).toContain(name)
      }
      expect(texts).toContain('sudo contratar ;)')
    }
  })

  it('projetos/ls listam no formato de permissões Unix', () => {
    const lines = runCommand('ls').lines.map((l) => l.text)
    expect(lines.some((t) => /^drwxr-x\s+canopi\s/.test(t))).toBe(true)
    expect(runCommand('projetos').lines).toEqual(runCommand('ls').lines)
  })

  it('aceita comandos em inglês e responde no idioma pedido', () => {
    expect(runCommand('projects', 'en').lines[0]?.text).toBe('total 3')
    expect(runCommand('photos', 'en').effect).toEqual({ type: 'open-gallery' })
    expect(runCommand('resume').effect).toEqual({ type: 'open-cv', href: profile.cvHref })
    expect(runCommand('limpar').effect).toEqual({ type: 'clear' })
    expect(runCommand('habilidades', 'en').lines[0]?.text).toContain('Front-end')
    expect(runCommand('sudo hire', 'en').effect).toEqual({ type: 'hire' })
    expect(runCommand('xyz', 'en').lines[0]?.text).toBe('command not found: xyz')
    expect(runCommand('xyz', 'pt').lines[0]?.text).toBe('comando não encontrado: xyz')
  })

  it('contato lista os três canais com links', () => {
    const lines = runCommand('contact').lines
    expect(lines.map((l) => l.href)).toEqual([contacts.github, contacts.linkedin, `mailto:${contacts.email}`])
  })

  it('github e linkedin devolvem linha clicável', () => {
    expect(runCommand('github').lines[0]?.href).toBe(contacts.github)
    expect(runCommand('linkedin').lines[0]?.href).toBe(contacts.linkedin)
  })
})
