'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { COLORS, PASS_PERIOD, PASS_SEQUENCE, XG_EVENTS } from '@/lib/match-data'

const AnalysisScene = dynamic(() => import('./AnalysisScene'), { ssr: false })

type Mode = 'boot' | 'live' | 'static'

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

function detectLite(): boolean {
  if (typeof window === 'undefined') return false
  const small = !window.matchMedia('(min-width: 768px)').matches
  const nav = navigator as Navigator & { deviceMemory?: number }
  const weak = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4
  return small || weak
}

export default function Hero3D() {
  const [mode, setMode] = useState<Mode>('boot')
  const [lite, setLite] = useState(false)
  const [tick, setTick] = useState(0)
  const scrollRef = useRef(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || !detectWebGL()) {
      setMode('static')
      return
    }
    setLite(detectLite())
    setMode('live')
  }, [])

  useEffect(() => {
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null
    let frame = 0
    if (mode === 'static') {
      return
    }
    let cancelled = false
    import('lenis')
      .then(({ default: Lenis }) => {
        if (cancelled) return
        const instance = new Lenis({ duration: 1.15, smoothWheel: true })
        lenis = instance
        const raf = (time: number) => {
          instance.raf(time)
          frame = requestAnimationFrame(raf)
        }
        frame = requestAnimationFrame(raf)
      })
      .catch(() => {})

    const onScroll = () => {
      const h = Math.max(1, window.innerHeight)
      scrollRef.current = Math.min(1, Math.max(0, window.scrollY / h))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      cancelled = true
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
      lenis?.destroy()
    }
  }, [mode])

  useEffect(() => {
    if (mode === 'boot' || !overlayRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let ctx: { revert: () => void } | null = null
    let cancelled = false
    import('gsap').then(({ gsap }) => {
      if (cancelled || !overlayRef.current) return
      const targets = overlayRef.current.querySelectorAll('[data-reveal]')
      ctx = gsap.from(targets, {
        y: 34,
        opacity: 0,
        duration: 1.05,
        ease: 'power3.out',
        stagger: 0.11,
        delay: 0.15,
      })
    })
    return () => {
      cancelled = true
      ctx?.revert()
    }
  }, [mode])

  useEffect(() => {
    if (mode !== 'live') return
    const id = window.setInterval(() => setTick((v) => v + 1), 400)
    return () => window.clearInterval(id)
  }, [mode])

  const action = useMemo(() => {
    const idx = Math.floor((tick * 0.4) / PASS_PERIOD) % PASS_SEQUENCE.length
    return PASS_SEQUENCE[idx]
  }, [tick])

  const maxXg = useMemo(() => Math.max(...XG_EVENTS.map((e) => e.xg)), [])
  const xgPct = Math.round((action.xg / maxXg) * 100)

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <section ref={rootRef} className="relative isolate h-[100svh] min-h-[640px] w-full overflow-hidden bg-[#05070A]">
      <div className="absolute inset-0">
        {mode === 'live' ? (
          <AnalysisScene lite={lite} scrollRef={scrollRef} />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(1200px_600px_at_50%_20%,rgba(79,195,247,0.18),transparent_60%),radial-gradient(900px_500px_at_70%_80%,rgba(255,92,122,0.16),transparent_60%),linear-gradient(180deg,#070A10,#05070A)]" />
        )}
      </div>

      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_10%,transparent_40%,rgba(5,7,10,0.72)_100%)]"
        aria-hidden
      />
      <div className="film-grain pointer-events-none absolute inset-0 opacity-[0.09] mix-blend-overlay" aria-hidden />

      <div
        ref={overlayRef}
        className="pointer-events-none relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col justify-between px-6 py-10 md:px-10 md:py-14"
      >
        <div className="flex items-center justify-between">
          <div data-reveal className="flex items-center gap-3">
            <span className="inline-block h-2 w-2 rounded-full bg-[#FCD34D] shadow-[0_0_18px_4px_rgba(252,211,77,0.55)]" />
            <span className="font-mono text-[11px] uppercase tracking-[0.34em] text-[#9FB3CF] md:text-xs">
              FICS · Match Intelligence Room
            </span>
          </div>
          <span
            data-reveal
            className="hidden font-mono text-[11px] uppercase tracking-[0.28em] text-[#6F86A6] md:block"
          >
            {mode === 'live' ? 'Live simulation' : 'Static preview'}
          </span>
        </div>

        <div className="max-w-3xl">
          <p data-reveal className="mb-5 font-mono text-xs uppercase tracking-[0.34em] text-[#FCD34D]">
            Football Intelligence &amp; Content Studio
          </p>
          <h1
            data-reveal
            className="text-balance text-4xl font-extrabold leading-[0.98] tracking-tight text-white md:text-6xl lg:text-7xl"
          >
            See the match
            <br />
            <span className="bg-gradient-to-r from-white via-[#BFE9FF] to-[#FCD34D] bg-clip-text text-transparent">
              before it happens.
            </span>
          </h1>
          <p data-reveal className="mt-6 max-w-xl text-base leading-relaxed text-[#C6D3E6] md:text-lg">
            A living 3D model of the game. Player networks, pass corridors and shot quality rendered in real time — so
            every insight is something you can see, not just read.
          </p>

          <div data-reveal className="pointer-events-auto mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/projects"
              className="inline-flex items-center gap-3 rounded-full bg-[#FCD34D] px-7 py-3.5 text-base font-semibold text-[#0A0A0A] shadow-[0_10px_40px_-12px_rgba(252,211,77,0.8)] transition hover:-translate-y-0.5 hover:bg-[#EAB308] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FCD34D]"
            >
              Explore the platform
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <button
              type="button"
              onClick={() => scrollTo('experience')}
              className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/[0.06] px-7 py-3.5 text-base font-medium text-[#F8FAFC] backdrop-blur transition hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/[0.1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
            >
              Watch the analysis
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="pointer-events-auto grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div
            data-reveal
            className="max-w-xl rounded-2xl border border-white/10 bg-[rgba(10,14,20,0.55)] p-4 backdrop-blur-md md:p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#7E93B0]">
                Possession phase
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#FCD34D]">
                xG {action.xg.toFixed(2)}
              </span>
            </div>
            <p className="mt-2 text-sm text-[#DCE6F5] md:text-base">{action.label}</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#4FC3F7] via-[#FCD34D] to-[#FF5C7A] transition-[width] duration-500 ease-out"
                style={{ width: `${Math.max(6, xgPct)}%` }}
              />
            </div>
          </div>
          <div data-reveal className="flex gap-6 md:gap-8">
            {[
              { k: '11', v: 'Tracked players' },
              { k: '2.6k', v: 'Crowd points' },
              { k: '60fps', v: 'Target' },
            ].map((s) => (
              <div key={s.k} className="text-left">
                <p className="text-2xl font-extrabold text-white md:text-3xl">{s.k}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#7E93B0]">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <span className="sr-only">
        Interactive 3D match analysis of a live possession phase, with player networks and expected-goals model.
        Scene palette {COLORS.accent}.
      </span>
    </section>
  )
}
