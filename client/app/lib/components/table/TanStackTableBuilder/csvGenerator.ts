import { ReactNode } from 'react';
import { Column, Table } from '@tanstack/react-table';
import { unparse } from 'papaparse';

import { ColumnTemplate, Data } from '../builder';

interface CsvGenerator<D extends Data> {
  table: Table<D>;
  getRealColumn: (id: string) => ColumnTemplate<D> | undefined;
  getExtraHeaderRows?: (columnIds: string[]) => string[][];
  onlySelected?: boolean;
}

const extractHeader = <D extends Data>(
  col: Column<D, unknown>,
  realColumn: ColumnTemplate<D> | undefined,
): string => {
  const title = realColumn?.title;
  if (typeof title === 'string') return title;
  return realColumn?.id ?? col.id;
};

const generateCsv = <D extends Data>(
  options: CsvGenerator<D>,
): Promise<string> =>
  new Promise((resolve) => {
    // Keep ONLY columns where the consumer explicitly set csvDownloadable === true.
    // Columns with `csvDownloadable: undefined` or `false` are excluded (matches the
    // original behaviour where `csvDownloadable ?? false` gated headers).
    const leafColumns = options.table.getVisibleLeafColumns();
    const exportColumns = leafColumns.filter(
      (col) => options.getRealColumn(col.id)?.csvDownloadable === true,
    );

    const headers = exportColumns.map((col) =>
      extractHeader(col, options.getRealColumn(col.id)),
    );

    const colIds = exportColumns.map((col) => col.id);
    const extraHeaderRows = options.getExtraHeaderRows?.(colIds) ?? [];
    const rows: string[][] = [headers, ...extraHeaderRows];

    const exportRows = options.onlySelected
      ? options.table.getSelectedRowModel().rows
      : options.table.getCoreRowModel().rows;
    exportRows.forEach((row) => {
      const rowData = exportColumns.map((col) => {
        const realColumn = options.getRealColumn(col.id);
        const value = row.getValue(col.id) as ReactNode;
        return realColumn?.csvValue?.(value) ?? value?.toString() ?? '';
      });
      rows.push(rowData);
    });

    resolve(unparse(rows));
  });

export default generateCsv;
