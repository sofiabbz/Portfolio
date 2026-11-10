import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { toast } from 'sonner'
import { contactIntro } from '@/content/portfolio'
import { ui } from '@/content/ui'
import { quickCommands, runCommand, type TerminalEffect, type TerminalLine } from '@/lib/terminal'
import { usePrefersReducedMotion } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import { useLanguage } from './language'

const RECRUITER_MODE_MS = 2400

interface TerminalProps {
  onOpenGallery: () => void
}

// Cores pensadas para o fundo areia: tinta escura, ferrugem para erros
const lineClass: Record<TerminalLine['kind'], string> = {
  input: 'text-ink font-semibold',
  output: 'text-ink',
  error: 'text-rust font-semibold',
  success: 'text-ink font-semibold',
  muted: 'text-ink/60',
}

/**
 * Terminal retro brutalista: fundo areia, tinta escura, sombra sólida.
 * Linha de comando real (comandos em PT e EN) + histórico (↑/↓) + chips de atalho.
 */
export function Terminal({ onOpenGallery }: TerminalProps) {
  const reducedMotion = usePrefersReducedMotion()
  const { lang, tx } = useLanguage()
  const tt = ui.terminal
  const initialLines: TerminalLine[] = [
    { kind: 'input', text: tx(contactIntro.command) },
    { kind: 'output', text: tx(contactIntro.text) },
    { kind: 'muted', text: lang === 'pt' ? 'digite help para ver os comandos' : 'type help to see the commands' },
  ]
  const [lines, setLines] = useState<TerminalLine[]>(initialLines)
  const [value, setValue] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const outputRef = useRef<HTMLDivElement | null>(null)
  const langRef = useRef(lang)

  // Ao trocar o idioma, reinicia as linhas de boas-vindas no novo idioma
  useEffect(() => {
    if (langRef.current === lang) return
    langRef.current = lang
    setLines([
      { kind: 'input', text: tx(contactIntro.command) },
      { kind: 'output', text: tx(contactIntro.text) },
      { kind: 'muted', text: lang === 'pt' ? 'digite help para ver os comandos' : 'type help to see the commands' },
    ])
  }, [lang, tx])

  // Autoscroll suave a cada linha nova
  useEffect(() => {
    const el = outputRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: reducedMotion ? 'auto' : 'smooth' })
  }, [lines, reducedMotion])

  const append = (next: TerminalLine[]) => setLines((prev) => [...prev, ...next])

  // Efeitos colaterais ficam aqui, fora da lógica pura de runCommand
  const applyEffect = async (effect: TerminalEffect) => {
    switch (effect.type) {
      case 'clear':
        setLines([])
        return
      case 'open-url':
        window.open(effect.url, '_blank', 'noopener,noreferrer')
        return
      case 'open-cv':
        window.open(effect.href, '_blank', 'noopener,noreferrer')
        return
      case 'open-gallery':
        onOpenGallery()
        return
      case 'hire': {
        // "Modo recrutador": glitch no site inteiro por 2.4s (CSS em styles.css)
        document.documentElement.classList.add('recruiter-mode')
        toast(tx(tt.recruiterToast), { description: tx(tt.recruiterToastDesc) })
        setTimeout(() => document.documentElement.classList.remove('recruiter-mode'), RECRUITER_MODE_MS)
        return
      }
      case 'copy-email': {
        // Só confirma "copiado" se a API realmente funcionou
        try {
          if (!navigator.clipboard) throw new Error('clipboard indisponível')
          await navigator.clipboard.writeText(effect.email)
          append([{ kind: 'success', text: `${tx(tt.copied)} ${effect.email}` }])
          toast.success(tx(tt.copiedToast))
        } catch {
          append([
            { kind: 'error', text: tx(tt.copyFailed) },
            { kind: 'output', text: `${tx(tt.openEmail)} ${effect.email}`, href: `mailto:${effect.email}` },
          ])
          toast.error(tx(tt.copyFailedToast))
        }
        return
      }
    }
  }

  const execute = async (input: string) => {
    if (input.trim().length === 0) return
    setHistory((h) => [...h, input])
    const result = runCommand(input, lang)
    if (result.effect?.type === 'clear') {
      setLines([])
      return
    }
    append([{ kind: 'input', text: input }, ...result.lines])
    if (result.effect) await applyEffect(result.effect)
  }

  const submit = async () => {
    const input = value
    setValue('')
    setHistoryIndex(null)
    await execute(input)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      void submit()
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return
      const next = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(next)
      setValue(history[next] ?? '')
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex === null) return
      const next = historyIndex + 1
      if (next >= history.length) {
        setHistoryIndex(null)
        setValue('')
      } else {
        setHistoryIndex(next)
        setValue(history[next] ?? '')
      }
    }
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xs border-2 border-ink bg-sand font-mono text-sm text-ink shadow-[10px_10px_0_0_var(--ink)]">
      <div className="flex items-center gap-2 border-b-2 border-ink px-3 py-2 text-xs">
        <span aria-hidden="true" className="inline-block size-2.5 rounded-full bg-ember" />
        <span>sofia@portfolio: ~/{lang === 'pt' ? 'contato' : 'contact'}</span>
      </div>

      <div
        ref={outputRef}
        role="log"
        aria-live="polite"
        onClick={() => inputRef.current?.focus()}
        className="scrollbar-thin h-64 space-y-1 overflow-y-auto px-3 py-3"
      >
        {lines.map((line, i) => (
          <p key={i} className={cn('break-words whitespace-pre-wrap', lineClass[line.kind])}>
            {line.kind === 'input' && (
              <span className="text-ember" aria-hidden="true">
                ${' '}
              </span>
            )}
            {line.href ? (
              <a
                href={line.href}
                target={line.href.startsWith('mailto:') ? undefined : '_blank'}
                rel="noopener noreferrer"
                className="underline decoration-dotted underline-offset-4 hover:text-rust"
              >
                {line.text}
              </a>
            ) : (
              line.text
            )}
          </p>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t-2 border-ink px-3 py-2">
        <span className="text-ember" aria-hidden="true">
          $
        </span>
        <input
          ref={inputRef}
          aria-label={tx(tt.input)}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="help"
          className="w-full bg-transparent text-ink placeholder:text-ink/40 focus:outline-none"
        />
      </div>

      {/* Chips: executam o comando sem digitar, no idioma ativo */}
      <ul className="flex flex-wrap gap-1.5 border-t border-ink/20 px-3 py-2" aria-label={tx(tt.shortcuts)}>
        {quickCommands(lang).map((command) => (
          <li key={command}>
            <button
              type="button"
              onClick={() => void execute(command)}
              className="rounded-xs border border-ink px-2 py-0.5 text-[11px] transition-colors hover:bg-ink hover:text-sand focus-visible:bg-ink focus-visible:text-sand"
            >
              {command}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
