import { ColumnDef } from '@tanstack/react-table';

import { RowSelector } from '../adapters';
import { buildColumns, BuiltColumns, ColumnTemplate, Data } from '../builder';

export const ROW_SELECTOR_ID = 'rowSelector';

const buildTanStackColumns = <D extends Data>(
  columns: ColumnTemplate<D>[],
  hasCheckboxes?: boolean,
  hasIndices?: boolean,
): BuiltColumns<D, ColumnDef<D, unknown>> => {
  const initialColumns: ColumnDef<D, unknown>[] = [];

  if (hasIndices)
    initialColumns.push({
      id: 'index',
      cell: ({ row: { index } }) => index + 1,
      enableColumnFilter: false,
      enableGlobalFilter: false,
      enableSorting: false,
    });

  if (hasCheckboxes)
    initialColumns.push({
      id: ROW_SELECTOR_ID,
      enableSorting: false,
      enableColumnFilter: false,
      enableGlobalFilter: false,
      header: ({ table }): RowSelector => ({
        selected: table.getIsAllRowsSelected(),
        indeterminate: table.getIsSomeRowsSelected(),
        onChange: table.getToggleAllRowsSelectedHandler(),
      }),
      cell: ({ row }): RowSelector => ({
        selected: row.getIsSelected(),
        disabled: !row.getCanSelect(),
        indeterminate: row.getIsSomeSelected(),
        onChange: row.getToggleSelectedHandler(),
      }),
    });

  return buildColumns(
    columns,
    (column) => ({
      id: column.id,
      accessorKey: column.of,
      accessorFn: column.searchProps?.getValue,
      header: column.title,
      cell: ({ row: { original: datum } }) => column.cell(datum),
      enableSorting: Boolean(column.sortable),
      enableColumnFilter: Boolean(column.filterable),
      enableGlobalFilter: Boolean(column.searchable),
      sortingFn: column.sortProps?.sort
        ? (rowA, rowB): number =>
            column.sortProps!.sort!(rowA.original, rowB.original)
        : 'alphanumeric',
      sortUndefined: column.sortProps?.undefinedPriority ?? false,
      filterFn:
        column.filterProps?.shouldInclude &&
        Object.assign(
          ({ original: datum }, _: string, filterValue: unknown) =>
            column.filterProps?.shouldInclude?.(datum, filterValue) ?? true,
          {
            resolveFilterValue:
              column.filterProps?.beforeFilter &&
              ((value: string): unknown =>
                column.filterProps?.beforeFilter?.(value) ?? value),
          },
        ),
      getUniqueValues:
        column.filterProps?.getValue &&
        ((datum): string[] => column.filterProps?.getValue?.(datum) ?? []),
    }),
    initialColumns,
  );
};

export default buildTanStackColumns;
