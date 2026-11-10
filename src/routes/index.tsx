import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { Toaster } from 'sonner'
import { About } from '@/components/portfolio/About'
import { BootScreen } from '@/components/portfolio/BootScreen'
import { CommandPalette, usePaletteShortcut } from '@/components/portfolio/CommandPalette'
import { Contact } from '@/components/portfolio/Contact'
import { Cursor } from '@/components/portfolio/Cursor'
import { Experience } from '@/components/portfolio/Experience'
import { Footer } from '@/components/portfolio/Footer'
import { Gallery } from '@/components/portfolio/Gallery'
import { Hero } from '@/components/portfolio/Hero'
import { Photography } from '@/components/portfolio/Photography'
import { Projects } from '@/components/portfolio/Projects'
import { SideSummary } from '@/components/portfolio/SideSummary'
import { Skills } from '@/components/portfolio/Skills'
import { SmoothScroll } from '@/components/portfolio/SmoothScroll'
import { ThemeProvider } from '@/components/portfolio/ThemeProvider'
import { LanguageProvider } from '@/components/portfolio/language'
import { TopActions, TopBar } from '@/components/portfolio/TopBar'
import { TOP_BAR_OFFSET } from '@/content/navigation'

export const Route = createFileRoute('/')({
  component: PortfolioPage,
})

function PortfolioPage() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SmoothScroll>
          <PageShell />
        </SmoothScroll>
      </LanguageProvider>
    </ThemeProvider>
  )
}

function PageShell() {
  const [booted, setBooted] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [galleryOpen, setGalleryOpen] = useState(false)
  usePaletteShortcut(paletteOpen, setPaletteOpen)

  const openGallery = useCallback(() => setGalleryOpen(true), [])
  const closeGallery = useCallback(() => setGalleryOpen(false), [])
  const onBooted = useCallback(() => setBooted(true), [])

  return (
    <div className="film-grain">
      {/* Boot screen por cima de tudo; o Hero já está renderizado atrás e anima quando a cortina sobe */}
      <BootScreen onDone={onBooted} />

      <TopBar />
      <TopActions onOpenPalette={() => setPaletteOpen(true)} />
      <SideSummary />

      {/* pr reserva a faixa do sumário: só números até lg, nome+número a partir de lg */}
      <main className="pr-10 lg:pr-44" style={{ paddingTop: TOP_BAR_OFFSET }}>
        <Hero active={booted} />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Photography onOpenGallery={openGallery} />
        <Contact onOpenGallery={openGallery} />
        <Footer />
      </main>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <Gallery open={galleryOpen} onClose={closeGallery} />
      <Cursor />
      <Toaster
        position="bottom-left"
        toastOptions={{
          className: 'font-mono text-sm',
          style: { background: 'var(--panel)', color: 'var(--cream)', border: '1px solid color-mix(in oklch, var(--cream) 18%, transparent)' },
        }}
      />
    </div>
  )
}
