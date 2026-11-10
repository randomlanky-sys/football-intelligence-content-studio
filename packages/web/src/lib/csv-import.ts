import { parseCsv } from '@fics/data-import'
import { eventImportRowSchema } from './schema'
import type { EventType, MatchEvent } from './types'

/**
 * CSV → event conversion for the Data screen. Kept out of the React component
 * so the all-or-nothing row contract can be unit-tested directly.
 */

export const REQUIRED_COLUMNS = ['minute', 'second', 'type', 'team'] as const

export interface CsvRowError {
  row: number
  message: string
}

export interface CsvImportPreview {
  events: MatchEvent[]
  errors: CsvRowError[]
  headers: string[]
}

export function rowsToEvents(
  text: string,
  projectId: string,
  homeId: string,
  awayId: string,
  stamp: string = Date.now().toString(36),
): CsvImportPreview {
  const table = parseCsv(text)
  const headerRow = table[0]
  if (!headerRow) {
    return { events: [], errors: [{ row: 1, message: 'The file is empty.' }], headers: [] }
  }

  const headers = headerRow.map((cell) => cell.trim().toLowerCase())
  const missing = REQUIRED_COLUMNS.filter((column) => !headers.includes(column))
  if (missing.length > 0) {
    return {
      events: [],
      errors: [
        {
          row: 1,
          message: `Missing required column${missing.length === 1 ? '' : 's'}: ${missing.join(', ')}.`,
        },
      ],
      headers,
    }
  }

  const events: MatchEvent[] = []
  const errors: CsvRowError[] = []
  const dataRows = table.slice(1).filter((row) => row.some((cell) => cell.trim() !== ''))

  dataRows.forEach((row, index) => {
    const lineNumber = index + 2
    const record: Record<string, string> = {}
    headers.forEach((header, columnIndex) => {
      record[header] = row[columnIndex] ?? ''
    })

    for (const column of REQUIRED_COLUMNS) {
      if (!record[column] || record[column]?.trim() === '') {
        errors.push({ row: lineNumber, message: `"${column}" is required.` })
        return
      }
    }

    const candidate: Record<string, unknown> = {
      minute: record.minute,
      second: record.second,
      type: record.type?.trim().toLowerCase(),
      team: record.team?.trim().toLowerCase(),
    }
    if (record.player?.trim()) candidate.player = record.player.trim()
    if (record.x?.trim()) candidate.x = record.x
    if (record.y?.trim()) candidate.y = record.y
    if (record.xg?.trim()) candidate.xg = record.xg
    if (record.outcome?.trim()) candidate.outcome = record.outcome.trim()

    const parsed = eventImportRowSchema.safeParse(candidate)
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      const path = issue?.path.join('.') ?? 'row'
      errors.push({ row: lineNumber, message: `${path}: ${issue?.message ?? 'invalid value'}.` })
      return
    }

    const data = parsed.data
    events.push({
      id: `${projectId}-evt-${lineNumber}-${stamp}`,
      type: data.type as EventType,
      minute: data.minute + data.second / 60,
      tUs: (data.minute * 60 + data.second) * 1_000_000,
      teamId: data.team === 'home' ? homeId : awayId,
      ...(data.player ? { playerId: data.player } : {}),
      ...(data.x !== undefined ? { x: data.x } : {}),
      ...(data.y !== undefined ? { y: data.y } : {}),
      ...(data.xg !== undefined ? { xg: data.xg } : {}),
      ...(data.outcome ? { outcome: data.outcome } : {}),
    })
  })

  return { events, errors, headers }
}
