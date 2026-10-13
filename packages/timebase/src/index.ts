// packages/timebase/src/index.ts
/**
 * Returns current time in microseconds since Unix epoch.
 * Uses Date.now() which returns milliseconds since epoch.
 */
export function nowMicros(): number {
  const ms = Date.now();
  return ms * 1000;
}

/**
 * Returns the presentation timestamp (in microseconds) for the frame at the given index.
 * If index is out of bounds, returns 0.
 * @param ptsTable - Array of presentation timestamps in microseconds for each frame.
 * @param index - Zero-based frame index.
 */
export function stepFrame(ptsTable: number[], index: number): number {
  if (index < 0 || index >= ptsTable.length) {
    return 0;
  }
  const val = ptsTable[index]!;
  // Assuming the array does not contain undefined values (timestamps are numbers)
  return val as number;
}

/**
 * Performs a binary search to find the index of the frame with the largest presentation timestamp
 *  that is less than or equal to the target time.
 * Returns -1 if no such frame exists (i.e., target time is before the first frame).
 * @param ptsTable - Sorted array of presentation timestamps in microseconds for each frame.
 * @param targetTimeUs - Target time in microseconds.
 */
export function seekToFrame(ptsTable: number[], targetTimeUs: number): number {
  if (ptsTable.length === 0 || targetTimeUs < ptsTable[0]) {
    return -1;
  }

  let low = 0;
  let high = ptsTable.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    // @ts-ignore:suppressTypeChecked
    const midVal = ptsTable[mid];
    // Assuming the array does not contain undefined values (timestamps are numbers)
    if (midVal === targetTimeUs) {
      return mid;
    } else if (midVal < targetTimeUs) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  // After loop, high is the index of the largest value <= targetTimeUs
  return high;
}