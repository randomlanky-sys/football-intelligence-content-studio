'use client'

import Link from 'next/link'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '@fics/ui'
import { buttonClass, type ButtonSize, type ButtonVariant } from './styles'

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  type = 'button',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }): ReactNode {
  return <button type={type} className={buttonClass(variant, size, className)} {...rest} />
}

export function ButtonLink({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className,
}: {
  href: string
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}): ReactNode {
  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  )
}

export type Tone = 'neutral' | 'success' | 'warn' | 'danger' | 'data' | 'accent'

const TONES: Record<Tone, string> = {
  neutral: 'border-line bg-surface-2 text-muted',
  success: 'border-green/30 bg-green/10 text-green',
  warn: 'border-amber/30 bg-amber/10 text-amber',
  danger: 'border-red/30 bg-red/10 text-red',
  data: 'border-cyan/30 bg-cyan/10 text-cyan',
  accent: 'border-accent/30 bg-accent/10 text-accent',
}

export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: Tone
  children: ReactNode
  className?: string
}): ReactNode {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-5',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function Card({
  children,
  className,
  as: Tag = 'section',
}: {
  children: ReactNode
  className?: string
  as?: 'section' | 'article' | 'div'
}): ReactNode {
  return <Tag className={cx('surface p-5', className)}>{children}</Tag>
}

export function SectionTitle({
  eyebrow,
  title,
  action,
  className,
}: {
  eyebrow?: string
  title: ReactNode
  action?: ReactNode
  className?: string
}): ReactNode {
  return (
    <div className={cx('flex flex-wrap items-end justify-between gap-3', className)}>
      <div>
        {eyebrow ? <p className="label mb-1.5">{eyebrow}</p> : null}
        <h2 className="text-lg font-semibold tracking-tight text-text">{title}</h2>
      </div>
      {action}
    </div>
  )
}

export function StatCard({
  label,
  value,
  hint,
  tone = 'neutral',
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  tone?: Tone
}): ReactNode {
  return (
    <div className="surface-2 p-4">
      <p className="label">{label}</p>
      <p
        className={cx(
          'mt-2 text-2xl font-semibold tracking-tight',
          tone === 'accent' && 'text-accent',
          tone === 'data' && 'text-cyan',
          tone === 'warn' && 'text-amber',
          tone === 'danger' && 'text-red',
          tone === 'success' && 'text-green',
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs leading-5 text-dim">{hint}</p> : null}
    </div>
  )
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: ReactNode
}): ReactNode {
  return (
    <div className="surface flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface-2 text-muted">
        <Icon name="inbox" className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-text">{title}</p>
      <p className="mt-1 max-w-md text-sm leading-6 text-muted">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }): ReactNode {
  return <div className={cx('animate-pulse rounded-[10px] bg-surface-2', className)} />
}

export function Kbd({ children }: { children: ReactNode }): ReactNode {
  return (
    <kbd className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-muted">
      {children}
    </kbd>
  )
}

export function FieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor?: string }): ReactNode {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-muted">
      {children}
    </label>
  )
}

export function Divider({ className }: { className?: string }): ReactNode {
  return <div className={cx('h-px w-full bg-line', className)} />
}

type IconName =
  | 'play'
  | 'pause'
  | 'arrow-right'
  | 'arrow-left'
  | 'chevron-down'
  | 'check'
  | 'x'
  | 'alert'
  | 'download'
  | 'copy'
  | 'search'
  | 'plus'
  | 'trash'
  | 'inbox'
  | 'clock'
  | 'target'
  | 'shield'
  | 'spark'
  | 'film'
  | 'settings'
  | 'grid'
  | 'external'

const PATHS: Record<IconName, ReactNode> = {
  play: <path d="M8 5v14l11-7z" fill="currentColor" stroke="none" />,
  pause: (
    <>
      <path d="M7 5h4v14H7z" fill="currentColor" stroke="none" />
      <path d="M13 5h4v14h-4z" fill="currentColor" stroke="none" />
    </>
  ),
  'arrow-right': <path d="M5 12h14M13 6l6 6-6 6" />,
  'arrow-left': <path d="M19 12H5M11 18l-6-6 6-6" />,
  'chevron-down': <path d="M6 9l6 6 6-6" />,
  check: <path d="M5 13l4 4L19 7" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  alert: (
    <>
      <path d="M12 4l9 16H3z" />
      <path d="M12 10v4M12 17.5v.5" />
    </>
  ),
  download: <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />,
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 012-2h9" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="M16 16l4 4" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  trash: <path d="M4 7h16M9 7V5h6v2M7 7l1 13h8l1-13M10 11v6M14 11v6" />,
  inbox: <path d="M4 13l2-8h12l2 8v6H4zM4 13h5l1 2h4l1-2h5" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  shield: <path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z" />,
  spark: <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />,
  film: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 5v14M17 5v14M3 10h4M3 14h4M17 10h4M17 14h4" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1" />
      <rect x="13" y="4" width="7" height="7" rx="1" />
      <rect x="4" y="13" width="7" height="7" rx="1" />
      <rect x="13" y="13" width="7" height="7" rx="1" />
    </>
  ),
  external: <path d="M14 4h6v6M20 4l-9 9M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4" />,
}

export function Icon({
  name,
  className = 'h-4 w-4',
}: {
  name: IconName
  className?: string
}): ReactNode {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}

export function Logo({ compact = false }: { compact?: boolean }): ReactNode {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="relative flex h-8 w-8 items-center justify-center rounded-[10px] border border-accent/40 bg-accent/10">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-accent" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 8l3.5 2.5v3L12 16l-3.5-2.5v-3z" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </span>
      {compact ? null : (
        <span className="leading-tight">
          <span className="block text-sm font-semibold tracking-tight text-text">Football Intelligence</span>
          <span className="block font-mono text-[9px] uppercase tracking-[0.24em] text-dim">
            Content Studio
          </span>
        </span>
      )}
    </span>
  )
}
