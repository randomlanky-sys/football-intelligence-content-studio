export type Vec3 = [number, number, number]

export type Team = 'home' | 'away'

export interface Player {
  id: number
  team: Team
  role: string
  from: [number, number]
  to: [number, number]
}

export interface PassStep {
  from: number
  to: number
  label: string
  xg: number
}

export interface PassEdge {
  a: number
  b: number
  weight: number
}

export interface XgEvent {
  minute: number
  xg: number
  label: string
}

export const COLORS = {
  home: '#FF5C7A',
  away: '#4FC3F7',
  ball: '#FFF7E6',
  accent: '#FCD34D',
  line: '#FFFFFF',
  glass: '#BFE9FF',
  deep: '#05070A',
} as const

const HOME_KICKOFF: Array<[number, number]> = [
  [0, -46],
  [-24, -30],
  [-9, -33],
  [9, -33],
  [24, -30],
  [-18, -14],
  [0, -16],
  [18, -14],
  [-24, 6],
  [0, 10],
  [24, 6],
]

const HOME_PUSH: Array<[number, number]> = [
  [0, -34],
  [-25, -14],
  [-10, -8],
  [10, -8],
  [25, -14],
  [-20, 4],
  [0, 2],
  [20, 4],
  [-25, 20],
  [0, 24],
  [25, 20],
]

const AWAY_KICKOFF: Array<[number, number]> = [
  [0, 46],
  [-24, 30],
  [-9, 33],
  [9, 33],
  [24, 30],
  [-12, 16],
  [12, 16],
  [-22, -6],
  [0, -8],
  [22, -6],
  [0, -12],
]

const AWAY_DROP: Array<[number, number]> = [
  [0, 50],
  [-22, 38],
  [-8, 40],
  [8, 40],
  [22, 38],
  [-12, 26],
  [12, 26],
  [-24, 12],
  [0, 10],
  [24, 12],
  [0, 4],
]

const HOME_ROLES = ['GK', 'LB', 'LCB', 'RCB', 'RB', 'LCM', 'CM', 'RCM', 'LW', 'ST', 'RW']
const AWAY_ROLES = ['GK', 'LB', 'LCB', 'RCB', 'RB', 'LDM', 'RDM', 'LAM', 'CAM', 'RAM', 'ST']

export const HOME_PLAYERS: Player[] = HOME_KICKOFF.map((from, i) => ({
  id: i,
  team: 'home' as const,
  role: HOME_ROLES[i],
  from,
  to: HOME_PUSH[i],
}))

export const AWAY_PLAYERS: Player[] = AWAY_KICKOFF.map((from, i) => ({
  id: 100 + i,
  team: 'away' as const,
  role: AWAY_ROLES[i],
  from,
  to: AWAY_DROP[i],
}))

export const PLAYERS: Player[] = [...HOME_PLAYERS, ...AWAY_PLAYERS]

export const PASS_SEQUENCE: PassStep[] = [
  { from: 2, to: 5, label: 'Central build-up begins', xg: 0.02 },
  { from: 5, to: 6, label: 'Rotation frees the pivot', xg: 0.03 },
  { from: 6, to: 7, label: 'Half-space entry', xg: 0.08 },
  { from: 7, to: 10, label: 'Switch of play', xg: 0.11 },
  { from: 10, to: 9, label: 'Cut-back into the corridor', xg: 0.24 },
  { from: 9, to: 8, label: 'Late runner arrives', xg: 0.36 },
  { from: 8, to: 9, label: 'One-two in the box', xg: 0.44 },
  { from: 9, to: 7, label: 'Recycle and re-load', xg: 0.12 },
]

export const PASS_EDGES: PassEdge[] = [
  { a: 2, b: 3, weight: 0.8 },
  { a: 3, b: 4, weight: 0.7 },
  { a: 3, b: 5, weight: 0.9 },
  { a: 4, b: 6, weight: 0.6 },
  { a: 5, b: 6, weight: 0.95 },
  { a: 5, b: 7, weight: 0.7 },
  { a: 6, b: 7, weight: 0.85 },
  { a: 6, b: 8, weight: 0.6 },
  { a: 7, b: 8, weight: 0.75 },
  { a: 7, b: 10, weight: 0.8 },
  { a: 8, b: 9, weight: 0.9 },
  { a: 9, b: 10, weight: 0.85 },
  { a: 8, b: 9, weight: 0.9 },
  { a: 9, b: 6, weight: 0.55 },
]

export const XG_EVENTS: XgEvent[] = [
  { minute: 12, xg: 0.06, label: 'Header, set piece' },
  { minute: 27, xg: 0.18, label: 'Edge-of-box strike' },
  { minute: 41, xg: 0.31, label: 'One-v-one, left channel' },
  { minute: 58, xg: 0.44, label: 'Cut-back, six-yard' },
  { minute: 74, xg: 0.62, label: 'Penalty area overload' },
  { minute: 89, xg: 0.08, label: 'Long-range effort' },
]

export const PITCH = {
  width: 68,
  length: 105,
  halfWidth: 34,
  halfLength: 52.5,
} as const

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

/**
 * Deterministic player position at scene time `t` (seconds).
 * Pure function so every layer of the scene agrees on the layout.
 */
export function playerPosition(p: Player, t: number): Vec3 {
  const speed = p.team === 'home' ? 0.1 : 0.08
  const phase = p.id * 0.37
  const k = 0.5 - 0.5 * Math.cos(t * speed + phase)
  const sway = Math.sin(t * 0.6 + phase) * 1.1
  const x = lerp(p.from[0], p.to[0], k) + sway
  const z = lerp(p.from[1], p.to[1], k) + Math.cos(t * 0.45 + phase) * 1.4
  const y = 0.95 + Math.sin(t * 2.2 + phase) * 0.05
  return [x, y, z]
}

export const PASS_PERIOD = 1.9

export function ballState(t: number) {
  const idx = Math.floor(t / PASS_PERIOD) % PASS_SEQUENCE.length
  const frac = (t % PASS_PERIOD) / PASS_PERIOD
  const step = PASS_SEQUENCE[idx]
  const scorer = HOME_PLAYERS[step.from]
  const receiver = HOME_PLAYERS[step.to]
  const a = playerPosition(scorer, t)
  const b = playerPosition(receiver, t)
  const eased = frac * frac * (3 - 2 * frac)
  const x = lerp(a[0], b[0], eased)
  const z = lerp(a[2], b[2], eased)
  const y = 0.55 + Math.sin(Math.PI * frac) * 1.35
  return { x, y, z, from: a, to: b, frac, step, idx }
}
