import { ReactNode } from 'react';
import { Header, Row } from '@tanstack/react-table';
import { unparse } from 'papaparse';

import { ColumnTemplate, Data } from '../builder';

interface CsvGenerator<D extends Data> {
  headers: () => Header<D, unknown>[];
  rows: () => Row<D>[];
  getRealColumn: (index: number) => ColumnTemplate<D> | undefined;
}

const generateCsv = <D extends Data>(
  options: CsvGenerator<D>,
): Promise<string> =>
  new Promise((resolve) => {
    const headers = options.headers().reduce<string[]>((cells, cell, index) => {
      const realColumn = options.getRealColumn(index);
      const csvDownloadable = realColumn?.csvDownloadable;
      if (!csvDownloadable) return cells;

      cells.push(cell.column.columnDef.header?.toString() ?? '');
      return cells;
    }, []);

    const rows = [headers];

    options.rows().forEach((row) => {
      const rowData = row
        .getVisibleCells()
        .reduce<string[]>((cells, cell, index) => {
          const realColumn = options.getRealColumn(index);
          const csvDownloadable = realColumn?.csvDownloadable;
          if (!csvDownloadable) return cells;

          const value = cell.getValue() as ReactNode;
          cells.push(realColumn.csvValue?.(value) ?? value?.toString() ?? '');
          return cells;
        }, []);

      rows.push(rowData);
    });

    resolve(unparse(rows));
  });

export default generateCsv;
