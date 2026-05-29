import { useMemo, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Download } from '@mui/icons-material';
import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Switch,
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
import {
  DEFAULT_MINI_TABLE_ROWS_PER_PAGE,
  DEFAULT_TABLE_ROWS_PER_PAGE,
} from 'lib/constants/sharedConstants';
import useTranslation from 'lib/hooks/useTranslation';
import tableTranslations from 'lib/translations/table';

import type { WeightedRow } from '../computeWeighted';
import { computeWeightedRows, sumWeights } from '../computeWeighted';

import ConfigureWeightsPrompt from './ConfigureWeightsPrompt';
import WeightedGradebookColumnTree from './WeightedGradebookColumnTree';

const translations = defineMessages({
  treatUngradedAsZero: {
    id: 'course.gradebook.GradebookWeightedTable.treatUngradedAsZero',
    defaultMessage: 'Treat Ungraded as 0',
  },
  treatUngradedAsZeroTooltip: {
    id: 'course.gradebook.GradebookWeightedTable.treatUngradedAsZeroTooltip',
    defaultMessage:
      'Counts unsubmitted and ungraded assessments as 0 in the calculation. Use at end of course when all work should be complete.',
  },
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
  student: {
    id: 'course.gradebook.GradebookWeightedTable.student',
    defaultMessage: 'Student',
  },
  email: {
    id: 'course.gradebook.GradebookWeightedTable.email',
    defaultMessage: 'Email',
  },
  total: {
    id: 'course.gradebook.GradebookWeightedTable.total',
    defaultMessage: 'Total',
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
    defaultMessage: 'Search by name or email',
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

const fmt = (v: number | null): string => {
  if (v === null) return '—';
  const rounded = Math.round(v);
  return Math.abs(v - rounded) < 1e-9 ? String(rounded) : v.toFixed(2);
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
  const [treatUngradedAsZero, setTreatUngradedAsZero] = useState(false);
  const [configureOpen, setConfigureOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

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

  const rows = useMemo<WeightedRow[]>(
    () =>
      computeWeightedRows({
        students,
        tabs,
        assessments,
        submissions,
        treatUngradedAsZero,
      }),
    [students, tabs, assessments, submissions, treatUngradedAsZero],
  );

  const hasExternalIds = useMemo(
    () => students.some((s) => s.externalId != null && s.externalId !== ''),
    [students],
  );

  const columns = useMemo<ColumnTemplate<WeightedRow>[]>(() => {
    const cols: ColumnTemplate<WeightedRow>[] = [
      {
        id: 'name',
        title: t(translations.student),
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
      cols.push({
        id: `tab-${tab.id}`,
        title: tab.title,
        accessorFn: (row) => {
          const sub = row.subtotals[idx];
          return fmtCsv(sub !== null ? sub * weight : null);
        },
        cell: (row) => {
          const sub = row.subtotals[idx];
          return fmt(sub !== null ? sub * weight : null);
        },
        csvDownloadable: true,
      });
    });

    cols.push({
      id: 'total',
      title: t(translations.total),
      accessorFn: (row) => fmtCsv(row.total),
      cell: (row) => fmt(row.total),
      csvDownloadable: true,
    });

    return cols;
  }, [tabs, t, gamificationEnabled, hasExternalIds]);

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
      rowsPerPage: [
        DEFAULT_MINI_TABLE_ROWS_PER_PAGE,
        25,
        50,
        DEFAULT_TABLE_ROWS_PER_PAGE,
      ],
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
              <Tooltip title={t(translations.treatUngradedAsZeroTooltip)}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={treatUngradedAsZero}
                      onChange={(e) => setTreatUngradedAsZero(e.target.checked)}
                      size="small"
                    />
                  }
                  label={t(translations.treatUngradedAsZero)}
                  sx={{ ml: 0 }}
                />
              </Tooltip>
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
                <TableRow>
                  <TableCell
                    rowSpan={3}
                    sx={{
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
                    sx={{ minWidth: 160, verticalAlign: 'middle' }}
                  >
                    {t(translations.student)}
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
                    {t(translations.total)}
                  </TableCell>
                </TableRow>

                {/* Row 2: Tab titles */}
                <TableRow>
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
                <TableRow>
                  {tabs.map((tab) => (
                    <TableCell
                      key={tab.id}
                      align="center"
                      sx={{ bgcolor: 'grey.100' }}
                    >
                      {t(translations.percentOfGrade, {
                        weight: tab.gradebookWeight ?? 0,
                      })}
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={{ bgcolor: 'grey.100' }}>
                    {totalWeight === 100 ? (
                      t(translations.percentTotalExact)
                    ) : (
                      <Tooltip title={t(translations.weightsDoNotSum)}>
                        <span>
                          <Typography
                            color="warning.main"
                            component="span"
                            fontSize="inherit"
                          >
                            {t(translations.percentTotalWarning, {
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
                      <TableCell>{row.original.name}</TableCell>
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
                            {fmt(subtotal !== null ? subtotal * weight : null)}
                          </TableCell>
                        );
                      })}
                      <TableCell align="right">
                        {fmt(row.original.total)}
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
