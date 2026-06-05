import { FC, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { InsertInvitation, PushPin } from '@mui/icons-material';
import {
  Button,
  Divider,
  FormControlLabel,
  Popover,
  PopoverActions,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import {
  CellRandomConfig,
  CellRandomConfigBody,
} from 'types/course/assessment/question/text-responses';

import { SpreadsheetCellValueView } from 'lib/components/form/fields/SingleFileInput/SpreadsheetCellValueView';
import SpreadsheetPreview from 'lib/components/form/fields/SingleFileInput/SpreadsheetPreview';
import {
  GridData,
  SheetGrid,
  SpreadsheetCellValue,
} from 'lib/components/form/fields/SingleFileInput/types';
import {
  getCellKey,
  parseSpreadsheet,
} from 'lib/components/form/fields/SingleFileInput/utils';
import AZIcon from 'lib/components/icons/AZIcon';
import OneNineIcon from 'lib/components/icons/OneNineIcon';
import RandomizeIcon from 'lib/components/icons/RandomizeIcon';
import useTranslation from 'lib/hooks/useTranslation';
import { formatRawDate } from 'lib/moment';

import translations from '../../../translations';
import {
  getDefaultRandomizationConfig,
  getDefaultRandomizationMode,
} from '../utils';

import DateRandomizationManager from './DateRandomizationManager';
import NumericRandomizationManager from './NumericRandomizationManager';
import OverrideRandomizationManager from './OverrideRandomizationManager';
import ShuffleRandomizationManager from './ShuffleRandomizationManager';
import StringRandomizationManager from './StringRandomizationManager';

interface Props {
  file?: File;
  initialVariables?: CellRandomConfig[];
  onVariablesChange?: (variables: CellRandomConfig[]) => void;
}

interface PopoverState {
  anchorEl: HTMLTableCellElement;
  cellKey: string;
  cellValue: SpreadsheetCellValue;
  rowIdx: number;
  colIdx: number;
  sheetIdx: number;
}

type CellRandomConfigsState = {
  [M in CellRandomConfig['mode']]?: CellRandomConfigBody<M>;
} & { activeMode: CellRandomConfig['mode'] };

type CellRandomConfigState = Record<string, CellRandomConfigsState>;

const initDefaultConfig = (
  config: { [K in CellRandomConfig['mode']]?: CellRandomConfigBody<K> },
  mode: Exclude<CellRandomConfig['mode'], 'off'>,
  cellValue: SpreadsheetCellValue,
): void => {
  // The switch-case is necessary so TypeScript can properly follow type declarations
  /* eslint-disable sonarjs/no-duplicated-branches */
  switch (mode) {
    case 'numeric':
      config[mode] =
        config[mode] ?? getDefaultRandomizationConfig(cellValue, mode);
      break;
    case 'date':
      config[mode] =
        config[mode] ?? getDefaultRandomizationConfig(cellValue, mode);
      break;
    case 'string':
      config[mode] =
        config[mode] ?? getDefaultRandomizationConfig(cellValue, mode);
      break;
    case 'shuffle':
      config[mode] =
        config[mode] ?? getDefaultRandomizationConfig(cellValue, mode);
      break;
    case 'override':
      config[mode] =
        config[mode] ?? getDefaultRandomizationConfig(cellValue, mode);
      break;
    default:
      break;
  }
  /* eslint-enable sonarjs/no-duplicated-branches */
};

const initSpreadsheetDefaultConfig: (
  sheetNames: string[],
  sheets: SheetGrid[],
) => CellRandomConfigState = (sheetNames, sheets) => {
  const defaultConfig: CellRandomConfigState = {};
  sheets.forEach((sheet, sheetIdx) => {
    const sheetName = sheetNames[sheetIdx];
    sheet.rows.forEach((row, rowLocalIdx) => {
      row.forEach((cellValue, colLocalIdx) => {
        const cellKey = getCellKey(
          sheet.rowOffset + rowLocalIdx,
          sheet.colOffset + colLocalIdx,
          sheetName,
        );
        const mode = getDefaultRandomizationMode(cellValue);
        const cellConfig: CellRandomConfigsState = { activeMode: mode };
        if (mode !== 'off') initDefaultConfig(cellConfig, mode, cellValue);
        defaultConfig[cellKey] = cellConfig;
      });
    });
  });
  return defaultConfig;
};

const fromVariables = (
  variables?: CellRandomConfig[],
): CellRandomConfigState | undefined => {
  if (!variables) return undefined;

  return Object.fromEntries(
    variables.map((config) => {
      const { cell, mode, ...rest } = config;
      return [cell, { activeMode: mode, [mode]: rest }];
    }),
  );
};

const toVariables = (state: CellRandomConfigState): CellRandomConfig[] =>
  Object.entries(state)
    .filter(([, cfg]) => cfg.activeMode !== 'off')
    .map(
      ([cell, cfg]) =>
        ({
          cell,
          mode: cfg.activeMode,
          ...(cfg[cfg.activeMode] ?? {}),
        }) as CellRandomConfig,
    );

const CellRandomConfigIndicator: FC<{ mode: string }> = ({ mode }) => {
  switch (mode) {
    case 'override':
      return <PushPin className="align-middle h-full text-xl" color="info" />;
    case 'numeric':
      return (
        <OneNineIcon className="align-middle h-full text-xl" color="info" />
      );
    case 'date':
      return (
        <InsertInvitation
          className="align-middle h-full text-xl"
          color="info"
        />
      );
    case 'string':
      return <AZIcon className="align-middle h-full text-xl" color="info" />;
    case 'shuffle':
      return (
        <RandomizeIcon className="align-middle h-full text-xl" color="info" />
      );
    default:
      return null;
  }
};

const CellOverrideContent: FC<{
  cellValue: SpreadsheetCellValue;
  cellConfig: CellRandomConfigsState;
}> = ({ cellValue, cellConfig }) => {
  switch (cellConfig.activeMode) {
    case 'override':
      return (
        <span className="flex-1 text-blue-800">
          <SpreadsheetCellValueView
            cellValue={cellConfig.override?.value ?? cellValue}
          />
        </span>
      );
    case 'numeric':
      if (
        cellConfig.numeric?.min !== undefined &&
        cellConfig.numeric?.max !== undefined
      ) {
        const min = cellConfig.numeric.roundToInteger
          ? Math.floor(cellConfig.numeric.min)
          : cellConfig.numeric.min;
        const max = cellConfig.numeric.roundToInteger
          ? Math.floor(cellConfig.numeric.max)
          : cellConfig.numeric.max;
        return (
          <span className="flex-1 text-blue-800">
            {min} - {max}
          </span>
        );
      }
      return (
        <span className="flex-1">
          <SpreadsheetCellValueView cellValue={cellValue} />
        </span>
      );
    case 'date':
      if (
        cellConfig.date?.min !== undefined &&
        cellConfig.date?.max !== undefined
      ) {
        return (
          <span className="flex-1 text-blue-800">
            {formatRawDate(cellConfig.date.min)} -{' '}
            {formatRawDate(cellConfig.date.max)}
          </span>
        );
      }
      return (
        <span className="flex-1">
          <SpreadsheetCellValueView cellValue={cellValue} />
        </span>
      );
    case 'string':
    case 'shuffle':
      return (
        <span className="flex-1 text-blue-800">
          <SpreadsheetCellValueView cellValue={cellValue} />
        </span>
      );
    default:
      return (
        <span className="flex-1">
          <SpreadsheetCellValueView cellValue={cellValue} />
        </span>
      );
  }
};

const SpreadsheetRandomizationManager: FC<Props> = ({
  file,
  initialVariables,
  onVariablesChange,
}) => {
  const { t } = useTranslation();

  const [popover, setPopover] = useState<PopoverState | null>(null);
  const [cellConfigs, setCellConfigs] = useState<
    CellRandomConfigState | undefined
  >(() => fromVariables(initialVariables));
  const [gridData, setGridData] = useState<GridData | null>(null);
  const popoverActionsRef = useRef<PopoverActions>(null);
  const spreadsheetRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<File | undefined>(undefined);

  const updateCellConfigs = (newState: CellRandomConfigState): void => {
    setCellConfigs(newState);
    onVariablesChange?.(toVariables(newState));
  };

  const initSpreadsheetDefaultConfigFromFile = async (
    override: boolean,
  ): Promise<void> => {
    if (!file) return;
    const data = await parseSpreadsheet(file);
    setGridData(data);
    if (override) {
      updateCellConfigs(
        initSpreadsheetDefaultConfig(data.sheetNames, data.sheets),
      );
    }
  };

  // If there is a previous file, we always override because old config structure is no longer valid.
  // If there are initial variables, it implies this is the first render editing a spreadsheet formula, so don't override.
  // If there are no initial variables, this triggers when a file is uploaded for the first time creating new spreadsheet formula solution.
  useEffect(() => {
    initSpreadsheetDefaultConfigFromFile(
      Boolean(fileRef.current) || !initialVariables,
    );
    fileRef.current = file;
    return (): void => {
      fileRef.current = undefined;
    };
  }, [file]);

  const isEditableElement = (el: Element | null): boolean => {
    if (!el) return false;
    if (el instanceof HTMLTextAreaElement) return true;
    if (el instanceof HTMLInputElement)
      return el.type !== 'radio' && el.type !== 'checkbox';
    return el instanceof HTMLElement && el.isContentEditable;
  };

  const handleArrowKey = (e: KeyboardEvent): void => {
    if (isEditableElement(document.activeElement)) return;
    const deltas: Record<string, [number, number]> = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    const delta = deltas[e.key];
    if (!delta || !popover || !gridData) return;
    e.preventDefault();

    const sheet = gridData.sheets[popover.sheetIdx];
    const sheetName = gridData.sheetNames[popover.sheetIdx];
    const newRowIdx = Math.max(
      sheet.rowOffset,
      Math.min(
        sheet.rowOffset + sheet.rows.length - 1,
        popover.rowIdx + delta[0],
      ),
    );
    const newColIdx = Math.max(
      sheet.colOffset,
      Math.min(
        sheet.colOffset + sheet.headers.length - 1,
        popover.colIdx + delta[1],
      ),
    );
    if (newRowIdx === popover.rowIdx && newColIdx === popover.colIdx) return;

    const newCellKey = getCellKey(newRowIdx, newColIdx, sheetName);
    const newAnchorEl =
      spreadsheetRef.current?.querySelector<HTMLTableCellElement>(
        `[data-cell-key="${newCellKey}"]`,
      );
    if (!newAnchorEl) return;

    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();

    setPopover({
      anchorEl: newAnchorEl,
      cellKey: newCellKey,
      cellValue:
        sheet.rows[newRowIdx - sheet.rowOffset]?.[newColIdx - sheet.colOffset],
      rowIdx: newRowIdx,
      colIdx: newColIdx,
      sheetIdx: popover.sheetIdx,
    });
    // Defer until after React commits and MUI's internal focus-scroll settles,
    // then reposition the already-open popover and scroll the cell into view.
    requestAnimationFrame(() => {
      popoverActionsRef.current?.updatePosition();
      newAnchorEl.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
  };

  const activeConfig = popover ? cellConfigs?.[popover.cellKey] : undefined;
  const activeMode = activeConfig?.activeMode ?? 'off';

  const handleModeChange = (mode: CellRandomConfig['mode']): void => {
    if (!popover || !cellConfigs) return;
    const newCellConfig: CellRandomConfigsState = {
      ...activeConfig,
      activeMode: mode,
    };
    if (mode !== 'off')
      initDefaultConfig(newCellConfig, mode, popover.cellValue);
    updateCellConfigs({ ...cellConfigs, [popover.cellKey]: newCellConfig });
  };

  const handleClearAll = (): void => {
    if (cellConfigs !== undefined) {
      updateCellConfigs(
        Object.fromEntries(
          Object.keys(cellConfigs).map((cellKey) => [
            cellKey,
            { ...cellConfigs[cellKey], activeMode: 'off' },
          ]),
        ),
      );
    }
  };

  if (!file) return null;

  return (
    <>
      <div className="flex flex-col space-y-1 mt-3">
        <Typography variant="body1">
          {t(translations.randomizationMode)}
        </Typography>
        <Typography className="text-neutral-500" variant="body2">
          {t(translations.randomizationModeDescription)}
        </Typography>
      </div>

      <div className="flex flex-row space-x-5">
        <Button
          className="w-fit"
          onClick={handleClearAll}
          size="small"
          variant="outlined"
        >
          {t(translations.randomizationModeClearAll)}
        </Button>
        <Button
          className="w-fit"
          onClick={() => initSpreadsheetDefaultConfigFromFile(true)}
          size="small"
          variant="outlined"
        >
          {t(translations.randomizationModeRestoreDefaults)}
        </Button>
      </div>

      <div ref={spreadsheetRef}>
        <SpreadsheetPreview
          activeCellKey={popover?.cellKey ?? null}
          file={file}
          getCellClassName={(_, key) => {
            const config = cellConfigs?.[key];
            return config?.activeMode && config.activeMode !== 'off'
              ? 'bg-blue-100'
              : '';
          }}
          onCellClick={(e, rowIdx, colIdx, sheetName, cellValue) => {
            setPopover({
              anchorEl: e.currentTarget,
              cellKey: getCellKey(rowIdx, colIdx, sheetName),
              cellValue,
              rowIdx,
              colIdx,
              sheetIdx: gridData?.sheetNames.indexOf(sheetName) ?? 0,
            });
          }}
          renderCell={(cellValue, key) => {
            const cellConfig = cellConfigs?.[key] ?? { activeMode: 'off' };
            const icon = (
              <CellRandomConfigIndicator
                mode={cellConfig?.activeMode ?? 'off'}
              />
            );
            const content = (
              <CellOverrideContent
                cellConfig={cellConfig}
                cellValue={cellValue}
              />
            );
            if (!icon) return content;
            return (
              <div className="flex justify-between space-x-1">
                <span>{icon}</span>
                {content}
              </div>
            );
          }}
        />
      </div>

      {popover && (
        <Popover
          action={popoverActionsRef}
          anchorEl={popover.anchorEl}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          onClose={() => setPopover(null)}
          onKeyDownCapture={handleArrowKey}
          open
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          <div className="flex flex-row">
            <div className="flex flex-col space-y-2 p-4">
              <Typography
                className="font-medium text-neutral-600"
                variant="caption"
              >
                {t(translations.randomizationModePopoverTitle)}
              </Typography>
              <RadioGroup
                onChange={(e) =>
                  handleModeChange(e.target.value as CellRandomConfig['mode'])
                }
                value={activeMode}
              >
                {(
                  [
                    {
                      value: 'off',
                      label: t(translations.noRandomizationMode),
                    },
                    {
                      value: 'override',
                      label: t(translations.overrideRandomizationMode),
                    },
                    {
                      value: 'numeric',
                      label: t(translations.numericRandomizationMode),
                    },
                    {
                      value: 'date',
                      label: t(translations.dateRandomizationMode),
                    },
                    {
                      value: 'string',
                      label: t(translations.stringRandomizationMode),
                    },
                    {
                      value: 'shuffle',
                      label: t(translations.shuffleRandomizationMode),
                    },
                  ] as { value: CellRandomConfig['mode']; label: string }[]
                ).map(({ value, label }) => (
                  <FormControlLabel
                    key={value}
                    componentsProps={{
                      typography: {
                        variant: 'caption',
                        className: 'font-medium text-neutral-600',
                      },
                    }}
                    control={<Radio className="p-1" size="small" />}
                    label={
                      <>
                        <CellRandomConfigIndicator mode={value} /> {label}
                      </>
                    }
                    sx={{ margin: 0 }}
                    value={value}
                  />
                ))}
              </RadioGroup>
            </div>
            {activeMode !== 'off' && activeConfig && (
              <>
                <Divider flexItem orientation="vertical" variant="middle" />
                <div className="flex flex-col justify-start p-4 w-144">
                  {activeMode === 'numeric' && (
                    <NumericRandomizationManager
                      config={activeConfig.numeric!}
                      onBlur={() => {
                        const { min, max, roundToInteger } =
                          activeConfig.numeric!;
                        if (min > max)
                          updateCellConfigs({
                            ...cellConfigs,
                            [popover.cellKey]: {
                              ...activeConfig,
                              numeric: { min: max, max: min, roundToInteger },
                            },
                          });
                      }}
                      onChange={(changed) => {
                        updateCellConfigs({
                          ...cellConfigs,
                          [popover.cellKey]: {
                            ...activeConfig,
                            numeric: { ...activeConfig.numeric!, ...changed },
                          },
                        });
                      }}
                    />
                  )}
                  {activeMode === 'date' && (
                    <DateRandomizationManager
                      config={activeConfig.date!}
                      onBlur={() => {
                        const { min, max, roundToDay } = activeConfig.date!;
                        if (min > max)
                          updateCellConfigs({
                            ...cellConfigs,
                            [popover.cellKey]: {
                              ...activeConfig,
                              date: { min: max, max: min, roundToDay },
                            },
                          });
                      }}
                      onChange={(changed) => {
                        updateCellConfigs({
                          ...cellConfigs,
                          [popover.cellKey]: {
                            ...activeConfig,
                            date: { ...activeConfig.date!, ...changed },
                          },
                        });
                      }}
                    />
                  )}
                  {activeMode === 'override' && (
                    <OverrideRandomizationManager
                      config={activeConfig.override!}
                      onChange={(changed) =>
                        updateCellConfigs({
                          ...cellConfigs,
                          [popover.cellKey]: {
                            ...activeConfig,
                            override: { ...activeConfig.override!, ...changed },
                          },
                        })
                      }
                    />
                  )}
                  {activeMode === 'string' && (
                    <StringRandomizationManager
                      config={activeConfig.string!}
                      onChange={(changed) =>
                        updateCellConfigs({
                          ...cellConfigs,
                          [popover.cellKey]: {
                            ...activeConfig,
                            string: { ...activeConfig.string!, ...changed },
                          },
                        })
                      }
                    />
                  )}
                  {activeMode === 'shuffle' && <ShuffleRandomizationManager />}
                </div>
              </>
            )}
          </div>
        </Popover>
      )}
    </>
  );
};

export default SpreadsheetRandomizationManager;
