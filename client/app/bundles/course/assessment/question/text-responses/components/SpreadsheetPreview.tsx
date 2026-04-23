import { useEffect, useRef, useState } from 'react';
import { Button, Checkbox, FormControlLabel, Popover, TextField, Tooltip, Typography } from '@mui/material';
import * as XLSX from 'xlsx';

export type CellRandomConfig = {
  isRandomizable: boolean;
  min: number;
  max: number;
};

interface SpreadsheetPreviewProps {
  file: File;
  randomConfig: Record<string, CellRandomConfig>;
  onRandomConfigChange: (config: Record<string, CellRandomConfig>) => void;
  substitutions: Record<string, string>;
  onSubstitutionsChange: (subs: Record<string, string>) => void;
}

export type GridData = {
  sheetNames: string[];
  headers: string[];
  rows: string[][];
};

type PopoverState = {
  anchorEl: HTMLTableCellElement;
  rowIdx: number;
  colIdx: number;
  mode: 'randomize' | 'substitute';
  cellValue: number;
};

// Hard-coded ranges for the auto-detect mockup (0-indexed row/col).
// C4:C8  → col 2, rows 3–7
// C13:E17 → cols 2–4, rows 12–16
const AUTO_DETECT_RANGES = [
  { rowStart: 3, rowEnd: 7, colStart: 2, colEnd: 2 },
  { rowStart: 12, rowEnd: 16, colStart: 2, colEnd: 4 },
];

export const isNumericCell = (val: string): boolean => val.trim() !== '' && !Number.isNaN(Number(val));

export const cellKey = (rowIdx: number, colIdx: number): string => `${rowIdx}-${colIdx}`;

const round2 = (n: number): number => Math.round(n * 100) / 100;

export const parseSpreadsheet = async (file: File): Promise<GridData> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json<(string | number | boolean)[]>(worksheet, {
    header: 1,
    defval: '',
  });
  const maxCols = data.reduce((max, row) => Math.max(max, (row as unknown[]).length), 0);
  const headers = Array.from({ length: maxCols }, (_, i) => XLSX.utils.encode_col(i));
  const allRows = data.map((row) =>
    Array.from({ length: maxCols }, (_, i) => String((row as (string | number | boolean)[])[i] ?? '')),
  );
  const lastNonBlank = allRows.reduce(
    (last: number, row: string[], idx: number) => (row.some((cell: string) => cell !== '') ? idx : last),
    -1,
  );
  return {
    sheetNames: workbook.SheetNames,
    headers,
    rows: lastNonBlank >= 0 ? allRows.slice(0, lastNonBlank + 1) : [],
  };
};

const SpreadsheetPreview = ({
  file,
  randomConfig,
  onRandomConfigChange,
  substitutions,
  onSubstitutionsChange,
}: SpreadsheetPreviewProps): JSX.Element => {
  const [grid, setGrid] = useState<GridData | null>(null);
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const [openTooltipKey, setOpenTooltipKey] = useState<string | null>(null);
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    parseSpreadsheet(file).then((parsed) => {
      if (!cancelled) setGrid(parsed);
    });
    return (): void => { cancelled = true; };
  }, [file]);

  if (!grid) return <></>;

  const handleCellClick = (
    e: React.MouseEvent<HTMLTableCellElement>,
    rowIdx: number,
    colIdx: number,
    value: string,
  ): void => {
    const key = cellKey(rowIdx, colIdx);
    setPopover({
      anchorEl: e.currentTarget,
      rowIdx,
      colIdx,
      mode: isNumericCell(value) ? 'randomize' : 'substitute',
      cellValue: isNumericCell(value) ? Number(value) : 0,
    });
  };

  const handleAutoDetect = (): void => {
    const newConfig: Record<string, CellRandomConfig> = {};
    for (const { rowStart, rowEnd, colStart, colEnd } of AUTO_DETECT_RANGES) {
      for (let r = rowStart; r <= rowEnd; r++) {
        for (let c = colStart; c <= colEnd; c++) {
          const cell = grid.rows[r]?.[c];
          if (cell === undefined || !isNumericCell(cell)) continue;
          const val = Number(cell);
          newConfig[cellKey(r, c)] = {
            isRandomizable: true,
            min: round2(val * 0.9),
            max: round2(val * 1.1),
          };
        }
      }
    }
    onRandomConfigChange(newConfig);
    setPopover(null);
  };

  const activeKey = popover ? cellKey(popover.rowIdx, popover.colIdx) : '';
  const activeConfig = popover ? randomConfig[activeKey] : undefined;
  const activeMin = activeConfig?.min ?? (popover ? round2(popover.cellValue * 0.9) : 0);
  const activeMax = activeConfig?.max ?? (popover ? round2(popover.cellValue * 1.1) : 0);

  const openTooltip = (tooltipKey: string): void => {
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    setOpenTooltipKey(tooltipKey);
    tooltipTimerRef.current = setTimeout(() => setOpenTooltipKey(null), 10000);
  };

  const closeTooltip = (): void => {
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    setOpenTooltipKey(null);
  };

  const updateConfig = (updates: Partial<CellRandomConfig>): void => {
    if (!popover) return;
    onRandomConfigChange({
      ...randomConfig,
      [activeKey]: {
        isRandomizable: randomConfig[activeKey]?.isRandomizable ?? false,
        min: randomConfig[activeKey]?.min ?? round2(popover.cellValue * 0.9),
        max: randomConfig[activeKey]?.max ?? round2(popover.cellValue * 1.1),
        ...updates,
      },
    });
  };

  return (
    <>
      <div className="flex flex-col space-y-3">
        <div className="flex flex-col space-y-1 mt-3">
          <Typography variant="body1">Variable Configuration</Typography>
          <Typography className="text-neutral-500" variant="body2">
            Click on cells to configure randomization for independent variables, or to insert helper values into cells used in grading.
          </Typography>
          <Button className="w-fit" onClick={handleAutoDetect} size="small" variant="outlined">
            Automatically detect randomizable variables
          </Button>
        </div>

        {grid.sheetNames.length > 1 && (
          <Typography className="text-neutral-500" variant="caption">
            Previewing sheet: <strong>{grid.sheetNames[0]}</strong> ({grid.sheetNames.length} sheets total)
          </Typography>
        )}

        <div className="overflow-auto rounded border border-solid border-neutral-300" style={{ maxHeight: 320 }}>
          <table className="border-collapse cursor-default select-none text-md" style={{ tableLayout: 'fixed' }}>
            <thead className="sticky top-0 bg-neutral-200">
              <tr>
                <th className="w-10 border border-solid border-neutral-300 px-1 py-0.5 text-center text-neutral-400" />
                {grid.headers.map((h) => (
                  <th
                    key={h}
                    className="min-w-[80px] border border-solid border-neutral-300 px-2 py-0.5 text-center font-medium text-neutral-600"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.rows.map((row, rowIdx) => (
                // eslint-disable-next-line react/no-array-index-key
                <tr key={rowIdx}>
                  <td className="bg-neutral-200 border border-solid border-neutral-300 px-1 py-0.5 text-center text-neutral-400">
                    {rowIdx + 1}
                  </td>
                  {row.map((cell, colIdx) => {
                    const key = cellKey(rowIdx, colIdx);
                    const numeric = isNumericCell(cell);
                    const cfg = randomConfig[key];
                    const substituted = substitutions[key];
                    const isActive = popover?.rowIdx === rowIdx && popover?.colIdx === colIdx;
                    let bgClass = 'bg-white';
                    if (substituted) {
                      bgClass = 'bg-yellow-100';
                    } else if (numeric) {
                      bgClass = cfg?.isRandomizable ? 'bg-blue-200' : 'bg-blue-50';
                    }
                    const tooltipTitle = !isActive && (
                      substituted
                        ? 'This cell will contain the specified value during grading.'
                        : cfg?.isRandomizable
                          ? 'This cell will be randomized during grading.'
                          : numeric
                            ? 'This cell might contain a randomizable variable.'
                            : ''
                    );
                    return (
                      // eslint-disable-next-line react/no-array-index-key
                      // <Tooltip key={colIdx} title={tooltipTitle || ''}>
                        <td
                          className={`border border-solid border-neutral-300 px-2 py-0.5 cursor-pointer ${bgClass} ${isActive ? 'outline outline-2 outline-blue-400' : ''}`}
                          onClick={(e) => handleCellClick(e, rowIdx, colIdx, cell)}
                        >
                          {substituted ?? cell}
                        </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {popover && (
        <Popover
          open
          anchorEl={popover.anchorEl}
          onClose={() => setPopover(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          {popover?.mode === 'randomize' ? (
            <div className="flex flex-col space-y-3 p-4" style={{ width: 240 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={activeConfig?.isRandomizable ?? false}
                    onChange={(e) => updateConfig({ isRandomizable: e.target.checked })}
                    size="small"
                  />
                }
                label="Mark as randomizable"
              />
              <TextField
                disabled={!(activeConfig?.isRandomizable ?? false)}
                label="Min value"
                size="small"
                type="number"
                value={activeMin}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  if (!Number.isNaN(v)) updateConfig({ min: v });
                }}
              />
              <TextField
                disabled={!(activeConfig?.isRandomizable ?? false)}
                label="Max value"
                size="small"
                type="number"
                value={activeMax}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  if (!Number.isNaN(v)) updateConfig({ max: v });
                }}
              />
            </div>
          ) : (
            <div className="p-4" style={{ width: 240 }}>
              <TextField
                autoFocus
                fullWidth
                label="Inserted Value"
                size="small"
                value={substitutions[activeKey] ?? ''}
                onChange={(e) =>
                  onSubstitutionsChange({ ...substitutions, [activeKey]: e.target.value })
                }
              />
            </div>
          )}
        </Popover>
      )}
    </>
  );
};

export default SpreadsheetPreview;
