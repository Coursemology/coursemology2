export type SpreadsheetCellValue = string | number | Date | undefined;

export interface SheetGrid {
  headers: string[];
  rows: SpreadsheetCellValue[][];
  rowOffset: number;
  colOffset: number;
}

export interface GridData {
  sheetNames: string[];
  sheets: SheetGrid[];
}
