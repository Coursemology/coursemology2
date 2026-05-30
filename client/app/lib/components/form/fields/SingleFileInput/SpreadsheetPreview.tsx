import { FC, useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

import useTranslation from 'lib/hooks/useTranslation';

import translations from './translations';

interface SpreadsheetPreviewProps {
  file: File | null;
  activeCellKey?: string | null;
  getCellClassName?: (cellValue: string | undefined, cellKey: string) => string;
  onCellClick?: (
    e: React.MouseEvent<HTMLTableCellElement>,
    rowIdx: number,
    colIdx: number,
    sheetName: string,
    cellValue: string | undefined,
  ) => void;
  renderCell?: (
    cellValue: string | undefined,
    cellKey: string,
  ) => React.ReactNode;
}

export interface SheetGrid {
  headers: string[];
  rows: (string | undefined)[][];
  rowOffset: number;
  colOffset: number;
}

export interface GridData {
  sheetNames: string[];
  sheets: SheetGrid[];
}

export const isNumericCell = (val: string | undefined): boolean =>
  !!val && val.trim() !== '' && !Number.isNaN(Number(val));

export const getCellKey = (
  rowIdx: number,
  colIdx: number,
  sheetName: string,
): string => `${sheetName}!${XLSX.utils.encode_cell({ r: rowIdx, c: colIdx })}`;

const parseSheetGrid = (worksheet: XLSX.WorkSheet): SheetGrid => {
  const ref = worksheet['!ref'];
  if (!ref) return { headers: [], rows: [], rowOffset: 0, colOffset: 0 };

  const range = XLSX.utils.decode_range(ref);
  const numCols = range.e.c - range.s.c + 1;
  const numRows = range.e.r - range.s.r + 1;
  const headers: string[] = [];
  const allRows: (string | undefined)[][] = [];

  for (let c = 0; c < numCols; c++) {
    headers.push(XLSX.utils.encode_col(range.s.c + c));
  }

  for (let r = 0; r < numRows; r++) {
    const row: (string | undefined)[] = [];
    for (let c = 0; c < numCols; c++) {
      const rowIdx = range.s.r + r;
      const colIdx = range.s.c + c;
      const cell = worksheet[XLSX.utils.encode_cell({ r: rowIdx, c: colIdx })];

      row.push(
        cell === null || cell === undefined
          ? undefined
          : String(cell.f ?? cell.v ?? ''),
      );
    }
    allRows.push(row);
  }

  const lastNonBlank = allRows.reduce(
    (last, row, idx) =>
      row.some((c) => c !== undefined && c.trim() !== '') ? idx : last,
    -1,
  );
  const rows = lastNonBlank >= 0 ? allRows.slice(0, lastNonBlank + 1) : [];
  return { headers, rows, rowOffset: range.s.r, colOffset: range.s.c };
};

export const parseSpreadsheet = async (file: File): Promise<GridData> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer);
  const sheets = workbook.SheetNames.map((name) =>
    parseSheetGrid(workbook.Sheets[name]),
  );
  return { sheetNames: workbook.SheetNames, sheets };
};

const SpreadsheetPreview: FC<SpreadsheetPreviewProps> = ({
  file,
  activeCellKey,
  onCellClick,
  renderCell,
  getCellClassName,
}) => {
  const { t } = useTranslation();

  const [grid, setGrid] = useState<GridData | null>(null);
  const [activeSheetIdx, setActiveSheetIdx] = useState(0);
  const [activeCell, setActiveCell] = useState<{
    rowIdx: number;
    colIdx: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setActiveSheetIdx(0);
    if (file) {
      parseSpreadsheet(file).then((parsed) => {
        if (!cancelled) setGrid(parsed);
      });
    }
    return (): void => {
      cancelled = true;
    };
  }, [file]);

  if (!grid) {
    return <div className="block">{t(translations.dropzone)}</div>;
  }

  const sheet = grid.sheets[activeSheetIdx];
  const multiSheet = grid.sheetNames.length > 1;

  const getFullCellClassName = (
    cellValue: string | undefined,
    cellKey: string,
    isActive: boolean,
  ): string => {
    return [
      'cursor-pointer border border-solid border-neutral-300 px-2 py-0.5 bg-white',
      `${isNumericCell(cellValue) ? 'text-right' : 'text-left'}`,
      `${isActive ? 'outline outline-2 outline-blue-400' : ''}`,
      `${getCellClassName ? getCellClassName(cellValue, cellKey) : ''}`,
    ].join(' ');
  };

  return (
    <div className="flex min-w-0 flex-col">
      <div
        className={`overflow-auto border border-solid border-neutral-300 ${multiSheet ? 'rounded-t' : 'rounded'}`}
        style={{ maxHeight: 320 }}
      >
        <table
          className="border-collapse cursor-default select-none text-md"
          style={{ tableLayout: 'fixed' }}
        >
          <thead className="sticky top-0 bg-neutral-200 border-b-0">
            <tr>
              <th className="top-0 z-10 w-10 border border-b-0 border-solid border-neutral-300 px-1 py-0.5 text-center text-neutral-400" />
              {sheet.headers.map((h) => (
                <th
                  key={h}
                  className="top-0 z-10 min-w-[80px] border border-b-0 border-solid border-neutral-300 px-2 py-0.5 text-center font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sheet.rows.map((row, rowLocalIdx) => {
              const rowIdx = sheet.rowOffset + rowLocalIdx;

              return (
                <tr key={rowIdx}>
                  <td className="border border-solid border-neutral-300 bg-neutral-200 px-1 py-0.5 text-center text-neutral-400">
                    {rowIdx + 1}
                  </td>
                  {row.map((cellValue, colLocalIdx) => {
                    const colIdx = sheet.colOffset + colLocalIdx;
                    const cellKey = getCellKey(
                      rowIdx,
                      colIdx,
                      grid.sheetNames[activeSheetIdx],
                    );
                    const isActive =
                      activeCellKey !== undefined
                        ? activeCellKey === cellKey
                        : activeCell?.rowIdx === rowIdx &&
                          activeCell?.colIdx === colIdx;
                    return (
                      <td
                        key={`td-${rowIdx}-${colIdx}`}
                        className={getFullCellClassName(
                          cellValue,
                          cellKey,
                          isActive && Boolean(onCellClick),
                        )}
                        data-cell-key={cellKey}
                        onClick={(e) => {
                          setActiveCell({ rowIdx, colIdx });
                          onCellClick?.(
                            e,
                            rowIdx,
                            colIdx,
                            grid.sheetNames[activeSheetIdx],
                            cellValue,
                          );
                        }}
                      >
                        {renderCell
                          ? renderCell(cellValue, cellKey)
                          : cellValue ?? ''}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {multiSheet && (
        <table className="border-collapse cursor-default select-none text-md">
          <thead>
            <tr className="flex items-stretch overflow-x-auto rounded-b border-x border-b border-solid border-neutral-300 bg-neutral-100">
              {grid.sheetNames.map((name, i) => (
                <th
                  key={name}
                  className={`min-w-16 border border-solid border-neutral-300 px-2 py-0.5 text-center text-neutral-400 cursor-pointer transition-colors ${
                    i === activeSheetIdx
                      ? 'border-t border-t-blue-500 bg-white font-medium'
                      : 'text-neutral-600 hover:bg-neutral-200'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSheetIdx(i);
                    setActiveCell(null);
                  }}
                >
                  {name}
                </th>
              ))}
            </tr>
          </thead>
        </table>
      )}
    </div>
  );
};

export default SpreadsheetPreview;
