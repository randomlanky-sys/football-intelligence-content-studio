import type { Metadata } from 'next'
import { SiteFooter, SiteHeader } from '@/components/site'
import { Badge, SectionTitle } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Data policy',
  description:
    'What Football Intelligence & Content Studio stores, where it stores it, and how to remove it.',
}

const SECTIONS = [
  {
    title: 'Where your workspace lives',
    body: [
      'Your projects are stored in this browser under the localStorage key fics.workspace.v2. Nothing is sent to a server when you create, edit, review or export a project.',
      'The application itself is served as static and server-rendered pages. Those requests carry standard web logs from the hosting provider, but they never carry your project content.',
    ],
  },
  {
    title: 'What is stored',
    body: [
      'The workspace envelope holds the projects you see: names, competitions, dates, teams, events, insights, clips and a capped history of the last 20 exports per project.',
      'Each insight stores a SHA-256 hash of its evidence references. The hash is used to detect when evidence has changed; it is not a secret and contains no personal data.',
    ],
  },
  {
    title: 'Backups and snapshots',
    body: [
      'Before a destructive action — deleting a project, resetting the demo, or importing a backup — the app writes a snapshot under a timestamped fics.workspace.v2.snapshot.* key.',
      'If a saved workspace cannot be read, the raw value is copied to fics.workspace.v2.corrupt.* before the demo is restored. Nothing is discarded silently.',
    ],
  },
  {
    title: 'Third parties',
    body: [
      'No analytics, advertising, session recording or third-party trackers are loaded by this application.',
      'No account, email address or payment detail is requested. There is no sign-in and no billing in this beta.',
    ],
  },
  {
    title: 'Deleting your data',
    body: [
      'Settings offers Export workspace (JSON), Reset demo, and per-project delete with a typed-name confirmation. You can also clear site data in your browser settings to remove everything at once.',
      'Exported files are written by your browser to your device. Where they go after that is controlled by you and your operating system.',
    ],
  },
  {
    title: 'Security honesty',
    body: [
      'This is a beta. It is not certified to any security framework, and it makes no compliance claims. Do not store confidential or personal data in it.',
      'Because data is local to a browser profile, anyone with access to that browser profile can read it. Use a dedicated browser profile if you need separation.',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <section className="border-b border-line">
          <div className="mx-auto max-w-3xl px-5 py-16">
            <Badge tone="neutral">Data policy</Badge>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-text">Your data stays in your browser</h1>
            <p className="mt-4 text-sm leading-7 text-muted">
              Last updated 9 November 2026. This policy describes the beta build. It is written to be
              read, not to be survived.
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-3xl space-y-8 px-5 py-14">
            {SECTIONS.map((section) => (
              <article key={section.title}>
                <SectionTitle title={section.title} />
                <div className="mt-3 space-y-3">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-7 text-muted">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </article>
            ))}

            <div className="surface p-5">
              <p className="text-sm font-medium text-text">Questions about this policy?</p>
              <p className="mt-1.5 text-sm leading-7 text-muted">
                This beta has no support inbox. Use the Help page for behaviour and recovery steps,
                and export a JSON backup before any destructive action.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
