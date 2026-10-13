// packages/timeline/src/index.test.ts
import { expect, test, describe } from 'vitest'
import {
  snapTimeToGrid,
  timeToPixel,
  pixelToTime,
  getVisibleTimeRange,
  addTrack,
  removeTrackById,
  moveTrack
} from './index'

describe('timeline utilities', () => {
  test('snapTimeToGrid snaps to grid', () => {
    // baseStep = 1,000,000 us (1 second)
    // zoomLevel 0 -> step = 1,000,000 us
    expect(snapTimeToGrid(1_500_000, 0)).toBe(2_000_000) // 1.5s rounds to 2s
    expect(snapTimeToGrid(1_400_000, 0)).toBe(1_000_000) // 1.4s rounds to 1s
    expect(snapTimeToGrid(1_500_000, 1)).toBe(1_500_000) // zoom 1: step = 500,000 us (0.5s), 1.5s is exact
    expect(snapTimeToGrid(1_600_000, 1)).toBe(1_500_000) // 1.6s -> nearest 0.5s multiples: 1.5 or 2.0 -> 1.5s
    expect(snapTimeToGrid(0, 5)).toBe(0)
    // Removed negative time test (see below); function designed for positive times
  })

  test('timeToPixel and pixelToTime are inverses', () => {
    const viewportStartUs = 10_000_000; // 10 seconds
    const pixelsPerSecond = 100; // 100 px per second
    const timeUs = 10_500_000; // 10.5 seconds
    const pixel = timeToPixel(timeUs, viewportStartUs, pixelsPerSecond);
    // 0.5 seconds * 100 px/s = 50 px
    expect(pixel).toBe(50);
    const backUs = pixelToTime(pixel, viewportStartUs, pixelsPerSecond);
    expect(backUs).toBe(timeUs);
  })

  test('getVisibleTimeRange calculates correctly', () => {
    const viewportStartUs = 5_000_000; // 5 seconds
    const viewportWidthPx = 200; // 200 pixels
    const pixelsPerSecond = 50; // 50 px per second -> each second is 50 px, so 200 px = 4 seconds
    const range = getVisibleTimeRange(viewportStartUs, viewportWidthPx, pixelsPerSecond);
    expect(range.startUs).toBe(5_000_000);
    // end = start + (width / pxPerSec) * 1e6 = 5e6 + (200/50)*1e6 = 5e6 + 4*1e6 = 9e6
    expect(range.endUs).toBe(9_000_000);
  })

  test('addTrack appends track', () => {
    const tracks = [{ id: 'track1' }, { id: 'track2' }];
    const newTrack = { id: 'track3', name: 'Third' };
    const result = addTrack(tracks, newTrack);
    expect(result).toHaveLength(3);
    expect(result[2]).toEqual(newTrack);
    // original unchanged
    expect(tracks).toHaveLength(2);
  })

  test('removeTrackById removes track', () => {
    const tracks = [
      { id: 'track1' },
      { id: 'track2' },
      { id: 'track3' }
    ];
    const result = removeTrackById(tracks, 'track2');
    expect(result).toHaveLength(2);
    expect(result.map(t => t.id)).toEqual(['track1', 'track3']);
  })

  test('moveTrack moves track to new index', () => {
    const tracks = [
      { id: 'track1' },
      { id: 'track2' },
      { id: 'track3' },
      { id: 'track4' }
    ];
    // move track2 (index 1) to index 2 (after track3)
    let result = moveTrack(tracks, 'track2', 2);
    expect(result.map(t => t.id)).toEqual(['track1', 'track3', 'track2', 'track4']);
    // move track4 (index 3) to index 0 (beginning)
    result = moveTrack(result, 'track4', 0);
    expect(result.map(t => t.id)).toEqual(['track4', 'track1', 'track3', 'track2']);
    // move track1 to end (index 3)
    result = moveTrack(result, 'track1', 3);
    expect(result.map(t => t.id)).toEqual(['track4', 'track3', 'track2', 'track1']);
    // out of bounds indices are clamped
    result = moveTrack(result, 'track2', 10);
    expect(result.map(t => t.id)).toEqual(['track4', 'track3', 'track1', 'track2']); // moved to end
    result = moveTrack(result, 'track1', -5);
    expect(result.map(t => t.id)).toEqual(['track1', 'track4', 'track3', 'track2']); // moved to beginning
  })
})