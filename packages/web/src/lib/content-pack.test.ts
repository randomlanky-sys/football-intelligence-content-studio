import { describe, expect, it } from 'vitest'
import {
  buildContentPack,
  ContentPackError,
  renderContentPackMarkdown,
} from './content-pack'
import { createDemoProject } from './demo-data'

describe('content pack', () => {
  it('is byte-identical across two builds of the same project', () => {
    const project = createDemoProject()
    const first = buildContentPack(project)
    const second = buildContentPack(project)

    expect(first).toEqual(second)
    expect(renderContentPackMarkdown(first)).toBe(renderContentPackMarkdown(second))
  })

  it('uses only accepted or edited insights with fresh evidence', () => {
    const pack = buildContentPack(createDemoProject())

    expect(pack.acceptedInsightIds).toContain('ins-05')
    expect(pack.acceptedInsightIds).toContain('ins-08')
    expect(pack.acceptedInsightIds).not.toContain('ins-06')
    expect(pack.acceptedInsightIds).not.toContain('ins-01')
  })

  it('includes the evidence ledger and a match label in the Markdown', () => {
    const project = createDemoProject()
    const markdown = renderContentPackMarkdown(buildContentPack(project))

    expect(markdown).toContain('Evidence ledger')
    expect(markdown).toContain('Atlantic FC')
    expect(markdown).toContain('Highveld United')
    expect(markdown).toMatch(/\d{2}:\d{2}/)
  })

  it('refuses to build with no accepted insights', () => {
    const project = { ...createDemoProject(), insights: [] }

    expect(() => buildContentPack(project)).toThrow(ContentPackError)
    try {
      buildContentPack(project)
    } catch (error) {
      expect(error).toBeInstanceOf(ContentPackError)
      expect((error as ContentPackError).code).toBe('no_accepted_insights')
    }
  })

  it('refuses to build an empty project', () => {
    const project = { ...createDemoProject(), events: [] }

    try {
      buildContentPack(project)
      throw new Error('expected a ContentPackError')
    } catch (error) {
      expect(error).toBeInstanceOf(ContentPackError)
      expect((error as ContentPackError).code).toBe('empty_project')
    }
  })
})
