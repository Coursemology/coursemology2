import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { renderHook } from '@testing-library/react';

import { ColumnTemplate } from '../builder';
import generateCsv from '../TanStackTableBuilder/csvGenerator';

interface Row {
  id: number;
  name: string;
  email: string;
  score: number;
}

const fixture: Row[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com', score: 90 },
  { id: 2, name: 'Bob', email: 'bob@example.com', score: 80 },
];

const buildHarness = (visibility: Record<string, boolean>) => {
  const templates: Record<string, ColumnTemplate<Row>> = {
    name: { id: 'name', title: 'Name', cell: (r) => r.name, csvDownloadable: true },
    email: { id: 'email', title: 'Email', cell: (r) => r.email, csvDownloadable: true },
    score: { id: 'score', title: 'Score', cell: (r) => r.score, csvDownloadable: false },
  };

  const columnDefs: ColumnDef<Row, unknown>[] = Object.values(templates).map((tpl) => ({
    id: tpl.id,
    header: tpl.title as string,
    accessorFn: (row) => (row as unknown as Record<string, unknown>)[tpl.id as string],
    cell: ({ row: { original } }) => tpl.cell(original),
  }));

  const { result } = renderHook(() =>
    useReactTable<Row>({
      data: fixture,
      columns: columnDefs,
      getCoreRowModel: getCoreRowModel(),
      state: { columnVisibility: visibility },
      onColumnVisibilityChange: () => {},
    }),
  );

  return { table: result.current, getRealColumn: (id: string) => templates[id] };
};

describe('csvGenerator', () => {
  it('emits headers and rows ordered by visible csv-downloadable columns', async () => {
    const { table, getRealColumn } = buildHarness({ name: true, email: true, score: true });

    const csv = await generateCsv({
      table,
      getRealColumn,
    });

    const lines = csv.trim().split(/\r?\n/);
    expect(lines[0]).toBe('Name,Email');           // score has csvDownloadable: false
    expect(lines[1]).toBe('Alice,alice@example.com');
    expect(lines[2]).toBe('Bob,bob@example.com');
  });

  it('excludes hidden columns from output', async () => {
    const { table, getRealColumn } = buildHarness({ name: true, email: false, score: true });

    const csv = await generateCsv({
      table,
      getRealColumn,
    });

    const lines = csv.trim().split(/\r?\n/);
    expect(lines[0]).toBe('Name');
    expect(lines[1]).toBe('Alice');
    expect(lines[2]).toBe('Bob');
  });

  it('row cell count always equals header count', async () => {
    const { table, getRealColumn } = buildHarness({ name: true, email: false, score: true });

    const csv = await generateCsv({ table, getRealColumn });

    const lines = csv.trim().split(/\r?\n/);
    const headerCount = lines[0].split(',').length;
    lines.slice(1).forEach((row) => expect(row.split(',').length).toBe(headerCount));
  });

  it('respects csvValue override', async () => {
    const { getRealColumn: baseGet, table } = buildHarness({ name: true, email: true, score: true });
    const wrapped = (id: string) =>
      id === 'name'
        ? { ...baseGet('name')!, csvValue: (v: unknown) => `<<${v}>>` }
        : baseGet(id);

    const csv = await generateCsv({ table, getRealColumn: wrapped });
    expect(csv).toContain('<<Alice>>');
  });
});
