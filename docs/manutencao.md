# Manutenção do portfólio (notas pessoais)

Guia de bolso para editar, testar e publicar. Não é documentação pública do projeto.

## Comandos

```bash
npm run dev             # http://localhost:3000
npm run test            # testes unitários
npm run typecheck       # tsc
npm run build           # gera .output/ (Nitro)
npm run start           # roda o build local
npm run smoke           # (com o dev rodando) checagem no Chrome + screenshots em smoke-shots/
npm run check:supabase  # valida tabela, rate limit e insert usando o .env
```

Verificação em produção (envia uma mensagem de teste pelo site e apaga a linha):
`node smoke-shots/prod-check.mjs https://sofiabezerra.vercel.app/`

## Onde mudar cada coisa

Regra: **conteúdo fica em `src/content/`**, nunca dentro dos componentes.

| O que mudar | Onde |
|---|---|
| Bio, tagline, tags, cargo, cidade | `src/content/portfolio.ts` → `profile`, `about` |
| Código digitado no editor do Hero | `src/content/portfolio.ts` → `heroCode` |
| Experiência (cargos, datas, bullets) | `src/content/portfolio.ts` → `experience` |
| Projetos (texto, stack, links) | `src/content/portfolio.ts` → `projects` |
| Skills | `src/content/portfolio.ts` → `skills` |
| Fotos e legendas | `src/content/portfolio.ts` → `photos` (+ arquivos em `public/photos/`) |
| Links de contato, e-mail | `src/content/portfolio.ts` → `contacts` |
| Currículo | troque o PDF em `public/` e ajuste `profile.cvHref` / `profile.cvFileName` |
| Nomes das seções | `src/content/navigation.ts` |
| Botões, rótulos, mensagens, boot screen | `src/content/ui.ts` |
| Comandos do terminal | `src/lib/terminal.ts` → `COMMANDS` |
| Título/descrição da aba (SEO) | `src/content/portfolio.ts` → `seo` |
| Cores dos temas | `src/styles.css` → `:root` e `:root[data-theme='light']` |
| Fontes | `src/routes/__root.tsx` → `fontsHref` e `src/styles.css` → `--font-*` |
| Posição/tamanho da estrela | `src/components/portfolio/Hero.tsx` (div que envolve `<AsciiStar>`) |
| "psst… passa o mouse aqui" | `src/components/portfolio/Scribble.tsx` → `StarHint` |
| "dev + arte" | `src/components/portfolio/Hero.tsx` (`<DevArtistScribble className="mt-5" />`) e `Scribble.tsx` |

### Textos em dois idiomas

Todo texto visível é um par `{ pt: '...', en: '...' }`. Listas também: `tags: { pt: [...], en: [...] }`. Links, ids, stacks e caminhos são strings simples. Se esquecer uma versão, o teste `todo texto localizado tem as duas versões preenchidas` avisa.

### Trocar ou adicionar uma foto

1. Arquivo em `public/photos/` (lado maior ≤ 1600px, JPEG).
2. Novo item em `photos`: `{ id, src: '/photos/arquivo.jpg', alt: { pt, en }, caption: { pt, en } }`.
3. A ordem do array é a ordem da galeria.

### Adicionar um projeto

Copie um bloco de `projects`; `demoUrl: null` desabilita o botão de demo (nunca inventa link); `accent` = `'signal'` (verde), `'ember'` (coral) ou `'sand'` (dourado).

## Publicar

```bash
git add -A
git commit -m "tipo: descrição curta"
git push
```

Prefixos: `feat` (função nova), `fix` (correção), `style` (visual), `refactor` (reorganização), `docs` (texto/documentação), `chore` (config/infra).

Todo push na `main` republica na Vercel em ~1 min. URL: https://sofiabezerra.vercel.app (a antiga `portfolio-sand-three-….vercel.app` redireciona).

## Formulário de contato (Supabase + Vercel)

- Mensagens: Supabase → projeto `portfolio` → **Table Editor → contact_submissions**. Só a chave secreta lê (RLS ligada, sem policies para visitantes).
- Limite: 5 envios por e-mail por hora (`claim_contact_attempt`, hash SHA-256 do e-mail — o e-mail não fica no contador).
- Variáveis: `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (a **Secret key** `sb_secret_…`, não a publishable). Localmente no `.env` (ignorado pelo git); na Vercel em *Settings → Environment Variables* (Production + Preview). Mudou variável → *Deployments → ⋯ → Redeploy*.
- Se o site disser "não está configurado": variável faltando/errada na Vercel.
- Chave vazou? Supabase → *API Keys → Secret keys → ⋯ → Revoke*, crie outra, atualize `.env` e Vercel, redeploy.

## Vercel — ajustes feitos

- Framework preset **TanStack Start** (fixado também em `vercel.json`; o detector automático errou para Angular).
- Node.js 24.x (`engines` no `package.json`).
- **Deployment Protection → Vercel Authentication: Disabled** (senão o site pede login da Vercel).
- Plugin `nitro/vite` no `vite.config.ts` é obrigatório para o build de servidor na Vercel.

## Pendências / ideias

- `og:image` para a prévia bonita no LinkedIn (precisa de uma imagem 1200×630 em `public/` e a meta em `__root.tsx`).
- Aviso por e-mail quando chegar mensagem (Database Webhook do Supabase).
- Domínio próprio (Settings → Domains na Vercel; gratuito: `is-a.dev`).
