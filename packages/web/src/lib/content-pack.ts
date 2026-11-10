import { formatTimecode } from '@fics/timebase'
import { resolveInsight } from './store'
import { xgTotals } from './stats'
import type { ContentPack, ContentPackSection, Project, ResolvedInsight } from './types'

export class ContentPackError extends Error {
  readonly code: 'no_accepted_insights' | 'empty_project'

  constructor(code: 'no_accepted_insights' | 'empty_project', message: string) {
    super(message)
    this.name = 'ContentPackError'
    this.code = code
  }
}

function shortClaim(claim: string, max = 96): string {
  if (claim.length <= max) return claim
  const slice = claim.slice(0, max)
  const lastSpace = slice.lastIndexOf(' ')
  return `${(lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice).trimEnd()}…`
}

function timecode(tUs: number): string {
  return formatTimecode(tUs)
}

function hashtag(value: string): string {
  return `#${value.replace(/[^a-zA-Z0-9]/g, '')}`
}

function usableInsights(project: Project): ResolvedInsight[] {
  return project.insights
    .map((insight) => resolveInsight(project, insight))
    .filter(
      (insight) =>
        (insight.status === 'accepted' || insight.status === 'edited') &&
        insight.displayStatus !== 'stale',
    )
    .sort((left, right) => {
      if (left.updatedAt !== right.updatedAt) return left.updatedAt < right.updatedAt ? -1 : 1
      return left.id < right.id ? -1 : 1
    })
}

/**
 * Deterministic content pack. The clock is only read when `options.now` is
 * supplied; by default the project's own `updatedAt` is used, so two calls on
 * the same project produce byte-identical output.
 */
export function buildContentPack(project: Project, options: { now?: string } = {}): ContentPack {
  if (project.events.length === 0) {
    throw new ContentPackError('empty_project', 'This project has no events to build a pack from.')
  }

  const insights = usableInsights(project)
  if (insights.length === 0) {
    throw new ContentPackError(
      'no_accepted_insights',
      'No accepted insight with fresh evidence. Accept at least one insight in Review first.',
    )
  }

  const xg = xgTotals(project)
  const scoreline = `${project.teams.home.name} ${project.score.home}–${project.score.away} ${project.teams.away.name}`
  const lead = insights[0]
  if (!lead) throw new ContentPackError('no_accepted_insights', 'No accepted insight available.')

  const evidenceSummary = insights.map((insight) => {
    const labels = insight.evidence.map((reference) => reference.label).join('; ')
    return `${timecode(insight.evidence[0]?.tUs ?? 0)} — ${insight.claim} (${labels})`
  })

  const sections: ContentPackSection[] = [
    {
      id: 'summary',
      heading: 'Match summary',
      body: [
        `${scoreline}`,
        `${project.competition} · ${project.date}`,
        `Possession ${project.possession.home}%–${project.possession.away}% · xG ${xg.home.toFixed(2)}–${xg.away.toFixed(2)} · ${project.events.length} tagged events`,
      ].join('\n'),
    },
    {
      id: 'decided',
      heading: 'What decided it',
      body: insights
        .map((insight, index) => {
          const stamps = insight.evidence.map((reference) => timecode(reference.tUs)).join(', ')
          return `${index + 1}. ${insight.claim}\n   Evidence: ${stamps}`
        })
        .join('\n'),
    },
    {
      id: 'tactical',
      heading: 'Tactical read',
      body: [
        `${project.teams.home.name} lined up ${project.teams.home.formation}; ${project.teams.away.name} lined up ${project.teams.away.formation}.`,
        ...insights
          .filter((insight) => insight.limitations)
          .map((insight) => `Limitation: ${insight.limitations}`),
      ].join('\n'),
    },
    {
      id: 'clips',
      heading: 'Clip list',
      body:
        project.clips.length === 0
          ? 'No clips saved yet.'
          : project.clips
              .map(
                (clip) =>
                  `${timecode(clip.inUs)}–${timecode(clip.outUs)} · ${clip.name} (${clip.tags.join(', ')})`,
              )
              .join('\n'),
    },
    {
      id: 'method',
      heading: 'Review note',
      body: `Generated from ${insights.length} accepted insight${insights.length === 1 ? '' : 's'} with resolving evidence. Rejected, proposed and stale claims are excluded by design.`,
    },
  ]

  const teamTags = [hashtag(project.teams.home.short), hashtag(project.teams.away.short)]
  const competitionTag = hashtag(project.competition.split('—')[0] ?? project.competition)
  const hashtags = ['#FootballAnalysis', ...teamTags, competitionTag].filter(
    (tag, index, all) => all.indexOf(tag) === index,
  )

  const firstStamp = timecode(lead.evidence[0]?.tUs ?? 0)

  return {
    title: `${scoreline} — ${project.competition}`,
    hook: `${scoreline}: ${shortClaim(lead.claim, 120)}`,
    sections,
    captions: [
      `${scoreline}. ${shortClaim(lead.claim, 110)}`,
      `The moment that decided it — ${firstStamp}. ${shortClaim(lead.claim, 90)}`,
      `New breakdown: ${project.competition}. ${insights.length} evidence-backed reads, no hot takes.`,
    ],
    hashtags,
    thumbnailBrief: `Split frame: ${project.teams.home.name} (${project.teams.home.color}) vs ${project.teams.away.name} (${project.teams.away.color}). Score ${project.score.home}–${project.score.away}. Headline: "${shortClaim(lead.claim, 64)}". Freeze the ${firstStamp} frame and keep the evidence timestamp in the corner.`,
    evidenceSummary,
    matchLabel: project.competition,
    generatedAt: options.now ?? project.updatedAt,
    acceptedInsightIds: insights.map((insight) => insight.id),
  }
}

export function renderContentPackMarkdown(pack: ContentPack): string {
  const lines: string[] = [`# ${pack.title}`, '', `> ${pack.hook}`, '']
  for (const section of pack.sections) {
    lines.push(`## ${section.heading}`, '', section.body, '')
  }
  lines.push('## Captions', '', ...pack.captions.map((caption) => `- ${caption}`), '')
  lines.push('## Hashtags', '', pack.hashtags.join(' '), '')
  lines.push('## Thumbnail brief', '', pack.thumbnailBrief, '')
  lines.push('## Evidence ledger', '', ...pack.evidenceSummary.map((line) => `- ${line}`), '')
  lines.push(`_Generated ${pack.generatedAt} · ${pack.matchLabel}_`)
  return lines.join('\n')
}
