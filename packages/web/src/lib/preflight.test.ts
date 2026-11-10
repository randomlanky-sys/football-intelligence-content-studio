import { describe, expect, it } from 'vitest'
import { createDemoProject } from './demo-data'
import { buildPreflight } from './preflight'
import type { Project } from './types'

function demoWithoutStale(): Project {
  const project = createDemoProject()
  return { ...project, insights: project.insights.filter((insight) => insight.id !== 'ins-06') }
}

describe('export preflight', () => {
  it('blocks the demo fixture because ins-06 cites stale evidence', () => {
    const report = buildPreflight(createDemoProject(), 'vertical_1080')

    expect(report.ok).toBe(false)
    expect(report.staleCount).toBe(1)
    expect(report.acceptedCount).toBe(2)

    const stale = report.rows.find((row) => row.id === 'stale')
    expect(stale?.status).toBe('fail')
    expect(stale?.fixHref).toContain('/review')
  })

  it('gives every failing rule a fix link', () => {
    const report = buildPreflight(createDemoProject(), 'article')
    const failures = report.rows.filter((row) => row.status === 'fail')

    expect(failures.length).toBeGreaterThan(0)
    for (const row of failures) {
      expect(row.fixHref, `${row.id} must link to a fix`).toBeTruthy()
      expect(row.fixLabel, `${row.id} must name the fix`).toBeTruthy()
    }
  })

  it('passes once the stale insight is removed', () => {
    const report = buildPreflight(demoWithoutStale(), 'vertical_1080')

    expect(report.ok).toBe(true)
    expect(report.staleCount).toBe(0)
    expect(report.danglingCount).toBe(0)
    expect(report.rows.every((row) => row.status !== 'fail')).toBe(true)
  })

  it('fails duration, events and accepted claims on an empty project', () => {
    const project = createDemoProject()
    const empty: Project = {
      ...project,
      durationUs: 0,
      events: [],
      insights: [],
      clips: [],
    }

    const report = buildPreflight(empty, 'article')
    expect(report.ok).toBe(false)

    const failed = new Set(report.rows.filter((row) => row.status === 'fail').map((row) => row.id))
    expect(failed).toEqual(new Set(['duration', 'events', 'accepted']))
  })
})
