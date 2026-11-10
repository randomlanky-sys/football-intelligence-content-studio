import Link from 'next/link'
import { buttonClass } from '@/components/styles'
import { Logo } from '@/components/ui'

const LINKS = [
  { href: '/#workflows', label: 'Workflows' },
  { href: '/#proof', label: 'Product' },
  { href: '/about', label: 'About' },
  { href: '/help', label: 'Help' },
]

export function SiteHeader(): React.ReactNode {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="/" className="shrink-0" aria-label="Football Intelligence home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition-colors duration-120 hover:text-text"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/app" className={buttonClass('secondary', 'sm', 'hidden sm:inline-flex')}>
            Open workspace
          </Link>
          <Link href="/app/p/demo-atl-hvu" className={buttonClass('primary', 'sm')}>
            Open the demo match
          </Link>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter(): React.ReactNode {
  return (
    <footer className="border-t border-line bg-surface/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted">
            A local-first workspace for evidence-linked football analysis and publish-ready content packs.
          </p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
            Beta · No account required
          </p>
        </div>

        <FooterColumn
          title="Product"
          links={[
            { href: '/app', label: 'Workspace' },
            { href: '/app/projects', label: 'Projects' },
            { href: '/app/p/demo-atl-hvu', label: 'Demo match' },
          ]}
        />
        <FooterColumn
          title="Trust"
          links={[
            { href: '/privacy', label: 'Data policy' },
            { href: '/terms', label: 'Beta terms' },
            { href: '/help', label: 'Help & shortcuts' },
          ]}
        />
        <FooterColumn
          title="Company"
          links={[
            { href: '/about', label: 'About' },
            { href: '/about#principles', label: 'Principles' },
            { href: '/help#faq', label: 'FAQ' },
          ]}
        />
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5">
          <p className="text-xs text-dim">© 2026 Football Intelligence & Content Studio. Demo data is fictional.</p>
          <p className="text-xs text-dim">
            Your projects stay in this browser until you export or delete them.
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: { href: string; label: string }[]
}): React.ReactNode {
  return (
    <div>
      <p className="label mb-3">{title}</p>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-muted transition-colors hover:text-text">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
