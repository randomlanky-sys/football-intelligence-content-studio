import type { Metadata } from 'next'
import { SiteFooter, SiteHeader } from '@/components/site'
import { Badge, ButtonLink, Icon, SectionTitle } from '@/components/ui'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Why Football Intelligence & Content Studio exists, the principles behind it, and what it deliberately does not do.',
}

const PRINCIPLES = [
  {
    title: 'Evidence before eloquence',
    body: 'A sentence about a match is only useful if a reviewer can jump to the exact second that supports it. The evidence ledger is the product, not a footnote.',
  },
  {
    title: 'The UI must refuse bad work',
    body: 'A stale claim cannot enter a pack. A rejected claim cannot be silently reused. A CSV with one bad row imports nothing. Constraints are features.',
  },
  {
    title: 'Local-first by default',
    body: 'Your workspace is a browser document you own. No account, no upload, no server-side copy. Export a JSON backup whenever you want one.',
  },
  {
    title: 'Say what is not built',
    body: 'No computer vision, no video decode, no multi-user sync in this build. An honest scope is more trustworthy than a demo that pretends.',
  },
]

const TIMELINE = [
  {
    date: 'Concept',
    title: 'One match, end to end',
    body: 'Start from a single fully populated fixture so every screen has real data and every workflow can be tested without a pipeline.',
  },
  {
    date: 'Build',
    title: 'Domain logic in packages',
    body: 'Evidence hashing, insight transitions, CSV parsing, preflight and export live in typed packages with unit tests — not in components.',
  },
  {
    date: 'Now',
    title: 'A reviewable beta',
    body: 'The studio, data, review and export routes are live against the demo fixture, with failure-mode tests for storage, staleness and imports.',
  },
]

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <section className="border-b border-line">
          <div className="mx-auto max-w-4xl px-5 py-16">
            <Badge tone="accent">About</Badge>
            <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight tracking-tight text-text sm:text-5xl">
              A studio built around the evidence trail.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted">
              Most football content tools start with a render and bolt analysis on afterwards. This
              one starts with a tagged event, asks what the event proves, and only then builds the
              pack. It is a smaller product with a stricter spine.
            </p>
          </div>
        </section>

        <section id="principles" className="border-b border-line bg-surface/30">
          <div className="mx-auto max-w-4xl px-5 py-16">
            <SectionTitle eyebrow="Principles" title="Four rules the build is held to" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {PRINCIPLES.map((principle, index) => (
                <article key={principle.title} className="surface p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-accent">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-dim">
                      <Icon name="spark" className="h-4 w-4" />
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-text">{principle.title}</h3>
                  <p className="mt-2 text-xs leading-6 text-muted">{principle.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line">
          <div className="mx-auto max-w-4xl px-5 py-16">
            <SectionTitle eyebrow="How it got here" title="From audit to a reviewable beta" />
            <ol className="mt-8 space-y-4">
              {TIMELINE.map((item) => (
                <li key={item.date} className="surface flex flex-col gap-2 p-5 sm:flex-row sm:gap-6">
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-accent sm:w-24 sm:pt-1">
                    {item.date}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-text">{item.title}</h3>
                    <p className="mt-1.5 text-xs leading-6 text-muted">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-4xl px-5 py-16">
            <div className="surface p-6 sm:p-8">
              <h2 className="text-xl font-semibold tracking-tight text-text">
                Demo data is fictional. Your data is yours.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
                Atlantic FC and Highveld United are invented teams with invented events. Player names
                are fictional. Nothing on this site is a real match record. Projects you create stay
                in your browser until you export or delete them.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href="/app/p/demo-atl-hvu">Open the demo match</ButtonLink>
                <ButtonLink href="/privacy" variant="secondary">
                  Read the data policy
                </ButtonLink>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
