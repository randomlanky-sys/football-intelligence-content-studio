'use client'

import { useEffect, useRef } from 'react'

export interface StudioKeyHandlers {
  onTogglePlay: () => void
  onStep: (frames: number) => void
  onMarkIn?: () => void
  onMarkOut?: () => void
  enabled?: boolean
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable
}

/**
 * Studio transport keys: Space toggles playback, arrows step frames (Shift for
 * ten), I/O set clip in/out. Ignored while typing so forms keep normal keys.
 */
export function useStudioKeyboard(handlers: StudioKeyHandlers): void {
  const ref = useRef(handlers)
  ref.current = handlers

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      const current = ref.current
      if (current.enabled === false) return
      if (isTypingTarget(event.target)) return
      if (event.metaKey || event.ctrlKey || event.altKey) return

      if (event.code === 'Space') {
        event.preventDefault()
        current.onTogglePlay()
        return
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        current.onStep(event.shiftKey ? -10 : -1)
        return
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        current.onStep(event.shiftKey ? 10 : 1)
        return
      }
      if (event.key === 'i' || event.key === 'I') {
        event.preventDefault()
        current.onMarkIn?.()
        return
      }
      if (event.key === 'o' || event.key === 'O') {
        event.preventDefault()
        current.onMarkOut?.()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
