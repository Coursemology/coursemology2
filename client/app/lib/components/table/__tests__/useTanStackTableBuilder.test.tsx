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
