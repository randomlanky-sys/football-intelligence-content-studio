// packages/geometry/src/index.ts
/**
 * Converts meters to pixels given pixels-per-meter (ppm).
 * @param meters - Distance in meters.
 * @param ppm - Pixels per meter (resolution factor).
 */
export function metersToPixels(meters: number, ppm: number): number {
  return meters * ppm;
}

/**
 * Converts pixels to meters given pixels-per-meter (ppm).
 * @param pixels - Distance in pixels.
 * @param ppm - Pixels per meter (resolution factor).
 */
export function pixelsToMeters(pixels: number, ppm: number): number {
  return pixels / ppm;
}

/**
 * Applies a 3x3 homography matrix to a 2D point.
 * The homography matrix H is assumed to be in column-major order as a flat array:
 * H = [h11 h12 h13;
 *      h21 h22 h23;
 *      h31 h32 h33]
 * @param point - Input point {x, y}.
 * @param H - 9-element homography matrix flatten row-major: [h11, h12, h13, h21, h22, h23, h31, h32, h33].
 * @returns Transformed point {x, y} in homography-normalized coordinates.
 */
export function applyHomography(point: {x: number; y: number}, H: number[]): {x: number; y: number} {
  // Assume the array contains exactly 9 numbers
  const h11 = H[0] as number;
  const h12 = H[1] as number;
  const h13 = H[2] as number;
  const h21 = H[3] as number;
  const h22 = H[4] as number;
  const h23 = H[5] as number;
  const h31 = H[6] as number;
  const h32 = H[7] as number;
  const h33 = H[8] as number;

  const w = h31 * point.x + h32 * point.y + h33;
  if (w === 0) {
    return {x: 0, y: 0};
  }
  const x = (h11 * point.x + h12 * point.y + h13) / w;
  const y = (h21 * point.x + h22 * point.y + h23) / w;
  return {x, y};
}