import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { ArrowRight, ExternalLink, Languages, Moon, Search, Sun } from 'lucide-react'
import { sections } from '@/content/navigation'
import { contacts } from '@/content/portfolio'
import { ui } from '@/content/ui'
import { normalizeText, cn } from '@/lib/utils'
import { useSmoothScroll } from './SmoothScroll'
import { useTheme } from './ThemeProvider'
import { useLanguage } from './language'

export interface PaletteAction {
  id: string
  label: string
  hint: string
  keywords: string
  icon: 'go' | 'link' | 'theme' | 'lang'
  run: () => void
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export function filterActions(actions: ReadonlyArray<PaletteAction>, query: string): PaletteAction[] {
  const q = normalizeText(query)
  if (q.length === 0) return [...actions]
  return actions.filter((a) => normalizeText(`${a.label} ${a.hint} ${a.keywords}`).includes(q))
}

const FOCUSABLE = 'input, button, [href], [tabindex]:not([tabindex="-1"])'

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const { scrollTo, stop, start } = useSmoothScroll()
  const { theme, toggleTheme } = useTheme()
  const { tx, toggleLang } = useLanguage()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const previousFocus = useRef<HTMLElement | null>(null)
  const listId = useId()
  const titleId = useId()

  const actions = useMemo<PaletteAction[]>(() => {
    const p = ui.palette
    const goTo = sections.map<PaletteAction>((s) => ({
      id: `go-${s.id}`,
      label: `${tx(p.goTo)} ${tx(s.label)}`,
      hint: `#${s.id}`,
      keywords: `${tx(p.keywords.section)} ${s.index}`,
      icon: 'go',
      run: () => scrollTo(s.id),
    }))
    return [
      ...goTo,
      {
        id: 'github',
        label: tx(p.openGithub),
        hint: 'github.com/sofiabbz',
        keywords: tx(p.keywords.github),
        icon: 'link',
        run: () => window.open(contacts.github, '_blank', 'noopener,noreferrer'),
      },
      {
        id: 'linkedin',
        label: tx(p.openLinkedin),
        hint: 'linkedin.com/in/sofia-bezerra-belem',
        keywords: tx(p.keywords.linkedin),
        icon: 'link',
        run: () => window.open(contacts.linkedin, '_blank', 'noopener,noreferrer'),
      },
      {
        id: 'lang',
        label: tx(p.switchLang),
        hint: 'PT / EN',
        keywords: tx(p.keywords.lang),
        icon: 'lang',
        run: toggleLang,
      },
      {
        id: 'theme',
        label: theme === 'dark' ? tx(p.themeLight) : tx(p.themeDark),
        hint: 'tema / theme',
        keywords: tx(p.keywords.theme),
        icon: 'theme',
        run: toggleTheme,
      },
    ]
  }, [scrollTo, theme, toggleTheme, toggleLang, tx])

  const results = useMemo(() => filterActions(actions, query), [actions, query])

  // Abertura: guarda o foco anterior, trava o scroll, foca o input
  useEffect(() => {
    if (!open) return
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    stop()
    setQuery('')
    setSelected(0)
    const frame = requestAnimationFrame(() => inputRef.current?.focus())
    return () => {
      cancelAnimationFrame(frame)
      start()
      previousFocus.current?.focus()
    }
  }, [open, stop, start])

  // Mantém a seleção válida quando a lista filtrada encolhe
  useEffect(() => {
    setSelected((s) => Math.min(s, Math.max(0, results.length - 1)))
  }, [results.length])

  // Garante que o item selecionado fique visível
  useEffect(() => {
    if (!open) return
    const el = dialogRef.current?.querySelector<HTMLElement>(`[data-index="${selected}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [selected, open])

  const execute = (action: PaletteAction) => {
    // Fecha antes de executar: o cleanup do efeito retoma o Lenis, e só então
    // a navegação roda — senão o scrollTo seria ignorado com o Lenis parado.
    onClose()
    requestAnimationFrame(() => action.run())
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (results.length > 0) setSelected((s) => (s + 1) % results.length)
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (results.length > 0) setSelected((s) => (s - 1 + results.length) % results.length)
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const action = results[selected]
      if (action) execute(action)
      return
    }
    if (e.key === 'Tab') {
      // Focus trap simples: Tab circula dentro do diálogo
      const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (!nodes || nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (!first || !last) return
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  if (!open) return null

  const activeId = results[selected] ? `${listId}-${results[selected].id}` : undefined
  const icons = { go: ArrowRight, link: ExternalLink, lang: Languages, theme: theme === 'dark' ? Sun : Moon }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-ink/70 px-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={onKeyDown}
        className="w-full max-w-lg overflow-hidden rounded-md border hairline bg-panel shadow-2xl"
      >
        <h2 id={titleId} className="sr-only">
          {tx(ui.palette.title)}
        </h2>
        <div className="flex items-center gap-3 border-b hairline px-4">
          <Search className="size-4 shrink-0 text-dim" aria-hidden="true" />
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            aria-label={tx(ui.palette.search)}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelected(0)
            }}
            placeholder={tx(ui.palette.placeholder)}
            className="h-12 w-full bg-transparent font-mono text-sm placeholder:text-dim focus:outline-none"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="hidden rounded-xs border hairline px-1.5 py-0.5 font-mono text-[10px] text-dim sm:inline">esc</kbd>
        </div>

        <ul id={listId} role="listbox" aria-label={tx(ui.palette.results)} className="scrollbar-thin max-h-[50vh] overflow-y-auto py-2">
          {results.length === 0 && (
            <li className="px-4 py-6 text-center font-mono text-sm text-dim" role="option" aria-selected="false">
              {tx(ui.palette.empty)} “{query}”
            </li>
          )}
          {results.map((action, index) => {
            const isSelected = index === selected
            const Icon = icons[action.icon]
            return (
              <li
                key={action.id}
                id={`${listId}-${action.id}`}
                role="option"
                aria-selected={isSelected}
                data-index={index}
                onMouseEnter={() => setSelected(index)}
                onClick={() => execute(action)}
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-4 px-4 py-2.5 font-mono text-sm',
                  isSelected ? 'bg-sand text-on-sand' : 'text-cream',
                )}
              >
                <span className="flex items-center gap-3">
                  <Icon className="size-4 shrink-0 opacity-70" aria-hidden="true" />
                  {action.label}
                </span>
                <span className={cn('truncate text-xs', isSelected ? 'text-on-sand/70' : 'text-dim')}>{action.hint}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

/** Hook que liga Cmd+K / Ctrl+K a abrir/fechar a palette. */
export function usePaletteShortcut(open: boolean, setOpen: (next: boolean) => void) {
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(!open)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpen])
}
