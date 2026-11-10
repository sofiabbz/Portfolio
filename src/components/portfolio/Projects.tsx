import { useId, useRef, useState } from 'react'
import { ExternalLink, Plus } from 'lucide-react'
import { GithubIcon } from '@/components/ui/BrandIcons'
import { projects, type Project, type ProjectAccent } from '@/content/portfolio'
import { sections } from '@/content/navigation'
import { ui } from '@/content/ui'
import { useInViewOnce, usePrefersReducedMotion } from '@/lib/hooks'
import { ButtonLink, buttonClasses } from '@/components/ui/Button'
import { SectionHeading } from './SectionHeading'
import { useLanguage } from './language'
import { cn } from '@/lib/utils'

const accentText: Record<ProjectAccent, string> = {
  signal: 'text-signal',
  ember: 'text-ember',
  sand: 'text-sand',
}
const accentBg: Record<ProjectAccent, string> = {
  signal: 'bg-signal',
  ember: 'bg-ember',
  sand: 'bg-sand',
}
const accentBorder: Record<ProjectAccent, string> = {
  signal: 'hover:border-signal/60 focus-within:border-signal/60',
  ember: 'hover:border-ember/60 focus-within:border-ember/60',
  sand: 'hover:border-sand/60 focus-within:border-sand/60',
}

/** Thumbnail abstrata (bloco + linhas), nunca screenshot. Entra "revelando" como no laboratório fotográfico. */
function Thumbnail({ project }: { project: Project }) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const inView = useInViewOnce(wrapperRef)
  const reducedMotion = usePrefersReducedMotion()
  const revealed = inView || reducedMotion

  return (
    <div ref={wrapperRef} className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xs sm:w-40 md:w-52">
      <div
        aria-hidden="true"
        className={cn('absolute inset-0 transition-[filter,opacity] duration-[1200ms] ease-out', accentBg[project.accent])}
        style={{
          filter: revealed ? 'blur(0px) brightness(1)' : 'blur(12px) brightness(0.25)',
          opacity: revealed ? 1 : 0.6,
          transitionDuration: reducedMotion ? '0ms' : undefined,
        }}
      >
        {/* Linhas diagonais em petróleo para textura */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'repeating-linear-gradient(135deg, var(--ink) 0 2px, transparent 2px 14px)',
          }}
        />
        <span className="font-display absolute right-3 bottom-2 text-5xl font-extrabold text-ink/80">{project.name.charAt(0)}</span>
      </div>
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const [open, setOpen] = useState(false)
  const bodyId = useId()
  const reducedMotion = usePrefersReducedMotion()
  const { tx } = useLanguage()
  const p = ui.projects

  return (
    <li className={cn('rounded-sm border hairline bg-panel transition-colors', accentBorder[project.accent])}>
      {/* O cabeçalho inteiro é um botão nativo: Enter/Espaço funcionam de graça */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full flex-col gap-4 p-4 text-left sm:flex-row sm:items-center sm:gap-6 md:p-6"
      >
        <Thumbnail project={project} />
        <span className="min-w-0 flex-1">
          <span className={cn('section-label block', accentText[project.accent])}>{tx(project.meta)}</span>
          <span className="font-display mt-1 block text-3xl font-extrabold tracking-wider uppercase md:text-4xl">{project.name}</span>
          <span className="mt-1 block text-sm text-cream/80">{tx(project.tagline)}</span>
        </span>
        <Plus
          aria-hidden="true"
          className={cn('size-6 shrink-0 self-end text-dim transition-transform duration-300 sm:self-center', open && 'rotate-45 text-cream')}
          style={{ transitionDuration: reducedMotion ? '0ms' : undefined }}
        />
      </button>

      {/* grid-rows 0fr→1fr: anima até a altura intrínseca, sem max-height mágico.
          Fechado: inert + aria-hidden tiram os links do fluxo de foco. */}
      <div
        id={bodyId}
        aria-hidden={!open}
        inert={!open}
        className="grid transition-[grid-template-rows] duration-400 ease-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr', transitionDuration: reducedMotion ? '0ms' : undefined }}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t hairline px-4 pt-5 pb-6 md:px-6">
            <dl className="grid gap-3 font-mono text-sm md:grid-cols-[max-content_1fr] md:gap-x-6">
              <dt className={cn('section-label', accentText[project.accent])}>{tx(p.problem)}</dt>
              <dd className="font-body text-cream/90">{tx(project.problem)}</dd>
              <dt className={cn('section-label', accentText[project.accent])}>{tx(p.solution)}</dt>
              <dd className="font-body text-cream/90">{tx(project.solution)}</dd>
              <dt className={cn('section-label', accentText[project.accent])}>{tx(p.highlight)}</dt>
              <dd className="font-body text-cream/90">{tx(project.highlight)}</dd>
            </dl>

            <ul className="mt-5 flex flex-wrap gap-2" aria-label={tx(p.stack)}>
              {project.stack.map((item) => (
                <li key={item} className="rounded-xs border hairline px-2 py-0.5 font-mono text-[11px] text-cream/80">
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-3">
              {project.demoUrl ? (
                <ButtonLink href={project.demoUrl} target="_blank" rel="noopener noreferrer" variant="solid">
                  <ExternalLink className="size-4" aria-hidden="true" />
                  {tx(p.demo)}
                </ButtonLink>
              ) : (
                <span className={buttonClasses('outline', 'md', 'cursor-not-allowed opacity-50')} aria-disabled="true" title={tx(p.noDemoTitle)}>
                  <ExternalLink className="size-4" aria-hidden="true" />
                  {tx(p.noDemo)}
                </span>
              )}
              <ButtonLink href={project.repoUrl} target="_blank" rel="noopener noreferrer" variant="outline">
                <GithubIcon className="size-4" />
                {tx(p.code)}
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}

export function Projects() {
  const { tx } = useLanguage()
  const section = sections[3]
  return (
    <section id="projetos" aria-labelledby="projetos-title" className="scroll-mt-[38px]">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8 md:px-12 md:py-24">
        <SectionHeading index="03" title={section ? tx(section.label) : 'Projetos'} id="projetos-title" />
        <ul className="space-y-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </ul>
      </div>
    </section>
  )
}
