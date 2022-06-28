import { TableColumns } from 'types/components/DataTable';

/**
 * Rebuilds an object from columns and data from a single row of MUI DataTable
 *
 * example:
 * columns: [{name: 'a', label: 'colA', ...}, {name: 'b', label: 'colB', ...}]
 * rowData: [undefined, 15]
 * result: {name: undefined, b: 15}
 * @param {TableColumns[]} columns columns of DataTable
 * @param {T} rowData current data in row
 * @returns {T} result of rebuilding
 *
 * adapted from https://github.com/gregnb/mui-datatables/issues/297#issuecomment-907881154
 */
export default function rebuildObjectFromRow<T>(
  columns: TableColumns[],
  rowData: T,
): T {
  return Object.fromEntries(
    columns.map((col, colIndex) => [col.name, rowData[colIndex]]),
  ) as T;
}
