import { Fragment, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { defineMessages } from 'react-intl';
import {
  Download,
  InfoOutlined,
  KeyboardArrowDown,
  KeyboardArrowRight,
} from '@mui/icons-material';
import {
  Alert,
  Button,
  Checkbox,
  IconButton,
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

import SegmentedSwitch from 'lib/components/core/buttons/SegmentedSwitch';
import SearchField from 'lib/components/core/fields/SearchField';
import type { ColumnPickerRenderContext } from 'lib/components/table';
import type { ColumnTemplate } from 'lib/components/table/builder';
import MuiColumnPickerPrompt from 'lib/components/table/MuiTableAdapter/MuiColumnPickerPrompt';
import MuiTablePagination from 'lib/components/table/MuiTableAdapter/MuiTablePagination';
import useTanStackTableBuilder from 'lib/components/table/TanStackTableBuilder';
import { DEFAULT_TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';
import useTranslation from 'lib/hooks/useTranslation';
import tableTranslations from 'lib/translations/table';

import type { AssessmentContribution, WeightedRow } from '../computeWeighted';
import {
  computeStudentBreakdown,
  computeWeightedRows,
  gradeRatio,
  resolveTabWeights,
  usingDefaultWeights,
} from '../computeWeighted';

import ConfigureWeightsPrompt from './ConfigureWeightsPrompt';
import ProjectedTotalHint, {
  projectedTotalPolicyTranslations,
} from './ProjectedTotalHint';
import WeightedGradebookColumnTree from './WeightedGradebookColumnTree';

const translations = defineMessages({
  configureWeights: {
    id: 'course.gradebook.WeightedGradebookTable.configureWeights',
    defaultMessage: 'Configure Weights',
  },
  noWeightsConfigured: {
    id: 'course.gradebook.WeightedGradebookTable.noWeightsConfigured',
    defaultMessage:
      'No weights configured - all tab weights are 0. Click "Configure Weights" to assign weights.',
  },
  noWeightsNoAccess: {
    id: 'course.gradebook.WeightedGradebookTable.noWeightsNoAccess',
    defaultMessage: 'No tab weights have been configured yet.',
  },
  defaultWeights: {
    id: 'course.gradebook.WeightedGradebookTable.defaultWeights',
    defaultMessage:
      'Showing default weights - every tab counts equally. Click "Configure Weights" to set your own.',
  },
  defaultWeightsNoAccess: {
    id: 'course.gradebook.WeightedGradebookTable.defaultWeightsNoAccess',
    defaultMessage:
      'Showing default weights - every tab counts equally until weights are configured.',
  },
  percentOfGrade: {
    id: 'course.gradebook.WeightedGradebookTable.percentOfGrade',
    defaultMessage: '{weight}% of grade',
  },
  percentTotalExact: {
    id: 'course.gradebook.WeightedGradebookTable.percentTotalExact',
    defaultMessage: '100% total',
  },
  percentTotalWarning: {
    id: 'course.gradebook.WeightedGradebookTable.percentTotalWarning',
    defaultMessage: '{weight}% total',
  },
  outOfWeight: {
    id: 'course.gradebook.WeightedGradebookTable.outOfWeight',
    defaultMessage: '/{weight}',
  },
  displayMode: {
    id: 'course.gradebook.WeightedGradebookTable.displayMode',
    defaultMessage: 'Display mode',
  },
  displayPoints: {
    id: 'course.gradebook.WeightedGradebookTable.displayPoints',
    defaultMessage: 'Points',
  },
  displayPointsTooltip: {
    id: 'course.gradebook.WeightedGradebookTable.displayPointsTooltip',
    defaultMessage:
      'How many grade points each tab contributes. Columns add up to the projected total.',
  },
  displayPercent: {
    id: 'course.gradebook.WeightedGradebookTable.displayPercent',
    defaultMessage: 'Percentage',
  },
  displayPercentTooltip: {
    id: 'course.gradebook.WeightedGradebookTable.displayPercentTooltip',
    defaultMessage:
      'What fraction of each tab the student earned. 100% on a tab worth 20% = the student earned all 20 grade points from that tab.',
  },
  weightsDoNotSum: {
    id: 'course.gradebook.WeightedGradebookTable.weightsDoNotSum',
    defaultMessage: 'Weights do not sum to 100. Total may be inaccurate.',
  },
  searchStudents: {
    id: 'course.gradebook.WeightedGradebookTable.searchStudents',
    defaultMessage: 'Search students',
  },
  downloadCsv: {
    id: 'course.gradebook.WeightedGradebookTable.downloadCsv',
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
  expandRow: {
    id: 'course.gradebook.WeightedGradebookTable.expandRow',
    defaultMessage: 'Expand {name}',
  },
  collapseRow: {
    id: 'course.gradebook.WeightedGradebookTable.collapseRow',
    defaultMessage: 'Collapse {name}',
  },
  excluded: {
    id: 'course.gradebook.WeightedGradebookTable.excluded',
    defaultMessage: 'Excluded',
  },
  total: {
    id: 'course.gradebook.WeightedGradebookTable.weightedTotal',
    defaultMessage: 'Weighted Total',
  },
});

type DisplayMode = 'points' | 'percent';

interface Props {
  categories: CategoryData[];
  tabs: TabData[];
  assessments: AssessmentData[];
  students: StudentData[];
  submissions: SubmissionData[];
  canManageWeights: boolean;
  courseTitle: string;
  courseId: number;
}

const precisionNeeded = (v: number): 0 | 1 | 2 => {
  const at2 = Math.round(v * 100) / 100;
  const at1 = Math.round(v * 10) / 10;
  const at0 = Math.round(v);
  if (Math.abs(at2 - at1) > 1e-9) return 2;
  if (Math.abs(at1 - at0) > 1e-9) return 1;
  return 0;
};

const columnPrecision = (values: (number | null)[]): 0 | 1 | 2 => {
  const precs = values
    .filter((v): v is number => v !== null)
    .map(precisionNeeded);
  if (precs.includes(2)) return 2;
  if (precs.includes(1)) return 1;
  return 0;
};

const fmtCsv = (v: number | null): string => {
  if (v === null) return '';
  return v.toFixed(2);
};

const CHECKBOX_WIDTH = 56;
const NAME_WIDTH_COLLAPSED = 150;
const NAME_WIDTH_EXPANDED = 260;
const EMAIL_WIDTH = 250;
const EXTERNAL_ID_WIDTH = 150;
const TAB_WIDTH = 120;

const WeightedGradebookTable = ({
  categories,
  tabs,
  assessments,
  students,
  submissions,
  canManageWeights,
  courseTitle,
  courseId,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const [configureOpen, setConfigureOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('points');

  const resolvedTabs = useMemo(
    () => resolveTabWeights(tabs, assessments),
    [tabs, assessments],
  );
  const showingDefaults = useMemo(
    () => usingDefaultWeights(tabs, assessments),
    [tabs, assessments],
  );

  const tabDisplayValue = (
    sub: number | null,
    weight: number,
  ): number | null => {
    if (sub === null) return null;
    return displayMode === 'percent' ? sub * 100 : sub * weight;
  };

  const allExcludedTabIds = useMemo(() => {
    const byTab = new Map<number, boolean>();
    assessments.forEach((a) => {
      const allExcludedSoFar = byTab.get(a.tabId);
      byTab.set(a.tabId, (allExcludedSoFar ?? true) && !!a.gradebookExcluded);
    });
    return new Set(
      [...byTab.entries()].filter(([, allExc]) => allExc).map(([id]) => id),
    );
  }, [assessments]);

  const totalWeight = resolvedTabs.reduce(
    (acc, tab) =>
      acc + (allExcludedTabIds.has(tab.id) ? 0 : tab.gradebookWeight ?? 0),
    0,
  );
  const allWeightsZero = totalWeight === 0;

  const totalDisplayValue = (total: number | null): number | null => {
    if (total === null) return null;
    if (displayMode === 'percent') {
      return totalWeight > 0 ? (total / totalWeight) * 100 : null;
    }
    return total;
  };

  const fmtDisplay = (v: number | null, prec: 0 | 1 | 2): string => {
    if (v === null) return '—';
    const s = v.toFixed(prec);
    return displayMode === 'percent' ? `${s}%` : s;
  };

  const breakdownDisplayValue = (a: AssessmentContribution): number | null => {
    if (displayMode === 'percent') {
      return a.grade === null ? null : gradeRatio(a.grade, a.maxGrade) * 100;
    }
    return a.points;
  };

  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const toggleExpanded = (studentId: number): void =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });

  // Widen the sticky Name column while any row's breakdown is open, so long
  // assessment titles in the breakdown aren't clipped; shrink back when all
  // rows are collapsed.
  const nameWidth =
    expandedIds.size > 0 ? NAME_WIDTH_EXPANDED : NAME_WIDTH_COLLAPSED;

  const breakdownsByStudent = useMemo(
    () =>
      new Map(
        [...expandedIds].map((studentId) => [
          studentId,
          computeStudentBreakdown({
            studentId,
            tabs: resolvedTabs,
            assessments,
            submissions,
          }),
        ]),
      ),
    [expandedIds, resolvedTabs, assessments, submissions],
  );

  const row1Ref = useRef<HTMLTableRowElement>(null);
  const row2Ref = useRef<HTMLTableRowElement>(null);
  const [row2Top, setRow2Top] = useState(0);
  const [row3Top, setRow3Top] = useState(0);

  const tabSubheaderLabel = (tab: TabData): string => {
    if (allExcludedTabIds.has(tab.id)) return t(translations.excluded);
    const weight = tab.gradebookWeight ?? 0;
    return displayMode === 'percent'
      ? t(translations.percentOfGrade, { weight })
      : t(translations.outOfWeight, { weight });
  };

  const categoryTabCounts = useMemo(() => {
    const counts = new Map<number, number>();
    resolvedTabs.forEach((tab) => {
      counts.set(tab.categoryId, (counts.get(tab.categoryId) ?? 0) + 1);
    });
    return counts;
  }, [resolvedTabs]);

  const visibleCategories = useMemo(
    () => categories.filter((cat) => categoryTabCounts.has(cat.id)),
    [categories, categoryTabCounts],
  );

  const tabIsCategoryEnd = useMemo(
    () =>
      resolvedTabs.map(
        (tab, i) =>
          i === resolvedTabs.length - 1 ||
          tab.categoryId !== resolvedTabs[i + 1].categoryId,
      ),
    [resolvedTabs],
  );
  const groupEndIf = (cond: boolean): { 'data-group-end'?: true } =>
    cond ? { 'data-group-end': true } : {};

  useLayoutEffect(() => {
    const row1 = row1Ref.current;
    const row2 = row2Ref.current;
    if (!row1 || !row2) return undefined;

    const measure = (): void => {
      const h1 = row1.getBoundingClientRect().height;
      const h2 = row2.getBoundingClientRect().height;
      setRow2Top(h1);
      setRow3Top(h1 + h2);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(row1);
    observer.observe(row2);
    return () => observer.disconnect();
  }, [visibleCategories, resolvedTabs]);

  const rows = useMemo<WeightedRow[]>(
    () =>
      computeWeightedRows({
        students,
        tabs: resolvedTabs,
        assessments,
        submissions,
      }),
    [students, resolvedTabs, assessments, submissions],
  );

  const columnPrecisions = useMemo(() => {
    const tabPrecs = resolvedTabs.map((tab, idx) =>
      columnPrecision(
        rows.map((r) =>
          tabDisplayValue(r.subtotals[idx], tab.gradebookWeight ?? 0),
        ),
      ),
    );
    return {
      tabs: tabPrecs,
      total: columnPrecision(rows.map((r) => totalDisplayValue(r.total))),
    };
  }, [rows, resolvedTabs, displayMode, totalWeight]);

  const hasExternalIds = useMemo(
    () => students.some((s) => s.externalId != null && s.externalId !== ''),
    [students],
  );

  const columns = useMemo<ColumnTemplate<WeightedRow>[]>(() => {
    const cols: ColumnTemplate<WeightedRow>[] = [
      {
        id: 'name',
        title: t(tableTranslations.name),
        of: 'name',
        cell: (row) => row.name,
        csvDownloadable: true,
        searchable: true,
      },
      {
        id: 'email',
        title: t(tableTranslations.email),
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
        searchable: true,
        defaultVisible: hasExternalIds,
      },
    ];

    resolvedTabs.forEach((tab, idx) => {
      const weight = tab.gradebookWeight ?? 0;
      const prec = columnPrecisions.tabs[idx];
      cols.push({
        id: `tab-${tab.id}`,
        title: tab.title,
        accessorFn: (row) =>
          fmtCsv(tabDisplayValue(row.subtotals[idx], weight)),
        cell: (row) =>
          fmtDisplay(tabDisplayValue(row.subtotals[idx], weight), prec),
        csvDownloadable: true,
      });
    });

    cols.push({
      id: 'total',
      title: t(translations.total),
      accessorFn: (row) => fmtCsv(totalDisplayValue(row.total)),
      cell: (row) =>
        fmtDisplay(totalDisplayValue(row.total), columnPrecisions.total),
      csvDownloadable: true,
    });

    return cols;
  }, [
    resolvedTabs,
    t,
    hasExternalIds,
    columnPrecisions,
    displayMode,
    totalWeight,
  ]);

  const columnPicker = useMemo(
    () => ({
      render: (context: ColumnPickerRenderContext) => (
        <WeightedGradebookColumnTree {...context} />
      ),
      locked: ['name'],
      triggerLabel: t(translations.selectColumns),
      dialogTitle: t(translations.dialogTitle),
      storageKey: `gradebook_weighted_columns_${courseId}`,
    }),
    [courseId, t],
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
  let lastIdentityField: 'name' | 'email' | 'externalId' = 'name';
  if (showExternalId) lastIdentityField = 'externalId';
  else if (showEmail) lastIdentityField = 'email';

  const allRowsSelected = body.allFilteredSelected ?? false;
  const someRowsSelected = body.someFilteredSelected ?? false;
  const toggleAllRows = (): void => body.toggleAllFiltered?.();

  const totalWeightHeaderLabel =
    displayMode === 'percent'
      ? t(translations.percentTotalExact)
      : t(translations.outOfWeight, { weight: totalWeight });

  return (
    <div data-testid="gradebook-weighted-table">
      {!allWeightsZero && !showingDefaults && <ProjectedTotalHint />}
      <div className="px-5">
        <Paper elevation={0} sx={{ width: 'fit-content', maxWidth: '100%' }}>
          <div className="flex items-center gap-3 px-2 py-3">
            <SearchField
              onChangeKeyword={toolbar.onSearchKeywordChange}
              placeholder={toolbar.searchPlaceholder}
              style={{ flex: 1 }}
              value={toolbar.searchKeyword ?? ''}
            />
            <div className="flex items-center gap-3">
              <SegmentedSwitch
                ariaLabel={t(translations.displayMode)}
                onChange={setDisplayMode}
                options={[
                  {
                    value: 'points',
                    label: t(translations.displayPoints),
                    tooltip: t(translations.displayPointsTooltip),
                  },
                  {
                    value: 'percent',
                    label: t(translations.displayPercent),
                    tooltip: t(translations.displayPercentTooltip),
                  },
                ]}
                value={displayMode}
              />
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

          {showingDefaults && (
            <Alert severity="info" sx={{ mx: 2, mb: 1 }}>
              {canManageWeights
                ? t(translations.defaultWeights)
                : t(translations.defaultWeightsNoAccess)}
            </Alert>
          )}
          {allWeightsZero && !showingDefaults && (
            <Alert severity="info" sx={{ mx: 2, mb: 1 }}>
              {canManageWeights
                ? t(translations.noWeightsConfigured)
                : t(translations.noWeightsNoAccess)}
            </Alert>
          )}
          <TableContainer
            sx={(theme) => ({
              maxHeight: 'calc(100vh - 22rem)',
              overflowX: 'auto',
              borderTop: `1px solid ${theme.palette.grey[400]}`,
              borderLeft: `1px solid ${theme.palette.grey[400]}`,
              borderRight: `1px solid ${theme.palette.grey[400]}`,
            })}
          >
            <Table
              size="small"
              stickyHeader
              sx={(theme) => {
                const line = theme.palette.grey[400];
                const right = `inset -1px 0 0 ${line}`;
                const bottom = `inset 0 -1px 0 ${line}`;
                const groupRight = `inset -2px 0 0 ${line}`;
                return {
                  tableLayout: 'fixed',
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                  '& th, & td': {
                    boxSizing: 'border-box',
                    border: 0,
                    boxShadow: `${right}, ${bottom}`,
                    py: 0.25,
                    px: 1,
                    lineHeight: 1.2,
                    height: 32,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  },
                  '& [data-group-end]': {
                    boxShadow: `${groupRight}, ${bottom}`,
                  },
                };
              }}
            >
              <colgroup>
                <col style={{ width: CHECKBOX_WIDTH }} />
                <col style={{ width: nameWidth }} />
                {showEmail && <col style={{ width: EMAIL_WIDTH }} />}
                {showExternalId && <col style={{ width: EXTERNAL_ID_WIDTH }} />}
                {resolvedTabs.map((tab) => (
                  <col key={tab.id} style={{ width: TAB_WIDTH }} />
                ))}
                <col />
              </colgroup>
              <TableHead>
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
                    {...groupEndIf(lastIdentityField === 'name')}
                    sx={{
                      position: 'sticky',
                      left: CHECKBOX_WIDTH,
                      zIndex: 4,
                      bgcolor: 'background.default',
                      minWidth: 160,
                      whiteSpace: 'nowrap',
                      verticalAlign: 'middle',
                    }}
                  >
                    {t(tableTranslations.name)}
                  </TableCell>
                  {showEmail && (
                    <TableCell
                      rowSpan={3}
                      {...groupEndIf(lastIdentityField === 'email')}
                      sx={{ minWidth: 200, verticalAlign: 'middle' }}
                    >
                      {t(tableTranslations.email)}
                    </TableCell>
                  )}
                  {showExternalId && (
                    <TableCell
                      rowSpan={3}
                      {...groupEndIf(lastIdentityField === 'externalId')}
                      sx={{ minWidth: 160, verticalAlign: 'middle' }}
                    >
                      {t(tableTranslations.externalId)}
                    </TableCell>
                  )}
                  {visibleCategories.map((cat) => (
                    <TableCell
                      key={cat.id}
                      align="center"
                      colSpan={categoryTabCounts.get(cat.id) ?? 1}
                      data-group-end
                      sx={{ fontWeight: 600 }}
                    >
                      {cat.title}
                    </TableCell>
                  ))}
                  <TableCell
                    align="center"
                    rowSpan={2}
                    sx={{
                      fontWeight: 600,
                      minWidth: 120,
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                      }}
                    >
                      {t(translations.total)}
                      <Tooltip
                        title={t(projectedTotalPolicyTranslations.policy)}
                      >
                        <IconButton
                          aria-label={t(
                            projectedTotalPolicyTranslations.policy,
                          )}
                          size="small"
                          sx={{ p: 0 }}
                        >
                          <InfoOutlined fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    </span>
                  </TableCell>
                </TableRow>

                <TableRow
                  ref={row2Ref}
                  sx={{
                    '& .MuiTableCell-stickyHeader': {
                      top: row2Top,
                    },
                  }}
                >
                  {resolvedTabs.map((tab, i) => (
                    <TableCell
                      key={tab.id}
                      align="center"
                      {...groupEndIf(tabIsCategoryEnd[i])}
                      sx={{ minWidth: 120, whiteSpace: 'nowrap' }}
                    >
                      <Tooltip title={tab.title}>
                        <span>{tab.title}</span>
                      </Tooltip>
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow
                  sx={{ '& .MuiTableCell-stickyHeader': { top: row3Top } }}
                >
                  {resolvedTabs.map((tab, i) => (
                    <TableCell
                      key={tab.id}
                      align="center"
                      {...groupEndIf(tabIsCategoryEnd[i])}
                      sx={{ bgcolor: 'grey.100' }}
                    >
                      {tabSubheaderLabel(tab)}
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={{ bgcolor: 'grey.100' }}>
                    {totalWeight === 100 ? (
                      totalWeightHeaderLabel
                    ) : (
                      <Tooltip title={t(translations.weightsDoNotSum)}>
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
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {body.rows.map((row, idx) => {
                  const rowProps = body.forEachRow(row, idx);
                  const studentId = row.original.studentId;
                  const isExpanded = expandedIds.has(studentId);
                  return (
                    <Fragment key={rowProps.id}>
                      <TableRow>
                        <TableCell
                          sx={{
                            position: 'sticky',
                            left: 0,
                            zIndex: 1,
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
                          {...groupEndIf(lastIdentityField === 'name')}
                          sx={{
                            position: 'sticky',
                            left: CHECKBOX_WIDTH,
                            zIndex: 1,
                            bgcolor: 'background.paper',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <IconButton
                            aria-label={t(
                              isExpanded
                                ? translations.collapseRow
                                : translations.expandRow,
                              { name: row.original.name },
                            )}
                            onClick={() => toggleExpanded(studentId)}
                            size="small"
                            sx={{
                              mr: 0.5,
                              p: 0.25,
                            }}
                          >
                            {isExpanded ? (
                              <KeyboardArrowDown fontSize="small" />
                            ) : (
                              <KeyboardArrowRight fontSize="small" />
                            )}
                          </IconButton>
                          <Tooltip title={row.original.name}>
                            <span>{row.original.name}</span>
                          </Tooltip>
                        </TableCell>
                        {showEmail && (
                          <TableCell
                            {...groupEndIf(lastIdentityField === 'email')}
                            sx={{ whiteSpace: 'nowrap' }}
                          >
                            <Tooltip title={row.original.email}>
                              <span>{row.original.email}</span>
                            </Tooltip>
                          </TableCell>
                        )}
                        {showExternalId && (
                          <TableCell
                            {...groupEndIf(lastIdentityField === 'externalId')}
                            sx={{ whiteSpace: 'nowrap' }}
                          >
                            <Tooltip title={row.original.externalId ?? ''}>
                              <span>{row.original.externalId ?? ''}</span>
                            </Tooltip>
                          </TableCell>
                        )}
                        {row.original.subtotals.map((subtotal, i) => {
                          const weight = resolvedTabs[i].gradebookWeight ?? 0;
                          return (
                            <TableCell
                              key={resolvedTabs[i].id}
                              align="right"
                              {...groupEndIf(tabIsCategoryEnd[i])}
                            >
                              {fmtDisplay(
                                tabDisplayValue(subtotal, weight),
                                columnPrecisions.tabs[i],
                              )}
                            </TableCell>
                          );
                        })}
                        <TableCell align="right">
                          {fmtDisplay(
                            totalDisplayValue(row.original.total),
                            columnPrecisions.total,
                          )}
                        </TableCell>
                      </TableRow>
                      {isExpanded &&
                        (breakdownsByStudent.get(studentId) ?? []).flatMap(
                          (tb, tabIdx) =>
                            tb.assessments.map((a) => {
                              const isExcluded = a.excluded;
                              const weightText = t(
                                translations.percentOfGrade,
                                {
                                  weight:
                                    Math.round(a.effectiveWeight * 100) / 100,
                                },
                              );
                              const gradeText =
                                a.grade === null
                                  ? `-/${a.maxGrade}`
                                  : `${a.grade}/${a.maxGrade}`;
                              return (
                                <TableRow
                                  key={`bd-${studentId}-${tb.tabId}-${a.assessmentId}`}
                                  data-testid={`breakdown-row-${studentId}-${tb.tabId}-${a.assessmentId}`}
                                  sx={{
                                    bgcolor: 'grey.50',
                                    opacity: isExcluded ? 0.6 : 1,
                                  }}
                                >
                                  <TableCell
                                    sx={{
                                      position: 'sticky',
                                      left: 0,
                                      zIndex: 1,
                                      bgcolor: 'grey.50',
                                      width: CHECKBOX_WIDTH,
                                      minWidth: CHECKBOX_WIDTH,
                                      px: 0,
                                    }}
                                  />
                                  <TableCell
                                    {...groupEndIf(
                                      lastIdentityField === 'name',
                                    )}
                                    sx={{
                                      position: 'sticky',
                                      left: CHECKBOX_WIDTH,
                                      zIndex: 1,
                                      bgcolor: 'grey.50',
                                      '&&': { pl: 4.5, py: 0.75 },
                                    }}
                                  >
                                    <Tooltip title={a.title}>
                                      <Typography
                                        color={
                                          isExcluded
                                            ? 'text.disabled'
                                            : undefined
                                        }
                                        fontSize="inherit"
                                        sx={{
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        {a.title}
                                      </Typography>
                                    </Tooltip>
                                    <Typography
                                      color="text.secondary"
                                      sx={{
                                        display: 'block',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                      variant="caption"
                                    >
                                      {`${gradeText} · ${isExcluded ? t(translations.excluded) : weightText}`}
                                    </Typography>
                                  </TableCell>
                                  {showEmail && (
                                    <TableCell
                                      {...groupEndIf(
                                        lastIdentityField === 'email',
                                      )}
                                    />
                                  )}
                                  {showExternalId && (
                                    <TableCell
                                      {...groupEndIf(
                                        lastIdentityField === 'externalId',
                                      )}
                                    />
                                  )}
                                  {resolvedTabs.map((tab, i) => {
                                    const tabCellValue = isExcluded
                                      ? '—'
                                      : fmtDisplay(
                                          breakdownDisplayValue(a),
                                          columnPrecisions.tabs[i],
                                        );
                                    return (
                                      <TableCell
                                        key={tab.id}
                                        align="right"
                                        {...groupEndIf(tabIsCategoryEnd[i])}
                                      >
                                        {i === tabIdx ? tabCellValue : ''}
                                      </TableCell>
                                    );
                                  })}
                                  <TableCell />
                                </TableRow>
                              );
                            }),
                        )}
                    </Fragment>
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

export default WeightedGradebookTable;
