import { cx } from '@fics/ui'

/**
 * Pure class-string helpers. This module deliberately has no `'use client'`
 * directive: server components call `buttonClass()` during prerender, and a
 * function exported from a client module becomes a client reference that
 * cannot be invoked on the server.
 */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-accent-ink hover:bg-[#d4ff5e] active:bg-[#b7e043] disabled:bg-accent/40 disabled:text-accent-ink/60',
  secondary:
    'border border-line bg-surface-2 text-text hover:border-[#34414f] hover:bg-[#18212b] disabled:text-dim',
  ghost: 'text-muted hover:bg-surface-2 hover:text-text disabled:text-dim',
  danger: 'border border-red/40 bg-red/10 text-red hover:bg-red/20 disabled:opacity-50',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-sm gap-2',
}

export function buttonClass(
  variant: ButtonVariant = 'secondary',
  size: ButtonSize = 'md',
  extra = '',
): string {
  return cx(
    'inline-flex select-none items-center justify-center rounded-[10px] font-medium transition-colors duration-120 disabled:cursor-not-allowed',
    VARIANTS[variant],
    SIZES[size],
    extra,
  )
}

export const inputClass =
  'h-10 w-full rounded-[10px] border border-line bg-surface px-3 text-sm text-text placeholder:text-dim focus:border-accent/60 focus:outline-none'

export const textareaClass =
  'w-full rounded-[10px] border border-line bg-surface px-3 py-2 text-sm leading-6 text-text placeholder:text-dim focus:border-accent/60 focus:outline-none'
