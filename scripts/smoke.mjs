// Verificação de fumaça de ponta a ponta no Chrome instalado (sem baixar navegador).
// Uso: `npm run dev` em outro terminal e depois `node scripts/smoke.mjs [pasta-de-screenshots]`.
// Imprime um JSON com checagens e salva screenshots. Não substitui os testes unitários.
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const OUT = process.argv[2] ?? './smoke-shots'
mkdirSync(OUT, { recursive: true })
const BASE = process.env.PORTFOLIO_URL ?? 'http://localhost:3000/'
const BOOT = '[aria-label="Inicializando portfólio"]'

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const report = { console: [], pageErrors: [], checks: {} }

async function run(name, viewport, fn) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  page.on('console', (m) => {
    if (['error', 'warning'].includes(m.type())) report.console.push(`[${name}] ${m.type()}: ${m.text().slice(0, 300)}`)
  })
  page.on('pageerror', (e) => report.pageErrors.push(`[${name}] ${e.message.slice(0, 300)}`))
  await page.goto(BASE, { waitUntil: 'load', timeout: 90000 })
  report.checks[`${name}-bootVisible`] = (await page.locator(BOOT).count()) === 1
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${OUT}/${name}-boot.png` })
  await page.locator(BOOT).waitFor({ state: 'detached', timeout: 15000 })
  report.checks[`${name}-bootStored`] = await page.evaluate(() => sessionStorage.getItem('sofia-booted'))
  await page.waitForTimeout(1800)
  await fn(page, name)
  await ctx.close()
}

await run('desktop', { width: 1440, height: 900 }, async (page, name) => {
  const c = {}
  c.hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  c.title = await page.title()
  c.clock = await page.locator('header time').textContent()
  c.editorText = (await page.locator('pre code').textContent())?.slice(0, 60)
  c.headerHasNoNavLinks = (await page.locator('header a').count()) === 0
  await page.screenshot({ path: `${OUT}/${name}-hero.png` })

  // cursor viewfinder: hover numa letra mostra a etiqueta
  const letter = page.locator('#hero-title [data-cursor]').first()
  await letter.hover()
  await page.waitForTimeout(400)
  c.cursorLabel = await page.locator('.mix-blend-difference span.uppercase').textContent().catch(() => null)
  await page.screenshot({ path: `${OUT}/${name}-hero-hover.png` })

  // palette
  await page.keyboard.press('Control+K')
  await page.waitForTimeout(300)
  c.paletteOpen = await page.locator('[role=dialog][aria-modal=true]').count()
  await page.keyboard.type('experi')
  await page.waitForTimeout(200)
  c.paletteResults = await page.locator('[role=option]').allTextContents()
  await page.keyboard.press('Enter')
  await page.waitForTimeout(1800)
  c.scrollAfterPalette = await page.evaluate(() => window.scrollY)
  c.activeSummary = await page.locator('nav[aria-label="Sumário das seções"] a[aria-current]').textContent()
  c.progressBarTransform = await page.evaluate(() => {
    const bar = document.querySelector('header > div:last-child')
    return bar ? getComputedStyle(bar).transform : null
  })

  // tema + persistência + boot rápido no reload
  await page.getByRole('button', { name: /ativar tema claro/i }).click()
  await page.waitForTimeout(400)
  c.themeAfterToggle = await page.evaluate(() => document.documentElement.dataset.theme)
  await page.screenshot({ path: `${OUT}/${name}-light.png`, fullPage: true })
  const reloadAt = Date.now()
  await page.reload({ waitUntil: 'load' })
  await page.locator(BOOT).waitFor({ state: 'detached', timeout: 15000 })
  c.fastBootMs = Date.now() - reloadAt
  await page.waitForTimeout(1000)
  c.themeAfterReload = await page.evaluate(() => document.documentElement.dataset.theme)
  await page.getByRole('button', { name: /ativar tema escuro/i }).click()

  // projetos por teclado
  const first = page.getByRole('button', { name: /CANOPI/i }).first()
  await first.scrollIntoViewIfNeeded()
  await page.waitForTimeout(800)
  await first.focus()
  await page.keyboard.press('Enter')
  await page.waitForTimeout(600)
  c.projectExpanded = await first.getAttribute('aria-expanded')
  c.demoLink = await page.getByRole('link', { name: /ver demo/i }).first().getAttribute('href')

  // câmera + galeria
  const galleryBtn = page.getByRole('button', { name: /abrir galeria/i })
  await galleryBtn.scrollIntoViewIfNeeded()
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${OUT}/${name}-photography.png` })
  await galleryBtn.click()
  await page.waitForTimeout(900)
  c.galleryOpen = await page.locator('[role=dialog][aria-label="Galeria de fotos"]').count()
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(200)
  c.galleryCounter = await page.locator('[role=dialog][aria-label="Galeria de fotos"] span.text-dim').first().textContent()
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)
  c.galleryClosed = (await page.locator('[role=dialog][aria-label="Galeria de fotos"]').count()) === 0

  // terminal: erro, chip, sudo
  const term = page.getByLabel('Comando do terminal')
  await term.scrollIntoViewIfNeeded()
  await page.waitForTimeout(800)
  await term.fill('foo')
  await term.press('Enter')
  await page.getByRole('button', { name: 'projetos' }).click()
  await page.waitForTimeout(300)
  const log = await page.locator('[role=log]').textContent()
  c.terminalError = log?.includes('comando não encontrado: foo')
  c.chipLs = log?.includes('drwxr-x  canopi')
  await page.screenshot({ path: `${OUT}/${name}-contact.png` })
  await term.fill('sudo contratar')
  await term.press('Enter')
  await page.waitForTimeout(300)
  c.recruiterMode = await page.evaluate(() => document.documentElement.classList.contains('recruiter-mode'))
  await page.waitForTimeout(2600)
  c.recruiterModeOff = await page.evaluate(() => !document.documentElement.classList.contains('recruiter-mode'))

  // formulário sem Supabase → erro honesto
  await page.getByLabel('Nome').fill('Teste')
  await page.getByLabel('E-mail').fill('teste@example.com')
  await page.getByLabel('Mensagem').fill('Mensagem de teste')
  await page.getByRole('button', { name: /enviar mensagem/i }).click()
  await page.waitForTimeout(2500)
  c.formAlert = await page.locator('[role=alert]').first().textContent().catch(() => null)

  const cv = await page.request.get(new URL('/CurriculoSofiaBezerra.pdf', BASE).toString())
  c.cvStatus = cv.status()
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUT}/${name}-full.png`, fullPage: true })
  report.checks[name] = c
})

await run('mobile', { width: 390, height: 844 }, async (page, name) => {
  const c = {}
  c.hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  c.heroH1 = await page.evaluate(() => {
    const r = document.getElementById('hero-title')?.getBoundingClientRect()
    return r ? { right: Math.round(r.right), vw: window.innerWidth } : null
  })
  c.starHintHidden = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('p')).find((p) => p.textContent?.includes('passa o mouse'))
    if (!el || !el.parentElement) return true
    return getComputedStyle(el.parentElement).display === 'none'
  })
  await page.screenshot({ path: `${OUT}/${name}-hero.png` })
  await page.screenshot({ path: `${OUT}/${name}-full.png`, fullPage: true })
  report.checks[name] = c
})

{
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 800 }, reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  const t0 = Date.now()
  await page.goto(BASE, { waitUntil: 'load' })
  await page.locator(BOOT).waitFor({ state: 'detached', timeout: 15000 })
  report.checks.reducedMotionBootMs = Date.now() - t0
  await page.waitForTimeout(800)
  report.checks.reducedMotionEditorComplete = (await page.locator('pre code').textContent())?.includes('em busca da primeira vaga júnior')
  await ctx.close()
}

await browser.close()
console.log(JSON.stringify(report, null, 2))
