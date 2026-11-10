import { useId, useMemo, useState, type FormEvent } from 'react'
import { Send, RotateCcw, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { ui } from '@/content/ui'
import { createContactSchema, type ContactFailureReason, type ContactResult } from '@/lib/contact-schema'
import { submitContact } from '@/server/contact'
import { cn } from '@/lib/utils'
import { useLanguage } from './language'

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'success' } | { kind: 'error'; message: string }

type FieldErrors = Partial<Record<'name' | 'email' | 'message', string>>

interface ContactFormProps {
  className?: string
}

const fieldClass =
  'w-full rounded-xs border border-on-rust/35 bg-ink/15 px-3 py-2.5 font-body text-on-rust placeholder:text-on-rust/45 focus:border-on-rust focus:outline-none aria-[invalid=true]:border-ember'

export function ContactForm({ className }: ContactFormProps) {
  const id = useId()
  const { lang, tx } = useLanguage()
  const f = ui.form
  const schema = useMemo(() => createContactSchema(lang), [lang])
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [values, setValues] = useState({ name: '', email: '', message: '', website: '' })

  // Mensagem de falha no idioma ativo, a partir da razão devolvida pelo servidor
  const reasonMessage = (reason: ContactFailureReason | 'network'): string => {
    if (reason === 'invalid') return tx(f.reasons.error)
    return tx(f.reasons[reason])
  }

  const update = (field: keyof typeof values) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [field]: e.target.value }))
    if (field !== 'website') setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const parsed = schema.safeParse(values)
    if (!parsed.success) {
      const next: FieldErrors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]
        if (key === 'name' || key === 'email' || key === 'message') next[key] = next[key] ?? issue.message
      }
      setErrors(next)
      return
    }

    setStatus({ kind: 'sending' })
    let result: ContactResult
    try {
      result = await submitContact({ data: parsed.data })
    } catch (error) {
      console.error('[contact] request failed', error)
      result = { ok: false, reason: 'error' }
      setStatus({ kind: 'error', message: reasonMessage('network') })
      toast.error(reasonMessage('network'))
      return
    }

    if (result.ok) {
      setStatus({ kind: 'success' })
      toast.success(tx(f.successToast))
    } else {
      const message = reasonMessage(result.reason)
      setStatus({ kind: 'error', message })
      toast.error(message)
    }
  }

  const reset = () => {
    setValues({ name: '', email: '', message: '', website: '' })
    setErrors({})
    setStatus({ kind: 'idle' })
  }

  if (status.kind === 'success') {
    return (
      <div role="status" className={cn('flex max-w-xl flex-col items-start gap-4 rounded-sm border border-on-rust/35 p-6', className)}>
        <p className="flex items-center gap-2 font-mono text-sm">
          <CheckCircle2 className="size-4 text-signal" aria-hidden="true" />
          {tx(f.success)}
        </p>
        <Button variant="outline" onClick={reset}>
          <RotateCcw className="size-4" aria-hidden="true" />
          {tx(f.newMessage)}
        </Button>
      </div>
    )
  }

  const sending = status.kind === 'sending'

  return (
    <form onSubmit={onSubmit} noValidate className={cn('grid max-w-xl gap-5', className)}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className="section-label mb-1.5 block">
            {tx(f.name)}
          </label>
          <input
            id={`${id}-name`}
            name="name"
            autoComplete="name"
            maxLength={100}
            required
            value={values.name}
            onChange={update('name')}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? `${id}-name-error` : undefined}
            className={fieldClass}
          />
          {errors.name && (
            <p id={`${id}-name-error`} className="mt-1 font-mono text-xs text-ember">
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <label htmlFor={`${id}-email`} className="section-label mb-1.5 block">
            {tx(f.email)}
          </label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            maxLength={255}
            required
            value={values.email}
            onChange={update('email')}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? `${id}-email-error` : undefined}
            className={fieldClass}
          />
          {errors.email && (
            <p id={`${id}-email-error`} className="mt-1 font-mono text-xs text-ember">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor={`${id}-message`} className="section-label mb-1.5 block">
          {tx(f.message)}
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={5}
          maxLength={3000}
          required
          value={values.message}
          onChange={update('message')}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? `${id}-message-error` : undefined}
          className={cn(fieldClass, 'resize-y')}
        />
        {errors.message && (
          <p id={`${id}-message-error`} className="mt-1 font-mono text-xs text-ember">
            {errors.message}
          </p>
        )}
      </div>

      {/* Honeypot: fora da tela, sem tab, sem autocomplete. Humanos nunca veem. */}
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={update('website')} />
      </div>

      {status.kind === 'error' && (
        <p role="alert" className="flex items-start gap-2 rounded-xs border border-on-rust/35 px-3 py-2 font-mono text-xs">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-ember" aria-hidden="true" />
          {status.message}
        </p>
      )}

      <div>
        <Button type="submit" variant="solid" disabled={sending} aria-busy={sending}>
          {sending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
          {sending ? tx(f.sending) : tx(f.send)}
        </Button>
      </div>
    </form>
  )
}
