import { act, renderHook } from '@testing-library/react';
import { downloadFile } from 'utilities/downloadFile';

import { ColumnTemplate, TableTemplate } from '../builder';
import useTanStackTableBuilder from '../TanStackTableBuilder';

jest.mock('utilities/downloadFile', () => ({
  downloadFile: jest.fn(),
}));

const mockedDownloadFile = jest.mocked(downloadFile);

interface Row {
  id: number;
  name: string;
  email: string;
}

const baseColumns: ColumnTemplate<Row>[] = [
  { id: 'name', title: 'Name', cell: (r) => r.name, csvDownloadable: true },
  { id: 'email', title: 'Email', cell: (r) => r.email, csvDownloadable: true },
];

const baseProps = (
  overrides: Partial<TableTemplate<Row>> = {},
): TableTemplate<Row> => ({
  data: [{ id: 1, name: 'Alice', email: 'alice@example.com' }],
  columns: baseColumns,
  getRowId: (r) => r.id.toString(),
  ...overrides,
});

describe('useTanStackTableBuilder columnPicker state', () => {
  it('initial visibility marks every column visible', () => {
    const { result } = renderHook(() =>
      useTanStackTableBuilder(
        baseProps({
          columnPicker: {
            renderTree: () => null,
            onExport: 'csv' as const,
          },
        }),
      ),
    );

    expect(result.current.toolbar!.getColumnVisibility?.()).toEqual({
      name: true,
      email: true,
    });
  });

  it('locked id cannot be set to false via setVisible', () => {
    const { result } = renderHook(() =>
      useTanStackTableBuilder(
        baseProps({
          columnPicker: {
            renderTree: () => null,
            locked: ['name'],
            onExport: 'csv' as const,
          },
        }),
      ),
    );

    const commit = result.current.toolbar!.commitColumnVisibility!;
    act(() => commit({ name: false, email: true }));

    expect(result.current.toolbar!.getColumnVisibility?.()).toEqual({
      name: true, // forced back to true
      email: true,
    });
  });

  it('setManyVisible toggles only unlocked descendants', () => {
    // This test exercises the contract used by BulkSelectors in PR2 callers:
    // when a branch deselects, locked descendants must remain visible.
    const { result } = renderHook(() =>
      useTanStackTableBuilder(
        baseProps({
          columnPicker: {
            renderTree: () => null,
            locked: ['name'],
            onExport: 'csv' as const,
          },
        }),
      ),
    );

    act(() =>
      result.current.toolbar!.commitColumnVisibility!({
        name: false,
        email: false,
      }),
    );
    expect(result.current.toolbar!.getColumnVisibility?.()).toEqual({
      name: true,
      email: false,
    });
  });

  it('dynamic columns: adding a new column with defaultVisible: false defaults it hidden', () => {
    const { result, rerender } = renderHook(
      ({ extra }: { extra: boolean }) =>
        useTanStackTableBuilder(
          baseProps({
            columns: extra
              ? [
                  ...baseColumns,
                  {
                    id: 'phone',
                    title: 'Phone',
                    cell: (): string => '',
                    csvDownloadable: true,
                    defaultVisible: false,
                  },
                ]
              : baseColumns,
            columnPicker: {
              renderTree: () => null,
              onExport: 'csv' as const,
            },
          }),
        ),
      { initialProps: { extra: false } },
    );

    rerender({ extra: true });

    expect(result.current.toolbar!.getColumnVisibility?.()).toEqual({
      name: true,
      email: true,
      phone: false,
    });
  });

  it('dynamic columns: adding a new column id after mount defaults it visible', () => {
    const { result, rerender } = renderHook(
      ({ extra }: { extra: boolean }) =>
        useTanStackTableBuilder(
          baseProps({
            columns: extra
              ? [
                  ...baseColumns,
                  {
                    id: 'phone',
                    title: 'Phone',
                    cell: (): string => '',
                    csvDownloadable: true,
                  },
                ]
              : baseColumns,
            columnPicker: { renderTree: () => null, onExport: 'csv' as const },
          }),
        ),
      { initialProps: { extra: false } },
    );

    expect(
      Object.keys(result.current.toolbar!.getColumnVisibility?.() ?? {}),
    ).toEqual(['name', 'email']);

    rerender({ extra: true });

    expect(result.current.toolbar!.getColumnVisibility?.()).toEqual({
      name: true,
      email: true,
      phone: true, // new column defaults visible
    });
  });
});

// CSV tests use `of:` (accessorKey) so TanStack can extract values via row.getValue().
// The student statistics table uses the same `of:` pattern.
const csvColumns: ColumnTemplate<Row>[] = [
  { of: 'name', title: 'Name', cell: (r) => r.name, csvDownloadable: true },
  { of: 'email', title: 'Email', cell: (r) => r.email, csvDownloadable: true },
];

describe('useTanStackTableBuilder CSV download', () => {
  beforeEach(() => {
    mockedDownloadFile.mockClear();
  });

  it('CSV contains headers and rows for all csvDownloadable columns', async () => {
    const { result } = renderHook(() =>
      useTanStackTableBuilder(
        baseProps({
          columns: csvColumns,
          csvDownload: { filename: 'test' },
        }),
      ),
    );

    await act(async () => {
      await result.current.toolbar!.onDownloadCsv?.();
    });

    expect(mockedDownloadFile).toHaveBeenCalledTimes(1);
    const csv: string = mockedDownloadFile.mock.calls[0][1];
    const lines = csv.trim().split(/\r?\n/);
    expect(lines[0]).toBe('Name,Email');
    expect(lines[1]).toContain('Alice');
  });

  it('CSV with indices: true still maps columns correctly (student statistics pattern)', async () => {
    // Student statistics sets indexing.indices: true, which prepends an index column
    // at position 0 in getAllLeafColumns(). getRealColumnById must offset correctly.
    const { result } = renderHook(() =>
      useTanStackTableBuilder(
        baseProps({
          columns: csvColumns,
          csvDownload: { filename: 'test' },
          indexing: { indices: true },
        }),
      ),
    );

    await act(async () => {
      await result.current.toolbar!.onDownloadCsv?.();
    });

    expect(mockedDownloadFile).toHaveBeenCalledTimes(1);
    const csv: string = mockedDownloadFile.mock.calls[0][1];
    const lines = csv.trim().split(/\r?\n/);
    // Headers must be Name and Email (not blank or offset titles from wrong template lookup)
    expect(lines[0]).toBe('Name,Email');
    expect(lines[1]).toContain('Alice');
  });

  it('CSV columns using accessorFn (not of) emit correct values', async () => {
    // Regression: assessment columns have no `of` key — they use accessorFn to
    // expose the grade value. row.getValue() must return the fn result, not undefined.
    interface ScoreRow {
      id: number;
      name: string;
      grades: Record<number, number | null>;
    }
    const scoreData: ScoreRow[] = [
      { id: 1, name: 'Alice', grades: { 42: 9 } },
      { id: 2, name: 'Bob', grades: { 42: null } },
    ];
    const scoreColumns: ColumnTemplate<ScoreRow>[] = [
      { of: 'name', title: 'Name', cell: (r) => r.name, csvDownloadable: true },
      {
        id: 'asn_42',
        title: 'Quiz',
        accessorFn: (r) => r.grades[42],
        cell: (r) => r.grades[42] ?? '—',
        csvDownloadable: true,
      },
    ];
    const { result } = renderHook(() =>
      useTanStackTableBuilder<ScoreRow>({
        data: scoreData,
        columns: scoreColumns,
        getRowId: (r) => r.id.toString(),
        csvDownload: { filename: 'test' },
      }),
    );

    await act(async () => {
      await result.current.toolbar!.onDownloadCsv?.();
    });

    const csv: string = mockedDownloadFile.mock.calls[0][1];
    const lines = csv.trim().split(/\r?\n/);
    expect(lines[0]).toBe('Name,Quiz');
    expect(lines[1]).toBe('Alice,9');
    expect(lines[2]).toBe('Bob,');
  });

  it('columnPicker getExtraHeaderRows inserts extra rows after the header', async () => {
    const { result } = renderHook(() =>
      useTanStackTableBuilder(
        baseProps({
          columns: csvColumns,
          columnPicker: {
            renderTree: () => null,
            onExport: 'csv' as const,
            getExtraHeaderRows: (colIds) => [colIds.map(() => 'max')],
          },
        }),
      ),
    );

    await act(async () => {
      await result.current.toolbar!.onExportFromPicker?.({
        name: true,
        email: true,
      });
    });

    expect(mockedDownloadFile).toHaveBeenCalledTimes(1);
    const csv: string = mockedDownloadFile.mock.calls[0][1];
    const lines = csv.trim().split(/\r?\n/);
    expect(lines[0]).toBe('Name,Email');
    expect(lines[1]).toBe('max,max');
    expect(lines[2]).toContain('Alice');
  });

  it('exports only selected rows when rows are selected', async () => {
    const twoRowData = [
      { id: 1, name: 'Alice', email: 'alice@example.com' },
      { id: 2, name: 'Bob', email: 'bob@example.com' },
    ];
    const { result } = renderHook(() =>
      useTanStackTableBuilder<Row>({
        data: twoRowData,
        columns: csvColumns,
        getRowId: (r) => r.id.toString(),
        indexing: { rowSelectable: true },
        columnPicker: {
          renderTree: () => null,
          onExport: 'csv' as const,
        },
      }),
    );

    // Select only Alice (row index 0)
    act(() => result.current.body.rows[0].toggleSelected());

    await act(async () => {
      await result.current.toolbar!.onExportFromPicker?.({
        name: true,
        email: true,
      });
    });

    expect(mockedDownloadFile).toHaveBeenCalledTimes(1);
    const csv: string = mockedDownloadFile.mock.calls[0][1];
    const lines = csv.trim().split(/\r?\n/);
    expect(lines).toHaveLength(2); // header + Alice only
    expect(lines[1]).toContain('Alice');
    expect(csv).not.toContain('Bob');
  });

  it('CSV excludes columns where csvDownloadable is false', async () => {
    const columns: ColumnTemplate<Row>[] = [
      { of: 'name', title: 'Name', cell: (r) => r.name, csvDownloadable: true },
      {
        of: 'email',
        title: 'Email',
        cell: (r) => r.email,
        csvDownloadable: false,
      },
    ];
    const { result } = renderHook(() =>
      useTanStackTableBuilder(
        baseProps({ columns, csvDownload: { filename: 'test' } }),
      ),
    );

    await act(async () => {
      await result.current.toolbar!.onDownloadCsv?.();
    });

    const csv: string = mockedDownloadFile.mock.calls[0][1];
    const lines = csv.trim().split(/\r?\n/);
    expect(lines[0]).toBe('Name');
    expect(lines[0]).not.toContain('Email');
  });
});

// ---------- cross-page row selection ----------

const threeRowData: Row[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
  { id: 3, name: 'Carol', email: 'carol@example.com' },
];

describe('cross-page row selection', () => {
  const selectionProps = (): TableTemplate<Row> =>
    baseProps({
      data: threeRowData,
      indexing: { rowSelectable: true },
      pagination: { rowsPerPage: [2] },
    });

  it('body.selectedCount is 0 when nothing is selected', () => {
    const { result } = renderHook(() =>
      useTanStackTableBuilder(selectionProps()),
    );
    expect(result.current.body.selectedCount).toBe(0);
  });

  it('body.selectedCount increments when a row on the current page is selected', () => {
    const { result } = renderHook(() =>
      useTanStackTableBuilder(selectionProps()),
    );
    act(() => result.current.body.rows[0].toggleSelected());
    expect(result.current.body.selectedCount).toBe(1);
  });

  it('body.selectedCount persists after navigating away from the page where the selection was made', () => {
    const { result } = renderHook(() =>
      useTanStackTableBuilder(selectionProps()),
    );
    // Page 1: Alice (id 1) and Bob (id 2)
    act(() => result.current.body.rows[0].toggleSelected()); // select Alice
    expect(result.current.body.selectedCount).toBe(1);

    // Navigate to page 2: Carol (id 3) only
    act(() => result.current.pagination!.onPageChange?.(1));
    expect(result.current.body.rows).toHaveLength(1); // only Carol visible
    expect(result.current.body.selectedCount).toBe(1); // Alice still counted
  });

  it('toggleAllFiltered selects all rows across all pages', () => {
    const { result } = renderHook(() =>
      useTanStackTableBuilder(selectionProps()),
    );
    act(() => result.current.body.toggleAllFiltered?.());
    expect(result.current.body.selectedCount).toBe(3);
    expect(result.current.body.allFilteredSelected).toBe(true);
  });

  it('someFilteredSelected is true when only some rows are selected', () => {
    const { result } = renderHook(() =>
      useTanStackTableBuilder(selectionProps()),
    );
    act(() => result.current.body.rows[0].toggleSelected()); // Alice only
    expect(result.current.body.someFilteredSelected).toBe(true);
    expect(result.current.body.allFilteredSelected).toBe(false);
  });

  it('toggleAllFiltered twice deselects all rows', () => {
    const { result } = renderHook(() =>
      useTanStackTableBuilder(selectionProps()),
    );
    act(() => result.current.body.toggleAllFiltered?.()); // select all
    act(() => result.current.body.toggleAllFiltered?.()); // deselect all
    expect(result.current.body.selectedCount).toBe(0);
    expect(result.current.body.allFilteredSelected).toBe(false);
  });
});

describe('localStorage persistence', () => {
  beforeEach(() => localStorage.clear());

  it('reads initial visibility from localStorage when storageKey is provided', () => {
    localStorage.setItem(
      'test_key',
      JSON.stringify({ name: false, email: true }),
    );
    const { result } = renderHook(() =>
      useTanStackTableBuilder(
        baseProps({
          columnPicker: {
            renderTree: () => null,
            onExport: 'csv' as const,
            storageKey: 'test_key',
          },
        }),
      ),
    );
    expect(result.current.toolbar!.getColumnVisibility?.()).toEqual({
      name: false,
      email: true,
    });
  });

  it('writes visibility to localStorage on change', async () => {
    const { result } = renderHook(() =>
      useTanStackTableBuilder(
        baseProps({
          columnPicker: {
            renderTree: () => null,
            onExport: 'csv' as const,
            storageKey: 'test_key',
          },
        }),
      ),
    );
    act(() =>
      result.current.toolbar!.commitColumnVisibility!({
        name: false,
        email: true,
      }),
    );
    expect(JSON.parse(localStorage.getItem('test_key')!)).toMatchObject({
      name: false,
      email: true,
    });
  });

  it('falls back to defaultVisible when storageKey has no entry', () => {
    const { result } = renderHook(() =>
      useTanStackTableBuilder(
        baseProps({
          columns: [
            baseColumns[0],
            { ...baseColumns[1], defaultVisible: false },
          ],
          columnPicker: {
            renderTree: () => null,
            onExport: 'csv' as const,
            storageKey: 'missing_key',
          },
        }),
      ),
    );
    expect(result.current.toolbar!.getColumnVisibility?.()).toEqual({
      name: true,
      email: false,
    });
  });
});

describe('useTanStackTableBuilder onDirectExport', () => {
  beforeEach(() => {
    mockedDownloadFile.mockClear();
  });

  it('toolbar.onDirectExport is defined when columnPicker is provided', () => {
    const { result } = renderHook(() =>
      useTanStackTableBuilder(
        baseProps({
          columnPicker: {
            renderTree: () => null,
            onExport: 'csv' as const,
          },
        }),
      ),
    );
    expect(result.current.toolbar!.onDirectExport).toBeDefined();
  });

  it('toolbar.onDirectExport is undefined when no columnPicker is provided', () => {
    const { result } = renderHook(() => useTanStackTableBuilder(baseProps()));
    expect(result.current.toolbar!.onDirectExport).toBeUndefined();
  });

  it('toolbar.onDirectExport downloads CSV using committed column visibility', async () => {
    const { result } = renderHook(() =>
      useTanStackTableBuilder(
        baseProps({
          columns: csvColumns,
          csvDownload: { filename: 'my_gradebook' },
          columnPicker: {
            renderTree: () => null,
            onExport: 'csv' as const,
          },
        }),
      ),
    );

    await act(async () => {
      await result.current.toolbar!.onDirectExport?.();
    });

    expect(mockedDownloadFile).toHaveBeenCalledTimes(1);
    const csv: string = mockedDownloadFile.mock.calls[0][1];
    const lines = csv.trim().split(/\r?\n/);
    expect(lines[0]).toBe('Name,Email');
    expect(lines[1]).toContain('Alice');
  });
});
