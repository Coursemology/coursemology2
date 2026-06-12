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
  WeightedRow,
} from '../computeWeighted';
import {
  computeStudentBreakdown,
  computeWeightedRows,
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
  defaultWeights: {
    id: 'course.gradebook.GradebookWeightedTable.defaultWeights',
    defaultMessage:
      'Showing default weights — every tab counts equally. Click "Configure Weights" to set your own.',
  },
  defaultWeightsNoAccess: {
    id: 'course.gradebook.GradebookWeightedTable.defaultWeightsNoAccess',
    defaultMessage:
      'Showing default weights — every tab counts equally until weights are configured.',
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
  displayPointsTooltip: {
    id: 'course.gradebook.GradebookWeightedTable.displayPointsTooltip',
    defaultMessage:
      'How many grade points each tab contributes. Columns add up to the projected total.',
  },
  displayPercent: {
    id: 'course.gradebook.GradebookWeightedTable.displayPercent',
    defaultMessage: 'Percentage',
  },
  displayPercentTooltip: {
    id: 'course.gradebook.GradebookWeightedTable.displayPercentTooltip',
    defaultMessage:
      'What fraction of each tab the student earned. 100% on a tab worth 20% = the student earned all 20 grade points from that tab.',
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
  excluded: {
    id: 'course.gradebook.GradebookWeightedTable.excluded',
    defaultMessage: 'Excluded',
  },
  dropped: {
    id: 'course.gradebook.GradebookWeightedTable.dropped',
    defaultMessage: 'Dropped',
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

  // When no weights are configured, fall back to an equal split across non-empty
  // tabs so the weighted view is meaningful out of the box. Every weight-dependent
  // calculation and header below reads `resolvedTabs`; the prop `tabs` is passed
  // verbatim to the configure dialog, which derives the same default itself.
  const resolvedTabs = useMemo(
    () => resolveTabWeights(tabs, assessments),
    [tabs, assessments],
  );
  const showingDefaults = useMemo(
    () => usingDefaultWeights(tabs, assessments),
    [tabs, assessments],
  );

  // Mode-aware display value for a tab cell.
  const tabDisplayValue = (
    sub: number | null,
    weight: number,
  ): number | null => {
    if (sub === null) return null;
    return displayMode === 'percent' ? sub * 100 : sub * weight;
  };

  // A tab whose every assessment is excluded contributes nothing: its subtotal is
  // null and computeWeighted already drops it from the row total. Its stored weight
  // is therefore treated as 0 here too — for the row-3 subheader and the projected
  // total's weight (so percent-mode normalization divides by live weight only).
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

  // Row-3 subheader for a tab: "Excluded" when the tab contributes nothing,
  // else the weight in the active lens ("/{w}" points / "{w}% of grade").
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
        searchable: true,
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
      title: t(translations.projectedTotal),
      accessorFn: (row) => fmtCsv(totalDisplayValue(row.total)),
      cell: (row) =>
        fmtDisplay(totalDisplayValue(row.total), columnPrecisions.total),
      csvDownloadable: true,
    });

    return cols;
  }, [
    resolvedTabs,
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

  const allRowsSelected = body.allFilteredSelected ?? false;
  const someRowsSelected = body.someFilteredSelected ?? false;
  const toggleAllRows = (): void => body.toggleAllFiltered?.();

  const totalWeightHeaderLabel =
    displayMode === 'percent'
      ? t(translations.percentTotalExact)
      : t(translations.outOfWeight, { weight: totalWeight });

  return (
    <div data-testid="gradebook-weighted-table">
      {/* One-time policy banner — only meaningful once real projected totals
        are on screen from a deliberate configuration. Suppressed while the
        equal-split default is in effect (the default-weights banner speaks
        instead) and in the degenerate all-zero/empty case. */}
      {!allWeightsZero && !showingDefaults && <ProjectedTotalHint />}
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
                  <Tooltip
                    placement="bottom"
                    title={t(translations.displayPointsTooltip)}
                  >
                    {/* aria-label pre-set so MUI Tooltip skips its own injection,
                        keeping the button's accessible name as the visible label. */}
                    <span aria-label={t(translations.displayPoints)}>
                      {t(translations.displayPoints)}
                    </span>
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="percent">
                  <Tooltip
                    placement="bottom"
                    title={t(translations.displayPercentTooltip)}
                  >
                    <span aria-label={t(translations.displayPercent)}>
                      {t(translations.displayPercent)}
                    </span>
                  </Tooltip>
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

          {/* Default-weights banner: weights are unconfigured, so the table is
            showing the equal-split fallback. Keeps the Configure CTA for managers. */}
          {showingDefaults && (
            <Alert severity="info" sx={{ mx: 2, mb: 1 }}>
              {canManageWeights
                ? t(translations.defaultWeights)
                : t(translations.defaultWeightsNoAccess)}
            </Alert>
          )}
          {/* Degenerate case: weights are 0 and there is nothing to default
            (no tab has any assessment). */}
          {allWeightsZero && !showingDefaults && (
            <Alert severity="info" sx={{ mx: 2, mb: 1 }}>
              {canManageWeights
                ? t(translations.noWeightsConfigured)
                : t(translations.noWeightsNoAccess)}
            </Alert>
          )}
          {/* A bounded maxHeight is what makes `stickyHeader` actually stick:
            `overflowX: 'auto'` already promotes this container to a scroll
            container on BOTH axes (CSS computes overflow-y to `auto` when
            overflow-x isn't `visible`), so the sticky <thead> sticks relative
            to THIS element, not the page. Without a height cap the container
            grows to fit all rows and never scrolls internally, leaving the
            header no scroll range. Capping the height makes the body scroll
            within the container while the header (and the frozen Name/checkbox
            columns, same scroll context) stay pinned. The cap subtracts the
            chrome above the body — breadcrumb, page header, view tabs,
            toolbar — plus the pagination below, so the table fills the
            remaining viewport; shorter classes shrink to fit (no whitespace). */}
          <TableContainer
            sx={{ maxHeight: 'calc(100vh - 22rem)', overflowX: 'auto' }}
          >
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
                  // Outer top + left edges. Interior lines come from each cell's
                  // own bottom + right, so every separator stays a single 1px
                  // (no doubling) and the whole table reads as one uniform grid.
                  borderTop: gridLine,
                  borderLeft: gridLine,
                  '& th, & td': {
                    boxSizing: 'border-box',
                    border: 0,
                    borderBottom: gridLine,
                    borderRight: gridLine,
                    py: 0.25,
                    px: 1,
                    lineHeight: 1.2,
                    height: 32,
                  },
                  // MUI's default `.MuiTableRow-root:last-child th { border: 0 }`
                  // (specificity 0,2,1, the `:last-child` pseudo-class) outranks
                  // the `& th` rule above (0,1,1) and silently zeroes ALL borders
                  // on the weight row — it is the last <tr> in <thead>. Re-assert
                  // the grid lines with a higher-specificity selector so they
                  // survive through the "% of grade" row.
                  '& thead tr:last-of-type th': {
                    borderTop: gridLine,
                    borderBottom: gridLine,
                    borderRight: gridLine,
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
                    sx={{
                      fontWeight: 600,
                      minWidth: 120,
                      // Its bottom edge is the row2/row3 boundary, now drawn by
                      // the row-3 subheader's `borderTop`; drop this one so the
                      // Total column's separator stays a single 1px.
                      '&&': { borderBottom: 'none' },
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
                  sx={{
                    '& .MuiTableCell-stickyHeader': {
                      top: row2Top,
                      // Separator below this row is now owned by row 3's
                      // `borderTop` (survives scroll compositing); drop the
                      // bottom border here so the line stays a single 1px.
                      borderBottom: 'none',
                    },
                  }}
                >
                  {resolvedTabs.map((tab) => (
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
                  {resolvedTabs.map((tab) => (
                    <TableCell
                      key={tab.id}
                      align="center"
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
                        {/* Body sticky-left cells sit at zIndex 1 — strictly
                          below the header's sticky cells (MUI gives every
                          stickyHeader cell zIndex 2). On a z-index tie the cell
                          later in the DOM (the body) wins, so matching z2 here
                          lets scrolled rows bleed up over the header in any
                          column the frozen Name cell (z4) doesn't cover — i.e.
                          the identity columns once they're toggled on. */}
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
                          sx={{
                            position: 'sticky',
                            left: CHECKBOX_WIDTH,
                            zIndex: 1,
                            bgcolor: 'background.paper',
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
                          const weight = resolvedTabs[i].gradebookWeight ?? 0;
                          return (
                            <TableCell key={resolvedTabs[i].id} align="right">
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
                              const isDropped = a.dropped;
                              const isInactive = isExcluded || isDropped;
                              const statusText = isExcluded
                                ? t(translations.excluded)
                                : t(translations.dropped);
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
                                  sx={{
                                    bgcolor: 'grey.50',
                                    opacity: isInactive ? 0.6 : 1,
                                  }}
                                >
                                  {/* Empty checkbox cell so the breakdown row
                                    carries the same checkbox | name divider (the
                                    universal cell borderRight) as the rows above. */}
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
                                  {/* Title over a muted "raw mark · weightage"
                                    subtitle, stacked and confined to the (sticky)
                                    Name column. The breakdown row freezes the same
                                    checkbox | Name region as the student rows above —
                                    the identity columns get their own empty cells
                                    after this — so the layout reads identically
                                    whether identity columns are shown or not. A left
                                    indent sits the title under the student name (past
                                    the expand chevron), signalling these are that
                                    student's assessments. */}
                                  <TableCell
                                    sx={{
                                      position: 'sticky',
                                      left: CHECKBOX_WIDTH,
                                      zIndex: 1,
                                      bgcolor: 'grey.50',
                                      // The Table's `& th, & td` sx rule
                                      // (specificity 0,1,1) sets px:1/py:0.25, which
                                      // outranks this cell's own sx (0,1,0). Double
                                      // the selector with `&&` (→ 0,2,0) so the larger
                                      // vertical padding + the indent win.
                                      '&&': { pl: 4.5, py: 0.75 },
                                    }}
                                  >
                                    {/* nowrap keeps the title on one line: its
                                      max-content width then drives the table's auto
                                      layout, expanding the (frozen) Name column to fit
                                      the longest title. With the metadata line also
                                      nowrap, every breakdown row is exactly 2 lines —
                                      no fixed widths, no JS measurement. */}
                                    <Typography
                                      color={
                                        isInactive ? 'text.disabled' : undefined
                                      }
                                      fontSize="inherit"
                                      sx={{ whiteSpace: 'nowrap' }}
                                    >
                                      {a.title}
                                    </Typography>
                                    {/* Muted metadata on its own line below the
                                      title: raw mark · effective weightage, kept on
                                      one line (nowrap). Weightage is always "% of
                                      grade" — never routed through the points/percent
                                      lens. */}
                                    <Typography
                                      color="text.secondary"
                                      sx={{
                                        display: 'block',
                                        whiteSpace: 'nowrap',
                                      }}
                                      variant="caption"
                                    >
                                      {`${gradeText} · ${isInactive ? statusText : weightText}`}
                                    </Typography>
                                  </TableCell>
                                  {/* One empty cell per visible identity column so
                                    the grid lines stay aligned with the rows above.
                                    These scroll with the table (only checkbox + Name
                                    are frozen), matching the student rows. */}
                                  {showEmail && <TableCell />}
                                  {showExternalId && <TableCell />}
                                  {showLevel && <TableCell />}
                                  {showTotalXp && <TableCell />}
                                  {resolvedTabs.map((tab, i) => {
                                    const tabCellValue = isExcluded
                                      ? '—'
                                      : fmtDisplay(
                                          breakdownDisplayValue(a),
                                          columnPrecisions.tabs[i],
                                        );
                                    return (
                                      <TableCell key={tab.id} align="right">
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

export default GradebookWeightedTable;
