import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { galleryIsDemo, photos } from '@/content/portfolio'
import { ui } from '@/content/ui'
import { Button } from '@/components/ui/Button'
import { useSmoothScroll } from './SmoothScroll'
import { useLanguage } from './language'
import { cn } from '@/lib/utils'

interface GalleryProps {
  open: boolean
  onClose: () => void
}

export function Gallery({ open, onClose }: GalleryProps) {
  const { stop, start } = useSmoothScroll()
  const { tx } = useLanguage()
  const g = ui.gallery
  const [index, setIndex] = useState(0)
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const stripRef = useRef<HTMLUListElement | null>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

  const total = photos.length
  const current = photos[index]

  const go = (delta: number) => setIndex((i) => (i + delta + total) % total)

  useEffect(() => {
    if (!open) return
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    stop()
    const frame = requestAnimationFrame(() => closeRef.current?.focus())
    return () => {
      cancelAnimationFrame(frame)
      start()
      previousFocus.current?.focus()
    }
  }, [open, stop, start])

  // Mantém a miniatura ativa visível no filme
  useEffect(() => {
    if (!open) return
    const el = stripRef.current?.querySelector<HTMLElement>(`[data-index="${index}"]`)
    el?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [index, open])

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(-1)
    }
  }

  if (!open || !current) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={tx(g.label)}
      onKeyDown={onKeyDown}
      className="fixed inset-0 z-[85] flex flex-col bg-ink/95 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between px-4 py-3 font-mono text-xs md:px-6">
        <span className="text-dim">
          <span className="text-sand tabular-nums">{String(index + 1).padStart(2, '0')}</span> / {String(total).padStart(2, '0')}
          {galleryIsDemo && <span className="ml-3 text-ember">{tx(g.demo)}</span>}
        </span>
        <Button ref={closeRef} size="sm" variant="ghost" onClick={onClose} aria-label={tx(g.closeLabel)}>
          <X className="size-4" aria-hidden="true" />
          {tx(g.close)}
        </Button>
      </div>

      <figure className="relative flex min-h-0 flex-1 items-center justify-center px-12 md:px-20">
        <Button size="sm" variant="ghost" onClick={() => go(-1)} aria-label={tx(g.prev)} className="absolute top-1/2 left-2 -translate-y-1/2 md:left-6">
          <ChevronLeft className="size-5" aria-hidden="true" />
        </Button>
        <img
          key={current.id}
          src={current.src}
          alt={tx(current.alt)}
          className="max-h-full max-w-full rounded-xs border hairline object-contain"
          draggable={false}
        />
        <Button size="sm" variant="ghost" onClick={() => go(1)} aria-label={tx(g.next)} className="absolute top-1/2 right-2 -translate-y-1/2 md:right-6">
          <ChevronRight className="size-5" aria-hidden="true" />
        </Button>
        <figcaption className="absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-xs text-cream/80">{tx(current.caption)}</figcaption>
      </figure>

      {/* Filme horizontal */}
      <ul ref={stripRef} className="scrollbar-thin flex gap-2 overflow-x-auto border-t hairline px-4 py-3 md:px-6" aria-label={tx(g.thumbs)}>
        {photos.map((photo, i) => (
          <li key={photo.id} data-index={i} className="shrink-0">
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${tx(g.goTo)} ${i + 1}`}
              aria-current={i === index ? 'true' : undefined}
              className={cn(
                'block h-16 w-24 overflow-hidden rounded-xs border transition-colors',
                i === index ? 'border-sand' : 'border-transparent opacity-60 hover:opacity-100',
              )}
            >
              <img src={photo.src} alt="" className="h-full w-full object-cover" draggable={false} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
