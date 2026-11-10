import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type ButtonVariant = 'solid' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'icon'

const base =
  'inline-flex items-center justify-center gap-2 rounded-xs font-mono text-sm tracking-wide transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sand'

const variants: Record<ButtonVariant, string> = {
  solid: 'bg-sand text-on-sand hover:bg-sand-deep',
  outline: 'border border-current bg-transparent hover:bg-cream/10',
  ghost: 'bg-transparent hover:bg-cream/10',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4',
  // Quadrado sem padding horizontal: só ícone dentro (toggle de tema etc.)
  icon: 'size-8 p-0 [&>svg]:shrink-0',
}

export function buttonClasses(variant: ButtonVariant = 'outline', size: ButtonSize = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className)
}

// ComponentProps<'button'> já inclui `ref` no React 19 (ref é prop comum, sem forwardRef).
interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({ variant = 'outline', size = 'md', className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...props} />
}

interface ButtonLinkProps extends ComponentProps<'a'> {
  variant?: ButtonVariant
  size?: ButtonSize
}

/** Mesmo visual do Button, mas é um <a> — use para links reais (demo, código, PDF). */
export function ButtonLink({ variant = 'outline', size = 'md', className, ...props }: ButtonLinkProps) {
  return <a className={buttonClasses(variant, size, className)} {...props} />
}
