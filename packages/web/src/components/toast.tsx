'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { cx } from '@fics/ui'
import { Icon } from './ui'

type ToastTone = 'info' | 'success' | 'error'

interface ToastItem {
  id: number
  title: string
  detail?: string
  tone: ToastTone
}

interface ToastApi {
  push: (toast: { title: string; detail?: string; tone?: ToastTone }) => void
}

const ToastContext = createContext<ToastApi | null>(null)

export function ToastProvider({ children }: { children: ReactNode }): ReactNode {
  const [items, setItems] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const push = useCallback((toast: { title: string; detail?: string; tone?: ToastTone }) => {
    counter.current += 1
    const id = counter.current
    setItems((current) => [...current.slice(-3), { id, tone: toast.tone ?? 'info', ...toast }])
    window.setTimeout(() => {
      setItems((current) => current.filter((item) => item.id !== id))
    }, 4500)
  }, [])

  const api = useMemo(() => ({ push }), [push])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2"
        role="status"
        aria-live="polite"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={cx(
              'pointer-events-auto flex animate-toast-in items-start gap-3 rounded-[10px] border bg-surface-2 px-4 py-3 shadow-lg',
              item.tone === 'success' && 'border-green/40',
              item.tone === 'error' && 'border-red/40',
              item.tone === 'info' && 'border-line',
            )}
          >
            <span
              className={cx(
                'mt-0.5',
                item.tone === 'success' && 'text-green',
                item.tone === 'error' && 'text-red',
                item.tone === 'info' && 'text-cyan',
              )}
            >
              <Icon name={item.tone === 'error' ? 'alert' : item.tone === 'success' ? 'check' : 'spark'} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text">{item.title}</p>
              {item.detail ? <p className="mt-0.5 text-xs leading-5 text-muted">{item.detail}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => setItems((current) => current.filter((candidate) => candidate.id !== item.id))}
              className="ml-auto rounded p-1 text-dim hover:text-text"
              aria-label="Dismiss notification"
            >
              <Icon name="x" className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext)
  if (!api) throw new Error('useToast must be used inside <ToastProvider>')
  return api
}
