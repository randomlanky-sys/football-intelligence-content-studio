import type { ReactNode } from 'react'

/**
 * Momentum as a diverging bar chart. Positive values favour the home side.
 * Pure SVG: no chart library, no client hooks.
 */
export function MomentumChart({
  values,
  height = 112,
  homeLabel = 'Home',
  awayLabel = 'Away',
}: {
  values: number[]
  height?: number
  homeLabel?: string
  awayLabel?: string
}): ReactNode {
  const width = 360
  const mid = height / 2
  const gap = 2
  const slot = width / Math.max(values.length, 1)
  const barWidth = Math.max(slot - gap, 2)

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label={`Momentum chart, ${values.length} five-minute buckets`}
      >
        <line x1="0" y1={mid} x2={width} y2={mid} stroke="#1F2933" strokeWidth="1" />
        {[0.25, 0.5, 0.75].map((fraction) => (
          <line
            key={fraction}
            x1="0"
            y1={height * fraction}
            x2={width}
            y2={height * fraction}
            stroke="#141b23"
            strokeWidth="1"
          />
        ))}
        {values.map((value, index) => {
          const clamped = Math.max(-1, Math.min(1, value))
          const magnitude = Math.abs(clamped) * (mid - 6)
          const x = index * slot + gap / 2
          const positive = clamped >= 0
          return (
            <rect
              key={index}
              x={x}
              y={positive ? mid - magnitude : mid}
              width={barWidth}
              height={Math.max(magnitude, 1.5)}
              rx="1.5"
              fill={positive ? '#C6F24E' : '#4CC9F0'}
              opacity={positive ? 0.85 : 0.55}
            />
          )
        })}
      </svg>
      <div className="mt-2 flex items-center justify-between text-[10px] text-dim">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {homeLabel}
        </span>
        <span className="font-mono">0′ — 90′</span>
        <span className="inline-flex items-center gap-1.5">
          {awayLabel} <span className="h-1.5 w-1.5 rounded-full bg-cyan/70" />
        </span>
      </div>
    </div>
  )
}

export function SplitBar({
  home,
  away,
  homeColor = '#C6F24E',
  awayColor = '#4CC9F0',
  homeLabel,
  awayLabel,
}: {
  home: number
  away: number
  homeColor?: string
  awayColor?: string
  homeLabel: string
  awayLabel: string
}): ReactNode {
  const total = home + away
  const homePct = total > 0 ? Math.round((home / total) * 100) : 50

  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
        <div style={{ width: `${homePct}%`, background: homeColor }} />
        <div style={{ width: `${100 - homePct}%`, background: awayColor, opacity: 0.65 }} />
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-muted">
        <span>
          {homeLabel} <span className="font-mono text-text">{homePct}%</span>
        </span>
        <span>
          <span className="font-mono text-text">{100 - homePct}%</span> {awayLabel}
        </span>
      </div>
    </div>
  )
}

export function Gauge({
  value,
  label,
  hint,
}: {
  value: number
  label: string
  hint?: string
}): ReactNode {
  const clamped = Math.max(0, Math.min(100, value))
  const radius = 34
  const circumference = Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 96 56" className="h-14 w-24" role="img" aria-label={`${label}: ${clamped} of 100`}>
        <path d="M14 48a34 34 0 0168 0" fill="none" stroke="#1F2933" strokeWidth="8" strokeLinecap="round" />
        <path
          d="M14 48a34 34 0 0168 0"
          fill="none"
          stroke="#C6F24E"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div>
        <p className="text-2xl font-semibold text-text">
          {clamped}
          <span className="ml-0.5 text-sm text-dim">/100</span>
        </p>
        <p className="text-xs text-muted">{label}</p>
        {hint ? <p className="mt-0.5 text-[11px] text-dim">{hint}</p> : null}
      </div>
    </div>
  )
}
