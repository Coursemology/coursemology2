import {
  ColumnDef,
  getCoreRowModel,
  Table,
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

const buildHarness = (
  visibility: Record<string, boolean>,
  selectedRowIds?: Record<string, boolean>,
): {
  table: Table<Row>;
  getRealColumn: (id: string) => ColumnTemplate<Row> | undefined;
} => {
  const templates: Record<string, ColumnTemplate<Row>> = {
    name: {
      id: 'name',
      title: 'Name',
      cell: (r) => r.name,
      csvDownloadable: true,
    },
    email: {
      id: 'email',
      title: 'Email',
      cell: (r) => r.email,
      csvDownloadable: true,
    },
    score: {
      id: 'score',
      title: 'Score',
      cell: (r) => r.score,
      csvDownloadable: false,
    },
  };

  const columnDefs: ColumnDef<Row, unknown>[] = Object.values(templates).map(
    (tpl) => ({
      id: tpl.id,
      header: tpl.title as string,
      accessorFn: (row) =>
        (row as unknown as Record<string, unknown>)[tpl.id as string],
      cell: ({ row: { original } }) => tpl.cell(original),
    }),
  );

  const { result } = renderHook(() =>
    useReactTable<Row>({
      data: fixture,
      columns: columnDefs,
      getCoreRowModel: getCoreRowModel(),
      enableRowSelection: true,
      state: {
        columnVisibility: visibility,
        rowSelection: selectedRowIds ?? {},
      },
      onColumnVisibilityChange: () => {},
      onRowSelectionChange: () => {},
    }),
  );

  return {
    table: result.current,
    getRealColumn: (id: string) => templates[id],
  };
};

describe('csvGenerator', () => {
  it('emits headers and rows ordered by visible csv-downloadable columns', async () => {
    const { table, getRealColumn } = buildHarness({
      name: true,
      email: true,
      score: true,
    });

    const csv = await generateCsv({
      table,
      getRealColumn,
    });

    const lines = csv.trim().split(/\r?\n/);
    expect(lines[0]).toBe('Name,Email'); // score has csvDownloadable: false
    expect(lines[1]).toBe('Alice,alice@example.com');
    expect(lines[2]).toBe('Bob,bob@example.com');
  });

  it('excludes hidden columns from output', async () => {
    const { table, getRealColumn } = buildHarness({
      name: true,
      email: false,
      score: true,
    });

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
    const { table, getRealColumn } = buildHarness({
      name: true,
      email: false,
      score: true,
    });

    const csv = await generateCsv({ table, getRealColumn });

    const lines = csv.trim().split(/\r?\n/);
    const headerCount = lines[0].split(',').length;
    lines
      .slice(1)
      .forEach((row) => expect(row.split(',')).toHaveLength(headerCount));
  });

  describe('getExtraHeaderRows', () => {
    it('inserts extra rows between the header row and data rows', async () => {
      const { table, getRealColumn } = buildHarness({
        name: true,
        email: true,
        score: true,
      });

      const csv = await generateCsv({
        table,
        getRealColumn,
        getExtraHeaderRows: () => [['Extra A', 'Extra B']],
      });

      const lines = csv.trim().split(/\r?\n/);
      expect(lines[0]).toBe('Name,Email');
      expect(lines[1]).toBe('Extra A,Extra B');
      expect(lines[2]).toBe('Alice,alice@example.com');
    });

    it('is called with the visible csvDownloadable column ids', async () => {
      const { table, getRealColumn } = buildHarness({
        name: true,
        email: false,
        score: true,
      });
      const getExtraHeaderRows = jest.fn(() => []);

      await generateCsv({ table, getRealColumn, getExtraHeaderRows });

      // email is hidden; score has csvDownloadable: false — only 'name' remains
      expect(getExtraHeaderRows).toHaveBeenCalledWith(['name']);
    });

    it('supports multiple extra rows', async () => {
      const { table, getRealColumn } = buildHarness({
        name: true,
        email: true,
        score: true,
      });

      const csv = await generateCsv({
        table,
        getRealColumn,
        getExtraHeaderRows: () => [
          ['Row1A', 'Row1B'],
          ['Row2A', 'Row2B'],
        ],
      });

      const lines = csv.trim().split(/\r?\n/);
      expect(lines[0]).toBe('Name,Email');
      expect(lines[1]).toBe('Row1A,Row1B');
      expect(lines[2]).toBe('Row2A,Row2B');
      expect(lines[3]).toBe('Alice,alice@example.com');
    });
  });

  it('exports only selected rows when onlySelected is true', async () => {
    // TanStack uses row index as id by default: '0' = Alice, '1' = Bob
    const { table, getRealColumn } = buildHarness(
      { name: true, email: true, score: true },
      { '1': true }, // Bob selected
    );

    const csv = await generateCsv({ table, getRealColumn, onlySelected: true });

    const lines = csv.trim().split(/\r?\n/);
    expect(lines).toHaveLength(2); // header + Bob only
    expect(lines[1]).toBe('Bob,bob@example.com');
  });

  it('respects csvValue override', async () => {
    const { getRealColumn: baseGet, table } = buildHarness({
      name: true,
      email: true,
      score: true,
    });
    const wrapped = (id: string): ColumnTemplate<Row> | undefined =>
      id === 'name'
        ? { ...baseGet('name')!, csvValue: (v: unknown) => `<<${String(v)}>>` }
        : baseGet(id);

    const csv = await generateCsv({ table, getRealColumn: wrapped });
    expect(csv).toContain('<<Alice>>');
  });
});
