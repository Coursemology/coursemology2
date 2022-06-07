/**
 * Rebuilds an object from columns and data from a single row of MUI DataTable
 *
 * example:
 * columns: [{name: 'a', label: 'colA', ...}, {name: 'b', label: 'colB', ...}]
 * rowData: [undefined, 15]
 * result: {name: undefined, b: 15}
 * @param {array} columns columns of DataTable
 * @param {array} rowData current data in row
 * @returns {object} result of rebuilding
 *
 * adapted from https://github.com/gregnb/mui-datatables/issues/297#issuecomment-907881154
 */
export default function rebuildObjectFromRow(columns, rowData) {
  return Object.fromEntries(
    columns.map((col, colIndex) => [col.name, rowData.data[colIndex]]),
  );
}
