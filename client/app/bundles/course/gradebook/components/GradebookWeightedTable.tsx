import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Download } from '@mui/icons-material';
import {
  Alert,
  Button,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import type {
  AssessmentData,
  CategoryData,
  StudentData,
  SubmissionData,
  TabData,
} from 'types/course/gradebook';

import SearchField from 'lib/components/core/fields/SearchField';
import type { ColumnPickerRenderContext } from 'lib/components/table';
import type { ColumnTemplate } from 'lib/components/table/builder';
import MuiColumnPickerPrompt from 'lib/components/table/MuiTableAdapter/MuiColumnPickerPrompt';
import MuiTablePagination from 'lib/components/table/MuiTableAdapter/MuiTablePagination';
import useTanStackTableBuilder from 'lib/components/table/TanStackTableBuilder';
import { DEFAULT_TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';
import useTranslation from 'lib/hooks/useTranslation';
import tableTranslations from 'lib/translations/table';

import type { WeightedRow } from '../computeWeighted';
import { computeWeightedRows, sumWeights } from '../computeWeighted';

import ConfigureWeightsPrompt from './ConfigureWeightsPrompt';
import WeightedGradebookColumnTree from './WeightedGradebookColumnTree';

const translations = defineMessages({
  configureWeights: {
    id: 'course.gradebook.GradebookWeightedTable.configureWeights',
    defaultMessage: 'Configure Weights',
  },
  noWeightsConfigured: {
    id: 'course.gradebook.GradebookWeightedTable.noWeightsConfigured',
    defaultMessage:
      'No weights configured — all tab weights are 0. Click "Configure Weights" to assign weights.',
  },
  noWeightsNoAccess: {
    id: 'course.gradebook.GradebookWeightedTable.noWeightsNoAccess',
    defaultMessage: 'No tab weights have been configured yet.',
  },
  name: {
    id: 'course.gradebook.GradebookWeightedTable.name',
    defaultMessage: 'Name',
  },
  email: {
    id: 'course.gradebook.GradebookWeightedTable.email',
    defaultMessage: 'Email',
  },
  projectedTotal: {
    id: 'course.gradebook.GradebookWeightedTable.projectedTotal',
    defaultMessage: 'Projected total — ungraded assessments count as 0',
  },
  percentOfGrade: {
    id: 'course.gradebook.GradebookWeightedTable.percentOfGrade',
    defaultMessage: '{weight}% of grade',
  },
  percentTotalExact: {
    id: 'course.gradebook.GradebookWeightedTable.percentTotalExact',
    defaultMessage: '100% total',
  },
  percentTotalWarning: {
    id: 'course.gradebook.GradebookWeightedTable.percentTotalWarning',
    defaultMessage: '{weight}% total',
  },
  outOfWeight: {
    id: 'course.gradebook.GradebookWeightedTable.outOfWeight',
    defaultMessage: '/{weight}',
  },
  displayPoints: {
    id: 'course.gradebook.GradebookWeightedTable.displayPoints',
    defaultMessage: 'Points',
  },
  displayPercent: {
    id: 'course.gradebook.GradebookWeightedTable.displayPercent',
    defaultMessage: 'Percentage',
  },
  doesNotSumTo100: {
    id: 'course.gradebook.GradebookWeightedTable.doesNotSumTo100',
    defaultMessage: 'does not sum to 100',
  },
  weightsDoNotSum: {
    id: 'course.gradebook.GradebookWeightedTable.weightsDoNotSum',
    defaultMessage: 'Weights do not sum to 100. Total may be inaccurate.',
  },
  searchStudents: {
    id: 'course.gradebook.GradebookWeightedTable.searchStudents',
    defaultMessage: 'Search students',
  },
  downloadCsv: {
    id: 'course.gradebook.GradebookWeightedTable.downloadCsv',
    defaultMessage: 'Download as CSV',
  },
  selectColumns: {
    id: 'course.gradebook.GradebookIndex.selectColumns',
    defaultMessage: 'Select Columns',
  },
  dialogTitle: {
    id: 'course.gradebook.GradebookIndex.dialogTitle',
    defaultMessage: 'Select columns',
  },
  exportButton: {
    id: 'course.gradebook.GradebookIndex.exportButton',
    defaultMessage: 'Export all rows',
  },
  exportRows: {
    id: 'course.gradebook.GradebookIndex.exportRows',
    defaultMessage: 'Export {count, plural, one {# row} other {# rows}}',
  },
  exportAllTooltip: {
    id: 'course.gradebook.GradebookIndex.exportAllTooltip',
    defaultMessage: 'No rows selected - all rows will be exported.',
  },
  level: {
    id: 'course.gradebook.GradebookColumnTree.level',
    defaultMessage: 'Level',
  },
  totalXp: {
    id: 'course.gradebook.GradebookColumnTree.totalXp',
    defaultMessage: 'Total XP',
  },
});

interface Props {
  categories: CategoryData[];
  tabs: TabData[];
  assessments: AssessmentData[];
  students: StudentData[];
  submissions: SubmissionData[];
  canManageWeights: boolean;
  courseTitle: string;
  courseId: number;
  gamificationEnabled: boolean;
}

// How many decimal places a single value needs (0, 1, or 2).
const precisionNeeded = (v: number): 0 | 1 | 2 => {
  const at2 = Math.round(v * 100) / 100;
  const at1 = Math.round(v * 10) / 10;
  const at0 = Math.round(v);
  if (Math.abs(at2 - at1) > 1e-9) return 2;
  if (Math.abs(at1 - at0) > 1e-9) return 1;
  return 0;
};

// Maximum precision needed across a column's values.
const columnPrecision = (values: (number | null)[]): 0 | 1 | 2 => {
  let prec: 0 | 1 | 2 = 0;
  for (const v of values) {
    if (v === null) continue;
    const p = precisionNeeded(v);
    if (p === 2) return 2;
    if (p === 1) prec = 1;
  }
  return prec;
};

const fmtAt = (v: number | null, prec: 0 | 1 | 2): string => {
  if (v === null) return '—';
  return v.toFixed(prec);
};

const fmtCsv = (v: number | null): string => {
  if (v === null) return '';
  return v.toFixed(2);
};

const CHECKBOX_WIDTH = 56;

const GradebookWeightedTable = ({
  categories,
  tabs,
  assessments,
  students,
  submissions,
  canManageWeights,
  courseTitle,
  courseId,
  gamificationEnabled,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const [configureOpen, setConfigureOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  type DisplayMode = 'points' | 'percent';
  const [displayMode, setDisplayMode] = useState<DisplayMode>('points');

  const row1Ref = useRef<HTMLTableRowElement>(null);
  const row2Ref = useRef<HTMLTableRowElement>(null);
  const [row2Top, setRow2Top] = useState(0);
  const [row3Top, setRow3Top] = useState(0);

  const totalWeight = sumWeights(tabs);
  const allWeightsZero = totalWeight === 0;

  const categoryTabCounts = useMemo(() => {
    const counts = new Map<number, number>();
    tabs.forEach((tab) => {
      counts.set(tab.categoryId, (counts.get(tab.categoryId) ?? 0) + 1);
    });
    return counts;
  }, [tabs]);

  const visibleCategories = useMemo(
    () => categories.filter((cat) => categoryTabCounts.has(cat.id)),
    [categories, categoryTabCounts],
  );

  useLayoutEffect(() => {
    const h1 = row1Ref.current?.offsetHeight ?? 0;
    const h2 = row2Ref.current?.offsetHeight ?? 0;
    setRow2Top(h1);
    setRow3Top(h1 + h2);
  }, [visibleCategories, tabs]);

  const rows = useMemo<WeightedRow[]>(
    () =>
      computeWeightedRows({
        students,
        tabs,
        assessments,
        submissions,
      }),
    [students, tabs, assessments, submissions],
  );

  const columnPrecisions = useMemo(() => {
    const tabPrecs = tabs.map((tab, idx) => {
      const weight = tab.gradebookWeight ?? 0;
      return columnPrecision(
        rows.map((r) => {
          const sub = r.subtotals[idx];
          return sub !== null ? sub * weight : null;
        }),
      );
    });
    return { tabs: tabPrecs, total: columnPrecision(rows.map((r) => r.total)) };
  }, [rows, tabs]);

  const hasExternalIds = useMemo(
    () => students.some((s) => s.externalId != null && s.externalId !== ''),
    [students],
  );

  const columns = useMemo<ColumnTemplate<WeightedRow>[]>(() => {
    const cols: ColumnTemplate<WeightedRow>[] = [
      {
        id: 'name',
        title: t(translations.name),
        of: 'name',
        cell: (row) => row.name,
        csvDownloadable: true,
        searchable: true,
      },
      {
        id: 'email',
        title: t(translations.email),
        of: 'email',
        cell: (row) => row.email,
        csvDownloadable: true,
        searchable: true,
        defaultVisible: false,
      },
      {
        id: 'externalId',
        title: t(tableTranslations.externalId),
        of: 'externalId',
        cell: (row) => row.externalId ?? '',
        csvDownloadable: true,
        defaultVisible: hasExternalIds,
      },
    ];

    if (gamificationEnabled) {
      cols.push({
        id: 'level',
        title: t(translations.level),
        of: 'level',
        cell: (row) => row.level,
        csvDownloadable: true,
        defaultVisible: false,
      });
      cols.push({
        id: 'totalXp',
        title: t(translations.totalXp),
        of: 'totalXp',
        cell: (row) => row.totalXp,
        csvDownloadable: true,
        defaultVisible: false,
      });
    }

    tabs.forEach((tab, idx) => {
      const weight = tab.gradebookWeight ?? 0;
      const prec = columnPrecisions.tabs[idx];
      cols.push({
        id: `tab-${tab.id}`,
        title: tab.title,
        accessorFn: (row) => {
          const sub = row.subtotals[idx];
          return fmtCsv(sub !== null ? sub * weight : null);
        },
        cell: (row) => {
          const sub = row.subtotals[idx];
          return fmtAt(sub !== null ? sub * weight : null, prec);
        },
        csvDownloadable: true,
      });
    });

    cols.push({
      id: 'total',
      title: t(translations.projectedTotal),
      accessorFn: (row) => fmtCsv(row.total),
      cell: (row) => fmtAt(row.total, columnPrecisions.total),
      csvDownloadable: true,
    });

    return cols;
  }, [tabs, t, gamificationEnabled, hasExternalIds, columnPrecisions]);

  const columnPicker = useMemo(
    () => ({
      render: (context: ColumnPickerRenderContext) => (
        <WeightedGradebookColumnTree
          {...context}
          gamificationEnabled={gamificationEnabled}
        />
      ),
      locked: ['name'],
      triggerLabel: t(translations.selectColumns),
      dialogTitle: t(translations.dialogTitle),
      storageKey: `gradebook_weighted_columns_${courseId}`,
    }),
    [gamificationEnabled, courseId, t],
  );

  const {
    toolbar: toolbarProps,
    body,
    pagination,
  } = useTanStackTableBuilder<WeightedRow>({
    data: rows,
    columns,
    getRowId: (row) => row.studentId.toString(),
    getRowEqualityData: (row) => row,
    indexing: { rowSelectable: true },
    pagination: {
      rowsPerPage: [DEFAULT_TABLE_ROWS_PER_PAGE],
      showAllRows: true,
    },
    search: { searchPlaceholder: t(translations.searchStudents) },
    toolbar: { show: true, keepNative: true },
    csvDownload: {
      filename: `${courseTitle}_weighted_gradebook`,
      showDownloadButton: false,
    },
    columnPicker,
  });

  const toolbar = toolbarProps!;

  const selectedCount = body.selectedCount ?? 0;
  const directExportLabel = useMemo((): string => {
    const isPartial = selectedCount > 0 && selectedCount < rows.length;
    if (isPartial) return t(translations.exportRows, { count: selectedCount });
    return t(translations.exportButton);
  }, [selectedCount, rows.length, t]);

  const visibility = toolbar.getColumnVisibility?.() ?? {};
  const showEmail = (visibility.email ?? false) === true;
  const showExternalId = (visibility.externalId ?? false) === true;
  const showLevel = gamificationEnabled && (visibility.level ?? false) === true;
  const showTotalXp =
    gamificationEnabled && (visibility.totalXp ?? false) === true;

  const allRowsSelected = body.allFilteredSelected ?? false;
  const someRowsSelected = body.someFilteredSelected ?? false;
  const toggleAllRows = (): void => body.toggleAllFiltered?.();

  return (
    <div data-testid="gradebook-weighted-table">
      {/* Table + toolbar share a fit-content container so toolbar never outruns the table */}
      <div className="px-5">
        <Paper elevation={0} sx={{ width: 'fit-content', maxWidth: '100%' }}>
          {/* Single-row toolbar */}
          <div className="flex items-center gap-3 px-2 py-3">
            <SearchField
              onChangeKeyword={toolbar.onSearchKeywordChange}
              placeholder={toolbar.searchPlaceholder}
              style={{ flex: 1 }}
              value={toolbar.searchKeyword ?? ''}
            />
            <div className="flex items-center gap-3">
              {canManageWeights && (
                <Button
                  onClick={() => setConfigureOpen(true)}
                  size="small"
                  variant="outlined"
                >
                  {t(translations.configureWeights)}
                </Button>
              )}
              <Button
                color="primary"
                onClick={() => setPickerOpen(true)}
                size="small"
                variant="outlined"
              >
                {t(translations.selectColumns)}
              </Button>
              {toolbar.onDirectExport && (
                <Tooltip
                  title={
                    selectedCount === 0 ? t(translations.exportAllTooltip) : ''
                  }
                >
                  <span>
                    <Button
                      color="primary"
                      endIcon={<Download fontSize="small" />}
                      onClick={toolbar.onDirectExport}
                      size="small"
                      variant="contained"
                    >
                      {directExportLabel}
                    </Button>
                  </span>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Empty state banner when all weights are 0 */}
          {allWeightsZero && (
            <Alert severity="info" sx={{ mx: 2, mb: 1 }}>
              {canManageWeights
                ? t(translations.noWeightsConfigured)
                : t(translations.noWeightsNoAccess)}
            </Alert>
          )}
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table
              size="small"
              stickyHeader
              sx={(theme) => {
                // One definition for every grid line so horizontal and vertical
                // separators share the same width and colour.
                const gridLine = `1px solid ${theme.palette.divider}`;
                return {
                  tableLayout: 'auto',
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                  '& th, & td': {
                    boxSizing: 'border-box',
                    border: 0,
                    borderBottom: gridLine,
                  },
                  '& thead th': {
                    borderLeft: gridLine,
                  },
                  // MUI's default `.MuiTableRow-root:last-child th { border: 0 }`
                  // (specificity 0,2,1, the `:last-child` pseudo-class) outranks
                  // `& thead th`/`& th` (0,1,2 / 0,1,1) and silently zeroes ALL
                  // borders on the weight row — it is the last <tr> in <thead>.
                  // Re-assert both the column separators (borderLeft) and the
                  // header's bottom edge (borderBottom) with a higher-specificity
                  // selector (0,2,3) so they survive through the "% of grade" row.
                  '& thead tr:last-of-type th': {
                    borderLeft: gridLine,
                    borderBottom: gridLine,
                  },
                  // Remove the outer-left line: only the checkbox (row 1, col 1).
                  '& thead tr:first-of-type th:first-of-type': {
                    borderLeft: 0,
                  },
                };
              }}
            >
              <TableHead>
                {/* Row 1: Checkbox + Student + Categories + Total */}
                <TableRow ref={row1Ref}>
                  <TableCell
                    rowSpan={3}
                    sx={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 5,
                      bgcolor: 'background.default',
                      width: CHECKBOX_WIDTH,
                      minWidth: CHECKBOX_WIDTH,
                      px: 0,
                      textAlign: 'center',
                      verticalAlign: 'middle',
                    }}
                  >
                    <Checkbox
                      checked={allRowsSelected}
                      indeterminate={someRowsSelected && !allRowsSelected}
                      onChange={toggleAllRows}
                      size="small"
                    />
                  </TableCell>
                  <TableCell
                    rowSpan={3}
                    sx={(theme) => ({
                      position: 'sticky',
                      left: CHECKBOX_WIDTH,
                      zIndex: 4,
                      bgcolor: 'background.default',
                      minWidth: 160,
                      whiteSpace: 'nowrap',
                      verticalAlign: 'middle',
                      boxShadow: `inset -1px 0 0 ${theme.palette.divider}`,
                    })}
                  >
                    {t(translations.name)}
                  </TableCell>
                  {showEmail && (
                    <TableCell
                      rowSpan={3}
                      sx={{ minWidth: 200, verticalAlign: 'middle' }}
                    >
                      {t(translations.email)}
                    </TableCell>
                  )}
                  {showExternalId && (
                    <TableCell
                      rowSpan={3}
                      sx={{ minWidth: 160, verticalAlign: 'middle' }}
                    >
                      {t(tableTranslations.externalId)}
                    </TableCell>
                  )}
                  {showLevel && (
                    <TableCell
                      align="right"
                      rowSpan={3}
                      sx={{ minWidth: 80, verticalAlign: 'middle' }}
                    >
                      {t(translations.level)}
                    </TableCell>
                  )}
                  {showTotalXp && (
                    <TableCell
                      align="right"
                      rowSpan={3}
                      sx={{ minWidth: 100, verticalAlign: 'middle' }}
                    >
                      {t(translations.totalXp)}
                    </TableCell>
                  )}
                  {visibleCategories.map((cat) => (
                    <TableCell
                      key={cat.id}
                      align="center"
                      colSpan={categoryTabCounts.get(cat.id) ?? 1}
                      sx={{ fontWeight: 600 }}
                    >
                      {cat.title}
                    </TableCell>
                  ))}
                  <TableCell
                    align="center"
                    rowSpan={2}
                    sx={{ fontWeight: 600, minWidth: 120 }}
                  >
                    {t(translations.projectedTotal)}
                  </TableCell>
                </TableRow>

                {/* Row 2: Tab titles */}
                <TableRow
                  ref={row2Ref}
                  sx={{ '& .MuiTableCell-stickyHeader': { top: row2Top } }}
                >
                  {tabs.map((tab) => (
                    <TableCell
                      key={tab.id}
                      align="center"
                      sx={{ minWidth: 120 }}
                    >
                      {tab.title}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Row 3: Weight subheaders */}
                <TableRow
                  sx={{ '& .MuiTableCell-stickyHeader': { top: row3Top } }}
                >
                  {tabs.map((tab) => (
                    <TableCell
                      key={tab.id}
                      align="center"
                      sx={{ bgcolor: 'grey.100' }}
                    >
                      {displayMode === 'percent'
                        ? t(translations.percentOfGrade, {
                            weight: tab.gradebookWeight ?? 0,
                          })
                        : t(translations.outOfWeight, {
                            weight: tab.gradebookWeight ?? 0,
                          })}
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={{ bgcolor: 'grey.100' }}>
                    {totalWeight === 100 ? (
                      displayMode === 'percent' ? (
                        t(translations.percentTotalExact)
                      ) : (
                        t(translations.outOfWeight, { weight: totalWeight })
                      )
                    ) : (
                      <Tooltip title={t(translations.weightsDoNotSum)}>
                        <span>
                          <Typography
                            color="warning.main"
                            component="span"
                            fontSize="inherit"
                          >
                            {displayMode === 'percent'
                              ? t(translations.percentTotalWarning, {
                                  weight: totalWeight,
                                })
                              : t(translations.outOfWeight, {
                                  weight: totalWeight,
                                })}
                          </Typography>
                          <Typography
                            color="warning.main"
                            component="span"
                            fontSize="inherit"
                            sx={{ display: 'block' }}
                          >
                            {t(translations.doesNotSumTo100)}
                          </Typography>
                        </span>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {body.rows.map((row, idx) => {
                  const rowProps = body.forEachRow(row, idx);
                  return (
                    <TableRow key={rowProps.id}>
                      <TableCell
                        sx={{
                          position: 'sticky',
                          left: 0,
                          zIndex: 2,
                          bgcolor: 'background.paper',
                          width: CHECKBOX_WIDTH,
                          minWidth: CHECKBOX_WIDTH,
                          px: 0,
                          textAlign: 'center',
                        }}
                      >
                        <Checkbox
                          checked={row.getIsSelected()}
                          onChange={row.getToggleSelectedHandler()}
                          size="small"
                        />
                      </TableCell>
                      <TableCell
                        sx={(theme) => ({
                          position: 'sticky',
                          left: CHECKBOX_WIDTH,
                          zIndex: 2,
                          bgcolor: 'background.paper',
                          boxShadow: `inset -1px 0 0 ${theme.palette.divider}`,
                        })}
                      >
                        {row.original.name}
                      </TableCell>
                      {showEmail && <TableCell>{row.original.email}</TableCell>}
                      {showExternalId && (
                        <TableCell>{row.original.externalId ?? ''}</TableCell>
                      )}
                      {showLevel && (
                        <TableCell align="right">
                          {row.original.level}
                        </TableCell>
                      )}
                      {showTotalXp && (
                        <TableCell align="right">
                          {row.original.totalXp}
                        </TableCell>
                      )}
                      {row.original.subtotals.map((subtotal, i) => {
                        const weight = tabs[i].gradebookWeight ?? 0;
                        return (
                          <TableCell key={tabs[i].id} align="right">
                            {fmtAt(
                              subtotal !== null ? subtotal * weight : null,
                              columnPrecisions.tabs[i],
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell align="right">
                        {fmtAt(row.original.total, columnPrecisions.total)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          {pagination && <MuiTablePagination {...pagination} />}
        </Paper>
      </div>

      {canManageWeights && (
        <ConfigureWeightsPrompt
          assessments={assessments}
          categories={categories}
          onClose={() => setConfigureOpen(false)}
          open={configureOpen}
          tabs={tabs}
        />
      )}

      {toolbar.columnPicker && toolbar.commitColumnVisibility && (
        <MuiColumnPickerPrompt
          columnPicker={toolbar.columnPicker}
          commitColumnVisibility={toolbar.commitColumnVisibility}
          initialVisibility={toolbar.getColumnVisibility?.() ?? {}}
          locked={toolbar.columnPicker.locked}
          onClose={() => setPickerOpen(false)}
          open={pickerOpen}
        />
      )}
    </div>
  );
};

export default GradebookWeightedTable;
