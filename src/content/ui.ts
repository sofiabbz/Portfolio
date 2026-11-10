import type { Localized } from './i18n'

// Textos de INTERFACE (botões, rótulos, mensagens de estado). O conteúdo do
// portfólio em si (bio, projetos, fotos...) fica em portfolio.ts.
// Para mudar qualquer texto fixo da UI, edite aqui.

export const ui = {
  topbar: {
    online: { pt: 'online', en: 'online' },
    backToTop: { pt: 'Online — voltar ao topo', en: 'Online — back to top' },
    clock: { pt: 'Hora atual em Brasília', en: 'Current time in Brasília' },
    commands: { pt: 'comandos', en: 'commands' },
    switchLang: { pt: 'Switch language to English', en: 'Mudar idioma para Português' },
    switchLangShort: { pt: 'English', en: 'Português' },
    themeToLight: { pt: 'Ativar tema claro', en: 'Switch to light theme' },
    themeToDark: { pt: 'Ativar tema escuro', en: 'Switch to dark theme' },
  },
  summary: {
    label: { pt: 'Sumário das seções', en: 'Section summary' },
  },
  palette: {
    title: { pt: 'Comandos', en: 'Commands' },
    search: { pt: 'Buscar comando', en: 'Search command' },
    placeholder: { pt: 'Ir para seção, abrir link, alternar tema...', en: 'Go to section, open link, toggle theme...' },
    results: { pt: 'Resultados', en: 'Results' },
    empty: { pt: 'nenhum resultado para', en: 'no results for' },
    goTo: { pt: 'Ir para', en: 'Go to' },
    openGithub: { pt: 'Abrir GitHub', en: 'Open GitHub' },
    openLinkedin: { pt: 'Abrir LinkedIn', en: 'Open LinkedIn' },
    themeLight: { pt: 'Alternar para tema claro', en: 'Switch to light theme' },
    themeDark: { pt: 'Alternar para tema escuro', en: 'Switch to dark theme' },
    switchLang: { pt: 'Mudar idioma para Inglês', en: 'Switch language to Portuguese' },
    keywords: {
      section: { pt: 'secao navegar', en: 'section navigate' },
      github: { pt: 'codigo repositorio', en: 'code repository' },
      linkedin: { pt: 'perfil profissional', en: 'professional profile' },
      theme: { pt: 'claro escuro dark light cor tema', en: 'light dark theme color' },
      lang: { pt: 'idioma ingles english language', en: 'language portuguese idioma' },
    },
  },
  boot: {
    lines: {
      pt: [
        '> iniciando sofia.os v26.11 ...',
        '> montando /dev/criatividade ........ ok',
        '> carregando rolos de filme (36 poses) ok',
        '> compilando ideias ................. ok',
        '$ cat about_me.txt',
      ],
      en: [
        '> booting sofia.os v26.11 ...',
        '> mounting /dev/creativity ........... ok',
        '> loading film rolls (36 exposures) ok',
        '> compiling ideas ................... ok',
        '$ cat about_me.txt',
      ],
    },
    transferring: { pt: 'transferindo', en: 'transferring' },
    complete: { pt: 'transfer complete', en: 'transfer complete' },
    skip: { pt: 'clique para pular', en: 'click to skip' },
    label: { pt: 'Inicializando portfólio', en: 'Booting portfolio' },
  },
  hero: {
    tagsLabel: { pt: 'Áreas de atuação', en: 'Areas of work' },
    devArtist: { pt: 'dev + arte', en: 'dev + art' },
    starHint: { pt: 'pss... passa o mouse aqui rs', en: 'pss... hover here rs' },
    codeLabel: { pt: 'Código em', en: 'Code in' },
  },
  experience: {
    command: { pt: '$ git log --oneline --trajetória', en: '$ git log --oneline --trajectory' },
    current: { pt: 'atual', en: 'current' },
  },
  projects: {
    problem: { pt: 'problema', en: 'problem' },
    solution: { pt: 'solução', en: 'solution' },
    highlight: { pt: 'destaque', en: 'highlight' },
    stack: { pt: 'Stack', en: 'Stack' },
    demo: { pt: 'ver demo', en: 'live demo' },
    noDemo: { pt: 'demo indisponível', en: 'no demo available' },
    noDemoTitle: { pt: 'Sem demo publicada', en: 'No public demo' },
    code: { pt: 'ver código', en: 'view source code' },
  },
  photography: {
    command: { pt: '$ ./revelar --galeria', en: '$ ./develop --gallery' },
    title: { pt: '+Fotografia', en: '+Photography' },
    open: { pt: 'Disparar obturador e abrir galeria', en: 'Fire the shutter and open the gallery' },
    cursor: { pt: 'disparar', en: 'shoot' },
    explore: { pt: 'clique para explorar', en: 'click to explore' },
    gallery: { pt: 'galeria', en: 'gallery' },
    demoNotice: {
      pt: 'galeria demonstrativa: os quadros atuais são placeholders, não fotografias.',
      en: 'demo gallery: the current frames are placeholders, not photographs.',
    },
  },
  gallery: {
    label: { pt: 'Galeria de fotos', en: 'Photo gallery' },
    demo: { pt: 'demonstrativa', en: 'demo' },
    close: { pt: 'fechar', en: 'close' },
    closeLabel: { pt: 'Fechar galeria', en: 'Close gallery' },
    prev: { pt: 'Foto anterior', en: 'Previous photo' },
    next: { pt: 'Próxima foto', en: 'Next photo' },
    thumbs: { pt: 'Miniaturas', en: 'Thumbnails' },
    goTo: { pt: 'Ir para foto', en: 'Go to photo' },
  },
  form: {
    name: { pt: 'Nome', en: 'Name' },
    email: { pt: 'E-mail', en: 'Email' },
    message: { pt: 'Mensagem', en: 'Message' },
    send: { pt: 'Enviar mensagem', en: 'Send message' },
    sending: { pt: 'enviando...', en: 'Sending...' },
    success: { pt: 'mensagem enviada e guardada. obrigada!', en: 'Message received. Thank you!' },
    successToast: { pt: 'Mensagem enviada!', en: 'Message sent!' },
    newMessage: { pt: 'nova mensagem', en: 'new message' },
    errors: {
      nameRequired: { pt: 'Informe seu nome.', en: 'Please enter your name.' },
      nameLong: { pt: 'Nome muito longo (máx. 100).', en: 'Name is too long (max 100).' },
      emailRequired: { pt: 'Informe seu e-mail.', en: 'Please enter your email.' },
      emailLong: { pt: 'E-mail muito longo (máx. 255).', en: 'Email is too long (max 255).' },
      emailInvalid: { pt: 'E-mail inválido.', en: 'Invalid email.' },
      messageRequired: { pt: 'Escreva uma mensagem.', en: 'Please write a message.' },
      messageLong: { pt: 'Mensagem muito longa (máx. 3000).', en: 'Message is too long (max 3000).' },
    },
    reasons: {
      unavailable: {
        pt: 'O envio de mensagens ainda não está configurado neste ambiente. Use um dos canais ao lado.',
        en: "Message sending isn't configured in this environment yet. Use one of the channels on the side.",
      },
      rate_limited: {
        pt: 'Muitas tentativas com este e-mail na última hora. Tente novamente mais tarde.',
        en: 'Too many attempts with this email in the last hour. Please try again later.',
      },
      error: {
        pt: 'Não consegui salvar sua mensagem. Tente de novo em instantes.',
        en: "I couldn't save your message. Please try again in a moment.",
      },
      network: {
        pt: 'Falha de rede ao enviar. Verifique a conexão e tente de novo.',
        en: 'Network error while sending. Check your connection and try again.',
      },
    },
  },
  contact: {
    channels: { pt: 'Canais de contato', en: 'Contact channels' },
    email: { pt: 'e-mail', en: 'email' },
  },
  terminal: {
    input: { pt: 'Comando do terminal', en: 'Terminal command' },
    shortcuts: { pt: 'Atalhos de comandos', en: 'Command shortcuts' },
    copied: { pt: 'e-mail copiado:', en: 'email copied:' },
    copiedToast: { pt: 'e-mail copiado para a área de transferência', en: 'email copied to clipboard' },
    copyFailed: { pt: 'não consegui copiar automaticamente.', en: "couldn't copy automatically." },
    copyFailedToast: { pt: 'não foi possível copiar; use o link mailto', en: "couldn't copy; use the mailto link" },
    openEmail: { pt: 'abrir e-mail:', en: 'open email:' },
    recruiterToast: { pt: 'modo recrutador ativado', en: 'recruiter mode on' },
    recruiterToastDesc: { pt: 'glitch temporário. respira, já passa.', en: 'temporary glitch. breathe, it passes.' },
  },
  footer: {
    backToTop: { pt: 'voltar ao topo', en: 'back to top' },
  },
} satisfies UiTree

// Garante que todo nó folha é um par { pt, en } (string ou lista)
type UiLeaf = Localized | Localized<ReadonlyArray<string>>
interface UiTree {
  readonly [key: string]: UiLeaf | UiTree
}
