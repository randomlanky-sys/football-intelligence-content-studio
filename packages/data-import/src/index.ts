// packages/data-import/src/index.ts
import { z } from 'zod';

/**
 * Simple CSV parser that returns rows of strings.
 * @param csvString - The CSV content as a string.
 * @returns A 2D array of strings representing the rows and cells.
 */
export function parseCsv(csvString: string): string[][] {
  if (!csvString) {
    return [];
  }
  const lines = csvString.split('\n');
  return lines.map(line => line.split(',').map(cell => cell.trim()));
}

/**
 * Simple JSON parser.
 * @param jsonString - The JSON content as a string.
 * @returns A parsed JavaScript object.
 */
export function parseJson(jsonString: string): any {
  return JSON.parse(jsonString);
}

/**
 * Simple data import validation.
 * @param data - The data to validate.
 * @param schema - The Zod schema to validate against.
 * @returns An object with valid data and errors.
 */
export function validateImport(
  data: any[],
  schema: z.ZodSchema
): { valid: any[]; errors: { row: number; issues: z.ZodIssue[] }[] } {
  const valid: any[] = [];
  const errors: { row: number; issues: z.ZodIssue[] }[] = [];

  for (let i = 0; i < data.length; i++) {
    const row: any = data[i];
    const result = schema.safeParse(row);
    if (result.success) {
      valid.push(row);
    } else {
      errors.push({ row: i + 1, issues: result.error.issues });
    }
  }

  return { valid, errors };
}

/**
 * Simple CSV to schema import.
 * @param csvString - The CSV content as a string.
 * @param schema - The Zod schema defining expected columns.
 * @returns An object with valid data and errors.
 */
export function importFromCsv(
  csvString: string,
  schema: z.ZodSchema
): { valid: any[]; errors: { row: number; issues: z.ZodIssue[] }[] } {
  const lines = csvString.split('\n');
  if (lines.length === 0) {
    return { valid: [], errors: [] };
  }

  const headers = lines[0].split(',');
  const dataLines: any[] = lines.slice(1);

  const data: any[] = [];
  for (let i = 0; i < dataLines.length; i++) {
    const row: any = dataLines[i];
    const obj: Record<string, any> = {};
    for (let hIndex = 0; hIndex < headers.length; hIndex++) {
      const header = headers[hIndex];
      // $FlowFixMe $FlowExpectedError
      obj[header] = row[hIndex];
    }
    data.push(obj);
  }

  return validateImport(data, schema);
}