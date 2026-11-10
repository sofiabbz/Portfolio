import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { seo } from '@/content/portfolio'
import appCss from '@/styles.css?url'

// O SSR usa sempre PT; o LanguageProvider atualiza título/descrição/lang no cliente.
const siteTitle = seo.title.pt
const siteDescription = seo.description.pt

// Fontes via <link> no head (não @import no CSS): o navegador descobre e baixa
// as fontes mais cedo, em paralelo com o CSS, em vez de esperar o CSS carregar.
const fontsHref =
  'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,500..900&family=Space+Grotesk:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&family=Caveat:wght@500;600&display=swap'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: siteTitle },
      { name: 'description', content: siteDescription },
      { name: 'color-scheme', content: 'dark light' },
      { name: 'theme-color', content: '#0a1416' },
      { property: 'og:title', content: siteTitle },
      { property: 'og:description', content: siteDescription },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'pt_BR' },
      // Sem og:image de propósito: não há URL pública confirmada e uma URL falsa
      // quebra a prévia nas redes. Adicionar quando o site tiver domínio.
    ],
    links: [
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: fontsHref },
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  shellComponent: RootDocument,
  component: Outlet,
})

// Script inline executado antes da hidratação: lê o tema salvo e aplica no <html>
// imediatamente, evitando o "flash" de tema errado. Só ele toca localStorage
// antes do mount — e é um script, não código React.
const themeBootstrap = `(function(){try{var t=localStorage.getItem('sb-theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t;}var l=localStorage.getItem('sofia-lang');if(l==='en'){document.documentElement.lang='en';}}catch(e){}})();`

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" data-theme="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
