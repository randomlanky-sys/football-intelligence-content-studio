/**
 * Shared UI utilities: formatting, validation, and small DOM-free helpers.
 * This package deliberately has no React dependency so it can be unit-tested
 * and imported from server or client code alike.
 */

/** Collapse conditional class names. */
export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter((value): value is string => Boolean(value)).join(' ');
}

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

export type FieldType = 'text' | 'number' | 'email' | 'url';

/** Validate a single form value. Empty text is invalid; numbers must be finite. */
export function validateFormField(value: unknown, type: FieldType): boolean {
  switch (type) {
    case 'text':
      return typeof value === 'string' && value.trim().length > 0;
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    case 'email':
      return (
        typeof value === 'string' &&
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
      );
    case 'url':
      return typeof value === 'string' && /^https?:\/\/[^\s]+$/i.test(value.trim());
    default:
      return false;
  }
}

/**
 * Debounce a function. The returned wrapper exposes `cancel` so callers can
 * stop a pending call on unmount.
 */
export interface DebouncedFunction<Args extends unknown[]> {
  (...args: Args): void;
  cancel: () => void;
}

export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delayMs: number,
): DebouncedFunction<Args> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const wrapped = (...args: Args): void => {
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      fn(...args);
    }, Math.max(0, delayMs));
  };

  wrapped.cancel = (): void => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  };

  return wrapped;
}

/** Deep clone via structuredClone when available, JSON otherwise. */
export function deepClone<T>(value: T): T {
  if (typeof globalThis.structuredClone === 'function') {
    return globalThis.structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Thousands separators without locale surprises. */
export function formatNumber(value: number, fractionDigits = 0): string {
  if (!Number.isFinite(value)) return '—';
  const fixed = fractionDigits > 0 ? value.toFixed(fractionDigits) : Math.trunc(value).toString();
  const [whole, fraction] = fixed.split('.');
  const sign = whole?.startsWith('-') ? '-' : '';
  const digits = sign ? whole?.slice(1) ?? '' : whole ?? '';
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return fraction ? `${sign}${grouped}.${fraction}` : `${sign}${grouped}`;
}

/** `54.3%` style percentage from a 0–1 ratio. */
export function formatPercent(ratio: number, fractionDigits = 0): string {
  if (!Number.isFinite(ratio)) return '—';
  return `${(ratio * 100).toFixed(fractionDigits)}%`;
}

/** Compact byte sizes for storage usage. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes < 1024) return `${Math.trunc(bytes)} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = units[0] ?? 'KB';
  for (let i = 1; i < units.length && value >= 1024; i += 1) {
    value /= 1024;
    unit = units[i] ?? unit;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${unit}`;
}

/** Relative time for "updated 3 minutes ago" labels. */
export function formatRelativeTime(iso: string, nowMs = Date.now()): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return 'unknown';
  const diffSeconds = Math.round((nowMs - then) / 1000);
  if (diffSeconds < 45) return 'just now';
  if (diffSeconds < 90) return 'a minute ago';
  const minutes = Math.round(diffSeconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? 'an hour ago' : `${hours} hours ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return days === 1 ? 'yesterday' : `${days} days ago`;
  return new Date(then).toLocaleDateString();
}

/** Truncate to a word boundary and add an ellipsis. */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const slice = text.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(' ');
  return `${(lastSpace > maxLength * 0.6 ? slice.slice(0, lastSpace) : slice).trimEnd()}…`;
}

/** Normalise a slug for ids and filenames. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}
