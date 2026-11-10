/**
 * Timebase helpers. All times are integer microseconds; nothing here assumes a
 * particular frame rate, so the same functions serve preview and export.
 */

export function nowMicros(): number {
  return Date.now() * 1000;
}

export function secondsToMicros(seconds: number): number {
  return Math.round(seconds * 1_000_000);
}

export function microsToSeconds(micros: number): number {
  return micros / 1_000_000;
}

/** Presentation timestamp for a frame index, or 0 when out of bounds. */
export function stepFrame(ptsTable: readonly number[], index: number): number {
  if (!Number.isInteger(index) || index < 0 || index >= ptsTable.length) return 0;
  return ptsTable[index] ?? 0;
}

/**
 * Binary search for the frame with the largest presentation timestamp less than
 * or equal to `targetTimeUs`. Returns -1 when the target precedes the first
 * frame or the table is empty.
 */
export function seekToFrame(ptsTable: readonly number[], targetTimeUs: number): number {
  const first = ptsTable[0];
  if (first === undefined || !Number.isFinite(targetTimeUs) || targetTimeUs < first) return -1;

  let low = 0;
  let high = ptsTable.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midVal = ptsTable[mid];
    if (midVal === undefined) break;
    if (midVal === targetTimeUs) return mid;
    if (midVal < targetTimeUs) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return high;
}

/**
 * Frame index for a time, clamped to the table. Unlike `seekToFrame` this never
 * returns -1: it is the safe choice for UI scrubbing.
 */
export function frameAt(ptsTable: readonly number[], targetTimeUs: number): number {
  const index = seekToFrame(ptsTable, targetTimeUs);
  return index < 0 ? 0 : index;
}

/** Build a constant-rate PTS table. */
export function buildPtsTable(durationUs: number, fps: number): number[] {
  if (durationUs <= 0 || fps <= 0) return [];
  const frameCount = Math.floor((durationUs / 1_000_000) * fps);
  const frameDurationUs = Math.round(1_000_000 / fps);
  const table: number[] = [];
  for (let frame = 0; frame < frameCount; frame += 1) {
    table.push(frame * frameDurationUs);
  }
  return table;
}

/**
 * `M:SS` or `H:MM:SS`, plus optional frames (`MM:SS:FF`) when a frame rate is
 * supplied. Negative inputs clamp to zero.
 */
export function formatTimecode(micros: number, fps?: number): string {
  const safeMicros = Math.max(0, Math.trunc(micros));
  const totalSeconds = Math.floor(safeMicros / 1_000_000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const base =
    hours > 0
      ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      : `${minutes}:${String(seconds).padStart(2, '0')}`;

  if (fps === undefined || fps <= 0) return base;
  const frame = Math.floor(((safeMicros % 1_000_000) / 1_000_000) * fps);
  return `${base}:${String(frame).padStart(2, '0')}`;
}

export function clampTime(micros: number, durationUs: number): number {
  if (!Number.isFinite(micros)) return 0;
  if (micros < 0) return 0;
  if (durationUs > 0 && micros > durationUs) return durationUs;
  return Math.trunc(micros);
}
