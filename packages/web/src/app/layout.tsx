import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import '@/styles/globals.css'
import { ToastProvider } from '@/components/toast'

export const metadata: Metadata = {
  metadataBase: new URL('https://football-intelligence-content-studio.onrender.com'),
  title: {
    default: 'Football Intelligence & Content Studio',
    template: '%s · Football Intelligence',
  },
  description:
    'A local-first workspace that turns tagged match events into evidence-linked analysis and publish-ready content packs.',
  applicationName: 'Football Intelligence & Content Studio',
  openGraph: {
    title: 'Football Intelligence & Content Studio',
    description:
      'Evidence-linked match analysis and publish-ready content packs, in one local-first workspace.',
    type: 'website',
    siteName: 'Football Intelligence & Content Studio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Football Intelligence & Content Studio',
    description:
      'Evidence-linked match analysis and publish-ready content packs, in one local-first workspace.',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#07090C',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-text antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-[10px] focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-accent-ink"
        >
          Skip to content
        </a>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
