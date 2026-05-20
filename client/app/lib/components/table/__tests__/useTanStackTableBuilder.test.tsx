import { FC, JSX, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { act, renderHook, type RenderHookResult } from '@testing-library/react';
import { setUpStoreWithState, store as appStore } from 'store';
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

// Wraps renderHook with the given store. Defaults to the global appStore
// (userId=0, no localStorage scoping) for tests that don't exercise persistence.
const withStore = (store = appStore): FC<{ children: ReactNode }> =>
  Object.assign(
    ({ children }: { children: ReactNode }): JSX.Element => (
      <Provider store={store}>{children}</Provider>
    ),
    { displayName: 'WithStoreWrapper' },
  );

// Creates a store pre-loaded with a specific userId for localStorage isolation tests.
const storeForUser = (userId: number): typeof appStore =>
  setUpStoreWithState({
    global: {
      ...appStore.getState().global,
      user: {
        ...appStore.getState().global.user,
        user: { id: userId, name: '', imageUrl: '' },
      },
    },
  });

describe('useTanStackTableBuilder columnPicker state', () => {
  it('initial visibility marks every column visible', () => {
    const { result } = renderHook(
      () =>
        useTanStackTableBuilder(
          baseProps({
            columnPicker: {
              render: () => null,
            },
          }),
        ),
      { wrapper: withStore() },
    );

    expect(result.current.toolbar!.getColumnVisibility?.()).toEqual({
      name: true,
      email: true,
    });
  });

  it('locked id cannot be set to false via setVisible', () => {
    const { result } = renderHook(
      () =>
        useTanStackTableBuilder(
          baseProps({
            columnPicker: {
              render: () => null,
              locked: ['name'],
            },
          }),
        ),
      { wrapper: withStore() },
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
    const { result } = renderHook(
      () =>
        useTanStackTableBuilder(
          baseProps({
            columnPicker: {
              render: () => null,
              locked: ['name'],
            },
          }),
        ),
      { wrapper: withStore() },
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
              render: () => null,
            },
          }),
        ),
      { initialProps: { extra: false }, wrapper: withStore() },
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
            columnPicker: { render: () => null },
          }),
        ),
      { initialProps: { extra: false }, wrapper: withStore() },
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
    const { result } = renderHook(
      () =>
        useTanStackTableBuilder(
          baseProps({
            columns: csvColumns,
            csvDownload: { filename: 'test' },
          }),
        ),
      { wrapper: withStore() },
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
    const { result } = renderHook(
      () =>
        useTanStackTableBuilder(
          baseProps({
            columns: csvColumns,
            csvDownload: { filename: 'test' },
            indexing: { indices: true },
          }),
        ),
      { wrapper: withStore() },
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
    const { result } = renderHook(
      () =>
        useTanStackTableBuilder<ScoreRow>({
          data: scoreData,
          columns: scoreColumns,
          getRowId: (r) => r.id.toString(),
          csvDownload: { filename: 'test' },
        }),
      { wrapper: withStore() },
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
    const { result } = renderHook(
      () =>
        useTanStackTableBuilder(
          baseProps({
            columns: csvColumns,
            columnPicker: {
              render: () => null,
              getExtraHeaderRows: (colIds) => [colIds.map(() => 'max')],
            },
          }),
        ),
      { wrapper: withStore() },
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
    const { result } = renderHook(
      () =>
        useTanStackTableBuilder<Row>({
          data: twoRowData,
          columns: csvColumns,
          getRowId: (r) => r.id.toString(),
          indexing: { rowSelectable: true },
          columnPicker: {
            render: () => null,
          },
        }),
      { wrapper: withStore() },
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
    const { result } = renderHook(
      () =>
        useTanStackTableBuilder(
          baseProps({ columns, csvDownload: { filename: 'test' } }),
        ),
      { wrapper: withStore() },
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

// ---------- columnVisibility alignment regression (PR #8226) ----------
//
// Root cause: getVisibleLeafColumns() / getVisibleCells() skips hidden columns,
// so its positional index diverges from getRealColumn()'s full-column-list index.
// Both the CSV path (csvGenerator) and the cell render path (forEachCell) must
// use getRealColumnById (ID-based) to stay stable when columns are hidden.
//
// Each scenario is tested on BOTH paths. A test would fail on the relevant path
// if it regressed to positional index.

interface ThreeColRow {
  id: number;
  name: string;
  email: string;
  phone: string;
}

const threeColData: ThreeColRow[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com', phone: '111' },
];

const threeColCsvColumns: ColumnTemplate<ThreeColRow>[] = [
  {
    of: 'name',
    title: 'Name',
    cell: (r) => r.name,
    csvDownloadable: true,
    className: 'col-name',
  },
  {
    of: 'email',
    title: 'Email',
    cell: (r) => r.email,
    csvDownloadable: true,
    className: 'col-email',
  },
  {
    of: 'phone',
    title: 'Phone',
    cell: (r) => r.phone,
    csvDownloadable: true,
    className: 'col-phone',
  },
];

describe('columnVisibility alignment — hiding a middle column', () => {
  let result: RenderHookResult<
    ReturnType<typeof useTanStackTableBuilder<ThreeColRow>>,
    TableTemplate<ThreeColRow>
  >['result'];

  beforeEach(() => {
    mockedDownloadFile.mockClear();
    ({ result } = renderHook(
      () =>
        useTanStackTableBuilder<ThreeColRow>({
          data: threeColData,
          columns: threeColCsvColumns,
          getRowId: (r) => r.id.toString(),
          columnPicker: { render: () => null },
        }),
      { wrapper: withStore() },
    ));
    act(() =>
      result.current.toolbar!.commitColumnVisibility!({
        name: true,
        email: false,
        phone: true,
      }),
    );
  });

  it('CSV: remaining columns have correct headers and data', async () => {
    await act(async () => {
      await result.current.toolbar!.onDirectExport?.();
    });
    const csv: string = mockedDownloadFile.mock.calls[0][1];
    const lines = csv.trim().split(/\r?\n/);
    expect(lines[0]).toBe('Name,Phone');
    expect(lines[1]).toBe('Alice,111');
  });

  it('forEachCell: remaining visible cells have correct className', () => {
    const row = result.current.body.rows[0];
    const cells = result.current.body.getCells(row);
    expect(cells).toHaveLength(2); // email hidden
    const renders = cells.map((cell, i) =>
      result.current.body.forEachCell(cell, row, i),
    );
    expect(renders[0].className).toBe('col-name');
    expect(renders[1].className).toBe('col-phone'); // not 'col-email'
  });
});

describe('columnVisibility alignment — indices: true + hidden column', () => {
  let result: RenderHookResult<
    ReturnType<typeof useTanStackTableBuilder<ThreeColRow>>,
    TableTemplate<ThreeColRow>
  >['result'];

  beforeEach(() => {
    mockedDownloadFile.mockClear();
    ({ result } = renderHook(
      () =>
        useTanStackTableBuilder<ThreeColRow>({
          data: threeColData,
          columns: threeColCsvColumns,
          getRowId: (r) => r.id.toString(),
          indexing: { indices: true },
          columnPicker: { render: () => null },
        }),
      { wrapper: withStore() },
    ));
    act(() =>
      result.current.toolbar!.commitColumnVisibility!({
        name: false,
        email: true,
        phone: true,
      }),
    );
  });

  it('CSV: remaining columns have correct headers and data', async () => {
    await act(async () => {
      await result.current.toolbar!.onDirectExport?.();
    });
    const csv: string = mockedDownloadFile.mock.calls[0][1];
    const lines = csv.trim().split(/\r?\n/);
    expect(lines[0]).toBe('Email,Phone');
    expect(lines[1]).toBe('alice@example.com,111');
  });

  it('forEachCell: remaining visible cells have correct className', () => {
    const row = result.current.body.rows[0];
    const cells = result.current.body.getCells(row);
    // index col (no template) + email + phone visible; name hidden
    const userCells = cells.filter((c) => c.column.id !== 'index');
    const renders = userCells.map((cell, i) =>
      result.current.body.forEachCell(cell, row, i),
    );
    expect(renders[0].className).toBe('col-email'); // not 'col-name'
    expect(renders[1].className).toBe('col-phone');
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
    const { result } = renderHook(
      () => useTanStackTableBuilder(selectionProps()),
      {
        wrapper: withStore(),
      },
    );
    expect(result.current.body.selectedCount).toBe(0);
  });

  it('body.selectedCount increments when a row on the current page is selected', () => {
    const { result } = renderHook(
      () => useTanStackTableBuilder(selectionProps()),
      {
        wrapper: withStore(),
      },
    );
    act(() => result.current.body.rows[0].toggleSelected());
    expect(result.current.body.selectedCount).toBe(1);
  });

  it('body.selectedCount persists after navigating away from the page where the selection was made', () => {
    const { result } = renderHook(
      () => useTanStackTableBuilder(selectionProps()),
      {
        wrapper: withStore(),
      },
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
    const { result } = renderHook(
      () => useTanStackTableBuilder(selectionProps()),
      {
        wrapper: withStore(),
      },
    );
    act(() => result.current.body.toggleAllFiltered?.());
    expect(result.current.body.selectedCount).toBe(3);
    expect(result.current.body.allFilteredSelected).toBe(true);
  });

  it('someFilteredSelected is true when only some rows are selected', () => {
    const { result } = renderHook(
      () => useTanStackTableBuilder(selectionProps()),
      {
        wrapper: withStore(),
      },
    );
    act(() => result.current.body.rows[0].toggleSelected()); // Alice only
    expect(result.current.body.someFilteredSelected).toBe(true);
    expect(result.current.body.allFilteredSelected).toBe(false);
  });

  it('toggleAllFiltered twice deselects all rows', () => {
    const { result } = renderHook(
      () => useTanStackTableBuilder(selectionProps()),
      {
        wrapper: withStore(),
      },
    );
    act(() => result.current.body.toggleAllFiltered?.()); // select all
    act(() => result.current.body.toggleAllFiltered?.()); // deselect all
    expect(result.current.body.selectedCount).toBe(0);
    expect(result.current.body.allFilteredSelected).toBe(false);
  });
});

describe('localStorage persistence', () => {
  beforeEach(() => localStorage.clear());

  it('reads initial visibility from the user-scoped key', () => {
    localStorage.setItem(
      '42:test_key',
      JSON.stringify({ name: false, email: true }),
    );
    const { result } = renderHook(
      () =>
        useTanStackTableBuilder(
          baseProps({
            columnPicker: { render: () => null, storageKey: 'test_key' },
          }),
        ),
      { wrapper: withStore(storeForUser(42)) },
    );
    expect(result.current.toolbar!.getColumnVisibility?.()).toEqual({
      name: false,
      email: true,
    });
  });

  it('writes visibility to the user-scoped key on change', () => {
    const { result } = renderHook(
      () =>
        useTanStackTableBuilder(
          baseProps({
            columnPicker: { render: () => null, storageKey: 'test_key' },
          }),
        ),
      { wrapper: withStore(storeForUser(42)) },
    );
    act(() =>
      result.current.toolbar!.commitColumnVisibility!({
        name: false,
        email: true,
      }),
    );
    expect(JSON.parse(localStorage.getItem('42:test_key')!)).toMatchObject({
      name: false,
      email: true,
    });
    // Unsecoped key must not be written
    expect(localStorage.getItem('test_key')).toBeNull();
  });

  it('falls back to defaultVisible when the user-scoped key has no entry', () => {
    const { result } = renderHook(
      () =>
        useTanStackTableBuilder(
          baseProps({
            columns: [
              baseColumns[0],
              { ...baseColumns[1], defaultVisible: false },
            ],
            columnPicker: { render: () => null, storageKey: 'missing_key' },
          }),
        ),
      { wrapper: withStore(storeForUser(42)) },
    );
    expect(result.current.toolbar!.getColumnVisibility?.()).toEqual({
      name: true,
      email: false,
    });
  });

  it('does not read or write localStorage when userId is 0 (not yet loaded)', () => {
    // Pre-populate a 0-prefixed key to prove it is not read on mount.
    const sentinel = JSON.stringify({ name: false, email: false });
    localStorage.setItem('0:test_key', sentinel);

    const { result } = renderHook(
      () =>
        useTanStackTableBuilder(
          baseProps({
            columnPicker: { render: () => null, storageKey: 'test_key' },
          }),
        ),
      { wrapper: withStore() }, // appStore has userId=0
    );
    // 0-prefixed key is ignored; visibility falls back to defaultVisible (true)
    expect(result.current.toolbar!.getColumnVisibility?.()).toEqual({
      name: true,
      email: true,
    });

    act(() =>
      result.current.toolbar!.commitColumnVisibility!({
        name: true,
        email: false,
      }),
    );
    // The 0-prefixed key is untouched (still holds the original sentinel value)
    expect(localStorage.getItem('0:test_key')).toBe(sentinel);
    // The unscoped key was never written
    expect(localStorage.getItem('test_key')).toBeNull();
  });

  it('two users on the same device have independent visibility preferences', () => {
    localStorage.setItem(
      '1:shared_key',
      JSON.stringify({ name: false, email: true }),
    );
    localStorage.setItem(
      '2:shared_key',
      JSON.stringify({ name: true, email: false }),
    );

    const { result: result1 } = renderHook(
      () =>
        useTanStackTableBuilder(
          baseProps({
            columnPicker: { render: () => null, storageKey: 'shared_key' },
          }),
        ),
      { wrapper: withStore(storeForUser(1)) },
    );
    const { result: result2 } = renderHook(
      () =>
        useTanStackTableBuilder(
          baseProps({
            columnPicker: { render: () => null, storageKey: 'shared_key' },
          }),
        ),
      { wrapper: withStore(storeForUser(2)) },
    );

    expect(result1.current.toolbar!.getColumnVisibility?.()).toEqual({
      name: false,
      email: true,
    });
    expect(result2.current.toolbar!.getColumnVisibility?.()).toEqual({
      name: true,
      email: false,
    });
  });
});

// ---------- global search — nullable searchable column (regression) ----------
//
// Root cause: TanStack's default getColumnCanGlobalFilter sniffs the first row's
// value type (string|number). When the first row has externalId=null, typeof null
// === 'object', so TanStack silently excludes the column from global filter for
// the entire table — even rows with a real string value are never matched.
// Fix: override getColumnCanGlobalFilter in useReactTable to return true always,
// relying on enableGlobalFilter (set by searchable:true/false) instead of sniffing.

describe('global search — searchable column whose first row is null', () => {
  interface StudentRow {
    id: number;
    name: string;
    externalId: string | null;
  }

  const nullFirstData: StudentRow[] = [
    { id: 1, name: 'Alice', externalId: null },
    { id: 2, name: 'Bob', externalId: 'EXT001' },
  ];

  const searchColumns: ColumnTemplate<StudentRow>[] = [
    { of: 'name', title: 'Name', cell: (r) => r.name, searchable: true },
    {
      of: 'externalId',
      title: 'External ID',
      cell: (r) => r.externalId ?? '',
      searchable: true,
    },
  ];

  it('finds rows by a searchable column value even when the first row has null for that column', () => {
    const { result } = renderHook(
      () =>
        useTanStackTableBuilder<StudentRow>({
          data: nullFirstData,
          columns: searchColumns,
          getRowId: (r) => r.id.toString(),
          search: { searchPlaceholder: 'Search' },
        }),
      { wrapper: withStore() },
    );

    act(() => result.current.toolbar!.onSearchKeywordChange?.('EXT001'));

    expect(result.current.body.rows).toHaveLength(1);
    expect(
      (result.current.body.rows[0] as { original: StudentRow }).original.name,
    ).toBe('Bob');
  });
});

describe('useTanStackTableBuilder onDirectExport', () => {
  beforeEach(() => {
    mockedDownloadFile.mockClear();
  });

  it('toolbar.onDirectExport is defined when columnPicker is provided', () => {
    const { result } = renderHook(
      () =>
        useTanStackTableBuilder(
          baseProps({
            columnPicker: { render: () => null },
          }),
        ),
      { wrapper: withStore() },
    );
    expect(result.current.toolbar!.onDirectExport).toBeDefined();
  });

  it('toolbar.onDirectExport is undefined when no columnPicker is provided', () => {
    const { result } = renderHook(() => useTanStackTableBuilder(baseProps()), {
      wrapper: withStore(),
    });
    expect(result.current.toolbar!.onDirectExport).toBeUndefined();
  });

  it('toolbar.onDirectExport downloads CSV using committed column visibility', async () => {
    const { result } = renderHook(
      () =>
        useTanStackTableBuilder(
          baseProps({
            columns: csvColumns,
            csvDownload: { filename: 'my_gradebook' },
            columnPicker: { render: () => null },
          }),
        ),
      { wrapper: withStore() },
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
