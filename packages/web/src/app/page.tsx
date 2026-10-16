import Link from 'next/link'
import Hero3D from '@/components/three/Hero3D'

export const metadata = {
  title: 'Football Intelligence & Content Studio',
  description: 'AI-powered football match analysis and content creation studio',
}

const FEATURES = [
  {
    title: 'AI Tactical Analysis',
    body: 'Automatic event detection, player tracking, and formation recognition powered by computer vision and machine learning algorithms.',
    path: 'M12 8c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2zm0 12c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2zm0-6c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2z',
  },
  {
    title: 'Evidence-Linked Insights',
    body: 'Every insight connects directly to the exact video moment - click any analysis to see the play unfold in crystal clear detail.',
    path: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 10c-4.962 0-9 4.038-9 9s4.038 9 9 9c1.657 0 3.2-.496 4.388-1.316',
  },
  {
    title: 'Auto-Generated Content',
    body: 'Turn match data into ready-to-publish social posts, articles, highlight reels, and tactical breakdowns with one click.',
    path: 'M12 8c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2z',
  },
  {
    title: 'Multi-Platform Export',
    body: 'Seamlessly export to YouTube, Twitter/X, TikTok, Instagram, Facebook, and more with optimized formats for each platform.',
    path: 'M20.248 6.363a9 9 0 00-4.357-12.132A5.941 5.941 0 009.538 3H2.639a2 2 0 00-2 1.706V17a2 2 0 002 2h6.899a2 2 0 002-1.706v-5.007A5.918 5.918 0 0112 8c2.412 0 4.658-.825 6.248-2.136z',
  },
]

const STATS = [
  { k: '90%', v: 'Time Saved' },
  { k: '5x', v: 'Content Output' },
  { k: '40%', v: 'Conversion Rate' },
]

export default function HomePage() {
  return (
    <main className="relative overflow-hidden bg-[#0A0A0A]">
      <Hero3D />

      <section id="experience" className="relative border-t border-white/5 px-6 py-24 md:px-10 md:py-28">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-60"
          style={{
            background:
              'radial-gradient(900px 420px at 15% 0%, rgba(79,195,247,0.10), transparent 60%), radial-gradient(800px 420px at 85% 100%, rgba(252,211,77,0.10), transparent 60%)',
          }}
          aria-hidden
        />

        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-[#FCD34D]">Inside the studio</p>
          <h2 className="mt-4 max-w-3xl text-balance text-3xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
            From raw match data to publish-ready storytelling.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#CBD5E1] md:text-lg">
            Transform raw match data into compelling stories with AI-powered tactical analysis, evidence-linked
            insights, and automated content creation. From the pitch to the publish button in minutes, not hours.
          </p>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <article
                key={f.title}
                className="group relative rounded-2xl border border-white/10 bg-[rgba(17,17,17,0.6)] p-8 backdrop-blur transition duration-500 hover:-translate-y-2 hover:border-[rgba(252,211,77,0.3)] hover:bg-[rgba(17,17,17,0.85)]"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(252,211,77,0.1)]">
                  <svg className="h-6 w-6 text-[#FCD34D]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={f.path} />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">{f.title}</h3>
                <p className="leading-relaxed text-[#CBD5E1]">{f.body}</p>
                <div className="mt-6 h-[2px] w-10 rounded-full bg-[rgba(252,211,77,0.4)] transition-all duration-500 group-hover:w-16 group-hover:bg-[#FCD34D]" />
              </article>
            ))}
          </div>

          <div className="mt-20 flex flex-wrap items-center justify-center gap-10 md:gap-16">
            {STATS.map((s) => (
              <div key={s.v} className="text-center">
                <p className="text-3xl font-extrabold text-[#FCD34D] md:text-4xl">{s.k}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.28em] text-[#94A3B8]">{s.v}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 flex flex-col items-center gap-6">
            <Link
              href="/projects"
              className="inline-flex items-center gap-3 rounded-full bg-[#FCD34D] px-7 py-3.5 text-base font-semibold text-[#0A0A0A] transition hover:-translate-y-0.5 hover:bg-[#EAB308]"
            >
              Explore Our Platform
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <p className="max-w-2xl text-center text-sm text-[#94A3B8]">
              Trusted by football analysts, content creators, and professional clubs worldwide · Enterprise-grade
              security · GDPR compliant · SOC 2 certified · No credit card required.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
