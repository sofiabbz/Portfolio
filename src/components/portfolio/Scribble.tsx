import { motion } from 'motion/react'
import { ui } from '@/content/ui'
import { useFinePointer, usePrefersReducedMotion } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import { useLanguage } from './language'

/**
 * Rabisco "dev + artista": seta curva que se desenha sozinha (pathLength) e o
 * texto em Caveat que surge depois. Fica entre as tags e o editor do Hero.
 */
export function DevArtistScribble({ className }: { className?: string }) {
  const reducedMotion = usePrefersReducedMotion()
  const { tx } = useLanguage()
  const draw = reducedMotion ? 0 : 1.2
  const delay = reducedMotion ? 0 : 1.2

  return (
    <div className={cn('flex items-center gap-3 text-ember', className)} aria-hidden="true">
      <svg width="110" height="32" viewBox="0 0 110 32" fill="none" className="shrink-0">
        <motion.path
          d="M3 20 C20 5 44 28 60 15 S85 6 103 17 M91 7 L104 17 L91 25"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: reducedMotion ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: draw, delay, ease: 'easeInOut' }}
        />
      </svg>
      <motion.span
        className="font-hand -rotate-6 text-3xl leading-none"
        initial={{ opacity: reducedMotion ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + draw, duration: 0.5 }}
      >
        {tx(ui.hero.devArtist)}
      </motion.span>
    </div>
  )
}

/**
 * Anotação "psst... passa o mouse aqui" apontando para a estrela.
 * Renderizada DENTRO da caixa da estrela (ancorada à ponta superior direita),
 * por isso acompanha qualquer deslocamento dela. Oculta abaixo de 768px e em
 * dispositivos sem mouse (a dica é sobre o mouse).
 */
export function StarHint() {
  const reducedMotion = usePrefersReducedMotion()
  const finePointer = useFinePointer()
  const { tx } = useLanguage()
  if (!finePointer) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-[30%] right-[-18%] z-10 hidden w-[240px] text-ember md:block xl:w-[300px]"
    >
      <motion.p
        className="font-hand -rotate-6 text-2xl leading-tight md:text-3xl"
        initial={{ opacity: reducedMotion ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reducedMotion ? 0 : 2.3, duration: 0.5 }}
      >
        {tx(ui.hero.starHint)}
      </motion.p>
      <svg width="150" height="70" viewBox="0 0 150 70" fill="none" className="mt-1 ml-6" style={{ transform: 'scaleX(-1)' }}>
        <motion.path
          d="M5 10 C50 4 35 65 102 44 Q120 38 135 22 M118 25 L137 20 L133 39"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: reducedMotion ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: reducedMotion ? 0 : 1.1, delay: reducedMotion ? 0 : 2.5, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  )
}
