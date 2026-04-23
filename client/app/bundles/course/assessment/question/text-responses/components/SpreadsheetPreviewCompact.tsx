import { useEffect, useRef, useState } from 'react';
import { Tooltip, Typography } from '@mui/material';

import {
  type CellRandomConfig,
  type GridData,
  cellKey,
  isNumericCell,
  parseSpreadsheet,
} from './SpreadsheetPreview';

interface SpreadsheetPreviewCompactProps {
  file: File;
  randomConfig: Record<string, CellRandomConfig>;
  substitutions: Record<string, string>;
}

const SpreadsheetPreviewCompact = ({
  file,
  randomConfig,
  substitutions,
}: SpreadsheetPreviewCompactProps): JSX.Element => {
  const [grid, setGrid] = useState<GridData | null>(null);
  const [openTooltipKey, setOpenTooltipKey] = useState<string | null>(null);
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openTooltip = (tooltipKey: string): void => {
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    setOpenTooltipKey(tooltipKey);
    tooltipTimerRef.current = setTimeout(() => setOpenTooltipKey(null), 10000);
  };

  const closeTooltip = (): void => {
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    setOpenTooltipKey(null);
  };

  useEffect(() => {
    let cancelled = false;
    parseSpreadsheet(file).then((parsed) => {
      if (!cancelled) setGrid(parsed);
    });
    return (): void => { cancelled = true; };
  }, [file]);

  if (!grid) return <></>;

  return (
    <div className="flex flex-col space-y-1">
      {grid.sheetNames.length > 1 && (
        <Typography className="text-neutral-500" variant="caption">
          Previewing sheet: <strong>{grid.sheetNames[0]}</strong> ({grid.sheetNames.length} sheets total)
        </Typography>
      )}
      <div className="overflow-auto rounded border border-solid border-neutral-300" style={{ maxHeight: 200 }}>
        <table className="border-collapse cursor-default select-none text-xs" style={{ tableLayout: 'fixed' }}>
          <thead className="sticky top-0 bg-neutral-200">
            <tr>
              <th className="w-8 border border-solid border-neutral-300 px-1 py-px text-center text-neutral-400" />
              {grid.headers.map((h) => (
                <th
                  key={h}
                  className="min-w-[60px] border border-solid border-neutral-300 px-1 py-px text-center font-medium text-neutral-600"
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
                <td className="bg-neutral-200 border border-solid border-neutral-300 px-1 py-px text-center text-neutral-400">
                  {rowIdx + 1}
                </td>
                {row.map((cell, colIdx) => {
                  const key = cellKey(rowIdx, colIdx);
                  const numeric = isNumericCell(cell);
                  const cfg = randomConfig[key];
                  const substituted = substitutions[key];
                  let bgClass = 'bg-white';
                  if (substituted) {
                    bgClass = 'bg-yellow-100';
                  } else if (numeric) {
                    bgClass = cfg?.isRandomizable ? 'bg-blue-200' : 'bg-blue-50';
                  }
                  const tooltipTitle = substituted
                    ? 'This cell will contain the specified value during grading.'
                    : cfg?.isRandomizable
                      ? 'This cell will be randomized during grading.'
                      : numeric
                        ? 'This cell might contain a randomizable variable.'
                        : '';
                  return (
                    // eslint-disable-next-line react/no-array-index-key
                    <Tooltip
                      key={colIdx}
                      title={tooltipTitle}
                      open={!!tooltipTitle && openTooltipKey === key}
                      onOpen={() => tooltipTitle && openTooltip(key)}
                      onClose={closeTooltip}
                      PopperProps={{ modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] }}
                    >
                      <td className={`border border-solid border-neutral-300 px-1 py-px ${bgClass}`}>
                        {substituted ?? cell}
                      </td>
                    </Tooltip>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SpreadsheetPreviewCompact;
