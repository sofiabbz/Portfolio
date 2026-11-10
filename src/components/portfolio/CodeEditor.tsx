import { useEffect, useState } from 'react'
import { tokenizeLines, type TokenKind } from '@/lib/code-tokens'
import { usePrefersReducedMotion } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import { ui } from '@/content/ui'
import { useLanguage } from './language'

const TYPE_DELAY_MS = 18
const LINE_COUNT = 6

const tokenClass: Record<TokenKind, string> = {
  keyword: 'text-ember',
  type: 'text-sand',
  string: 'text-signal',
  brace: 'text-cream',
  punct: 'text-dim',
  text: 'text-cream',
}

interface CodeEditorProps {
  code: string
  fileName?: string
  /** Começa a digitar quando true (ex.: depois da entrada do hero). */
  start: boolean
}

export function CodeEditor({ code, fileName = 'sofia.ts', start }: CodeEditorProps) {
  const reducedMotion = usePrefersReducedMotion()
  const { tx } = useLanguage()
  const [count, setCount] = useState(0)
  const done = count >= code.length

  useEffect(() => {
    if (reducedMotion) {
      setCount(code.length)
      return
    }
    if (!start) return
    let position = 0
    let timer: ReturnType<typeof setTimeout> | undefined
    const step = () => {
      position += 1
      setCount(position)
      if (position < code.length) timer = setTimeout(step, TYPE_DELAY_MS)
    }
    timer = setTimeout(step, TYPE_DELAY_MS)
    return () => {
      if (timer !== undefined) clearTimeout(timer)
    }
  }, [code, start, reducedMotion])

  const visible = code.slice(0, count)
  const lines = tokenizeLines(visible)

  return (
    <div className="w-full max-w-xl overflow-hidden rounded-sm border hairline bg-panel font-mono text-[13px] leading-6 shadow-lg">
      <div className="flex items-center gap-3 border-b hairline px-3 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-ember" />
          <span className="size-2.5 rounded-full bg-sand" />
          <span className="size-2.5 rounded-full bg-signal" />
        </span>
        <span className="text-xs text-cream/80">{fileName}</span>
        <span className="ml-auto text-[10px] tracking-widest text-dim uppercase">TypeScript</span>
      </div>

      <div className="flex">
        <ol aria-hidden="true" className="select-none border-r hairline px-3 py-3 text-right text-dim">
          {Array.from({ length: LINE_COUNT }, (_, i) => (
            <li key={i}>{i + 1}</li>
          ))}
        </ol>
        {/* Altura reservada para 6 linhas: o conteúdo cresce sem empurrar o layout.
            overflow-x-auto confina linhas longas ao editor, nunca à página. */}
        <pre
          className="scrollbar-thin flex-1 overflow-x-auto px-3 py-3 whitespace-pre"
          style={{ height: `calc(${LINE_COUNT} * 1.5rem + 1.5rem)` }}
          aria-label={`${tx(ui.hero.codeLabel)} ${fileName}`}
        >
          <code>
            {lines.map((tokens, lineIndex) => {
              const isLast = lineIndex === lines.length - 1
              return (
                <span key={lineIndex} className="block">
                  {tokens.map((token, i) => (
                    <span key={i} className={cn(tokenClass[token.kind])}>
                      {token.value}
                    </span>
                  ))}
                  {isLast && !reducedMotion && <span aria-hidden="true" className={cn('caret-block', done && 'opacity-70')} />}
                </span>
              )
            })}
          </code>
        </pre>
      </div>
    </div>
  )
}
