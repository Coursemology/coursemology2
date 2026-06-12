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
  displayMode: {
    id: 'course.gradebook.GradebookWeightedTable.displayMode',
    defaultMessage: 'Display mode',
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
  total: {
    id: 'course.gradebook.GradebookWeightedTable.total',
    defaultMessage: 'Total',
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

  // A tab whose RIGHT edge is a tab-group (category) boundary — i.e. the last
  // tab of its category. These boundaries (plus the identity|grades one) get a
  // 2px separator instead of the 1px sub-column hairline: a 2px line always
  // covers at least one full device pixel, so unlike a 1px line it can't wash
  // out at an unlucky fractional column offset on a non-integer DPR. The data
  // attribute is targeted by the table's `& [data-group-end]` sx rule.
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

    // Re-measure on every header-row resize, not just on mount. Expanding or
    // collapsing a row, switching display mode and showing/hiding columns all
    // reflow the header after mount; with a one-shot measurement rows 2–3 keep
    // a stale `top` and stay permanently dislodged from the rows above them.
    const measure = (): void => {
      // getBoundingClientRect (subpixel) not offsetHeight (integer-rounded):
      // rows are fractional (32px min + lineHeight content), and a rounded
      // `top` lands the stuck rows 2-3 a fraction off — opening thin gaps
      // between header rows (body bleeds through) and overshooting the single
      // rowSpan=3 frozen-left cell so the right header reads a touch taller.
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
  // The rightmost visible identity column — its right edge is the
  // identity|grades group boundary (drawn 2px, like the category boundaries).
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
            sx={(theme) => ({
              maxHeight: 'calc(100vh - 22rem)',
              overflowX: 'auto',
              // Outer top + left edges of the grid. A static border on the
              // scroll container sits at the viewport edge and is always
              // visible — unlike a border on the <table>, which scrolls out
              // from under the sticky header / frozen column. The cells' own
              // right + bottom box-shadow insets supply the other two outer
              // edges (last column / last row). Solid grey (matching the cell
              // lines), not the translucent `divider` which anti-aliases away
              // at fractional positions on a non-integer DPR.
              borderTop: `1px solid ${theme.palette.grey[400]}`,
              borderLeft: `1px solid ${theme.palette.grey[400]}`,
            })}
          >
            <Table
              size="small"
              stickyHeader
              sx={(theme) => {
                // Interior grid lines: each cell draws its OWN right + bottom
                // edge as a box-shadow inset, NOT a `border`. Rationale (this is
                // a sticky-header table with frozen columns on a fractional DPR):
                //   (1) A box-shadow is painted inside the cell's own layer, so
                //       the lines travel with the sticky header rows and frozen
                //       checkbox/Name columns on scroll. (`border-collapse:
                //       collapse` paints one grid by the <table> at the cells'
                //       original positions and leaves it behind when they stick.)
                //   (2) At a fractional column boundary — a nowrap breakdown
                //       title widens the Name column to a fractional max-content
                //       width, cascading fractional offsets across every column —
                //       a 1px `border` lands between device pixels on a
                //       non-integer DPR (e.g. 1.33×) and the browser snaps it to
                //       ZERO width, vanishing (and different browsers drop
                //       different ones); a box-shadow renders a hairline instead.
                //   (3) box-shadow sidesteps MUI's `:last-child { border: 0 }`,
                //       so the last header/body row keeps its lines unaided.
                // The outer top/left edges live on the TableContainer (a static
                // frame at the scroll-viewport edge); the cells' right/bottom
                // insets supply the outer right/bottom (last column / last row).
                //
                // The line is a SOLID grey, not the translucent `divider`
                // (rgba(0,0,0,0.12)). At a fractional column boundary on a
                // non-integer DPR the 1px line is anti-aliased across two device
                // pixels at partial coverage; 50%-covered `divider` (→ 0.06)
                // disappears, but a 50%-covered solid grey is still visibly grey.
                // This is what keeps the tab-group separators (Missions |
                // Tutorials | …) reliably visible at every layout.
                const line = theme.palette.grey[400];
                const right = `inset -1px 0 0 ${line}`;
                const bottom = `inset 0 -1px 0 ${line}`;
                // 2px separator for tab-group boundaries (see `tabIsCategoryEnd`).
                const groupRight = `inset -2px 0 0 ${line}`;
                return {
                  tableLayout: 'auto',
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
                  },
                  // Tab-group separators: a 2px right edge that can't wash out
                  // at a fractional column offset. (0,2,0) outranks the
                  // `& th, & td` rule (0,1,1), so it wins on the marked cells.
                  '& [data-group-end]': {
                    boxShadow: `${groupRight}, ${bottom}`,
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
                    },
                  }}
                >
                  {resolvedTabs.map((tab, i) => (
                    <TableCell
                      key={tab.id}
                      align="center"
                      {...groupEndIf(tabIsCategoryEnd[i])}
                      // nowrap keeps each tab title on one line, so its natural
                      // single-line width drives the column. Without it, auto
                      // table-layout shrinks these wrappable cells toward
                      // min-content whenever an identity column (e.g. Email) is
                      // toggled on and the table outgrows the viewport — wrapping
                      // titles to two lines and growing the whole header taller.
                      // Pinning the width forces horizontal scroll instead, so
                      // the header height stays constant.
                      sx={{ minWidth: 120, whiteSpace: 'nowrap' }}
                    >
                      {tab.title}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Row 3: Weight subheaders */}
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
                          {...groupEndIf(lastIdentityField === 'name')}
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
                          <TableCell
                            {...groupEndIf(lastIdentityField === 'email')}
                          >
                            {row.original.email}
                          </TableCell>
                        )}
                        {showExternalId && (
                          <TableCell
                            {...groupEndIf(lastIdentityField === 'externalId')}
                          >
                            {row.original.externalId ?? ''}
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
                                    opacity: isExcluded ? 0.6 : 1,
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
                                    {...groupEndIf(
                                      lastIdentityField === 'name',
                                    )}
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
                                        isExcluded ? 'text.disabled' : undefined
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
                                      {`${gradeText} · ${isExcluded ? t(translations.excluded) : weightText}`}
                                    </Typography>
                                  </TableCell>
                                  {/* One empty cell per visible identity column so
                                    the grid lines stay aligned with the rows above.
                                    These scroll with the table (only checkbox + Name
                                    are frozen), matching the student rows. */}
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

export default GradebookWeightedTable;
