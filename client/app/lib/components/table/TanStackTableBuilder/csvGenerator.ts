import { ReactNode } from 'react';
import { Row } from '@tanstack/react-table';
import { unparse } from 'papaparse';

import { ColumnTemplate, Data } from '../builder';

interface CsvGenerator<D extends Data> {
  headers: string[];
  rows: () => Row<D>[];
  getRealColumn: (index: number) => ColumnTemplate<D> | undefined;
}

const generateCsv = <D extends Data>(
  options: CsvGenerator<D>,
): Promise<string> =>
  new Promise((resolve) => {
    const rows = [options.headers];

    options.rows().forEach((row) => {
      const rowData = row
        .getAllCells()
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
