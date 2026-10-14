import Link from 'next/link'

export const metadata = {
  title: 'Football Intelligence - About',
  description: 'About the Football Intelligence & Content Studio',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-zinc-900 text-white p-8">
      <nav className="mb-8">
        <Link href="/" className="text-yellow-400 hover:text-white transition-colors font-medium">
          ← Back to Home
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight mb-6">
          About Football Intelligence
        </h1>

        <div className="bg-white/10 rounded-xl p-8 backdrop-blur-sm border border-white/5">
          <p className="text-white/70 text-lg leading-relaxed mb-6">
            Football Intelligence & Content Studio is an AI-powered platform for football
            match analysis and content creation. We combine automated event tagging, video
            synchronization, and tactical breakdown generation with publish-ready content
            packs for creators, analysts, and teams.
          </p>

          <h2 className="text-xl font-bold text-yellow-400 mb-4">Our Mission</h2>
          <p className="text-white/70 text-lg leading-relaxed">
            To democratize football analysis by providing AI-powered tools that turn match
            data into compelling content, saving creators hours of manual work while
            maintaining tactical depth and accuracy.
          </p>

          <h2 className="text-xl font-bold text-yellow-400 mt-6">Features</h2>
          <ul className="grid grid-cols-2 gap-4 my-6">
            <li>
              <span className="text-white/70">AI Tactical Analysis</span>
            </li>
            <li>
              <span className="text-white/70">Content Packs</span>
            </li>
            <li>
              <span className="text-white/70">Evidence-Linked Breakdowns</span>
            </li>
            <li>
              <span className="text-white/70">Video Synchronization</span>
            </li>
          </ul>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10">
          <h3 className="text-base font-medium text-white/60 mb-4">Connect</h3>
          <div className="grid grid-cols-3 gap-4">
            <Link href="#" className="text-white/70 hover:text-white transition-colors text-sm">
              GitHub
            </Link>
            <Link href="#" className="text-white/70 hover:text-white transition-colors text-sm">
              Twitter
            </Link>
            <Link href="#" className="text-white/70 hover:text-white transition-colors text-sm">
              Discord
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}