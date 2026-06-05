import { FC, useEffect, useState } from 'react';

import useTranslation from 'lib/hooks/useTranslation';

import { SpreadsheetCellValueView } from './SpreadsheetCellValueView';
import translations from './translations';
import { GridData, SpreadsheetCellValue } from './types';
import { getCellKey, parseSpreadsheet } from './utils';

interface SpreadsheetPreviewProps {
  file: File | null;
  activeCellKey?: string | null;
  getCellClassName?: (
    cellValue: SpreadsheetCellValue,
    cellKey: string,
  ) => string;
  onCellClick?: (
    e: React.MouseEvent<HTMLTableCellElement>,
    rowIdx: number,
    colIdx: number,
    sheetName: string,
    cellValue: SpreadsheetCellValue,
  ) => void;
  renderCell?: (
    cellValue: SpreadsheetCellValue,
    cellKey: string,
  ) => React.ReactNode;
}

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
    cellValue: SpreadsheetCellValue,
    cellKey: string,
    isActive: boolean,
  ): string => {
    return [
      'cursor-pointer border border-solid border-neutral-300 px-2 py-0.5 bg-white',
      `${typeof cellValue === 'number' || cellValue instanceof Date ? 'text-right' : 'text-left'}`,
      `${isActive ? 'outline outline-2 outline-blue-400' : ''}`,
      `${getCellClassName ? getCellClassName(cellValue, cellKey) : ''}`,
    ].join(' ');
  };

  return (
    <div className="flex min-w-0 flex-col">
      <div
        className={`overflow-auto border border-solid border-neutral-300 ${multiSheet ? 'rounded-t' : 'rounded'}`}
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
                        {renderCell ? (
                          renderCell(cellValue, cellKey)
                        ) : (
                          <SpreadsheetCellValueView cellValue={cellValue} />
                        )}
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
