import type { Localized } from './i18n'

// ============================================================================
// TODO O CONTEÚDO EDITÁVEL DO PORTFÓLIO VIVE AQUI, SEPARADO DOS COMPONENTES.
//
// Como editar:
// - Texto que aparece na tela é sempre um par { pt: '...', en: '...' }.
//   Mude os dois (ou só um, se quiser) — o site troca sozinho pelo idioma ativo.
// - Links, ids, stacks e caminhos de arquivo NÃO são traduzidos: são strings simples.
// - Arquivos (currículo, fotos) ficam em /public e são referenciados pelo caminho
//   a partir da raiz, ex.: '/CurriculoSofiaBezerra.pdf' → public/CurriculoSofiaBezerra.pdf.
// Nenhum componente precisa ser tocado para mudar conteúdo.
// ============================================================================

export const profile = {
  name: 'Sofia Bezerra',
  fullName: 'Sofia Bezerra Belém',
  role: { pt: 'Desenvolvedora web & fotógrafa', en: 'Web developer & photographer' },
  location: { pt: 'Brasília/DF', en: 'Brasília, Brazil' },
  tagline: {
    pt: 'Desenvolvedora júnior e curto tirar algumas fotos, juntando códigos e capturas.',
    en: 'Junior web developer with an eye for photography, merging code and frames.',
  },
  tags: {
    pt: ['front-end', 'ui/ux', 'fotografia', 'desenvolvimento web'],
    en: ['front-end', 'ui/ux', 'photography', 'web development'],
  },
  terminalLine: '$ cat about_me.txt',
  terminalStatus: 'transfer complete',
  // Asset pointer compartilhado: o botão "Currículo" e o comando `cv` do terminal
  // apontam para o mesmo arquivo real em /public. Nunca simular download.
  cvHref: '/CurriculoSofiaBezerra.pdf',
  cvFileName: 'CurriculoSofiaBezerra.pdf',
  cvLabel: { pt: 'currículo (pdf)', en: 'resume (pdf)' },
  availability: {
    pt: 'disponível para vagas júnior, remoto ou presencial.',
    en: 'open to junior roles, remote or on-site.',
  },
} satisfies Record<string, string | Localized | Localized<ReadonlyArray<string>>>

export const seo = {
  title: { pt: 'Sofia Bezerra — Desenvolvedora web & fotógrafa', en: 'Sofia Bezerra — Web developer & photographer' },
  description: {
    pt: 'Portfólio de Sofia Bezerra: desenvolvedora web júnior (React, TypeScript, Node.js) e fotógrafa em Brasília/DF.',
    en: 'Portfolio of Sofia Bezerra: junior web developer (React, TypeScript, Node.js) and photographer based in Brasília, Brazil.',
  },
} as const

export const contacts = {
  github: 'https://github.com/sofiabbz',
  githubHandle: 'sofiabbz',
  linkedin: 'https://www.linkedin.com/in/sofia-bezerra-belem',
  linkedinHandle: 'sofia-bezerra-belem',
  email: 'sofiabezlem@gmail.com',
} as const

// Código digitado no editor do Hero. A sintaxe TypeScript é a mesma; só os valores mudam.
export const heroCode: Localized = {
  pt: `const sofia: Dev = {
  nome: "Sofia Bezerra",
  faz: "dev + arte",
  stack: ["React", "TypeScript", "Node.js"],
  status: "em busca de uma vaga"
};`,
  en: `const sofia: Dev = {
  name: "Sofia Bezerra",
  does: "dev + art",
  stack: ["React", "TypeScript", "Node.js"],
  status: "looking for a junior role"
};`,
}

export const about = {
  text: {
    pt: 'Desenvolvedora web com foco em Front-end e conhecimentos em Full Stack. Trabalho com React, TypeScript, JavaScript, Node.js e outras. Gosto bastante de criar interfaces, explorar ideias e expandir minha criatividade nas minhas criações. Além do código, a fotografia é outra forma de expressar minha imaginação e olhar artístico. Por fim, me considero muito curiosa e me amarro em aprender coisas novas, experimentar e construir.',
    en: "Web developer focused on front-end with full-stack knowledge. I work with React, TypeScript, JavaScript, Node.js and more. I really enjoy building interfaces, exploring ideas and stretching my creativity in whatever I make. Beyond code, photography is another way I express my imagination and artistic eye. Lastly, I'm deeply curious and love learning new things, experimenting and building.",
  },
  formTitle: { pt: 'Vamos conversar.', en: "Let's talk." },
  formIntro: {
    pt: 'Deixe uma mensagem para batermos um papo! Ela fica guardada com segurança e eu leio assim que puder.',
    en: "Leave a message for a chat! It's stored safely and I'll read it as soon as I can.",
  },
} as const

export interface ExperienceEntry {
  id: string
  hash: string // decorativo, não é um commit real
  title: Localized
  org: Localized
  period: Localized
  current: boolean
  bullets: Localized<ReadonlyArray<string>>
}

// Mais recente primeiro. Datas do HFA confirmadas pelo currículo (Mar/2025 — Out/2026).
export const experience: ReadonlyArray<ExperienceEntry> = [
  {
    id: 'dev-web',
    hash: 'a7f3c21',
    title: { pt: 'Desenvolvimento Web', en: 'Web Development' },
    org: { pt: 'Projetos autorais · front-end & full-stack', en: 'Personal projects · front-end & full-stack' },
    period: { pt: '2025 → agora', en: '2025 → now' },
    current: true,
    bullets: {
      pt: [
        'Construindo apps reais com React, TypeScript e Node.js.',
        'Explorando interfaces, integrações e ideias do conceito ao deploy.',
        
      ],
      en: [
        'Building real apps with React, TypeScript and Node.js.',
        'Exploring interfaces, integrations and ideas from concept to deploy.',
        
      ],
    },
  },
  {
    id: 'hfa',
    hash: '5e9d04b',
    title: { pt: 'Estagiária de Suporte Técnico em TI', en: 'IT Technical Support Intern' },
    org: { pt: 'Hospital das Forças Armadas (HFA) · Brasília/DF', en: 'Hospital das Forças Armadas (HFA) · Brasília, Brazil' },
    period: { pt: 'Mar/2025 → Out/2026', en: 'Mar 2025 → Oct 2026' },
    current: false,
    bullets: {
      pt: [
        'Atendimento presencial e remoto em ambiente hospitalar, resolvendo chamados de software, hardware e rede local.',
        'Configuração, manutenção e padronização de estações de trabalho, impressoras em rede e equipamentos de TI.',
        'Acompanhamento e documentação do ciclo dos chamados, contribuindo para identificar e evitar reincidências.',
      ],
      en: [
        'On-site and remote IT support in a hospital environment, solving software, hardware and network incidents.',
        'Configuration, maintenance and standardization of workstations, network printers and IT infrastructure.',
        'Tracking and documenting the ticket lifecycle to help identify and prevent recurring issues.',
      ],
    },
  },
]

export type ProjectAccent = 'signal' | 'ember' | 'sand'

export interface Project {
  id: string
  name: string
  meta: Localized
  tagline: Localized
  accent: ProjectAccent
  problem: Localized
  solution: Localized
  highlight: Localized
  stack: ReadonlyArray<string>
  repoUrl: string
  demoUrl: string | null // null = sem demo confirmada; o botão aparece desabilitado
}

export const projects: ReadonlyArray<Project> = [
  {
    id: 'canopi',
    name: 'CANOPI',
    meta: { pt: 'app web · atlas interativo', en: 'web app · interactive atlas' },
    tagline: {
      pt: 'Biodiversidade e conservação brasileiras, acessíveis em um mapa.',
      en: 'Brazilian biodiversity and conservation, accessible on a map.',
    },
    accent: 'signal',
    problem: {
      pt: 'Informação sobre biomas e espécies ameaçadas são limitadas para quem não tem conhecimento e muito menos acesso a tais informações.',
      en: 'Information about biomes and endangered species is limited for those without knowledge, much less access to such information.',
    },
    solution: {
      pt: 'SPA em React 19 + TypeScript integrada ao Supabase, com mapa SVG dos seis biomas, busca e filtros dinâmicos.',
      en: 'React 19 + TypeScript SPA backed by Supabase, with an SVG map of the six biomes, search and dynamic filters.',
    },
    highlight: {
      pt: 'Mapa interativo em SVG com filtros por bioma via CSS Modules e data-attributes; deploy automatizado na Vercel.',
      en: 'Interactive SVG map with per-biome filters via CSS Modules and data-attributes; automated deploys on Vercel.',
    },
    stack: ['React 19', 'TypeScript', 'Vite', 'Supabase', 'CSS Modules'],
    repoUrl: 'https://github.com/sofiabbz/canopi',
    demoUrl: 'https://canopi-atlas.vercel.app',
  },
  {
    id: 'chamaki',
    name: 'CHAMAKI',
    meta: { pt: 'sistema · helpdesk', en: 'system · helpdesk' },
    tagline: {
      pt: 'Registro e acompanhamento de chamados, inspirado no suporte hospitalar.',
      en: 'Ticket logging and tracking, inspired by hospital IT support.',
    },
    accent: 'ember',
    problem: {
      pt: 'No suporte de TI, chamados com poucas informações se tornam retrabalho e reincidência de problemas.',
      en: 'In IT support, tickets with limited information result in repetitive work and recurring problems.',
    },
    solution: {
      pt: 'Interfaces separadas para cliente e técnico, API em Express e modelagem com Prisma sobre PostgreSQL.',
      en: 'Separate client and technician interfaces, an Express API and Prisma modeling over PostgreSQL.',
    },
    highlight: {
      pt: 'Navegação por perfil e integração front ↔ API ↔ banco. Autorização por perfil e upload de arquivos ainda em desenvolvimento.',
      en: 'Role-based navigation and front ↔ API ↔ database integration. Role authorization and file upload are still in progress.',
    },
    stack: ['React', 'JavaScript', 'Vite', 'Node.js', 'Express', 'Prisma', 'PostgreSQL'],
    repoUrl: 'https://github.com/sofiabbz/Chamaki',
    demoUrl: null,
  },
  {
    id: 'orbec',
    name: 'ORBEC',
    meta: { pt: 'app web · controle financeiro', en: 'web app · personal finance' },
    tagline: { pt: 'Finanças pessoais com tema espacial.', en: 'Personal finances with a space theme.' },
    accent: 'sand',
    problem: {
      pt: 'Controlar gastos costuma ser chato; a interface raramente convida a voltar.',
      en: 'Tracking expenses is usually boring; the interface rarely invites you back.',
    },
    solution: {
      pt: 'App de controle financeiro com temática espacial, gráficos de gastos e persistência local no navegador.',
      en: 'Space-themed expense tracker with spending charts and local persistence in the browser.',
    },
    highlight: {
      pt: 'Visualização de gastos por categoria e dados persistidos localmente, sem depender de backend.',
      en: 'Spending by category and data persisted locally, with no backend required.',
    },
    stack: ['React', 'TypeScript', 'Tailwind CSS'],
    repoUrl: 'https://github.com/sofiabbz/Orbec',
    demoUrl: null,
  },
]

export interface SkillGroup {
  id: string
  title: Localized
  items: Localized<ReadonlyArray<string>>
  note?: Localized
}

export const skills: ReadonlyArray<SkillGroup> = [
  {
    id: 'frontend',
    title: { pt: 'Front-end', en: 'Front-end' },
    items: {
      pt: ['React 19', 'TypeScript', 'JavaScript ES6+', 'HTML5 & CSS3 Grid/Flexbox', 'Vite · React Router', 'CSS Modules'],
      en: ['React 19', 'TypeScript', 'JavaScript ES6+', 'HTML5 & CSS3 Grid/Flexbox', 'Vite · React Router', 'CSS Modules'],
    },
  },
  {
    id: 'fotografia',
    title: { pt: 'Fotografia', en: 'Photography' },
    items: { pt: ['Ensaios autorais', 'Edição'], en: ['Personal photo essays', 'Editing'] },
  },
  {
    id: 'design',
    title: { pt: 'Design', en: 'Design' },
    items: { pt: ['Figma', 'Inkscape', 'UI / UX', 'Composição visual'], en: ['Figma', 'Inkscape', 'UI / UX', 'Visual composition'] },
  },
  {
    id: 'backend',
    title: { pt: 'Back-end e BD', en: 'Back-end & DB' },
    items: {
      pt: ['Node.js · Express', 'APIs REST', 'PostgreSQL', 'Supabase', 'Prisma ORM'],
      en: ['Node.js · Express', 'REST APIs', 'PostgreSQL', 'Supabase', 'Prisma ORM'],
    },
  },
  {
    id: 'ferramentas',
    title: { pt: 'Ferramentas', en: 'Tools' },
    items: {
      pt: ['Git & GitHub', 'Docker', 'Vercel', 'Deploy & incidentes'],
      en: ['Git & GitHub', 'Docker', 'Vercel', 'Deploy & incident response'],
    },
  },
  {
    id: 'formacao',
    title: { pt: 'Formação', en: 'Education' },
    items: {
      pt: ['Análise e Desenvolvimento de Sistemas', 'Universidade Católica de Brasília'],
      en: ['Systems Analysis and Development', 'Universidade Católica de Brasília'],
    },
    note: { pt: 'previsão de conclusão 11/2026', en: 'expected graduation 11/2026' },
  },
]

export interface Photo {
  id: string
  src: string
  alt: Localized
  caption: Localized
}

/**
 * Fotografias autorais da Sofia (arquivos em /public/photos, redimensionados
 * para no máximo 1600px). `galleryIsDemo = true` reativa o aviso de galeria
 * demonstrativa, caso algum dia volte a usar placeholders.
 * As legendas são descritivas — edite à vontade; nenhum metadado foi inventado.
 */
export const galleryIsDemo = false

export const photos: ReadonlyArray<Photo> = [
  {
    id: 'f1',
    src: '/photos/foto-01.jpg',
    alt: { pt: 'Rosto em close contra fundo preto, com uma lágrima escorrendo', en: 'Close-up of a face against a black background, a tear running down' },
    caption: { pt: 'lágrima — close no escuro', en: 'tear — close-up in the dark' },
  },
  {
    id: 'f2',
    src: '/photos/foto-02.jpg',
    alt: { pt: 'Costas de uma figura vistas por trás, luz lateral suave', en: 'Back of a figure seen from behind, soft side light' },
    caption: { pt: 'costas — luz lateral', en: 'back — side light' },
  },
  {
    id: 'f3',
    src: '/photos/foto-03.jpg',
    alt: {
      pt: 'Retrato em preto e branco: mão em sinal de paz em primeiro plano, rosto desfocado ao fundo',
      en: 'Black and white portrait: a hand making a peace sign in the foreground, face out of focus behind',
    },
    caption: { pt: 'paz — preto e branco', en: 'peace — black and white' },
  },
  {
    id: 'f4',
    src: '/photos/foto-04.jpg',
    alt: { pt: 'Cachorro de pelagem malhada sorrindo para a câmera num parque ao entardecer', en: 'Merle-coated dog grinning at the camera in a park at dusk' },
    caption: { pt: 'cachorro — entardecer', en: 'dog — dusk' },
  },
  {
    id: 'f5',
    src: '/photos/foto-05.jpg',
    alt: { pt: 'Flor branca com manchas laranja em close, fundo verde desfocado', en: 'White flower with orange spots in close-up, blurred green background' },
    caption: { pt: 'flor — macro', en: 'flower — macro' },
  },
  {
    id: 'f6',
    src: '/photos/foto-06.jpeg',
    alt: { pt: 'Retrato: homem posando para marca de roupas, parede clara ao fundo', en: 'Portrait:  man posing for a clothing brand, with a light-colored wall in the background' },
    caption: { pt: 'posando', en: 'posing' },
  },
]

export const photography = {
  intro: {
    pt: 'Além do código, tirar fotos é uma maneira que gosto muuuito de expressar minha criatividade e olhar artístico.',
    en: 'Beyond the code, taking photos is a way that I really enjoy to express my creativity and artistic eye.',
  },
  count: { pt: 'A galeria tem {n} imagens.', en: 'The gallery has {n} images.' },
} as const

export const contactIntro = {
  command: { pt: 'echo "vamos trabalhar juntos?"', en: 'echo "shall we work together?"' },
  text: {
    pt: 'Em busca da minha próxima oportunidade como dev. Se tiver uma vaga, projeto ou só quiser trocar ideia, me chama em qualquer canal aí do lado :)',
    en: 'Looking for my next opportunity as a dev. If you have a role, a project or just want to chat, reach me on any channel on the side :)',
  },
} as const

export const footer = {
  copyright: '© sofia bezerra belém',
  stamp: 'brasília-2026',
} as const
