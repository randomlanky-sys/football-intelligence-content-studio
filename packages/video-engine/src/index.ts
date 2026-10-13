// packages/video-engine/src/index.ts
/**
 * Convert frame index to time in microseconds given frames per second.
 * @param frameIndex - Zero-based frame index.
 * @param fps - Frames per second (can be fractional).
 * @returns Time in microseconds.
 */
export function frameToTimeUs(frameIndex: number, fps: number): number {
  if (frameIndex < 0) {
    return 0;
  }
  const seconds = frameIndex / fps;
  return Math.round(seconds * 1_000_000); // microseconds
}

/**
 * Convert time in microseconds to frame index given frames per second.
 * Uses floor to get the frame index at or before the given time.
 * @param timeUs - Time in microseconds.
 * @param fps - Frames per second (can be fractional).
 * @returns Zero-based frame index.
 */
export function timeToFrameUs(timeUs: number, fps: number): number {
  if (timeUs < 0) {
    return 0;
  }
  const seconds = timeUs / 1_000_000;
  return Math.floor(seconds * fps);
}

/**
 * Calculate the duration of a video in microseconds given frame count and fps.
 * @param frameCount - Total number of frames.
 * @param fps - Frames per second.
 * @returns Duration in microseconds.
 */
export function calculateDurationUs(frameCount: number, fps: number): number {
  if (frameCount <= 0) {
    return 0;
  }
  const seconds = frameCount / fps;
  return Math.round(seconds * 1_000_000);
}