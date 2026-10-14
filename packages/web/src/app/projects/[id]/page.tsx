import Link from 'next/link'
import { useParams } from 'next/navigation'

export const metadata = {
  title: 'Football Intelligence - Project Details',
  description: 'Project detail page for Football Intelligence & Content Studio',
}

export default function ProjectDetailPage() {
  const { id } = useParams()

  const projectDetails: Record<string, any> = {
    '1': {
      name: 'Match Analysis Pro',
      description: 'AI-powered tactical breakdown engine with automated event tagging',
      features: [
        'Automatic event detection',
        'Video synchronization',
        'Tactical pattern recognition',
        'Export to CSV/JSON',
      ],
    },
    '2': {
      name: 'Content Pack Generator',
      description: 'Automated content creation from match data and statistics',
      features: [
        'Template-based content generation',
        'Social media optimized posts',
        'SEO-friendly articles',
        'Multi-platform export',
      ],
    },
    '3': {
      name: 'Event Tagging Suite',
      description: 'Manual event tagging and video synchronization tool',
      features: [
        'Timestamped event marking',
        'Multi-angle video sync',
        'Custom tag categories',
        'Export for analysis pipelines',
      ],
    },
  }[id] || {
    name: 'Project',
    description: 'Project details',
    features: ['Under construction'],
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-white p-8">
      <nav className="mb-8">
        <Link href="/projects" className="text-yellow-400 hover:text-white transition-colors font-medium">
          ← Back to Projects
        </Link>
        <Link href="/" className="text-yellow-400 hover:text-white transition-colors font-medium ml-4">
          ← Home
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white/10 rounded-xl p-8 backdrop-blur-sm border border-white/5 mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            {projectDetails.name}
          </h1>
          <p className="text-white/60 text-base mb-6">{projectDetails.description}</p>

          {projectDetails.features && projectDetails.features.length > 0 ? (
            <ul className="space-y-3 text-white/70 text-sm">
              {projectDetails.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-yellow-400 flex-shrink-0 w-3 h-3 rounded-full group-hover:text-white transition-colors"></span>
                  <span className="ml-3">{feature}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-white/60 italic">No features listed yet.</p>
          )}
        </div>

        <div>
          <Link href="/projects" className="bg-yellow-600 text-white px-6 py-3 rounded-full font-medium hover:bg-yellow-500 transition-colors">
            View All Projects
          </Link>
        </div>
      </div>
    </main>
  )
}