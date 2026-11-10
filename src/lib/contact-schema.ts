import { z } from 'zod'
import type { Language } from '@/content/i18n'
import { ui } from '@/content/ui'

// Schema compartilhado: o navegador valida antes de enviar (feedback rápido,
// com mensagens no idioma ativo) e o servidor valida de novo (nunca confiar no cliente).
export function createContactSchema(lang: Language = 'pt') {
  const m = ui.form.errors
  return z.object({
    name: z.string().trim().min(1, m.nameRequired[lang]).max(100, m.nameLong[lang]),
    email: z.string().trim().min(1, m.emailRequired[lang]).max(255, m.emailLong[lang]).email(m.emailInvalid[lang]),
    message: z.string().trim().min(1, m.messageRequired[lang]).max(3000, m.messageLong[lang]),
    // Honeypot: campo invisível para humanos; bots costumam preencher tudo.
    website: z.string().max(0).optional().default(''),
  })
}

export const contactSchema = createContactSchema('pt')

export type ContactInput = z.input<typeof contactSchema>
export type ContactData = z.output<typeof contactSchema>

export type ContactFailureReason = 'rate_limited' | 'unavailable' | 'invalid' | 'error'

// O servidor devolve só a RAZÃO; o cliente escolhe a mensagem no idioma ativo.
export type ContactResult = { ok: true } | { ok: false; reason: ContactFailureReason }
