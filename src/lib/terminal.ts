// Interpretação PURA dos comandos do terminal da seção Contato.
// Esta função não toca em DOM, clipboard ou janela: ela devolve uma descrição
// do que aconteceu (linhas a imprimir + efeito colateral opcional) e o componente
// React decide como executar o efeito. Isso mantém a lógica testável.
// Os comandos são aceitos em português E em inglês, independentemente do idioma
// ativo; o idioma só muda o texto das respostas.

import type { Language, Localized } from '@/content/i18n'
import { contacts, profile, projects, skills } from '@/content/portfolio'

export type TerminalLineKind = 'input' | 'output' | 'error' | 'success' | 'muted'

export interface TerminalLine {
  kind: TerminalLineKind
  text: string
  /** Quando presente, a linha é renderizada como link (ex.: github, mailto). */
  href?: string
}

export type TerminalEffect =
  | { type: 'open-url'; url: string }
  | { type: 'copy-email'; email: string }
  | { type: 'open-gallery' }
  | { type: 'open-cv'; href: string }
  | { type: 'clear' }
  | { type: 'hire' }

export interface TerminalResult {
  lines: TerminalLine[]
  effect?: TerminalEffect
}

interface CommandSpec {
  /** Nome exibido por idioma (no help e nos chips). */
  name: Localized
  /** Todas as formas aceitas na digitação (pt + en). */
  aliases: ReadonlyArray<string>
  description: Localized
}

export const COMMANDS: ReadonlyArray<CommandSpec> = [
  { name: { pt: 'help', en: 'help' }, aliases: ['help', 'ajuda'], description: { pt: 'lista os comandos (alias: ajuda)', en: 'lists the commands (alias: ajuda)' } },
  { name: { pt: 'whoami', en: 'whoami' }, aliases: ['whoami'], description: { pt: 'quem está do outro lado', en: 'who is on the other side' } },
  { name: { pt: 'projetos', en: 'projects' }, aliases: ['projetos', 'projects', 'ls'], description: { pt: 'lista os projetos (alias: ls)', en: 'lists the projects (alias: ls)' } },
  { name: { pt: 'skills', en: 'skills' }, aliases: ['skills', 'habilidades'], description: { pt: 'stack e ferramentas', en: 'stack and tools' } },
  { name: { pt: 'github', en: 'github' }, aliases: ['github'], description: { pt: 'abre o GitHub', en: 'opens GitHub' } },
  { name: { pt: 'linkedin', en: 'linkedin' }, aliases: ['linkedin'], description: { pt: 'abre o LinkedIn', en: 'opens LinkedIn' } },
  { name: { pt: 'email', en: 'email' }, aliases: ['email', 'e-mail'], description: { pt: 'copia o e-mail de contato', en: 'copies the contact email' } },
  { name: { pt: 'contato', en: 'contact' }, aliases: ['contato', 'contact'], description: { pt: 'lista os canais de contato', en: 'lists the contact channels' } },
  { name: { pt: 'fotos', en: 'photos' }, aliases: ['fotos', 'photos', 'galeria', 'gallery'], description: { pt: 'abre a galeria (alias: galeria)', en: 'opens the gallery (alias: gallery)' } },
  { name: { pt: 'cv', en: 'resume' }, aliases: ['cv', 'resume', 'curriculo', 'currículo'], description: { pt: 'abre o currículo em PDF', en: 'opens the resume as PDF' } },
  { name: { pt: 'clear', en: 'clear' }, aliases: ['clear', 'limpar', 'cls'], description: { pt: 'limpa o terminal (alias: limpar, cls)', en: 'clears the terminal (alias: cls)' } },
  { name: { pt: 'echo', en: 'echo' }, aliases: ['echo'], description: { pt: 'repete o que você digitar', en: 'repeats what you type' } },
]

/** Comandos expostos como chips clicáveis abaixo do input, no idioma ativo. */
export function quickCommands(lang: Language): string[] {
  return ['help', 'whoami', 'projetos', 'skills', 'github', 'linkedin', 'email', 'fotos', 'cv'].map((pt) => {
    const spec = COMMANDS.find((c) => c.name.pt === pt)
    return spec ? spec.name[lang] : pt
  })
}

const MESSAGES = {
  available: { pt: 'comandos disponíveis:', en: 'available commands:' },
  sudoTip: { pt: 'dica: sudo contratar ;)', en: 'tip: sudo hire ;)' },
  total: { pt: 'total', en: 'total' },
  openingGallery: { pt: 'abrindo galeria...', en: 'opening gallery...' },
  opening: { pt: 'abrindo', en: 'opening' },
  sudoPassword: { pt: '[sudo] senha para recrutador: ********', en: '[sudo] password for recruiter: ********' },
  sudoGranted: { pt: 'permissão concedida. modo recrutador ativado.', en: 'permission granted. recruiter mode on.' },
  reachMe: { pt: '→ me chama:', en: '→ reach me:' },
  sudoNotFound: { pt: 'comando não encontrado', en: 'command not found' },
  notFound: { pt: 'comando não encontrado:', en: 'command not found:' },
  typeHelp: { pt: 'digite help para ver os comandos', en: 'type help to see the commands' },
} as const satisfies Record<string, Localized>

const out = (text: string): TerminalLine => ({ kind: 'output', text })
const muted = (text: string): TerminalLine => ({ kind: 'muted', text })
const err = (text: string): TerminalLine => ({ kind: 'error', text })

function resolve(cmd: string): string | null {
  const spec = COMMANDS.find((c) => c.aliases.includes(cmd))
  return spec ? spec.name.pt : null
}

export function runCommand(rawInput: string, lang: Language = 'pt'): TerminalResult {
  const input = rawInput.trim()
  if (input.length === 0) return { lines: [] }

  const [first = '', ...rest] = input.split(/\s+/)
  const cmd = first.toLowerCase()
  const args = rest.join(' ')
  const m = <K extends keyof typeof MESSAGES>(key: K) => MESSAGES[key][lang]

  if (cmd === 'sudo') {
    const target = args.toLowerCase()
    if (target === 'contratar' || target === 'hire') {
      return {
        lines: [muted(m('sudoPassword')), { kind: 'success', text: m('sudoGranted') }, out(`${m('reachMe')} ${contacts.email}`)],
        effect: { type: 'hire' },
      }
    }
    return { lines: [err(`sudo: ${args || '(vazio)'}: ${m('sudoNotFound')}`)] }
  }

  switch (resolve(cmd)) {
    case 'help':
      return {
        lines: [
          muted(m('available')),
          ...COMMANDS.map((c) => out(`  ${c.name[lang].padEnd(12, ' ')} ${c.description[lang]}`)),
          muted(m('sudoTip')),
        ],
      }

    case 'whoami':
      return {
        lines: [out(`${profile.fullName} — ${profile.role[lang].toLowerCase()}`), out(`${profile.location[lang]} · ${profile.tagline[lang]}`)],
      }

    case 'projetos':
      // Formato de listagem Unix: permissões, nome e descrição
      return {
        lines: [
          muted(`${m('total')} ${projects.length}`),
          ...projects.map((p) => out(`drwxr-x  ${p.name.toLowerCase().padEnd(9, ' ')} ${p.tagline[lang]}`)),
        ],
      }

    case 'skills':
      return { lines: skills.map((g) => out(`  ${g.title[lang]}: ${g.items[lang].join(', ')}`)) }

    case 'github':
      return { lines: [{ kind: 'output', text: contacts.github, href: contacts.github }], effect: { type: 'open-url', url: contacts.github } }

    case 'linkedin':
      return { lines: [{ kind: 'output', text: contacts.linkedin, href: contacts.linkedin }], effect: { type: 'open-url', url: contacts.linkedin } }

    case 'email':
      // A confirmação "copiado" só é impressa pelo componente se o clipboard funcionar
      return { lines: [], effect: { type: 'copy-email', email: contacts.email } }

    case 'contato':
      return {
        lines: [
          { kind: 'output', text: `github    ${contacts.github}`, href: contacts.github },
          { kind: 'output', text: `linkedin  ${contacts.linkedin}`, href: contacts.linkedin },
          { kind: 'output', text: `email     ${contacts.email}`, href: `mailto:${contacts.email}` },
        ],
      }

    case 'fotos':
      return { lines: [muted(m('openingGallery'))], effect: { type: 'open-gallery' } }

    case 'cv':
      return { lines: [muted(`${m('opening')} ${profile.cvFileName}`)], effect: { type: 'open-cv', href: profile.cvHref } }

    case 'clear':
      return { lines: [], effect: { type: 'clear' } }

    case 'echo':
      return { lines: [out(args.replace(/^"(.*)"$/, '$1'))] }

    default:
      return { lines: [err(`${m('notFound')} ${first}`), muted(m('typeHelp'))] }
  }
}
