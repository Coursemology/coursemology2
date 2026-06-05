import { FC } from 'react';

import { formatRawDate } from 'lib/moment';

import { SpreadsheetCellValue } from './types';

export const SpreadsheetCellValueView: FC<{
  cellValue: SpreadsheetCellValue;
}> = ({ cellValue }) => {
  if (cellValue === undefined) return '';
  if (typeof cellValue === 'string') {
    if (cellValue.startsWith('=')) {
      return <i>{cellValue}</i>;
    }
    return cellValue;
  }
  if (typeof cellValue === 'number') return String(cellValue);
  if (cellValue instanceof Date) return formatRawDate(cellValue);
  return String(cellValue);
};
