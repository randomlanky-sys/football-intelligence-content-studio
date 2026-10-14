import Link from 'next/link'

export const metadata = {
  title: 'Football Intelligence - Projects',
  description: 'Project list for Football Intelligence & Content Studio',
}

export default function ProjectsPage() {
  const projects = [
    {
      id: '1',
      name: 'Match Analysis Pro',
      description: 'AI-powered tactical breakdown engine',
    },
    {
      id: '2',
      name: 'Content Pack Generator',
      description: 'Automated content creation from match data',
    },
    {
      id: '3',
      name: 'Event Tagging Suite',
      description: 'Manual event tagging and video synchronization',
    },
  ]

  return (
    <main className="min-h-screen bg-zinc-900 text-white p-8">
      <nav className="mb-8">
        <Link href="/" className="text-yellow-400 hover:text-white transition-colors font-medium">
          ← Back to Home
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight mb-6">Project Library</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/5 transition-all hover:bg-white/5"
            >
              <h3 className="text-xl font-bold mb-2">
                <Link
                  href={`/projects/${project.id}`}
                  className="text-white hover:text-yellow-400 transition-colors"
                >
                  {project.name}
                </Link>
              </h3>
              <p className="text-white/60 text-sm mb-4">{project.description}</p>
              <Link
                href="/"
                className="text-white/60 text-sm group-hover:text-white transition-colories"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}