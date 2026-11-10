import { describe, expect, test, vi } from 'vitest';
import {
  clamp,
  cx,
  debounce,
  deepClone,
  formatBytes,
  formatNumber,
  formatPercent,
  formatRelativeTime,
  slugify,
  truncate,
  validateFormField,
} from './index';

describe('class and number helpers', () => {
  test('cx joins truthy classes', () => {
    expect(cx('a', false, undefined, 'b', null)).toBe('a b');
  });

  test('clamp bounds values', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
    expect(clamp(Number.NaN, 2, 10)).toBe(2);
  });

  test('formatNumber groups thousands and keeps fractions', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(1000000)).toBe('1,000,000');
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(-100)).toBe('-100');
    expect(formatNumber(1234.567, 2)).toBe('1,234.57');
    expect(formatNumber(Number.NaN)).toBe('—');
  });

  test('formatPercent and formatBytes are human readable', () => {
    expect(formatPercent(0.543, 1)).toBe('54.3%');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
  });
});

describe('validation', () => {
  test('validateFormField validates text, number, email and url', () => {
    expect(validateFormField('hello', 'text')).toBe(true);
    expect(validateFormField('   ', 'text')).toBe(false);
    expect(validateFormField(42, 'number')).toBe(true);
    expect(validateFormField(Number.NaN, 'number')).toBe(false);
    expect(validateFormField('test@example.com', 'email')).toBe(true);
    expect(validateFormField('not-an-email', 'email')).toBe(false);
    expect(validateFormField('https://example.com', 'url')).toBe(true);
    expect(validateFormField('ftp://example.com', 'url')).toBe(false);
  });
});

describe('timing and cloning', () => {
  test('debounce collapses rapid calls into one trailing call', () => {
    vi.useFakeTimers();
    try {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      debounced('a');
      debounced('b');
      debounced('c');
      expect(fn).not.toHaveBeenCalled();
      vi.advanceTimersByTime(99);
      expect(fn).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('c');
    } finally {
      vi.useRealTimers();
    }
  });

  test('debounce cancel prevents the call', () => {
    vi.useFakeTimers();
    try {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      debounced();
      debounced.cancel();
      vi.advanceTimersByTime(200);
      expect(fn).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  test('deepClone creates an independent copy', () => {
    const original = { name: 'test', nested: { value: 42 } };
    const cloned = deepClone(original);
    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned.nested).not.toBe(original.nested);
  });
});

describe('text helpers', () => {
  test('truncate keeps whole words', () => {
    expect(truncate('the quick brown fox jumps', 15)).toBe('the quick brown…');
    expect(truncate('short', 15)).toBe('short');
  });

  test('slugify produces stable ids', () => {
    expect(slugify('Atlantic FC — Match 6!')).toBe('atlantic-fc-match-6');
  });

  test('formatRelativeTime handles recent and older values', () => {
    const now = Date.parse('2026-11-09T12:00:00.000Z');
    expect(formatRelativeTime('2026-11-09T11:59:30.000Z', now)).toBe('just now');
    expect(formatRelativeTime('2026-11-09T11:55:00.000Z', now)).toBe('5 minutes ago');
    expect(formatRelativeTime('2026-11-09T09:00:00.000Z', now)).toBe('3 hours ago');
    expect(formatRelativeTime('not-a-date', now)).toBe('unknown');
  });
});
