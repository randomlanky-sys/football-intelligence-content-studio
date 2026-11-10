import type { MatchEvent, Project } from './types'

/** Derived match stats. Nothing here is stored, so a re-import cannot drift. */
export function xgTotals(project: Project): { home: number; away: number } {
  return project.events.reduce(
    (totals, event) => {
      if (event.xg === undefined) return totals
      if (event.teamId === project.teams.home.id) return { ...totals, home: totals.home + event.xg }
      if (event.teamId === project.teams.away.id) return { ...totals, away: totals.away + event.xg }
      return totals
    },
    { home: 0, away: 0 },
  )
}

export function shots(project: Project): MatchEvent[] {
  return project.events.filter((event) => event.type === 'shot' || event.type === 'goal')
}

export function goals(project: Project): MatchEvent[] {
  return project.events.filter((event) => event.type === 'goal')
}

export function countByType(project: Project, types: MatchEvent['type'][]): number {
  return project.events.filter((event) => types.includes(event.type)).length
}

export function acceptedInsightCount(project: Project, resolved: { displayStatus: string }[]): number {
  return resolved.filter((insight) => insight.displayStatus === 'accepted' || insight.displayStatus === 'edited')
    .length
}

/** 0–100 control proxy from possession and xG share; used by the momentum card. */
export function controlIndex(project: Project): number {
  const xg = xgTotals(project)
  const total = xg.home + xg.away
  const xgShare = total > 0 ? xg.home / total : 0.5
  return Math.round((project.possession.home / 100) * 60 + xgShare * 40)
}
