import type { Metadata } from 'next'
import { SiteFooter, SiteHeader } from '@/components/site'
import { Badge, ButtonLink, Icon, Kbd, SectionTitle } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Help & shortcuts',
  description:
    'Keyboard shortcuts, the review state machine, CSV format, export preflight rules and recovery steps.',
}

const SHORTCUTS = [
  { keys: ['Space'], action: 'Play or pause the studio transport' },
  { keys: ['←', '→'], action: 'Step one frame back or forward' },
  { keys: ['Shift', '←/→'], action: 'Step ten frames' },
  { keys: ['I'], action: 'Mark the current time as clip in' },
  { keys: ['O'], action: 'Mark the current time as clip out' },
  { keys: ['⌘K', 'Ctrl K'], action: 'Open the command palette' },
  { keys: ['Esc'], action: 'Close the palette or the moment inspector' },
]

const STATES = [
  { from: 'proposed', to: 'accepted', note: 'Requires at least one resolving evidence reference' },
  { from: 'proposed', to: 'edited', note: 'Rewrite the claim, then accept it' },
  { from: 'proposed', to: 'needs_evidence', note: 'Flag with the missing evidence named' },
  { from: 'proposed', to: 'rejected', note: 'Terminal until reopened' },
  { from: 'needs_evidence', to: 'accepted', note: 'After the evidence is added' },
  { from: 'accepted', to: 'proposed', note: 'Reopen to revise' },
  { from: 'rejected', to: 'proposed', note: 'Explicit reopen only' },
]

const CSV_COLUMNS = [
  { name: 'minute', required: true, note: '0–200, integer' },
  { name: 'second', required: true, note: '0–59, integer' },
  { name: 'type', required: true, note: 'kickoff, pass, shot, goal, save, tackle, foul, card, sub, corner, offside, whistle' },
  { name: 'team', required: true, note: 'home or away' },
  { name: 'player', required: false, note: 'Free text, max 80 characters' },
  { name: 'x', required: false, note: 'Pitch length 0–105' },
  { name: 'y', required: false, note: 'Pitch width 0–68' },
  { name: 'xg', required: false, note: '0–1' },
  { name: 'outcome', required: false, note: 'Free text, max 120 characters' },
]

const FAQ = [
  {
    q: 'Where is my data stored?',
    a: 'In this browser, under localStorage key fics.workspace.v2. Export a JSON backup from Settings before clearing site data or switching machines.',
  },
  {
    q: 'Why is an insight stale?',
    a: 'The evidence hash no longer matches, an evidence event was deleted, or an evidence timestamp sits outside the match duration. Stale claims are blocked from export until reopened and accepted again.',
  },
  {
    q: 'Why did my CSV import nothing?',
    a: 'Imports are all-or-nothing. One invalid row rejects the whole file and reports the row number and column. Fix the row and import again.',
  },
  {
    q: 'What does read-only mean?',
    a: 'The saved workspace was written by a newer version of the app. This build will display it but never overwrite it. Export a copy and open it in the newer build.',
  },
  {
    q: 'Can I recover a deleted project?',
    a: 'A snapshot is written before a delete, reset or import. It lives under a timestamped fics.workspace.v2.snapshot.* key. Settings lists the keys it can see; recovery is a manual copy in your browser devtools for now.',
  },
  {
    q: 'Does the demo match use real data?',
    a: 'No. Every team, player and event is fictional. It exists so every workflow can be tested end to end.',
  },
]

export default function HelpPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <section className="border-b border-line">
          <div className="mx-auto max-w-4xl px-5 py-16">
            <Badge tone="accent">Help</Badge>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-text">Shortcuts, rules and recovery</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
              Everything the studio enforces is written down here, including the review state machine,
              the CSV contract and the export preflight rules.
            </p>
          </div>
        </section>

        <section className="border-b border-line bg-surface/30">
          <div className="mx-auto max-w-4xl px-5 py-14">
            <SectionTitle eyebrow="Keyboard" title="Studio shortcuts" />
            <div className="mt-6 surface overflow-hidden">
              <ul className="divide-y divide-line">
                {SHORTCUTS.map((shortcut) => (
                  <li key={shortcut.action} className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <span className="flex min-w-[120px] items-center gap-1">
                      {shortcut.keys.map((key) => (
                        <Kbd key={key}>{key}</Kbd>
                      ))}
                    </span>
                    <span className="text-sm text-muted">{shortcut.action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="border-b border-line">
          <div className="mx-auto max-w-4xl px-5 py-14">
            <SectionTitle eyebrow="Review" title="Allowed status transitions" />
            <div className="mt-6 surface overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-surface-2/60">
                  <tr>
                    <th className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-dim">From</th>
                    <th className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-dim">To</th>
                    <th className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-dim">Condition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {STATES.map((state) => (
                    <tr key={`${state.from}-${state.to}-${state.note}`}>
                      <td className="px-4 py-2.5 font-mono text-xs text-muted">{state.from}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-text">{state.to}</td>
                      <td className="px-4 py-2.5 text-xs text-muted">{state.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-6 text-dim">
              Illegal transitions are rejected by the domain layer, not just hidden in the UI.
            </p>
          </div>
        </section>

        <section className="border-b border-line bg-surface/30">
          <div className="mx-auto max-w-4xl px-5 py-14">
            <SectionTitle eyebrow="Import" title="CSV columns" />
            <div className="mt-6 surface overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-surface-2/60">
                  <tr>
                    <th className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-dim">Column</th>
                    <th className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-dim">Required</th>
                    <th className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-dim">Rule</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {CSV_COLUMNS.map((column) => (
                    <tr key={column.name}>
                      <td className="px-4 py-2.5 font-mono text-xs text-text">{column.name}</td>
                      <td className="px-4 py-2.5 text-xs text-muted">{column.required ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-2.5 text-xs text-muted">{column.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <ButtonLink href="/app/p/demo-atl-hvu/data" variant="secondary" size="sm">
                Open the importer
              </ButtonLink>
              <span className="inline-flex items-center gap-1.5 text-xs text-dim">
                <Icon name="alert" className="h-3.5 w-3.5" /> Header row is required.
              </span>
            </div>
          </div>
        </section>

        <section className="border-b border-line">
          <div className="mx-auto max-w-4xl px-5 py-14">
            <SectionTitle eyebrow="Export" title="Preflight rules" />
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                ['Match duration is set', 'Blocking when zero'],
                ['Events are tagged', 'Blocking when zero'],
                ['At least one accepted insight', 'Blocking when zero'],
                ['No stale evidence', 'Blocking per stale claim'],
                ['Every reference resolves', 'Blocking per dangling reference'],
                ['Clips are optional', 'Warning only'],
              ].map(([label, rule]) => (
                <li key={label} className="surface flex items-start gap-3 p-4">
                  <span className="mt-0.5 text-accent">
                    <Icon name="check" className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm text-text">{label}</p>
                    <p className="mt-0.5 text-xs text-muted">{rule}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="faq">
          <div className="mx-auto max-w-4xl px-5 py-14">
            <SectionTitle eyebrow="FAQ" title="Common questions" />
            <dl className="mt-6 space-y-3">
              {FAQ.map((item) => (
                <div key={item.q} className="surface p-5">
                  <dt className="text-sm font-medium text-text">{item.q}</dt>
                  <dd className="mt-1.5 text-sm leading-7 text-muted">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
