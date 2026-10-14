import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export const metadata = {
  title: 'Football Intelligence & Content Studio',
  description: 'AI-powered football match analysis and content creation studio',
}

export default function HomePage() {
  const [showFeatures, setShowFeatures] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-900 via-zinc-900 to-black text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-wider text-white">
            Football IQ
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/projects" className="text-white hover:text-yellow-400 transition-colors">
              Projects
            </Link>
            <Link href="/about" className="text-white hover:text-yellow-400 transition-colors">
              About
            </Link>
          </div>
          <button
            onClick={() => setShowFeatures(true)}
            className="md:hidden text-white bg-yellow-600 px-4 py-2 rounded-full font-medium transition-colors"
          >
            Menu
          </button>
        </div>
      </nav>

      <header className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            Analyze <span className="text-yellow-400">Football Matches</span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-12">
            AI-powered tactical breakdowns, evidence-linked analysis, and publish-ready
            content packs. Manual event tagging, video synchronization, and automated
            content generation for football content creators.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link
              href="/projects"
              className="bg-yellow-600 text-white px-8 py-4 rounded-full font-medium hover:bg-yellow-500 transition-colors text-lg"
            >
              Explore Projects
            </Link>
            <button
              className="bg-white/10 text-white px-8 py-4 rounded-full font-medium hover:bg-white/20 transition-colors text-lg"
              onClick={() => setShowFeatures(true)}
            >
              Watch Demo
            </button>
          </div>

          <div
            id="features-section"
            className="hidden md:block mt-20 grid grid-cols-3 gap-8 max-w-6xl mx-auto"
            role="region"
            aria-label="Features"
          >
            <div>
              <h3 className="text-xl font-bold mb-3">AI Tactical Analysis</h3>
              <p className="text-white/60 text-sm">
                Automatic event tagging and video synchronization
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3">Content Packs</h3>
              <p className="text-white/60 text-sm">
                Publish-ready content generation from match data
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3">Evidence-Linked</h3>
              <p className="text-white/60 text-sm">
              Breakdowns backed by timestamped evidence
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className="fixed inset-0 z-40 hidden md:hidden bg-black/80 backdrop-blur-sm"
      >
        <div className="max-w-md mx-auto px-4 py-16">
          <Link href="/" className="text-2xl font-bold text-white mb-4 block">Football IQ</Link>
          <div className="space-y-4">
            <Link href="/projects" className="text-white hover:text-yellow-400 transition-colors text-lg block">
              Projects
            </Link>
            <Link href="/about" className="text-white hover:text-yellow-400 transition-colors text-lg block">
              About
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}