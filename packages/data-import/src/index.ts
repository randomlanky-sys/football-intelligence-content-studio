import { z } from 'zod';

/**
 * RFC-4180-style CSV parser: quoted fields, escaped quotes, CRLF/LF, and
 * trailing blank lines. Returns rows of raw cell strings.
 */
export function parseCsv(csvString: string): string[][] {
  if (!csvString) return [];

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < csvString.length; i += 1) {
    const char = csvString[i];

    if (inQuotes) {
      if (char === '"') {
        if (csvString[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(cell.trim());
      cell = '';
    } else if (char === '\n') {
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = '';
    } else if (char === '\r') {
      if (csvString[i + 1] !== '\n') {
        row.push(cell.trim());
        rows.push(row);
        row = [];
        cell = '';
      }
    } else {
      cell += char;
    }
  }

  row.push(cell.trim());
  rows.push(row);

  return rows.filter((candidate) => candidate.some((value) => value.length > 0));
}

export function parseJson(jsonString: string): unknown {
  return JSON.parse(jsonString) as unknown;
}

export interface ImportError {
  row: number;
  issues: { path: string; message: string }[];
}

export interface ImportResult<T> {
  valid: T[];
  errors: ImportError[];
}

/**
 * Validate an array of records. Row numbers are 1-based array positions.
 */
export function validateImport<T>(data: unknown[], schema: z.ZodType<T>): ImportResult<T> {
  const valid: T[] = [];
  const errors: ImportError[] = [];

  data.forEach((row, index) => {
    const result = schema.safeParse(row);
    if (result.success) {
      valid.push(result.data);
    } else {
      errors.push({
        row: index + 1,
        issues: result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
  });

  return { valid, errors };
}

/**
 * Parse a CSV with a header row and validate each data record. Data rows are
 * numbered from 2 so the number matches the line a user sees in the file.
 */
export function importFromCsv<T>(csvString: string, schema: z.ZodType<T>): ImportResult<T> {
  const rows = parseCsv(csvString);
  const header = rows[0];
  if (!header || header.length === 0) return { valid: [], errors: [] };

  const records = rows.slice(1).map((row) => {
    const record: Record<string, string> = {};
    header.forEach((column, index) => {
      record[column] = row[index] ?? '';
    });
    return record;
  });

  const result = validateImport(records, schema);
  return {
    valid: result.valid,
    errors: result.errors.map((error) => ({ ...error, row: error.row + 1 })),
  };
}

export function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

export function toCsv(rows: string[][]): string {
  return rows.map((row) => row.map(csvEscape).join(',')).join('\n');
}
