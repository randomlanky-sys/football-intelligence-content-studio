import { describe, expect, test } from 'vitest';
import { z } from 'zod';
import { importFromCsv, parseCsv, toCsv, validateImport } from './index';

describe('CSV parsing', () => {
  test('parses quoted fields with commas', () => {
    const rows = parseCsv('name,note\n"Smith, J","Said ""hello"""\n');
    expect(rows).toEqual([
      ['name', 'note'],
      ['Smith, J', 'Said "hello"'],
    ]);
  });

  test('handles CRLF and trailing blank lines', () => {
    const rows = parseCsv('a,b\r\n1,2\r\n\r\n');
    expect(rows).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });

  test('round-trips through toCsv', () => {
    const rows = [
      ['name', 'note'],
      ['Smith, J', 'line1\nline2'],
    ];
    expect(parseCsv(toCsv(rows))).toEqual(rows);
  });
});

describe('import validation', () => {
  const schema = z.object({
    minute: z.coerce.number().int().min(0).max(130),
    type: z.enum(['shot', 'pass', 'tackle']),
  });

  test('reports row-indexed errors and keeps valid rows', () => {
    const result = validateImport(
      [
        { minute: '12', type: 'shot' },
        { minute: 'nope', type: 'pass' },
        { minute: '40', type: 'header' },
      ],
      schema,
    );
    expect(result.valid).toHaveLength(1);
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0]?.row).toBe(2);
    expect(result.errors[0]?.issues[0]?.path).toBe('minute');
  });

  test('maps CSV data rows to line numbers starting at 2', () => {
    const result = importFromCsv('minute,type\n12,shot\nbad,pass\n', schema);
    expect(result.valid).toHaveLength(1);
    expect(result.errors[0]?.row).toBe(3);
  });

  test('returns empty result for empty input', () => {
    expect(importFromCsv('', schema)).toEqual({ valid: [], errors: [] });
  });
});
