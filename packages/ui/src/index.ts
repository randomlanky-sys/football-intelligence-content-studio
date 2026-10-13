// packages/ui/src/index.ts
/**
 * Shared UI utilities for the Football Intelligence & Content Studio.
 *
 * Provides utility functions for:
 * - State management
 * - Form handling
 * - Validation
 * - Component utilities
 */
export function useState<T>(initialValue: T): [T, (newValue: T) => void] {
  // Placeholder: In a real React application, this would use React's useState hook.
  // For this placeholder, we return the initial value and a no-op setter.
  const setValue = () => {};
  return [initialValue, setValue];
}

/**
 * Validate a form field value based on a given type.
 * @param value - The value to validate.
 * @param type - The type of validation to perform.
 * @returns True if the value is valid, false otherwise.
 */
export function validateFormField(value: any, type: 'text' | 'number' | 'email'): boolean {
  switch (type) {
    case 'text':
      return typeof value === 'string' && value.length > 0;
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'email':
      return typeof value === 'string' &&/@/.test(value);
    default:
      return false;
  }
}

/**
 * Debounce a function call.
 * @param fn - The function to debounce.
 * @param delay - The delay in milliseconds.
 * @returns A debounced function.
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Deep clone a value.
 * @param obj - The value to clone.
 * @returns A deep copy of the value.
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Format a number with comma separators.
 * @param num - The number to format.
 * @returns The formatted number string.
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}