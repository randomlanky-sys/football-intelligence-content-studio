import '@/styles/globals.css'

export const metadata = {
  title: 'Football Intelligence & Content Studio',
  description: 'AI-powered football match analysis and content creation studio',
  openGraph: {
    title: 'Football Intelligence & Content Studio',
    description: 'Transform match data into compelling stories with AI-powered analysis',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Football Intelligence & Content Studio'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Football Intelligence & Content Studio',
    description: 'Transform match data into compelling stories with AI-powered analysis'
  }
}

export default function HomePage() {
  return (
    <main className="min-h-[100vh] bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A/80] to-[#0A0A0A/95] relative overflow-hidden">
      {/* Deep space/nebula background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A/80] to-[#0A0A0A/95]" />
      
      {/* Subtle animated star field */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[url('/stars.png')] bg-repeat bg-[length:200px_200px] animate-[starfield_20s_linear_infinite]" />
      </div>

      <div className="relative z-10 flex min-h-[100vh] flex-col items-center justify-center px-6 pt-20 pb-16 text-center">
        {/* Header/Logo */}
        <div className="mb-16">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-[800] leading-none tracking-tighter text-white mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
            Football Intelligence
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="w-1 h-1 bg-[#FCD34D] rounded-full" />
            <span className="text-3xl font-[700] text-[#FCD34D] tracking-wider">&</span>
            <span className="w-1 h-1 bg-[#FCD34D] rounded-full" />
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-[800] leading-none tracking-tighter text-white mt-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
            Content Studio
          </h1>
          <p className="mt-4 text-xl lg:text-2xl text-[#E2E8F0] max-w-2xl">
            Where AI meets football brilliance
          </p>
        </div>

        {/* Hero Description */}
        <div className="mb-16 max-w-3xl">
          <p className="text-lg md:text-xl lg:text-2xl leading-relaxed text-[#E2E8F0]">
            Transform raw match data into compelling stories with AI-powered tactical analysis, 
            evidence-linked insights, and automated content creation. From the pitch to the 
            publish button in minutes, not hours.
          </p>
        </div>

        {/* Primary Call to Action */}
        <div className="mb-12">
          <Link
            href="/projects"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#FCD34D] text-[#0A0A0A] font-[600] rounded-lg text-lg md:text-xl transition-all duration-300 hover:bg-[#EAB308] active:bg-[#D97706] shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Explore Our Platform
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Secondary Actions */}
        <div className="space-x-4">
          <Link
            href="/projects"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[rgba(255,255,255,0.08)] text-[#F8FAFC] border border-[rgba(255,255,255,0.2)] font-[500] rounded-lg text-lg md:text-xl transition-all duration-300 hover:bg-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.3)] transform hover:-translate-y-1"
          >
            View Features
          </Link>
          
          <button
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[rgba(255,255,255,0.08)] text-[#F8FAFC] border border-[rgba(255,255,255,0.2)] font-[500] rounded-lg text-lg md:text-xl transition-all duration-300 hover:bg-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.3)] transform hover:-translate-y-1"
          >
            Watch Demo
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>

        {/* Features Grid */}
        <div className="mt-20 w-full max-w-6xl grid gap-8 md:grid-cols-3 lg:grid-cols-4">
          {/* Feature Card 1 */}
          <div className="relative group bg-[rgba(17,17,17,0.6)] backdrop-blur-[4px] border border-[rgba(255,255,255,0.1)] rounded-2xl p-8 text-center transition-all duration-500 hover:bg-[rgba(17,17,17,0.8)] hover:border-[rgba(252,211,77,0.3)] transform hover:-translate-y-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.01)]">
            <div className="w-12 h-12 mb-6 flex items-center justify-center bg-[rgba(252,211,77,0.1)] rounded-xl">
              <svg className="w-6 h-6 text-[#FCD34D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2zm0 12c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2zm0-6c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-[700] text-white mb-4">AI Tactical Analysis</h3>
            <p className="text-[#CBD5E1] leading-relaxed">
              Automatic event detection, player tracking, and formation recognition 
              powered by computer vision and machine learning algorithms.
            </p>
            <div className="mt-6 w-[40px] mx-auto relative">
              <div className="w-full h-[2px] bg-[rgba(252,211,77,0.3)] rounded-full" />
              <div className="absolute left-0 top-[-4px] w-[12px] h-[12px] bg-[#FCD34D] rounded-full" />
            </div>
          </div>

          {/* Feature Card 2 */}
          <div className="relative group bg-[rgba(17,17,17,0.6)] backdrop-blur-[4px] border border-[rgba(255,255,255,0.1)] rounded-2xl p-8 text-center transition-all duration-500 hover:bg-[rgba(17,17,17,0.8)] hover:border-[rgba(252,211,77,0.3)] transform hover:-translate-y-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.01)]">
            <div className="w-12 h-12 mb-6 flex items-center justify-center bg-[rgba(252,211,77,0.1)] rounded-xl">
              <svg className="w-6 h-6 text-[#FCD34D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 10c-4.962 0-9 4.038-9 9s4.038 9 9 9c1.657 0 3.2- .496 4.388-1.316" />
              </svg>
            </div>
            <h3 className="text-2xl font-[700] text-white mb-4">Evidence-Linked Insights</h3>
            <p className="text-[#CBD5E1] leading-relaxed">
              Every insight connects directly to the exact video moment - click any 
              analysis to see the play unfold in crystal clear detail.
            </p>
            <div className="mt-6 w-[40px] mx-auto relative">
              <div className="w-full h-[2px] bg-[rgba(252,211,77,0.3)] rounded-full" />
              <div className="absolute left-0 top-[-4px] w-[12px] h-[12px] bg-[#FCD34D] rounded-full" />
            </div>
          </div>

          {/* Feature Card 3 */}
          <div className="relative group bg-[rgba(17,17,17,0.6)] backdrop-blur-[4px] border border-[rgba(255,255,255,0.1)] rounded-2xl p-8 text-center transition-all duration-500 hover:bg-[rgba(17,17,17,0.8)] hover:border-[rgba(252,211,77,0.3)] transform hover:-translate-y-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.01)]">
            <div className="w-12 h-12 mb-6 flex items-center justify-center bg-[rgba(252,211,77,0.1)] rounded-xl">
              <svg className="w-6 h-6 text-[#FCD34D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-[700] text-white mb-4">Auto-Generated Content</h3>
            <p className="text-[#CBD5E1] leading-relaxed">
              Turn match data into ready-to-publish social posts, articles, highlight 
              reels, and tactical breakdowns with one click.
            </p>
            <div className="mt-6 w-[40px] mx-auto relative">
              <div className="w-full h-[2px] bg-[rgba(252,211,77,0.3)] rounded-full" />
              <div className="absolute left-0 top-[-4px] w-[12px] h-[12px] bg-[#FCD34D] rounded-full" />
            </div>
          </div>

          {/* Feature Card 4 */}
          <div className="relative group bg-[rgba(17,17,17,0.6)] backdrop-blur-[4px] border border-[rgba(255,255,255,0.1)] rounded-2xl p-8 text-center transition-all duration-500 hover:bg-[rgba(17,17,17,0.8)] hover:border-[rgba(252,211,77,0.3)] transform hover:-translate-y-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.01)]">
            <div className="w-12 h-12 mb-6 flex items-center justify-center bg-[rgba(252,211,77,0.1)] rounded-xl">
              <svg className="w-6 h-6 text-[#FCD34D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.248 6.363a9 9 0 00-4.357-12.132A5.941 5.941 0 009.538 3H2.639a2 2 0 00-2 1.706V17a2 2 0 002 2h6.899a2 2 0 002-1.706v-5.007A5.918 5.918 0 0112 8c2.412 0 4.658-.825 6.248-2.136z" />
              </svg>
            </div>
            <h3 className="text-2xl font-[700] text-white mb-4">Multi-Platform Export</h3>
            <p className="text-[#CBD5E1] leading-relaxed">
              Seamlessly export to YouTube, Twitter/X, TikTok, Instagram, Facebook, 
              and more with optimized formats for each platform.
            </p>
            <div className="mt-6 w-[40px] mx-auto relative">
              <div className="w-full h-[2px] bg-[rgba(252,211,77,0.3)] rounded-full" />
              <div className="absolute left-0 top-[-4px] w-[12px] h-[12px] bg-[#FCD34D] rounded-full" />
            </div>
          </div>
        </div>

        {/* Stats Counter */}
        <div className="mt-20 flex flex-col-reverse md:flex-row md:space-x-8 lg:space-x-12 justify-center text-center">
          <div className="flex flex-col items-center">
            <p className="text-3xl font-[800] text-[#FCD34D] leading-none">90%</p>
            <p className="text-sm text-[#E2E8F0] tracking-wider">Time Saved</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-3xl font-[800] text-[#FCD34D] leading-none">5x</p>
            <p className="text-sm text-[#E2E8F0] tracking-wider">Content Output</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-3xl font-[800] text-[#FCD34D] leading-none">40%</p>
            <p className="text-sm text-[#E2E8F0] tracking-wider">Conversion Rate</p>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="mt-24 text-sm text-[#94A3B8] max-w-2xl">
          <p className="mb-2">Trusted by football analysts, content creators, and professional clubs worldwide</p>
          <p className="mb-2">Enterprise-grade security • GDPR compliant • SOC 2 certified</p>
          <p>No credit card required to get started</p>
        </div>
      </div>

      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Bottom left decorative element */}
        <div className="absolute bottom-0 left-0 -z-10 w-[200px] h-[200px] bg-[radial-gradient(circle_at_bottom_right,_transparent_20%,rgba(252,211,77,0.05)_20%_rgba(252,211,77,0.02)_40%,transparent_60%)] animate-[pulse_4s_ease-in-out_infinite]" />
        
        {/* Top right decorative element */}
        <div className="absolute top-0 right-0 -z-10 w-[180px] h-[180px] bg-[radial-gradient(circle_at_top_left,_transparent_20%,rgba(252,211,77,0.05)_20%_rgba(252,211,77,0.02)_40%,transparent_60%)] animate-[pulse_4s_ease-in-out_infinite]" />
        
        {/* Floating particles */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute w-[4px] h-[4px] bg-[#FCD34D] rounded-full top-[20%] left-[10%] animate-[float_6s_ease-in-out_infinite]" />
          <div className="absolute w-[3px] h-[3px] bg-[#FCD34D] rounded-full top-[70%] right-[15%] animate-[float_8s_ease-in-out_infinite_reverse]" />
          <div className="absolute w-[5px] h-[5px] bg-[#FCD34D] rounded-full bottom-[30%] left-[25%] animate-[float_10s_ease-in-out_infinite]" />
          <div className="absolute w-[2px] h-[2px] bg-[#FCD34D] rounded-full top-[40%] right-[20%] animate-[float_5s_ease-in-out_infinite_reverse]" />
        </div>
      </div>
    </main>
  )
}