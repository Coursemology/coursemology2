import { TableColumns } from 'types/components/DataTable';

const hasRowNumberColumn = (
  columns: TableColumns[],
  rowData: unknown[],
): boolean => {
  if (!columns.length || !rowData.length) return false;

  const rowDataOffsetByOne = rowData.length - columns.length === 1;
  const firstCellIsUndefined = rowData[0] === undefined;
  return rowDataOffsetByOne && firstCellIsUndefined;
};

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
export default function rebuildObjectFromRow(
  columns: TableColumns[],
  rowData: unknown[],
): unknown {
  const hasRowNumber = hasRowNumberColumn(columns, rowData);

  if (!hasRowNumber && columns.length !== rowData.length)
    throw new Error(
      'columns and rowData must have the same length to rebuild object',
    );

  return Object.fromEntries(
    columns.map((col, colIndex) => {
      const rowIndex = hasRowNumber ? colIndex + 1 : colIndex;
      return [col.name, rowData[rowIndex]];
    }),
  );
}
