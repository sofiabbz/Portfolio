import { cn } from '@/lib/utils'
import { ScrambleText } from './ScrambleText'

interface SectionHeadingProps {
  index: string
  title: string
  id: string
  command?: string
  className?: string
  tone?: 'default' | 'on-rust' | 'on-sand'
}

/** Cabeçalho padrão: número pequeno, título display e linha até a borda. */
export function SectionHeading({ index, title, id, command, className, tone = 'default' }: SectionHeadingProps) {
  const color = tone === 'on-rust' ? 'text-on-rust' : tone === 'on-sand' ? 'text-on-sand' : 'text-cream'
  const line = tone === 'on-rust' ? 'bg-on-rust/40' : tone === 'on-sand' ? 'bg-on-sand/35' : 'bg-cream/25'
  const sub = tone === 'on-rust' ? 'text-on-rust/75' : tone === 'on-sand' ? 'text-on-sand/75' : 'text-dim'
  return (
    <div className={cn('mb-10', className)}>
      {command && <p className={cn('mb-3 font-mono text-xs', sub)}>{command}</p>}
      <div className="flex items-center gap-4">
        <span className={cn('font-mono text-xs', sub)}>{index}.</span>
        <ScrambleText as="h2" text={title} className={cn('font-display text-2xl font-extrabold tracking-wide uppercase md:text-3xl', color)} />
        <span aria-hidden="true" className={cn('h-px flex-1', line)} />
      </div>
      <span id={id} className="sr-only">
        {title}
      </span>
    </div>
  )
}
