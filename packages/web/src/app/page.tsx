import Link from 'next/link'
import { createDemoProject } from '@/lib/demo-data'
import { SplitBar } from '@/components/charts'
import { Pitch } from '@/components/pitch'
import { SiteFooter, SiteHeader } from '@/components/site'
import { Badge, ButtonLink, Icon, SectionTitle } from '@/components/ui'

const project = createDemoProject()

const WORKFLOW = [
  {
    step: '01',
    title: 'Tag the match',
    body: 'Paste or upload a CSV of events. Every row is validated before a single event is written, so a bad import never half-lands.',
    icon: 'grid' as const,
  },
  {
    step: '02',
    title: 'Review the claims',
    body: 'Each insight carries its evidence timestamps and an integrity hash. Accept, edit, reject or send it back for evidence — the state machine refuses illegal moves.',
    icon: 'shield' as const,
  },
  {
    step: '03',
    title: 'Clear preflight',
    body: 'Six rules decide whether a pack may ship: duration, events, accepted claims, stale evidence, dangling references, clips.',
    icon: 'check' as const,
  },
  {
    step: '04',
    title: 'Ship the pack',
    body: 'Get a deterministic content pack — summary, tactical read, clip list, captions, hashtags, thumbnail brief and an evidence ledger.',
    icon: 'download' as const,
  },
]

const ROLES = [
  {
    name: 'Analyst',
    line: 'Build the argument',
    body: 'Work from the pitch and the timeline. Every shot opens a moment inspector with the events and insights that cite it.',
    icon: 'target' as const,
  },
  {
    name: 'Editor',
    line: 'Protect the standard',
    body: 'A review queue ordered by risk: stale evidence first, then needs-evidence, then proposed. Nothing publishes unreviewed.',
    icon: 'shield' as const,
  },
  {
    name: 'Producer',
    line: 'Ship on deadline',
    body: 'Pick a preset, clear preflight, download Markdown or JSON. The evidence ledger travels with the pack.',
    icon: 'film' as const,
  },
]

const SCOPE = {
  real: [
    'One fully populated demo match — 32 events, 8 insights, 4 clips',
    'CSV import with all-or-nothing row validation',
    'Insight review state machine with derived staleness',
    'Export preflight with a fix link on every failing rule',
    'Deterministic content pack + Markdown and JSON download',
    'Local-first storage with quarantine, snapshots and read-only safety',
  ],
  not: [
    'Video decode or frame-accurate playback (timeline only today)',
    'Computer-vision event detection from raw footage',
    'Accounts, billing or multi-user collaboration',
    'A hosted database — your browser holds the workspace',
  ],
}

export default function HomePage() {
  const accepted = project.insights.filter((insight) => insight.status === 'accepted').length
  const proposed = project.insights.filter((insight) => insight.status === 'proposed').length
  const lead = project.insights.find((insight) => insight.id === 'ins-05')

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main id="main" className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-line">
          <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-24">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="accent">Local-first</Badge>
                <Badge tone="neutral">Beta · no account</Badge>
              </div>

              <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-text sm:text-5xl lg:text-6xl">
                Every claim, tied to the moment that proves it.
              </h1>

              <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-muted">
                Football Intelligence is a content studio for match analysis. Tag the events, review
                the claims, and export a pack where every sentence carries a timestamp — not a vibe.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <ButtonLink href="/app/p/demo-atl-hvu" size="lg">
                  Open the demo match
                  <Icon name="arrow-right" className="h-4 w-4" />
                </ButtonLink>
                <ButtonLink href="/app" variant="secondary" size="lg">
                  Enter the workspace
                </ButtonLink>
              </div>

              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-6">
                <Stat label="Tagged events" value={String(project.events.length)} />
                <Stat label="Insights in review" value={String(project.insights.length)} />
                <Stat label="Accepted claims" value={String(accepted)} />
              </dl>
            </div>

            <div className="relative">
              <div className="surface overflow-hidden shadow-2xl">
                <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
                  <span className="h-2 w-2 rounded-full bg-red/70" />
                  <span className="h-2 w-2 rounded-full bg-amber/70" />
                  <span className="h-2 w-2 rounded-full bg-green/70" />
                  <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.16em] text-dim">
                    Studio · demo match
                  </span>
                  <span className="ml-auto font-mono text-[10px] text-dim">90:00</span>
                </div>

                <div className="p-4">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-text">{project.teams.home.name}</p>
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-dim">
                        {project.teams.home.formation} · home
                      </p>
                    </div>
                    <p className="font-mono text-3xl font-semibold tabular-nums text-text">
                      {project.score.home}
                      <span className="mx-2 text-dim">–</span>
                      {project.score.away}
                    </p>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-text">{project.teams.away.name}</p>
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-dim">
                        away · {project.teams.away.formation}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <SplitBar
                      home={project.possession.home}
                      away={project.possession.away}
                      homeLabel={project.teams.home.short}
                      awayLabel={project.teams.away.short}
                    />
                  </div>

                  <div className="mt-4">
                    <Pitch project={project} />
                  </div>

                  {lead ? (
                    <div className="mt-4 surface-2 p-3">
                      <div className="flex items-center gap-2">
                        <Badge tone="success">Accepted</Badge>
                        <span className="font-mono text-[10px] text-dim">{lead.id}</span>
                        <span className="ml-auto font-mono text-[10px] text-dim">
                          hash {lead.evidenceHash.slice(0, 8)}…
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-muted">{lead.claim}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {lead.evidence.map((reference) => (
                          <span
                            key={reference.eventId}
                            className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-0.5 font-mono text-[10px] text-cyan"
                          >
                            <Icon name="clock" className="h-2.5 w-2.5" />
                            {Math.floor(reference.tUs / 60_000_000)}:
                            {String(Math.floor((reference.tUs % 60_000_000) / 1_000_000)).padStart(2, '0')}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-dim">
                Real UI · real fixture · no screenshots
              </p>
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section id="workflows" className="border-b border-line">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <SectionTitle
              eyebrow="The loop"
              title="Four steps, one evidence trail"
              action={
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-dim">
                  {proposed} claims waiting in review
                </span>
              }
            />

            <ol className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {WORKFLOW.map((item) => (
                <li key={item.step} className="surface p-5">
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-accent/30 bg-accent/10 text-accent">
                      <Icon name={item.icon} className="h-4 w-4" />
                    </span>
                    <span className="font-mono text-[11px] text-dim">{item.step}</span>
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-text">{item.title}</h3>
                  <p className="mt-2 text-xs leading-6 text-muted">{item.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Proof */}
        <section id="proof" className="border-b border-line bg-surface/30">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <SectionTitle eyebrow="The proof" title="A claim without evidence is a rumour" />
              <p className="mt-4 max-w-lg text-sm leading-7 text-muted">
                Every insight stores a canonical hash over its evidence references. Change an event,
                delete one, or move a timestamp outside the match, and the insight is derived
                <span className="text-amber"> stale</span> at read time — the UI never trusts a
                stored status.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Hash covers event id, timestamp and label — sorted, trimmed, canonical.',
                  'Staleness is derived on read; a stale insight cannot enter a pack.',
                  'Accepted re-baselines the hash, so a reviewer signs what they saw.',
                  'Rejected is terminal until explicitly reopened.',
                ].map((line) => (
                  <li key={line} className="flex gap-2.5 text-sm leading-6 text-muted">
                    <span className="mt-1 text-accent">
                      <Icon name="check" className="h-3.5 w-3.5" />
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            <div className="surface overflow-hidden">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <span className="label">Review · status transitions</span>
                <Badge tone="neutral">8 insights</Badge>
              </div>
              <div className="divide-y divide-line">
                {project.insights.map((insight) => {
                  const tone =
                    insight.status === 'accepted'
                      ? 'success'
                      : insight.status === 'proposed'
                        ? 'neutral'
                        : insight.status === 'needs_evidence'
                          ? 'warn'
                          : insight.status === 'edited'
                            ? 'data'
                            : 'danger'
                  return (
                    <div key={insight.id} className="flex items-start gap-3 px-4 py-3">
                      <Badge tone={tone}>{insight.status.replace('_', ' ')}</Badge>
                      <p className="min-w-0 flex-1 text-xs leading-5 text-muted">
                        {insight.claim.length > 108 ? `${insight.claim.slice(0, 108)}…` : insight.claim}
                      </p>
                      <span className="shrink-0 font-mono text-[10px] text-dim">
                        {insight.evidence.length} refs
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="border-t border-line px-4 py-3">
                <Link
                  href="/app/p/demo-atl-hvu/review"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
                >
                  Open the live review queue <Icon name="arrow-right" className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Roles */}
        <section className="border-b border-line">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <SectionTitle eyebrow="Role lenses" title="One workspace, three jobs to be done" />
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {ROLES.map((role) => (
                <article key={role.name} className="surface p-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-line bg-surface-2 text-cyan">
                    <Icon name={role.icon} className="h-4 w-4" />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-text">{role.name}</h3>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
                    {role.line}
                  </p>
                  <p className="mt-2 text-xs leading-6 text-muted">{role.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Scope honesty */}
        <section className="border-b border-line bg-surface/30">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <SectionTitle
              eyebrow="Scope"
              title="What ships today, and what does not"
              action={
                <span className="text-xs text-dim">
                  Honest scope beats a false promise
                </span>
              }
            />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="surface p-5">
                <p className="label mb-3 text-green">In this build</p>
                <ul className="space-y-2.5">
                  {SCOPE.real.map((line) => (
                    <li key={line} className="flex gap-2.5 text-sm leading-6 text-muted">
                      <span className="mt-0.5 text-green">
                        <Icon name="check" className="h-4 w-4" />
                      </span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="surface p-5">
                <p className="label mb-3 text-dim">Not in this build</p>
                <ul className="space-y-2.5">
                  {SCOPE.not.map((line) => (
                    <li key={line} className="flex gap-2.5 text-sm leading-6 text-dim">
                      <span className="mt-0.5">
                        <Icon name="x" className="h-4 w-4" />
                      </span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 grid-lines opacity-30" aria-hidden="true" />
          <div className="relative mx-auto max-w-6xl px-5 py-16 text-center">
            <p className="label mb-3">No sign-up</p>
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              Open the demo. Break it. Reset it.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted">
              The demo match is fully populated and lives in your browser. Reset it from Settings at
              any time — your own projects are never touched.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/app/p/demo-atl-hvu" size="lg">
                Open the demo match
              </ButtonLink>
              <ButtonLink href="/help" variant="secondary" size="lg">
                Read the shortcuts
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="label">{label}</dt>
      <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums text-text">{value}</dd>
    </div>
  )
}
