import { computeEvidenceHash, type EvidenceRef } from '@fics/evidence-engine'
import type { Insight, MatchEvent, Project, Team } from './types'

/**
 * One fully populated, fixed demo fixture. Every timestamp and id is a constant
 * so content-pack and snapshot tests are deterministic. Nothing here reads the
 * clock.
 */

export const DEMO_PROJECT_ID = 'demo-atl-hvu'
export const DEMO_CREATED_AT = '2026-11-07T20:45:00.000Z'

const ATL: Team = {
  id: 'team-atl',
  name: 'Atlantic FC',
  short: 'ATL',
  color: '#C6F24E',
  formation: '4-3-3',
}

const HVU: Team = {
  id: 'team-hvu',
  name: 'Highveld United',
  short: 'HVU',
  color: '#4CC9F0',
  formation: '4-2-3-1',
}

const S = 1_000_000

function evt(
  id: string,
  type: MatchEvent['type'],
  minute: number,
  second: number,
  team: Team,
  extra: Partial<MatchEvent> = {},
): MatchEvent {
  const tUs = (minute * 60 + second) * S
  return {
    id,
    type,
    minute: minute + second / 60,
    tUs,
    teamId: team.id,
    ...extra,
  }
}

export const DEMO_EVENTS: MatchEvent[] = [
  evt('evt-01', 'kickoff', 0, 0, ATL, { outcome: 'Kick-off' }),
  evt('evt-02', 'pass', 1, 24, ATL, { playerId: 'J. Mensah', x: 42, y: 30, endX: 58, endY: 22 }),
  evt('evt-03', 'pass', 3, 2, ATL, { playerId: 'L. Duarte', x: 58, y: 22, endX: 74, endY: 16 }),
  evt('evt-04', 'shot', 6, 12, HVU, {
    playerId: 'S. Nkosi',
    x: 96,
    y: 34,
    outcome: 'Saved low',
    xg: 0.1,
  }),
  evt('evt-05', 'pass', 9, 40, ATL, { playerId: 'K. Okafor', x: 60, y: 48, endX: 44, endY: 40 }),
  evt('evt-06', 'tackle', 12, 18, HVU, { playerId: 'M. Botha', x: 62, y: 38, outcome: 'Won' }),
  evt('evt-07', 'foul', 14, 5, HVU, { playerId: 'M. Botha', x: 66, y: 40, outcome: 'Late challenge' }),
  evt('evt-08', 'card', 14, 20, HVU, { playerId: 'M. Botha', outcome: 'Yellow' }),
  evt('evt-09', 'pass', 17, 50, ATL, { playerId: 'R. van Wyk', x: 30, y: 20, endX: 52, endY: 26 }),
  evt('evt-10', 'shot', 21, 5, ATL, {
    playerId: 'T. Silva',
    x: 88,
    y: 30,
    outcome: 'Blocked',
    xg: 0.48,
  }),
  evt('evt-11', 'goal', 23, 14, ATL, {
    playerId: 'T. Silva',
    x: 92,
    y: 32,
    outcome: 'Left-foot finish',
    xg: 0.31,
  }),
  evt('evt-12', 'pass', 26, 40, ATL, { playerId: 'J. Mensah', x: 50, y: 44, endX: 64, endY: 52 }),
  evt('evt-13', 'pass', 30, 12, HVU, { playerId: 'A. Diallo', x: 70, y: 30, endX: 84, endY: 22 }),
  evt('evt-14', 'tackle', 33, 30, ATL, { playerId: 'K. Okafor', x: 56, y: 40, outcome: 'Won' }),
  evt('evt-15', 'save', 36, 2, HVU, { playerId: 'P. Jacobs', x: 95, y: 44, outcome: 'Tip over' }),
  evt('evt-16', 'goal', 41, 2, HVU, {
    playerId: 'S. Nkosi',
    x: 90,
    y: 40,
    outcome: 'Second-ball finish',
    xg: 0.28,
  }),
  evt('evt-17', 'whistle', 45, 0, ATL, { outcome: 'Half-time' }),
  evt('evt-18', 'kickoff', 45, 1, HVU, { outcome: 'Second half' }),
  evt('evt-19', 'pass', 47, 30, HVU, { playerId: 'A. Diallo', x: 62, y: 26, endX: 48, endY: 20 }),
  evt('evt-20', 'sub', 55, 0, ATL, { playerId: 'N. Abara', outcome: 'On for L. Duarte' }),
  evt('evt-21', 'shot', 58, 20, ATL, {
    playerId: 'N. Abara',
    x: 86,
    y: 52,
    outcome: 'Saved',
    xg: 0.27,
  }),
  evt('evt-22', 'corner', 61, 0, ATL, { playerId: 'J. Mensah', outcome: 'Out-swinging' }),
  evt('evt-23', 'tackle', 63, 45, HVU, { playerId: 'D. Moyo', x: 74, y: 56, outcome: 'Won' }),
  evt('evt-24', 'foul', 66, 10, ATL, { playerId: 'N. Abara', x: 58, y: 44, outcome: 'Stopped counter' }),
  evt('evt-25', 'card', 66, 25, ATL, { playerId: 'N. Abara', outcome: 'Yellow' }),
  evt('evt-26', 'goal', 67, 38, ATL, {
    playerId: 'T. Silva',
    x: 94,
    y: 36,
    outcome: 'First-time finish',
    xg: 0.44,
  }),
  evt('evt-27', 'sub', 72, 0, HVU, { playerId: 'B. Sithole', outcome: 'On for M. Botha' }),
  evt('evt-28', 'shot', 76, 15, HVU, {
    playerId: 'B. Sithole',
    x: 90,
    y: 44,
    outcome: 'Saved',
    xg: 0.22,
  }),
  evt('evt-29', 'sub', 81, 0, ATL, { playerId: 'C. Mensah', outcome: 'On for T. Silva' }),
  evt('evt-30', 'pass', 84, 20, ATL, { playerId: 'C. Mensah', x: 48, y: 34, endX: 62, endY: 28 }),
  evt('evt-31', 'offside', 87, 10, HVU, { playerId: 'S. Nkosi', outcome: 'Flagged' }),
  evt('evt-32', 'whistle', 90, 0, ATL, { outcome: 'Full-time' }),
]

function ref(eventId: string, label: string): EvidenceRef {
  const event = DEMO_EVENTS.find((candidate) => candidate.id === eventId)
  if (!event) throw new Error(`Demo fixture references missing event ${eventId}`)
  return { eventId, tUs: event.tUs, label }
}

function insight(
  id: string,
  claim: string,
  status: Insight['status'],
  evidence: EvidenceRef[],
  updatedAt: string,
  extra: Partial<Insight> = {},
): Insight {
  return {
    id,
    claim,
    status,
    evidenceHash: computeEvidenceHash(evidence),
    evidence,
    updatedAt,
    ...extra,
  }
}

export const DEMO_INSIGHTS: Insight[] = [
  insight(
    'ins-01',
    "Atlantic's left-side overload created the opener: three passes in 14 seconds pulled Highveld's right-back inside before the cut-back.",
    'proposed',
    [
      ref('evt-09', 'Pass into the left half-space'),
      ref('evt-10', 'Blocked shot from the overload'),
      ref('evt-11', 'Opener'),
    ],
    '2026-11-07T20:52:00.000Z',
  ),
  insight(
    'ins-02',
    "Highveld's equaliser came from a second-ball win rather than a sustained sequence.",
    'proposed',
    [
      ref('evt-14', 'Tackle won in midfield'),
      ref('evt-15', 'Save from the first shot'),
      ref('evt-16', 'Equaliser from the rebound'),
    ],
    '2026-11-07T20:56:00.000Z',
  ),
  insight(
    'ins-03',
    'After the 55th-minute substitution Atlantic rest-defended in a 3-2 shape, cutting Highveld transition entries.',
    'proposed',
    [
      ref('evt-20', 'Substitution'),
      ref('evt-23', 'Highveld transition tackle'),
    ],
    '2026-11-07T21:02:00.000Z',
  ),
  insight(
    'ins-04',
    "Highveld's press lost intensity in the final fifteen minutes.",
    'needs_evidence',
    [ref('evt-30', 'Late Atlantic progression')],
    '2026-11-07T21:05:00.000Z',
    {
      limitations: 'No distance-covered or sprint data yet. Needs a tracking export before this can be accepted.',
    },
  ),
  insight(
    'ins-05',
    "Atlantic's winner began with a deliberate foul that stopped Highveld's counter before the ball was recycled.",
    'accepted',
    [
      ref('evt-24', 'Foul to stop the counter'),
      ref('evt-25', 'Yellow card'),
      ref('evt-26', 'Winner'),
    ],
    '2026-11-07T21:10:00.000Z',
    { reviewer: 'You' },
  ),
  {
    ...insight(
      'ins-06',
      'The second goal was assisted from the right half-space after a short corner.',
      'accepted',
      [ref('evt-22', 'Short corner'), ref('evt-26', 'Second goal')],
      '2026-11-07T21:12:00.000Z',
      { reviewer: 'You' },
    ),
    // Deliberately stale: the stored hash was taken against evidence that has
    // since changed. The UI derives `stale` at read time and blocks export.
    evidenceHash: computeEvidenceHash([{ eventId: 'evt-retired', tUs: 1, label: 'Retired evidence' }]),
  },
  insight(
    'ins-07',
    'Highveld deserved a penalty for the 66th-minute challenge.',
    'rejected',
    [ref('evt-24', 'Challenge on the edge of the box')],
    '2026-11-07T21:14:00.000Z',
    { reviewer: 'You', limitations: 'Contact started outside the box; no penalty.' },
  ),
  insight(
    'ins-08',
    'Atlantics xG advantage understates their control because four shots were blocked before reaching the box.',
    'edited',
    [
      ref('evt-10', 'Blocked shot'),
      ref('evt-21', 'Saved shot'),
      ref('evt-28', 'Late save'),
    ],
    '2026-11-07T21:18:00.000Z',
    { reviewer: 'You' },
  ),
]

export const DEMO_MOMENTUM = [
  -0.1, 0.2, 0.35, 0.15, -0.2, 0.45, 0.7, 0.4, -0.35, -0.55, -0.2, 0.25, 0.5, 0.75, 0.35, -0.15,
  0.2, 0.55,
]

export function createDemoProject(): Project {
  return {
    id: DEMO_PROJECT_ID,
    origin: 'demo',
    name: 'Atlantic FC vs Highveld United',
    competition: 'Continental Cup — Matchday 6',
    date: '2026-11-07',
    state: 'review',
    teams: { home: { ...ATL }, away: { ...HVU } },
    score: { home: 2, away: 1 },
    possession: { home: 54, away: 46 },
    durationUs: 90 * 60 * S,
    fps: 25,
    events: DEMO_EVENTS.map((event) => ({ ...event })),
    insights: DEMO_INSIGHTS.map((item) => ({
      ...item,
      evidence: item.evidence.map((reference) => ({ ...reference })),
    })),
    clips: [
      {
        id: 'clip-01',
        name: 'Build-up to the opener',
        inUs: 1_040 * S,
        outUs: 1_430 * S,
        tags: ['build-up', 'goal'],
      },
      {
        id: 'clip-02',
        name: 'Equaliser transition',
        inUs: 2_000 * S,
        outUs: 2_500 * S,
        tags: ['transition', 'goal'],
      },
      {
        id: 'clip-03',
        name: 'Winner sequence',
        inUs: 3_940 * S,
        outUs: 4_100 * S,
        tags: ['press', 'goal'],
      },
      {
        id: 'clip-04',
        name: 'Late save',
        inUs: 4_540 * S,
        outUs: 4_610 * S,
        tags: ['defending'],
      },
    ],
    exports: [],
    createdAt: DEMO_CREATED_AT,
    updatedAt: DEMO_CREATED_AT,
  }
}

/** xG totals are derived in `stats.ts`; the fixture stores only event-level xG. */
