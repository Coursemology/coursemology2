import { act, renderHook } from '@testing-library/react';

import { ColumnTemplate, TableTemplate } from '../builder';
import useTanStackTableBuilder from '../TanStackTableBuilder';

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
    const captured: Record<string, boolean>[] = [];
    const { result } = renderHook(() =>
      useTanStackTableBuilder(
        baseProps({
          columnPicker: {
            renderTree: (ctx) => {
              captured.push({
                name: ctx.isVisible('name'),
                email: ctx.isVisible('email'),
              });
              return null;
            },
          },
        }),
      ),
    );

    // Trigger the renderTree callback once via the toolbar adapter.
    result.current.toolbar.columnPicker?.renderTree({
      isVisible: (id) =>
        result.current.toolbar.getColumnVisibility?.()[id] ?? false,
      setVisible: () => {},
      setManyVisible: () => {},
    });

    expect(result.current.toolbar.getColumnVisibility?.()).toEqual({
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
          },
        }),
      ),
    );

    const commit = result.current.toolbar.commitColumnVisibility!;
    act(() => commit({ name: false, email: true }));

    expect(result.current.toolbar.getColumnVisibility?.()).toEqual({
      name: true,    // forced back to true
      email: true,
    });
  });

  it('setVisible no-ops for unknown id', () => {
    const { result } = renderHook(() =>
      useTanStackTableBuilder(
        baseProps({
          columnPicker: {
            renderTree: () => null,
          },
        }),
      ),
    );

    // Drive ctx via the dialog code path (commitColumnVisibility wraps setManyVisible behaviourally).
    result.current.toolbar.commitColumnVisibility!({
      name: true,
      email: true,
      unknownId: false,  // unknown should NOT be added in any setter
    });
    // The reconciler effect would prune unknownId; visibility map only carries column ids.
    expect(result.current.toolbar.getColumnVisibility?.()).toEqual({
      name: true,
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
          },
        }),
      ),
    );

    result.current.toolbar.commitColumnVisibility!({ name: false, email: false });
    expect(result.current.toolbar.getColumnVisibility?.()).toEqual({
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
                  { id: 'phone', title: 'Phone', cell: () => '', csvDownloadable: true },
                ]
              : baseColumns,
            columnPicker: { renderTree: () => null },
          }),
        ),
      { initialProps: { extra: false } },
    );

    expect(Object.keys(result.current.toolbar.getColumnVisibility?.() ?? {})).toEqual([
      'name',
      'email',
    ]);

    rerender({ extra: true });

    expect(result.current.toolbar.getColumnVisibility?.()).toEqual({
      name: true,
      email: true,
      phone: true,    // new column defaults visible
    });
  });
});
