import * as XLSX from 'xlsx';

import { GridData, SheetGrid, SpreadsheetCellValue } from './types';

export const getCellKey = (
  rowIdx: number,
  colIdx: number,
  sheetName: string,
): string => `${sheetName}!${XLSX.utils.encode_cell({ r: rowIdx, c: colIdx })}`;

const parseCellValue = (cell: XLSX.CellObject): SpreadsheetCellValue => {
  if (cell?.v === null || cell?.v === undefined || cell.v === '')
    return undefined;
  if (cell.f !== undefined) return `=${cell.f}`;
  if (cell.t === 'd' && cell.v instanceof Date) return cell.v;
  if (typeof cell.v === 'number') return cell.v;
  return String(cell.v);
};

const parseSheetGrid = (worksheet: XLSX.WorkSheet): SheetGrid => {
  const ref = worksheet['!ref'];
  if (!ref) return { headers: [], rows: [], rowOffset: 0, colOffset: 0 };

  const range = XLSX.utils.decode_range(ref);
  const numCols = range.e.c - range.s.c + 1;
  const numRows = range.e.r - range.s.r + 1;
  const headers: string[] = [];
  const allRows: SpreadsheetCellValue[][] = [];

  for (let c = 0; c < numCols; c++) {
    headers.push(XLSX.utils.encode_col(range.s.c + c));
  }

  for (let r = 0; r < numRows; r++) {
    const row: SpreadsheetCellValue[] = [];
    for (let c = 0; c < numCols; c++) {
      const rowIdx = range.s.r + r;
      const colIdx = range.s.c + c;
      const cell = worksheet[XLSX.utils.encode_cell({ r: rowIdx, c: colIdx })];

      row.push(parseCellValue(cell));
    }
    allRows.push(row);
  }

  const lastNonBlank = allRows.reduce(
    (last, row, idx) =>
      row.some((c) => c !== undefined && String(c).trim() !== '') ? idx : last,
    -1,
  );
  const rows = lastNonBlank >= 0 ? allRows.slice(0, lastNonBlank + 1) : [];
  return { headers, rows, rowOffset: range.s.r, colOffset: range.s.c };
};

export const parseSpreadsheet = async (file: File): Promise<GridData> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, {
    cellDates: true,
    cellNF: true,
    cellFormula: true,
    UTC: true,
  });
  const sheets = workbook.SheetNames.map((name) =>
    parseSheetGrid(workbook.Sheets[name]),
  );
  return { sheetNames: workbook.SheetNames, sheets };
};
