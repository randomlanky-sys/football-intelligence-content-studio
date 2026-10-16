import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Football Intelligence & Content Studio',
  description: 'AI-powered football match analysis and content creation studio',
  openGraph: {
    title: 'Football Intelligence & Content Studio',
    description: 'Transform match data into compelling stories with AI-powered analysis',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Football Intelligence & Content Studio',
    description: 'Transform match data into compelling stories with AI-powered analysis',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-background text-text-primary antialiased">{children}</body>
    </html>
  )
}
