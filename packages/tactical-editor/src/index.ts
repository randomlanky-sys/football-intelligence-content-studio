// packages/tactical-editor/src/index.ts
/**
 * Convert frame index to timestamp in microseconds given fps.
 * Same as video-engine frameToTimeUs but kept for editor-specific usage.
 */
export function frameToTimestampUs(frameIndex: number, fps: number): number {
  if (frameIndex < 0) {
    return 0;
  }
  const seconds = frameIndex / fps;
  return Math.round(seconds * 1_000_000);
}

/**
 * Convert timestamp in microseconds to frame index given fps.
 * Same as video-engine timeToFrameUs.
 */
export function timestampToFrameUs(timestampUs: number, fps: number): number {
  if (timestampUs < 0) {
    return 0;
  }
  const seconds = timestampUs / 1_000_000;
  return Math.floor(seconds * fps);
}

/**
 * Create a basic annotation object.
 * @param type - Annotation type (e.g., 'arrow', 'circle', 'text').
 * @param frame - Frame index where annotation appears.
 * @param props - Type-specific properties.
 */
export function createAnnotation(type: string, frame: number, props: Record<string, any>): any {
  return {
    type,
    frame,
    props,
    id: Math.random().toString(36).substr(2, 9), // simple placeholder ID
    timestamp: Date.now(),
  };
}

/**
 * Check if a tool is active based on current tool state.
 * @param currentTool - Currently selected tool identifier.
 * @param toolToCheck - Tool identifier to check against.
 */
export function isToolActive(currentTool: string | null, toolToCheck: string): boolean {
  return currentTool === toolToCheck;
}

/**
 * Get the opposite team identity for a given team identity.
 * Assumes identity is 'home' or 'away'.
 * @param identity - Team identity ('home' or 'away').
 * @returns Opposite identity.
 */
export function getOppositeTeam(identity: 'home' | 'away'): 'home' | 'away' {
  return identity === 'home' ? 'away' : 'home';
}