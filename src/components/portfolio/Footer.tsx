import { ArrowUp } from 'lucide-react'
import { footer } from '@/content/portfolio'
import { ui } from '@/content/ui'
import { useSmoothScroll } from './SmoothScroll'
import { useLanguage } from './language'

export function Footer() {
  const { scrollTo } = useSmoothScroll()
  const { tx } = useLanguage()
  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t hairline px-4 py-4 font-mono text-[11px] tracking-wider text-dim sm:px-8 md:px-12">
      <span>{footer.copyright}</span>
      <button type="button" onClick={() => scrollTo(0)} className="flex items-center gap-1.5 transition-colors hover:text-sand">
        <ArrowUp className="size-3" aria-hidden="true" />
        {tx(ui.footer.backToTop)}
      </button>
      <span>{footer.stamp}</span>
    </footer>
  )
}
