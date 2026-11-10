# Portfólio — Sofia Bezerra

Página única (`/`) com estética terminal/retro, construída com **React 19 + TypeScript**, **TanStack Start/Router**, **Tailwind CSS v4**, **Motion**, **Lenis**, **Lucide**, **Sonner** e **Zod**.

## Rodando

```bash
npm install
npm run dev        # http://localhost:3000
npm run test       # testes unitários (Vitest + Testing Library)
npm run smoke      # (com o dev rodando) checagem de ponta a ponta no Chrome instalado + screenshots
npm run typecheck  # tsc --noEmit
npm run build      # gera dist/client (assets) e dist/server/server.js (handler fetch)
npm run start      # serve o build localmente (vite preview)
```

Para deploy na Vercel, basta importar o repositório: o TanStack Start é detectado e `dist/server/server.js` vira a função de servidor. Configure `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` nas variáveis de ambiente do projeto.

## Estrutura

```
src/
  content/            ← TUDO que é texto/dado editável
    portfolio.ts      perfil, sobre, experiência, projetos, skills, fotos, contatos
    navigation.ts     lista única de seções (sumário + command palette)
  lib/
    code-tokens.ts    tokenizador puro do editor (testado)
    terminal.ts       interpretação pura dos comandos (testado)
    contact-schema.ts schema Zod compartilhado cliente/servidor
    hooks.ts          hooks seguros para SSR (reduced motion, pointer, inView)
    camera-art.ts     line-art procedural da câmera (fonte do sampler ASCII)
  server/
    contact.ts        server function POST do formulário (só roda no servidor)
  components/
    ui/Button.tsx
    portfolio/        um arquivo por seção/peça (BootScreen, Hero, AsciiCanvas, CodeEditor, Terminal, ...)
  routes/
    __root.tsx        <html>, fontes, meta tags, script anti-flash de tema
    index.tsx         monta a página
supabase/migrations/  SQL das tabelas + função de rate limit
public/               currículo PDF e placeholders da galeria
```

## Como editar textos, links e arquivos

Regra geral: **conteúdo fica em `src/content/`, nunca dentro dos componentes.** Você não precisa abrir nada em `src/components/` para mudar o que o site diz.

| O que quero mudar | Onde |
|---|---|
| Bio, tagline, tags, cargo, cidade | `src/content/portfolio.ts` → `profile`, `about` |
| Código digitado no editor do Hero | `src/content/portfolio.ts` → `heroCode` |
| Experiência (cargos, datas, bullets) | `src/content/portfolio.ts` → `experience` |
| Projetos (texto, stack, links de demo/código) | `src/content/portfolio.ts` → `projects` |
| Skills | `src/content/portfolio.ts` → `skills` |
| Fotos e legendas | `src/content/portfolio.ts` → `photos` (+ arquivos em `public/photos/`) |
| Links de contato, e-mail | `src/content/portfolio.ts` → `contacts` |
| Currículo | troque o arquivo em `public/` e ajuste `profile.cvHref` / `profile.cvFileName` |
| Nomes das seções (sumário, palette, títulos) | `src/content/navigation.ts` |
| Botões, rótulos, mensagens de erro, boot screen | `src/content/ui.ts` |
| Comandos do terminal (nomes, aliases, descrições) | `src/lib/terminal.ts` → `COMMANDS` |
| Título e descrição da aba/SEO | `src/content/portfolio.ts` → `seo` |
| Cores (tema escuro e claro) | `src/styles.css` → blocos `:root` e `:root[data-theme='light']` |
| Fontes | `src/routes/__root.tsx` → `fontsHref` e `src/styles.css` → `--font-*` |

### Textos em dois idiomas

Todo texto visível é um par:

```ts
tagline: {
  pt: 'Desenvolvedora júnior e curto tirar algumas fotos...',
  en: 'Junior web developer with an eye for photography...',
},
```

Mude as duas versões. Listas seguem o mesmo padrão (`tags: { pt: [...], en: [...] }`). Links, ids, stacks e caminhos de arquivo são strings simples — não têm tradução. Se esquecer uma versão, o teste `todo texto localizado tem as duas versões preenchidas` avisa.

### Trocar ou adicionar uma foto

1. Coloque o arquivo em `public/photos/` (ideal: lado maior ≤ 1600px, JPEG).
2. Em `photos`, adicione um item: `{ id: 'f7', src: '/photos/minha-foto.jpg', alt: { pt, en }, caption: { pt, en } }`.
3. A ordem do array é a ordem da galeria.

### Adicionar um projeto

Copie um bloco de `projects`, mude `id`, `name`, textos, `stack`, `repoUrl` e `demoUrl` (use `null` se não houver demo — o botão aparece desabilitado, nunca inventa link). `accent` escolhe a cor: `'signal'` (verde), `'ember'` (coral) ou `'sand'` (dourado).

### Depois de editar

`npm run dev` mostra a mudança na hora. `npm run test` garante que nada quebrou (links, ordem das seções, textos nos dois idiomas).

## Fluxo de dados do formulário

1. O usuário envia → `contactSchema.safeParse` valida no navegador (erros por campo).
2. `submitContact({ data })` chama a server function (`POST /_serverFn/...`). O corpo do handler **não existe** no bundle do cliente.
3. No servidor: valida de novo com o mesmo schema → honeypot → `SHA-256(email)` → RPC `claim_contact_attempt` (máx. 5/hora por e-mail, atômico) → `insert` em `contact_submissions` com a chave `service_role` lida de `process.env`.
4. Resposta `{ ok: true }` ou `{ ok: false, reason, message }` → UI mostra sucesso real, erro ou limite.

Sem `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` no `.env`, o formulário responde com erro honesto ("não configurado") — ele **nunca** simula envio.

### Configurando o Supabase

1. Crie um projeto em supabase.com.
2. Rode `supabase/migrations/0001_contact_submissions.sql` no SQL Editor.
3. Copie `.env.example` para `.env` e preencha URL + service_role key (Settings → API).
4. Mensagens ficam em **Table Editor → contact_submissions**. Ninguém além da `service_role` consegue ler.

## Fotos

As fotos autorais ficam em `public/photos/foto-0X.jpg` (lado maior ≤ 1600px) e são listadas em `photos` dentro de `src/content/portfolio.ts` — para trocar, adicionar ou mudar legendas, edite só esse arquivo. `galleryIsDemo = true` reativa o aviso de galeria demonstrativa.

## Decisões técnicas

- **Boot screen**: overlay CRT renderizado também no SSR (sem flash do Hero). Linhas a cada 260ms → barra 0–100% em 1,7s → cortina sobe por `clip-path` (0,9s). `sessionStorage['sofia-booted']` liga o modo rápido (400ms) em recarregamentos da mesma aba; `prefers-reduced-motion` também usa o modo rápido. Clique pula.
- **Estrela ASCII**: sampler polar puro (`sampleStar`, testado) — estrela de 5 pontas (vale 0,42 → ponta 0,95) com espiral logarítmica; mouse empurra glifos com força ∝ 1/d² e revela glitch coral.
- **Câmera ASCII**: a silhueta vetorial da câmera (corpo, prisma do visor, anéis da lente) é desenhada por código num canvas offscreen de 280×200 e lida por um *sampler* de luminância com correção de aspect ratio. Onde há traço (> 0,55) o canvas imprime, em loop e "correndo", o código de hardware; cada célula tem dispersão aleatória (120–520px) e atraso próprio, montadas pelo progresso do scroll (Motion `useScroll`); mouse num raio de 130px empurra, troca por glitch e pinta coral. Clique: cortinas fecham em ~350ms, flash, galeria abre.
- **Hero**: nome em uma linha só (`whitespace-nowrap`, tamanhos por breakpoint calibrados para ~1,1em por letra da Archivo wdth 125); a estrela fica encostada no fim do nome e o "psst" é renderizado **dentro** da caixa da estrela, então acompanha qualquer deslocamento dela.
- **Idiomas (PT/EN)**: `LanguageProvider` (`src/components/portfolio/language.tsx`) expõe `lang`, `toggleLang`, `t(pt, en)` e `tx({ pt, en })`. SSR renderiza sempre PT; depois do mount lê `localStorage['sofia-lang']` e troca (a boot screen cobre o instante). Atualiza `<html lang>`, `<title>` e a meta description. O terminal aceita comandos nos dois idiomas sempre; só as respostas mudam.
- **Cursor viewfinder**: ponto instantâneo + moldura com lerp 0,18 em rAF, `mix-blend-difference`; `data-cursor="texto"` expande e mostra etiqueta. Só com `pointer: fine` e sem reduced-motion.

- **Tema**: tokens CSS semânticos (`--ink`, `--sand`, ...) reatribuídos em `[data-theme=light]`; Tailwind mapeia via `@theme inline`. Um script inline no `<head>` aplica o tema salvo antes da hidratação (sem flash). O canvas lê os tokens com `getComputedStyle` e refaz a paleta quando o tema muda.
- **SSR seguro**: nada acessa `window`/`localStorage` durante render; relógio, canvas, Lenis e preferências só entram em `useEffect`.
- **Scroll**: Lenis com rAF próprio (limpo no unmount); modais chamam `stop()`/`start()`. Com `prefers-reduced-motion` o Lenis não é criado.
- **Acessibilidade**: palette com `role=dialog` + combobox/listbox + focus trap; cards de projeto com `aria-expanded`/`aria-controls` e `inert` quando fechados; galeria e terminal com teclado completo.
