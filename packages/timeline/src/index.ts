// packages/timeline/src/index.ts
/**
 * Snap a time value to the nearest grid step based on zoom level.
 * @param timeUs - Time in microseconds.
 * @param zoomLevel - Zoom level (higher = more granular). 
 *                    Defines the grid step in microseconds: step = baseStep / (2^zoomLevel)
 * @param baseStep - Base grid step in microseconds at zoom level 0 (default: 1 second = 1,000,000 us).
 * @returns Snapped time in microseconds.
 */
export function snapTimeToGrid(timeUs: number, zoomLevel: number, baseStep: number = 1_000_000): number {
  if (zoomLevel < 0) {
    zoomLevel = 0;
  }
  const step = baseStep / Math.pow(2, zoomLevel);
  return Math.round(timeUs / step) * step;
}

/**
 * Convert time in microseconds to pixel position relative to viewport start.
 * @param timeUs - Time in microseconds.
 * @param viewportStartUs - Start time of the viewport in microseconds.
 * @param pixelsPerSecond - Horizontal scale (pixels per second of time).
 * @returns Pixel position (can be negative or > viewport width).
 */
export function timeToPixel(timeUs: number, viewportStartUs: number, pixelsPerSecond: number): number {
  const timeDiffUs = timeUs - viewportStartUs;
  const seconds = timeDiffUs / 1_000_000;
  return seconds * pixelsPerSecond;
}

/**
 * Convert pixel position to time in microseconds relative to viewport start.
 * @param pixel - Pixel position.
 * @param viewportStartUs - Start time of the viewport in microseconds.
 * @param pixelsPerSecond - Horizontal scale (pixels per second of time).
 * @returns Time in microseconds.
 */
export function pixelToTime(pixel: number, viewportStartUs: number, pixelsPerSecond: number): number {
  const seconds = pixel / pixelsPerSecond;
  const timeUs = viewportStartUs + seconds * 1_000_000;
  return timeUs;
}

/**
 * Calculate the visible time range given viewport start, width, and scale.
 * @param viewportStartUs - Start time of the viewport in microseconds.
 * @param viewportWidthPx - Width of the viewport in pixels.
 * @param pixelsPerSecond - Horizontal scale (pixels per second of time).
 * @returns Object with start and end times in microseconds.
 */
export function getVisibleTimeRange(viewportStartUs: number, viewportWidthPx: number, pixelsPerSecond: number): { startUs: number; endUs: number } {
  const startUs = viewportStartUs;
  const endUs = viewportStartUs + (viewportWidthPx / pixelsPerSecond) * 1_000_000;
  return { startUs, endUs };
}

/**
 * Add a track to the timeline.
 * @param tracks - Array of existing track objects.
 * @param track - Track object to add.
 * @returns New array with track appended.
 */
export function addTrack<T extends { id: string }>(tracks: T[], track: T): T[] {
  return [...tracks, track];
}

/**
 * Remove a track by ID.
 * @param tracks - Array of track objects.
 * @param trackId - ID of the track to remove.
 * @returns New array with track removed.
 */
export function removeTrackById<T extends { id: string }>(tracks: T[], trackId: string): T[] {
  return tracks.filter(track => track.id !== trackId);
}

/**
 * Move a track to a new index.
 * @param tracks - Array of track objects.
 * @param trackId - ID of the track to move.
 * @param newIndex - New index position.
 * @returns New array with track moved.
 */
export function moveTrack<T extends { id: string }>(tracks: T[], trackId: string, newIndex: number): T[] {
  const trackIndex = tracks.findIndex(track => track.id === trackId);
  if (trackIndex === -1) {
    return tracks;
  }
  const updated = [...tracks];
  const removedArray = updated.splice(trackIndex, 1);
  const removed = removedArray[0];
  // Since trackIndex is valid, removed should not be undefined.
  // However, TypeScript doesn't know that, so we check.
  if (removed === undefined) {
    // This should not happen, but to satisfy typecheck we return early.
    return tracks;
  }
  // Clamp newIndex to valid range
  const clampedIndex = Math.max(0, Math.min(newIndex, updated.length));
  updated.splice(clampedIndex, 0, removed);
  return updated;
}