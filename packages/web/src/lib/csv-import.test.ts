import { describe, expect, it } from 'vitest'
import { rowsToEvents } from './csv-import'

const HOME = 'team-home'
const AWAY = 'team-away'

function convert(csv: string) {
  return rowsToEvents(csv, 'proj', HOME, AWAY, 'test')
}

describe('CSV import', () => {
  it('converts valid rows to events with microsecond timestamps and team mapping', () => {
    const result = convert(`minute,second,type,team,player,x,y,xg,outcome
23,14,goal,home,T. Silva,92,32,0.31,Left-foot finish
41,2,goal,away,S. Nkosi,90,40,0.28,Second-ball finish
`)

    expect(result.errors).toEqual([])
    expect(result.events).toHaveLength(2)

    const first = result.events[0]
    expect(first?.type).toBe('goal')
    expect(first?.teamId).toBe(HOME)
    expect(first?.tUs).toBe((23 * 60 + 14) * 1_000_000)
    expect(first?.minute).toBeCloseTo(23 + 14 / 60)
    expect(first?.xg).toBeCloseTo(0.31)

    expect(result.events[1]?.teamId).toBe(AWAY)
  })

  it('reports the exact file line for an invalid row and keeps valid rows visible', () => {
    const result = convert(`minute,second,type,team
12,18,tackle,away
99,99,goal,home
23,14,goal,home
`)

    expect(result.events).toHaveLength(2)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]?.row).toBe(3)
    expect(result.errors[0]?.message).toContain('second')
  })

  it('rejects a file missing a required column at row 1', () => {
    const result = convert(`minute,second,type
12,18,tackle
`)

    expect(result.events).toEqual([])
    expect(result.errors[0]?.row).toBe(1)
    expect(result.errors[0]?.message).toContain('team')
  })

  it('rejects an unknown event type', () => {
    const result = convert(`minute,second,type,team
12,18,teleport,away
`)

    expect(result.events).toEqual([])
    expect(result.errors[0]?.row).toBe(2)
    expect(result.errors[0]?.message).toContain('type')
  })

  it('honours quoted fields containing commas', () => {
    const result = convert(`minute,second,type,team,outcome
1,0,pass,home,"Won, then recycled"
`)

    expect(result.errors).toEqual([])
    expect(result.events[0]?.outcome).toBe('Won, then recycled')
  })

  it('treats a blank file as a row-1 error', () => {
    const result = convert('')
    expect(result.events).toEqual([])
    expect(result.errors[0]?.row).toBe(1)
  })
})
