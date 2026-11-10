import { createServerFn } from '@tanstack/react-start'
import { contactSchema, type ContactResult } from '@/lib/contact-schema'

const RATE_LIMIT_PER_HOUR = 5

/** SHA-256 via Web Crypto (existe no Node 20+ e em Workers; sem `node:crypto`). */
async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Server function pública e dedicada ao formulário.
 * O corpo do handler NUNCA vai para o navegador: o compilador do TanStack Start
 * substitui esta função por uma chamada fetch no bundle do cliente.
 * Fluxo: validar → limitar por e-mail (hash, sem armazenar o e-mail no contador)
 * → inserir em contact_submissions com a chave service_role (só no servidor).
 * Devolve apenas uma razão em caso de falha; a mensagem traduzida é escolhida no cliente.
 */
export const submitContact = createServerFn({ method: 'POST' })
  .validator(contactSchema)
  .handler(async ({ data }): Promise<ContactResult> => {
    if (data.website && data.website.length > 0) {
      // Honeypot preenchido: responde como sucesso silencioso para não ensinar o bot
      return { ok: true }
    }

    const url = process.env.SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceKey) return { ok: false, reason: 'unavailable' }

    // Import dinâmico dentro do handler: o cliente privilegiado nunca entra no bundle do navegador
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

    const emailHash = await sha256Hex(data.email.toLowerCase())
    const { data: allowed, error: limitError } = await supabase.rpc('claim_contact_attempt', {
      p_email_hash: emailHash,
      p_limit: RATE_LIMIT_PER_HOUR,
    })

    if (limitError) {
      console.error('[contact] rate limit rpc failed', limitError)
      return { ok: false, reason: 'error' }
    }
    if (allowed !== true) return { ok: false, reason: 'rate_limited' }

    const { error } = await supabase.from('contact_submissions').insert({
      name: data.name,
      email: data.email,
      message: data.message,
    })

    if (error) {
      console.error('[contact] insert failed', error)
      return { ok: false, reason: 'error' }
    }

    return { ok: true }
  })
