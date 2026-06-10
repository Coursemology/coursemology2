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
  ToggleButton,
  ToggleButtonGroup,
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

import type {
  AssessmentContribution,
  TabBreakdown,
  WeightedRow,
} from '../computeWeighted';
import {
  computeStudentBreakdown,
  computeWeightedRows,
  sumWeights,
} from '../computeWeighted';

import ConfigureWeightsPrompt from './ConfigureWeightsPrompt';
import ProjectedTotalHint, {
  projectedTotalPolicyTranslations,
} from './ProjectedTotalHint';
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
    defaultMessage: 'Projected total',
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
  expandRow: {
    id: 'course.gradebook.GradebookWeightedTable.expandRow',
    defaultMessage: 'Expand {name}',
  },
  collapseRow: {
    id: 'course.gradebook.GradebookWeightedTable.collapseRow',
    defaultMessage: 'Collapse {name}',
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
  const [displayMode, setDisplayMode] = useState<DisplayMode>('points');

  // Mode-aware display value for a tab cell.
  const tabDisplayValue = (
    sub: number | null,
    weight: number,
  ): number | null => {
    if (sub === null) return null;
    return displayMode === 'percent' ? sub * 100 : sub * weight;
  };

  // Mode-aware display value for the total cell.
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

  // Mode-aware display value for a single assessment in the expanded breakdown:
  // its points contribution in points mode, its own grade percentage in percent
  // mode (null grade → null so fmtDisplay renders "—").
  const breakdownDisplayValue = (a: AssessmentContribution): number | null => {
    if (displayMode === 'percent') {
      return a.grade === null ? null : (a.grade / a.maxGrade) * 100;
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

  const breakdownsByStudent = useMemo(() => {
    const map = new Map<number, TabBreakdown[]>();
    for (const studentId of expandedIds) {
      map.set(
        studentId,
        computeStudentBreakdown({ studentId, tabs, assessments, submissions }),
      );
    }
    return map;
  }, [expandedIds, tabs, assessments, submissions]);

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
    const row1 = row1Ref.current;
    const row2 = row2Ref.current;
    if (!row1 || !row2) return undefined;

    // Re-measure on every header-row resize, not just on mount. Expanding or
    // collapsing a row, switching display mode and showing/hiding columns all
    // reflow the header after mount; with a one-shot measurement rows 2–3 keep
    // a stale `top` and stay permanently dislodged from the rows above them.
    const measure = (): void => {
      const h1 = row1.offsetHeight;
      setRow2Top(h1);
      setRow3Top(h1 + row2.offsetHeight);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(row1);
    observer.observe(row2);
    return () => observer.disconnect();
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
    const tabPrecs = tabs.map((tab, idx) =>
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
  }, [rows, tabs, displayMode, totalWeight]);

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
        accessorFn: (row) =>
          fmtCsv(tabDisplayValue(row.subtotals[idx], weight)),
        cell: (row) =>
          fmtDisplay(tabDisplayValue(row.subtotals[idx], weight), prec),
        csvDownloadable: true,
      });
    });

    cols.push({
      id: 'total',
      title: t(translations.projectedTotal),
      accessorFn: (row) => fmtCsv(totalDisplayValue(row.total)),
      cell: (row) =>
        fmtDisplay(totalDisplayValue(row.total), columnPrecisions.total),
      csvDownloadable: true,
    });

    return cols;
  }, [
    tabs,
    t,
    gamificationEnabled,
    hasExternalIds,
    columnPrecisions,
    displayMode,
    totalWeight,
  ]);

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

  const visibleIdentityCount =
    (showEmail ? 1 : 0) +
    (showExternalId ? 1 : 0) +
    (showLevel ? 1 : 0) +
    (showTotalXp ? 1 : 0);
  const labelColSpan = 2 + visibleIdentityCount;

  const allRowsSelected = body.allFilteredSelected ?? false;
  const someRowsSelected = body.someFilteredSelected ?? false;
  const toggleAllRows = (): void => body.toggleAllFiltered?.();

  return (
    <div data-testid="gradebook-weighted-table">
      {/* One-time policy banner — only meaningful once real projected totals
        are on screen (i.e. some weight is configured). */}
      {!allWeightsZero && <ProjectedTotalHint />}
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
              <ToggleButtonGroup
                exclusive
                onChange={(_, value: DisplayMode | null) => {
                  if (value) setDisplayMode(value);
                }}
                size="small"
                value={displayMode}
              >
                <ToggleButton value="points">
                  {t(translations.displayPoints)}
                </ToggleButton>
                <ToggleButton value="percent">
                  {t(translations.displayPercent)}
                </ToggleButton>
              </ToggleButtonGroup>
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
                    py: 0.25,
                    px: 1,
                    lineHeight: 1.2,
                    height: 32,
                  },
                  // Column separators live only on the data cells (tab columns
                  // + Total), in both the header and body — one rule keyed off
                  // data-col="value" keeps the two in lockstep. Identity columns
                  // form a borderless label zone; the frozen Name column carries
                  // its own right edge via boxShadow, which is the only divider
                  // the identity zone needs.
                  '& [data-col="value"]': {
                    borderLeft: gridLine,
                  },
                  // MUI's default `.MuiTableRow-root:last-child th { border: 0 }`
                  // (specificity 0,2,1, the `:last-child` pseudo-class) outranks
                  // the attribute rule above (0,2,0) and silently zeroes ALL
                  // borders on the weight row — it is the last <tr> in <thead>.
                  // Re-assert both the column separators (borderLeft) and the
                  // header's bottom edge (borderBottom) with a higher-specificity
                  // selector (0,3,2) so they survive through the "% of grade" row.
                  '& thead tr:last-of-type [data-col="value"]': {
                    borderLeft: gridLine,
                    borderBottom: gridLine,
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
                      data-col="value"
                      sx={{ fontWeight: 600 }}
                    >
                      {cat.title}
                    </TableCell>
                  ))}
                  <TableCell
                    align="center"
                    data-col="value"
                    rowSpan={2}
                    sx={{ fontWeight: 600, minWidth: 120 }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                      }}
                    >
                      {t(translations.projectedTotal)}
                      {/* The policy moved out of the header label into this ⓘ —
                        the descriptive sentence stays available on demand after
                        the one-time banner is dismissed. */}
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

                {/* Row 2: Tab titles */}
                <TableRow
                  ref={row2Ref}
                  sx={{ '& .MuiTableCell-stickyHeader': { top: row2Top } }}
                >
                  {tabs.map((tab) => (
                    <TableCell
                      key={tab.id}
                      align="center"
                      data-col="value"
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
                      data-col="value"
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
                  <TableCell
                    align="center"
                    data-col="value"
                    sx={{ bgcolor: 'grey.100' }}
                  >
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
                  const studentId = row.original.studentId;
                  const isExpanded = expandedIds.has(studentId);
                  return (
                    <Fragment key={rowProps.id}>
                      <TableRow>
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
                          {row.original.name}
                        </TableCell>
                        {showEmail && (
                          <TableCell>{row.original.email}</TableCell>
                        )}
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
                            <TableCell
                              key={tabs[i].id}
                              align="right"
                              data-col="value"
                            >
                              {fmtDisplay(
                                tabDisplayValue(subtotal, weight),
                                columnPrecisions.tabs[i],
                              )}
                            </TableCell>
                          );
                        })}
                        <TableCell align="right" data-col="value">
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
                              // Weightage is always "% of grade" — it never
                              // follows the points/percent lens.
                              const weightText = t(
                                translations.percentOfGrade,
                                {
                                  weight:
                                    Math.round(a.effectiveWeight * 100) / 100,
                                },
                              );
                              const gradeText =
                                a.grade === null
                                  ? `—/${a.maxGrade}`
                                  : `${a.grade}/${a.maxGrade}`;
                              return (
                                <TableRow
                                  key={`bd-${studentId}-${tb.tabId}-${a.assessmentId}`}
                                  data-testid={`breakdown-row-${studentId}-${tb.tabId}-${a.assessmentId}`}
                                  sx={{ bgcolor: 'grey.50' }}
                                >
                                  {/* Freeze only the checkbox+Name zone — the
                                    same width the main rows freeze — so this cell
                                    can never paint over the scrolling value
                                    columns. The title wraps within the Name
                                    column; its weightage and grade scroll in the
                                    identity span beside it, mirroring email /
                                    external ID on the main rows. When no identity
                                    columns are visible there is no scroll span, so
                                    they fall back here right-aligned — harmless, as
                                    the frozen cell then spans the full label
                                    width. */}
                                  <TableCell
                                    colSpan={2}
                                    sx={(theme) => ({
                                      position: 'sticky',
                                      left: 0,
                                      zIndex: 2,
                                      bgcolor: 'grey.50',
                                      pl: 6,
                                      boxShadow: `inset -1px 0 0 ${theme.palette.divider}`,
                                    })}
                                  >
                                    {visibleIdentityCount === 0 ? (
                                      <span
                                        style={{
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          gap: 16,
                                        }}
                                      >
                                        <span>
                                          {a.title}
                                          <Typography
                                            color="text.secondary"
                                            component="span"
                                            fontSize="inherit"
                                            sx={{ ml: 1 }}
                                          >
                                            {weightText}
                                          </Typography>
                                        </span>
                                        <span style={{ opacity: 0.7 }}>
                                          {gradeText}
                                        </span>
                                      </span>
                                    ) : (
                                      a.title
                                    )}
                                  </TableCell>
                                  {visibleIdentityCount > 0 && (
                                    <TableCell
                                      colSpan={visibleIdentityCount}
                                      sx={{ whiteSpace: 'nowrap' }}
                                    >
                                      <span
                                        style={{
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          gap: 16,
                                        }}
                                      >
                                        <Typography
                                          color="text.secondary"
                                          component="span"
                                          fontSize="inherit"
                                        >
                                          {weightText}
                                        </Typography>
                                        <span style={{ opacity: 0.7 }}>
                                          {gradeText}
                                        </span>
                                      </span>
                                    </TableCell>
                                  )}
                                  {tabs.map((tab, i) => (
                                    <TableCell
                                      key={tab.id}
                                      align="right"
                                      data-col="value"
                                    >
                                      {i === tabIdx
                                        ? fmtDisplay(
                                            breakdownDisplayValue(a),
                                            columnPrecisions.tabs[i],
                                          )
                                        : ''}
                                    </TableCell>
                                  ))}
                                  <TableCell data-col="value" />
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

export default GradebookWeightedTable;
