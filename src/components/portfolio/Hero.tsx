import { motion, useScroll, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { ArrowDown } from 'lucide-react'
import { heroCode, profile } from '@/content/portfolio'
import { sections } from '@/content/navigation'
import { ui } from '@/content/ui'
import { usePrefersReducedMotion } from '@/lib/hooks'
import { AsciiStar } from './AsciiCanvas'
import { CodeEditor } from './CodeEditor'
import { DevArtistScribble, StarHint } from './Scribble'
import { useSmoothScroll } from './SmoothScroll'
import { useLanguage } from './language'
import { cn } from '@/lib/utils'

interface WordProps {
  word: string
  variant: 'fill' | 'outline'
  baseDelay: number
  active: boolean
  reducedMotion: boolean
}

/**
 * Cada letra é um span: entra de baixo com stagger e, no hover, salta/estica e
 * inverte o estilo (preenchida → vazada; vazada → preenchida em coral).
 * Duas camadas: a externa (motion) cuida da entrada; a interna cuida do hover
 * via CSS — assim o transform da entrada não briga com o do hover.
 */
function Word({ word, variant, baseDelay, active, reducedMotion }: WordProps) {
  // Enquanto as letras entram, o wrapper recorta (overflow-hidden); depois libera
  // para o salto do hover não ser cortado.
  const [revealed, setRevealed] = useState(false)
  const letters = word.split('')
  const lastIndex = letters.length - 1

  const letterClass =
    variant === 'fill'
      ? 'text-cream hover:text-outline'
      : 'text-outline-sand hover:text-ember hover:[-webkit-text-stroke:0]'

  return (
    <span className="inline-block whitespace-nowrap">
      {letters.map((letter, i) => (
        <span key={i} className={cn('inline-block pb-[0.08em] align-bottom', !revealed && 'overflow-hidden')}>
          <motion.span
            className="inline-block"
            initial={reducedMotion ? false : { y: '110%' }}
            animate={active || reducedMotion ? { y: 0 } : { y: '110%' }}
            transition={{ delay: baseDelay + i * 0.05, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={() => {
              if (i === lastIndex && (active || reducedMotion)) setRevealed(true)
            }}
          >
            <span
              data-cursor="✦"
              className={cn(
                'inline-block transition-[transform,color,-webkit-text-stroke] duration-200 ease-out hover:[transform:translateY(-8%)_scaleY(1.12)]',
                letterClass,
              )}
            >
              {letter}
            </span>
          </motion.span>
        </span>
      ))}
    </span>
  )
}

interface HeroProps {
  /** false enquanto a boot screen está na frente; true libera as animações de entrada. */
  active: boolean
}

export function Hero({ active }: HeroProps) {
  const reducedMotion = usePrefersReducedMotion()
  const { scrollTo } = useSmoothScroll()
  const { lang, tx } = useLanguage()
  const sectionRef = useRef<HTMLElement | null>(null)
  const [entered, setEntered] = useState(false)

  // Parallax sutil do bloco de conteúdo em relação à estrela
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const contentY = useTransform(scrollYProgress, [0, 1], [0, reducedMotion ? 0 : 70])

  useEffect(() => {
    if (!active) return
    // O editor começa a digitar depois que as letras do nome entraram
    const id = setTimeout(() => setEntered(true), reducedMotion ? 0 : 900)
    return () => clearTimeout(id)
  }, [active, reducedMotion])

  const next = sections[1]
  const fade = (delay: number) => ({
    initial: reducedMotion ? false : { opacity: 0, y: 12 },
    animate: active || reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
    transition: { delay, duration: 0.6 },
  })

  return (
    <section
      id="inicio"
      ref={sectionRef}
      aria-labelledby="hero-title"
      className="relative flex min-h-[calc(100svh-38px)] max-h-[1100px] flex-col justify-center overflow-hidden px-4 pt-24 pb-16 sm:px-8 md:px-12"
    >
      {/* Estrela ASCII ao fundo, colada ao fim do nome. O "psst" vive DENTRO desta
          caixa, então acompanha qualquer deslocamento da estrela. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[60%] right-[-36%] h-[min(78vw,520px)] w-[min(78vw,520px)] -translate-y-1/2 opacity-45 md:top-[40%] md:right-[-6%] md:h-[min(50vh,460px)] md:w-[min(50vh,460px)] md:opacity-65 lg:right-[-4%] xl:right-[4%] xl:h-[min(58vh,600px)] xl:w-[min(58vh,600px)] 2xl:right-[8%]"
      >
        <AsciiStar className="h-full w-full" />
        <StarHint />
      </div>

      <motion.div style={{ y: contentY }} className="relative z-10">
        <motion.p {...fade(0)} className="font-mono text-xs text-dim">
          <span className="text-ember">{profile.terminalLine}</span> — {profile.terminalStatus}
        </motion.p>

        {/* Uma linha só: tamanhos por breakpoint calibrados para "SOFIA BEZERRA" caber
            sem quebrar (Archivo wdth 125 tem ~1.1em por letra). */}
        <h1
          id="hero-title"
          className="font-display mt-4 flex items-baseline gap-[0.22em] text-[1.45rem] leading-none font-extrabold tracking-tight whitespace-nowrap uppercase sm:text-[2.5rem] md:text-[2.9rem] lg:text-[3.5rem] xl:text-[4.7rem] 2xl:text-[5.8rem]"
        >
          <Word word="SOFIA" variant="fill" baseDelay={0.1} active={active} reducedMotion={reducedMotion} />
          <Word word="BEZERRA" variant="outline" baseDelay={0.3} active={active} reducedMotion={reducedMotion} />
        </h1>

        <motion.p {...fade(0.8)} className="mt-6 max-w-xl text-base text-cream/85 md:text-lg">
          {tx(profile.tagline)}
        </motion.p>

        <motion.ul {...fade(1)} className="mt-4 flex flex-wrap gap-2" aria-label={tx(ui.hero.tagsLabel)}>
          {tx(profile.tags).map((tag) => (
            <li key={tag} className="rounded-xs border border-ember/70 px-2.5 py-1 font-mono text-[11px] tracking-wider text-ember">
              {tag}
            </li>
          ))}
        </motion.ul>

        {(active || reducedMotion) && <DevArtistScribble className="mt-5" />}

        <motion.div {...fade(1.1)} className="mt-5 w-full md:max-w-xl">
          {/* key={lang}: ao trocar o idioma o editor remonta e digita o código de novo */}
          <CodeEditor key={lang} code={tx(heroCode)} start={entered} />
        </motion.div>
      </motion.div>

      {next && (
        <a
          href={`#${next.id}`}
          onClick={(e) => {
            e.preventDefault()
            scrollTo(next.id)
          }}
          className="absolute bottom-6 left-4 z-10 flex items-center gap-2 font-mono text-[11px] tracking-widest text-dim transition-colors hover:text-sand sm:left-8 md:left-12"
        >
          <ArrowDown className="size-3.5" aria-hidden="true" />
          {next.index} {tx(next.label).toLowerCase()}
        </a>
      )}
    </section>
  )
}
