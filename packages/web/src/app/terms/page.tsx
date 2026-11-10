import type { Metadata } from 'next'
import { SiteFooter, SiteHeader } from '@/components/site'
import { Badge, SectionTitle } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Beta terms',
  description: 'The terms that apply to the Football Intelligence & Content Studio beta.',
}

const TERMS = [
  {
    title: '1. The beta',
    body: 'This is a free, unsupported beta. Features can change or disappear without notice. There is no service-level agreement, no uptime guarantee and no support commitment.',
  },
  {
    title: '2. Your content',
    body: 'You keep ownership of the projects and exports you create. Because the workspace is stored in your browser, you are responsible for keeping backups. Use Settings → Export workspace regularly.',
  },
  {
    title: '3. Demo data',
    body: 'Atlantic FC, Highveld United, their players, events and insights are fictional. Nothing in the demo is a real match record or a statement about real people. Do not present demo output as factual coverage.',
  },
  {
    title: '4. Acceptable use',
    body: 'Do not use the studio to publish claims you know to be false, to harass individuals, or to infringe third-party rights. You are responsible for what you publish from an export.',
  },
  {
    title: '5. No warranty',
    body: 'The software is provided as-is, without warranties of any kind. Analysis, xG values and generated copy are aids, not ground truth. Verify before publishing.',
  },
  {
    title: '6. Limitation of liability',
    body: 'To the maximum extent permitted by law, the project maintainers are not liable for indirect or consequential loss arising from use of the beta, including lost content, lost revenue or reputational harm.',
  },
  {
    title: '7. Data loss',
    body: 'Browser storage can be cleared by the browser, by the operating system, or by the user. Clearing site data removes the workspace. Snapshots exist for destructive actions inside the app, not for external deletion.',
  },
  {
    title: '8. Changes',
    body: 'These terms may be updated as the beta evolves. The date below is the effective date of the current version.',
  },
]

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <section className="border-b border-line">
          <div className="mx-auto max-w-3xl px-5 py-16">
            <Badge tone="neutral">Terms</Badge>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-text">Beta terms</h1>
            <p className="mt-4 text-sm leading-7 text-muted">
              Effective 9 November 2026. Plain language, short clauses, no fake compliance badges.
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-3xl space-y-7 px-5 py-14">
            {TERMS.map((term) => (
              <article key={term.title}>
                <SectionTitle title={term.title} />
                <p className="mt-2 text-sm leading-7 text-muted">{term.body}</p>
              </article>
            ))}

            <div className="surface p-5">
              <p className="text-sm font-medium text-text">Not a certified product</p>
              <p className="mt-1.5 text-sm leading-7 text-muted">
                This beta holds no SOC 2, ISO 27001, GDPR certification or similar attestation. Any
                earlier marketing claim to the contrary has been removed.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
