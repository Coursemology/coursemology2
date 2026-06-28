import { Fragment, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { defineMessages, MessageDescriptor } from 'react-intl';
import {
  Download,
  InfoOutlined,
  KeyboardArrowDown,
  KeyboardArrowRight,
  WarningAmber,
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
import type { Theme } from '@mui/material/styles';
import { lighten } from '@mui/material/styles';
import type {
  AssessmentData,
  CategoryData,
  LevelContributionData,
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
import {
  DEFAULT_MINI_TABLE_ROWS_PER_PAGE,
  DEFAULT_TABLE_ROWS_PER_PAGE,
} from 'lib/constants/sharedConstants';
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
  customTabImbalanced,
  effectiveGrade,
  LEVEL_TAB_ID,
  levelOffenders,
  resolveTabWeights,
  usingDefaultWeights,
} from '../computeWeighted';
import { parseFormula } from '../levelFormula';
import { externalClamp } from '../outOfRange';

import ConfigureWeightsPrompt from './ConfigureWeightsPrompt';
import ProjectedTotalHint, {
  projectedTotalPolicyTranslations,
} from './ProjectedTotalHint';
import WeightedGradebookColumnTree from './WeightedGradebookColumnTree';

const INLINE_FLEX = 'inline-flex';

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
  dropped: {
    id: 'course.gradebook.WeightedGradebookTable.dropped',
    defaultMessage: 'Dropped (lowest)',
  },
  total: {
    id: 'course.gradebook.WeightedGradebookTable.weightedTotal',
    defaultMessage: 'Weighted Total',
  },
  gradeCapped: {
    id: 'course.gradebook.WeightedGradebookTable.gradeCapped',
    defaultMessage: 'Capped at {value}',
  },
  gradeFloored: {
    id: 'course.gradebook.WeightedGradebookTable.gradeFloored',
    defaultMessage: 'Floored to {value}',
  },
  gradeCountsAs: {
    id: 'course.gradebook.WeightedGradebookTable.gradeCountsAs',
    defaultMessage: 'Counts as {value}',
  },
  levelHeader: {
    id: 'course.gradebook.WeightedGradebookTable.levelHeader',
    defaultMessage: 'Level',
  },
  levelContributionHeader: {
    id: 'course.gradebook.WeightedGradebookTable.levelContributionHeader',
    defaultMessage: 'Level Contribution',
  },
  levelBreakdownDetail: {
    id: 'course.gradebook.WeightedGradebookTable.levelBreakdownDetail',
    defaultMessage: 'Level {level}',
  },
  levelOverBudgetAboveOnly: {
    id: 'course.gradebook.WeightedGradebookTable.levelOverBudgetAboveOnly',
    defaultMessage:
      'Some level contributions are above the maximum level contributions and have been capped.',
  },
  levelOverBudgetBelowOnly: {
    id: 'course.gradebook.WeightedGradebookTable.levelOverBudgetBelowOnly',
    defaultMessage:
      'Some level contributions are below 0 and have been raised to 0.',
  },
  levelOverBudgetBoth: {
    id: 'course.gradebook.WeightedGradebookTable.levelOverBudgetBoth',
    defaultMessage:
      'Some level contributions are outside the valid range (below 0 or above the maximum level contributions) and are floored and capped accordingly.',
  },
  levelCellCappedAbove: {
    id: 'course.gradebook.WeightedGradebookTable.levelCellCappedAbove',
    defaultMessage: 'Set to {weight} because the formula produced {raw}.',
  },
  levelCellCappedBelow: {
    id: 'course.gradebook.WeightedGradebookTable.levelCellCappedBelow',
    defaultMessage: 'Set to 0 because the formula produced {raw}.',
  },
  levelCellDivByZero: {
    id: 'course.gradebook.WeightedGradebookTable.levelCellDivByZero',
    defaultMessage:
      'Set to 0 because the formula divides by zero for this level.',
  },
  customWeightsUnbalanced: {
    id: 'course.gradebook.WeightedGradebookTable.customWeightsUnbalanced',
    defaultMessage:
      'This tab\'s assessment weights don\'t add up to its tab weight. Its total may be understated - open "Configure Weights" to fix.',
  },
  externalOverRangeAboveOnly: {
    id: 'course.gradebook.WeightedGradebookTable.externalOverRangeAboveOnly',
    defaultMessage:
      'Some grades exceed the maximum and are capped in the weighted total.',
  },
  externalOverRangeBelowOnly: {
    id: 'course.gradebook.WeightedGradebookTable.externalOverRangeBelowOnly',
    defaultMessage:
      'Some grades are below 0 and are floored to 0 in the weighted total.',
  },
  externalOverRangeBoth: {
    id: 'course.gradebook.WeightedGradebookTable.externalOverRangeBoth',
    defaultMessage:
      'Some grades are outside the valid range (below 0 or above the maximum) and are floored and capped accordingly.',
  },
  externalCellCapped: {
    id: 'course.gradebook.WeightedGradebookTable.externalCellCapped',
    defaultMessage: 'Set to {max} because the grade was {raw}.',
  },
  externalCellFloored: {
    id: 'course.gradebook.WeightedGradebookTable.externalCellFloored',
    defaultMessage: 'Set to 0 because the grade was {raw}.',
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
  courseMaxLevel: number;
  levelContribution: LevelContributionData;
  /** Optional action rendered in the toolbar, left of the column picker. */
  toolbarAction?: JSX.Element;
}

const r2 = (n: number): number => Math.round(n * 100) / 100;

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
const LEVEL_WIDTH = 90;
const LEVEL_CONTRIBUTIONS_WIDTH = 110;
const TOTAL_WIDTH = 120;

const WeightedGradebookTable = ({
  categories,
  tabs,
  assessments,
  students,
  submissions,
  canManageWeights,
  courseTitle,
  courseId,
  gamificationEnabled,
  courseMaxLevel,
  levelContribution,
  toolbarAction,
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
  const assessmentsById = useMemo(
    () => new Map(assessments.map((a) => [a.id, a])),
    [assessments],
  );

  const tabDisplayValue = (
    sub: number | null,
    weight: number,
  ): number | null => {
    if (sub === null) return null;
    return displayMode === 'percent' ? sub * 100 : sub * weight;
  };

  // The Level Contribution is stored in points (already weight-scaled). Points mode
  // shows it verbatim; percent mode shows the fraction of the level budget earned
  // (points / weight × 100), mirroring how a tab cell reads in percent — a value can
  // exceed 100% since the weight is a suggested max, never a cap. Weight 0 → the
  // component carries no grade, so there's nothing meaningful to normalise against.
  const levelDisplayValue = (points: number | null): number | null => {
    if (points === null) return null;
    if (displayMode !== 'percent') return points;
    const weight = levelContribution.weight;
    return weight > 0 ? (points / weight) * 100 : null;
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

  // Level Contribution column: shown whenever the contribution is active (drives
  // the total + per-row points too).
  const showLevelContribution =
    gamificationEnabled && levelContribution.enabled;
  // Raw Level column: the actual student level, shown alongside the contribution
  // so staff can sanity-check it. Gated additionally on `show`.
  //
  // Both columns are server-controlled (not in the column picker), so their
  // *presence* — not just their default visibility — is gated here, and they are
  // locked visible (below). Plumbing these through `defaultVisible` failed:
  // defaultVisible is a one-time seed that loses to stale persisted localStorage,
  // stranding a column hidden with no picker entry to recover it.
  const showRawLevel = showLevelContribution && levelContribution.show;

  // The level weight is a suggested maximum (never caps the total), so a formula
  // can push a student's contribution past it. Flag that on the column subheader.
  // Reuses the dialog's check so both views warn on identical conditions.
  const levelBudgetOffenders = useMemo(
    () =>
      showLevelContribution
        ? levelOffenders(
            students,
            parseFormula(levelContribution.formula),
            levelContribution.weight,
          )
        : null,
    [showLevelContribution, students, levelContribution],
  );

  // Students for whom the formula is undefined (divide-by-zero -> NaN). The
  // store/backend store these as null; we surface them as 0 + a warning.
  const unscoreableIds = useMemo(
    () => new Set(levelBudgetOffenders?.unscoreable.map((o) => o.id) ?? []),
    [levelBudgetOffenders],
  );
  const levelOverBudget =
    levelBudgetOffenders !== null &&
    (levelBudgetOffenders.below.length > 0 ||
      levelBudgetOffenders.above.length > 0);
  const levelClampByStudent = useMemo(() => {
    const map = new Map<
      number,
      { bound: 'below' | 'above' | 'unscoreable'; raw: number }
    >();
    if (showLevelContribution && levelBudgetOffenders) {
      if (levelContribution.clamp) {
        levelBudgetOffenders.below.forEach((o) =>
          map.set(o.id, { bound: 'below', raw: o.value }),
        );
        levelBudgetOffenders.above.forEach((o) =>
          map.set(o.id, { bound: 'above', raw: o.value }),
        );
      }
      levelBudgetOffenders.unscoreable.forEach((o) =>
        map.set(o.id, { bound: 'unscoreable', raw: NaN }),
      );
    }
    return map;
  }, [showLevelContribution, levelContribution.clamp, levelBudgetOffenders]);
  const getLevelOverBudgetTranslation = (): MessageDescriptor => {
    const below = levelBudgetOffenders?.below.length ?? 0;
    const above = levelBudgetOffenders?.above.length ?? 0;
    if (below > 0 && above > 0) return translations.levelOverBudgetBoth;
    if (above > 0) return translations.levelOverBudgetAboveOnly;
    return translations.levelOverBudgetBelowOnly;
  };
  const getLevelCellTranslation = (
    bound: 'below' | 'above' | 'unscoreable',
  ): MessageDescriptor => {
    if (bound === 'unscoreable') return translations.levelCellDivByZero;
    if (bound === 'below') return translations.levelCellCappedBelow;
    return translations.levelCellCappedAbove;
  };
  const externalClampState = useMemo(
    () => externalClamp(assessments, submissions),
    [assessments, submissions],
  );
  // Each external assessment is its own single-assessment tab; map tab -> its
  // bounded assessment id so a tab column can resolve its clamp state.
  const externalAssessmentByTab = useMemo(() => {
    const map = new Map<number, number>();
    assessments.forEach((a) => {
      if (a.external) map.set(a.tabId, a.id);
    });
    return map;
  }, [assessments]);
  const getExternalOverRangeTranslation = (flags: {
    above: boolean;
    below: boolean;
  }): MessageDescriptor => {
    if (flags.above && flags.below) return translations.externalOverRangeBoth;
    if (flags.above) return translations.externalOverRangeAboveOnly;
    return translations.externalOverRangeBelowOnly;
  };
  const tabTotalWeight = resolvedTabs.reduce(
    (acc, tab) =>
      acc + (allExcludedTabIds.has(tab.id) ? 0 : tab.gradebookWeight ?? 0),
    0,
  );
  const totalWeight = r2(
    tabTotalWeight + (showLevelContribution ? levelContribution.weight : 0),
  );
  const allWeightsZero = totalWeight === 0;

  const totalDisplayValue = (total: number | null): number | null => total;

  const fmtDisplay = (v: number | null, prec: 0 | 1 | 2): string => {
    if (v === null) return '—';
    const s = v.toFixed(prec);
    return displayMode === 'percent' ? `${s}%` : s;
  };

  const breakdownDisplayValue = (a: AssessmentContribution): number | null => {
    if (displayMode === 'percent') {
      return a.grade === null ? null : a.ratio * 100;
    }
    return a.points;
  };

  // Single-open accordion: auditing one student at a time. Replaces the former
  // multi-expand Set so only the focused student's breakdown is on screen (and
  // only one summary row ever pins under the header).
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const toggleExpanded = (studentId: number): void =>
    setExpandedId((prev) => (prev === studentId ? null : studentId));

  // The table is fixed-layout, so the Name column can't auto-grow to fit the
  // breakdown's assessment titles. Widen its fixed <col> while the audited
  // student's breakdown is open (single-open accordion → a row is expanded iff
  // expandedId is set); shrink back when collapsed. Titles longer than this are
  // ellipsis-clipped with a Tooltip in the breakdown cell below.
  const nameWidth =
    expandedId !== null ? NAME_WIDTH_EXPANDED : NAME_WIDTH_COLLAPSED;

  const studentLevelById = useMemo(
    () => new Map(students.map((s) => [s.id, s.level])),
    [students],
  );

  const studentLevelContributionById = useMemo(
    () => new Map(students.map((s) => [s.id, s.levelContribution ?? null])),
    [students],
  );

  const expandedBreakdown = useMemo<TabBreakdown[] | null>(() => {
    if (expandedId === null) return null;
    const breakdown = computeStudentBreakdown({
      studentId: expandedId,
      tabs: resolvedTabs,
      assessments,
      submissions,
      level: studentLevelById.get(expandedId) ?? 0,
      levelContribution: showLevelContribution ? levelContribution : undefined,
      levelContributionPoints: showLevelContribution
        ? studentLevelContributionById.get(expandedId) ?? null
        : null,
      courseMaxLevel,
    });
    // Level row first, mirroring the Level Contribution column being the
    // first contribution column (left of the tabs).
    return [
      ...breakdown.filter((tb) => tb.tabId === LEVEL_TAB_ID),
      ...breakdown.filter((tb) => tb.tabId !== LEVEL_TAB_ID),
    ];
  }, [
    expandedId,
    resolvedTabs,
    assessments,
    submissions,
    studentLevelById,
    studentLevelContributionById,
    showLevelContribution,
    levelContribution,
    courseMaxLevel,
  ]);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeRowRef = useRef<HTMLTableRowElement>(null);
  const row1Ref = useRef<HTMLTableRowElement>(null);
  const row2Ref = useRef<HTMLTableRowElement>(null);
  const row3Ref = useRef<HTMLTableRowElement>(null);
  const [row2Top, setRow2Top] = useState(0);
  const [row3Top, setRow3Top] = useState(0);
  // Full header height = where the pinned summary row sticks, and the scroll
  // offset that lands a focused row just beneath the header.
  const [headerHeight, setHeaderHeight] = useState(0);

  // sx for the focused (expanded) student's summary row. Pinning is applied at
  // the ROW level — every cell sticks beneath the header as a unit — so the
  // optional identity columns (email, external ID) and any future optional
  // column (e.g. level / level contribution) are pinned automatically, without
  // having to remember to decorate each new cell. Layering mirrors the header:
  // the two left-frozen lead cells (checkbox, name) carry their own left freeze
  // and ride above the data cells; the checkbox also carries the left accent
  // bar that marks "this is the student you're auditing".
  const pinnedRowSx = (theme: Theme): Record<string, unknown> => ({
    '& > td': {
      position: 'sticky',
      top: headerHeight,
      zIndex: 3,
      // Opaque tint (not alpha) so scrolled body content can't bleed through
      // the sticky cell.
      backgroundColor: lighten(theme.palette.primary.light, 0.96),
    },
    // checkbox + name are also left-frozen; keep them above the data cells (and
    // above the header's frozen corner) while both axes stick.
    '& > td:nth-of-type(1), & > td:nth-of-type(2)': {
      zIndex: 6,
    },
    // Accent bar PLUS the cell's usual right/bottom borders — a bare accent
    // boxShadow would otherwise replace (and so erase) the grid lines the
    // Table's `& th, & td` rule paints via boxShadow.
    '& > td:first-of-type': {
      boxShadow: [
        `inset 3px 0 0 ${theme.palette.primary.main}`,
        `inset -1px 0 0 ${theme.palette.grey[400]}`,
        `inset 0 -1px 0 ${theme.palette.grey[400]}`,
      ].join(', '),
    },
  });

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
    const row3 = row3Ref.current;
    if (!row1 || !row2 || !row3) return undefined;

    const measure = (): void => {
      const h1 = row1.getBoundingClientRect().height;
      const h2 = row2.getBoundingClientRect().height;
      const h3 = row3.getBoundingClientRect().height;
      setRow2Top(h1);
      setRow3Top(h1 + h2);
      setHeaderHeight(h1 + h2 + h3);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(row1);
    observer.observe(row2);
    observer.observe(row3);
    return () => observer.disconnect();
  }, [visibleCategories, resolvedTabs]);

  // On expand, glide the focused row to just beneath the header so its
  // breakdown is guaranteed in view (even when the clicked row was near the
  // bottom). getBoundingClientRect keeps this correct regardless of the row's
  // offsetParent; scrollTo is optional-chained because jsdom lacks it.
  useLayoutEffect(() => {
    if (expandedId === null) return;
    const container = containerRef.current;
    const rowEl = activeRowRef.current;
    if (!container || !rowEl) return;
    const prefersReducedMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const delta =
      rowEl.getBoundingClientRect().top - container.getBoundingClientRect().top;
    container.scrollTo?.({
      top: container.scrollTop + delta - headerHeight,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }, [expandedId, headerHeight]);

  const rows = useMemo<WeightedRow[]>(() => {
    const base = computeWeightedRows({
      students,
      tabs: resolvedTabs,
      assessments,
      submissions,
      showLevelContribution,
    });
    if (unscoreableIds.size === 0) return base;
    return base.map((r) =>
      unscoreableIds.has(r.studentId) ? { ...r, levelContribution: 0 } : r,
    );
  }, [
    students,
    resolvedTabs,
    assessments,
    submissions,
    showLevelContribution,
    unscoreableIds,
  ]);

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
      level: columnPrecision(
        rows.map((r) => levelDisplayValue(r.levelContribution ?? null)),
      ),
    };
  }, [rows, resolvedTabs, displayMode, totalWeight, levelContribution.weight]);

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

    // Raw Level — the right-most student-info column, just left of the
    // contribution columns. The actual student level, shown for verification.
    if (showRawLevel) {
      cols.push({
        id: 'level',
        title: t(translations.levelHeader),
        accessorFn: (row) => `${row.level}`,
        cell: (row) => `${row.level}`,
        csvDownloadable: true,
      });
    }

    // Level Contribution — the left-most contribution column, immediately right
    // of the student-info columns and before the per-tab columns.
    if (showLevelContribution) {
      cols.push({
        id: 'levelContribution',
        title: t(translations.levelContributionHeader),
        accessorFn: (row) =>
          fmtCsv(levelDisplayValue(row.levelContribution ?? null)),
        cell: (row) =>
          fmtDisplay(
            levelDisplayValue(row.levelContribution ?? null),
            columnPrecisions.level,
          ),
        csvDownloadable: true,
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
    showLevelContribution,
    showRawLevel,
    levelContribution.weight,
  ]);

  // Lock the level columns visible whenever present so a stale persisted-hidden
  // entry can't keep them hidden (the picker doesn't expose them to recover).
  const lockedColumns = useMemo(() => {
    const locked = ['name'];
    if (showLevelContribution) locked.push('levelContribution');
    if (showRawLevel) locked.push('level');
    return locked;
  }, [showLevelContribution, showRawLevel]);

  const columnPicker = useMemo(
    () => ({
      render: (context: ColumnPickerRenderContext) => (
        <WeightedGradebookColumnTree {...context} />
      ),
      locked: lockedColumns,
      triggerLabel: t(translations.selectColumns),
      dialogTitle: t(translations.dialogTitle),
      storageKey: `gradebook_weighted_columns_${courseId}`,
    }),
    [courseId, t, lockedColumns],
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
      initialPageSize: DEFAULT_TABLE_ROWS_PER_PAGE,
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
  let lastIdentityField: 'name' | 'email' | 'externalId' = 'name';
  if (showExternalId) lastIdentityField = 'externalId';
  else if (showEmail) lastIdentityField = 'email';
  // These columns are locked visible when present, so visibility resolves to true;
  // gating the manual header on it keeps the header in lockstep with the body
  // (no colSpan drift) even on the first frame before the lock effect runs.
  const showLevelContributionCol =
    showLevelContribution && (visibility.levelContribution ?? true) === true;
  const showRawLevelCol = showRawLevel && (visibility.level ?? true) === true;

  const allRowsSelected = body.allFilteredSelected ?? false;
  const someRowsSelected = body.someFilteredSelected ?? false;
  const toggleAllRows = (): void => body.toggleAllFiltered?.();

  const totalWeightHeaderLabel =
    displayMode === 'percent'
      ? t(translations.percentTotalExact)
      : t(translations.outOfWeight, { weight: totalWeight });

  const levelBudgetLabel =
    displayMode === 'percent'
      ? t(translations.percentOfGrade, { weight: levelContribution.weight })
      : t(translations.outOfWeight, { weight: levelContribution.weight });

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
              {toolbarAction}
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
            ref={containerRef}
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
                {showRawLevelCol && <col style={{ width: LEVEL_WIDTH }} />}
                {showLevelContributionCol && (
                  <col style={{ width: LEVEL_CONTRIBUTIONS_WIDTH }} />
                )}
                {resolvedTabs.map((tab) => (
                  <col key={tab.id} style={{ width: TAB_WIDTH }} />
                ))}
                <col style={{ width: TOTAL_WIDTH }} />
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
                  {/* Raw Level — last student-info column (spans all 3 rows, no
                    weight subheader). */}
                  {showRawLevelCol && (
                    <TableCell
                      align="center"
                      rowSpan={3}
                      sx={{
                        fontWeight: 600,
                        minWidth: 120,
                        verticalAlign: 'middle',
                      }}
                    >
                      {t(translations.levelHeader)}
                    </TableCell>
                  )}
                  {/* Level Contribution — first contribution column, before the
                    category-grouped tabs. */}
                  {showLevelContributionCol && (
                    <TableCell
                      align="center"
                      rowSpan={2}
                      sx={{
                        fontWeight: 600,
                        minWidth: 120,
                        '&&': { borderBottom: 'none' },
                      }}
                    >
                      {t(translations.levelContributionHeader)}
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
                        display: INLINE_FLEX,
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
                  ref={row3Ref}
                  sx={{ '& .MuiTableCell-stickyHeader': { top: row3Top } }}
                >
                  {showLevelContributionCol && (
                    <TableCell align="center" sx={{ bgcolor: 'grey.100' }}>
                      {levelContribution.clamp &&
                      levelOverBudget &&
                      levelBudgetOffenders ? (
                        <Tooltip title={t(getLevelOverBudgetTranslation())}>
                          <Typography
                            aria-label={t(getLevelOverBudgetTranslation())}
                            color="warning.main"
                            component="span"
                            fontSize="inherit"
                            sx={{
                              display: INLINE_FLEX,
                              alignItems: 'center',
                              gap: 0.25,
                            }}
                          >
                            {levelBudgetLabel}
                            <WarningAmber fontSize="inherit" />
                          </Typography>
                        </Tooltip>
                      ) : (
                        levelBudgetLabel
                      )}
                    </TableCell>
                  )}
                  {resolvedTabs.map((tab, i) => {
                    const externalAid = externalAssessmentByTab.get(tab.id);
                    const clampFlags =
                      externalAid != null
                        ? externalClampState.byAssessment.get(externalAid)
                        : undefined;
                    const balancedSubheader = customTabImbalanced(
                      tab,
                      assessments,
                    ) ? (
                      <Tooltip title={t(translations.customWeightsUnbalanced)}>
                        <Typography
                          color="warning.main"
                          component="span"
                          fontSize="inherit"
                        >
                          {tabSubheaderLabel(tab)}
                        </Typography>
                      </Tooltip>
                    ) : (
                      tabSubheaderLabel(tab)
                    );
                    return (
                      <TableCell
                        key={tab.id}
                        align="center"
                        {...groupEndIf(tabIsCategoryEnd[i])}
                        sx={{ bgcolor: 'grey.100' }}
                      >
                        {clampFlags ? (
                          <Tooltip
                            title={t(
                              getExternalOverRangeTranslation(clampFlags),
                            )}
                          >
                            <Typography
                              aria-label={t(
                                getExternalOverRangeTranslation(clampFlags),
                              )}
                              color="warning.main"
                              component="span"
                              fontSize="inherit"
                              sx={{
                                display: INLINE_FLEX,
                                alignItems: 'center',
                                gap: 0.25,
                              }}
                            >
                              {tabSubheaderLabel(tab)}
                              <WarningAmber fontSize="inherit" />
                            </Typography>
                          </Tooltip>
                        ) : (
                          balancedSubheader
                        )}
                      </TableCell>
                    );
                  })}
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
                  const isExpanded = expandedId === studentId;
                  return (
                    <Fragment key={rowProps.id}>
                      <TableRow
                        ref={isExpanded ? activeRowRef : undefined}
                        sx={isExpanded ? pinnedRowSx : undefined}
                      >
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
                          <Tooltip title={row.original.name}>
                            <span>{row.original.name}</span>
                          </Tooltip>
                        </TableCell>
                        {showEmail && (
                          <TableCell
                            {...groupEndIf(lastIdentityField === 'email')}
                          >
                            <Tooltip title={row.original.email}>
                              <span>{row.original.email}</span>
                            </Tooltip>
                          </TableCell>
                        )}
                        {showExternalId && (
                          <TableCell
                            {...groupEndIf(lastIdentityField === 'externalId')}
                          >
                            <Tooltip title={row.original.externalId ?? ''}>
                              <span>{row.original.externalId ?? ''}</span>
                            </Tooltip>
                          </TableCell>
                        )}
                        {showRawLevelCol && (
                          <TableCell align="right">
                            {row.original.level}
                          </TableCell>
                        )}
                        {showLevelContributionCol &&
                          ((): React.JSX.Element => {
                            const valueText = fmtDisplay(
                              levelDisplayValue(
                                row.original.levelContribution ?? null,
                              ),
                              columnPrecisions.level,
                            );
                            const info = levelClampByStudent.get(
                              row.original.studentId,
                            );
                            return (
                              <TableCell align="right">
                                {info ? (
                                  <span
                                    style={{
                                      display: INLINE_FLEX,
                                      alignItems: 'center',
                                      justifyContent: 'flex-end',
                                      gap: 2,
                                    }}
                                  >
                                    <Tooltip
                                      title={t(
                                        getLevelCellTranslation(info.bound),
                                        {
                                          weight: levelContribution.weight,
                                          raw: Number.isNaN(info.raw)
                                            ? ''
                                            : info.raw.toFixed(2),
                                        },
                                      )}
                                    >
                                      <WarningAmber
                                        color="warning"
                                        fontSize="inherit"
                                      />
                                    </Tooltip>
                                    {valueText}
                                  </span>
                                ) : (
                                  valueText
                                )}
                              </TableCell>
                            );
                          })()}
                        {row.original.subtotals.map((subtotal, i) => {
                          const weight = resolvedTabs[i].gradebookWeight ?? 0;
                          const valueText = fmtDisplay(
                            tabDisplayValue(subtotal, weight),
                            columnPrecisions.tabs[i],
                          );
                          const externalAid = externalAssessmentByTab.get(
                            resolvedTabs[i].id,
                          );
                          const clampInfo =
                            externalAid != null
                              ? externalClampState.byStudent.get(
                                  `${studentId}:${externalAid}`,
                                )
                              : undefined;
                          return (
                            <TableCell
                              key={resolvedTabs[i].id}
                              align="right"
                              {...groupEndIf(tabIsCategoryEnd[i])}
                            >
                              {clampInfo ? (
                                <span
                                  style={{
                                    display: INLINE_FLEX,
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    gap: 2,
                                  }}
                                >
                                  <Tooltip
                                    title={t(
                                      clampInfo.bound === 'above'
                                        ? translations.externalCellCapped
                                        : translations.externalCellFloored,
                                      {
                                        max: clampInfo.max,
                                        raw: clampInfo.raw.toFixed(2),
                                      },
                                    )}
                                  >
                                    <WarningAmber
                                      color="warning"
                                      fontSize="inherit"
                                    />
                                  </Tooltip>
                                  {valueText}
                                </span>
                              ) : (
                                valueText
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
                        (expandedBreakdown ?? []).flatMap((tb) =>
                          tb.assessments.map((a) => {
                            const isExcluded = a.excluded;
                            const isDropped = a.dropped;
                            const isInactive = isExcluded || isDropped;
                            // Weightage is always "% of grade" — it never
                            // follows the points/percent lens.
                            const weightText = t(translations.percentOfGrade, {
                              weight: Math.round(a.effectiveWeight * 100) / 100,
                            });
                            const assessmentGradeText =
                              a.grade === null
                                ? `—/${a.maxGrade}`
                                : `${a.grade}/${a.maxGrade}`;
                            // The level row has no max — courseMaxLevel plays
                            // no part in the contribution, so showing
                            // "level/courseMaxLevel" would falsely imply a
                            // proportional derivation. Show the raw level only.
                            const gradeText =
                              tb.tabId === LEVEL_TAB_ID
                                ? t(translations.levelBreakdownDetail, {
                                    level: a.grade ?? 0,
                                  })
                                : assessmentGradeText;
                            let statusText = weightText;
                            if (isExcluded) {
                              statusText = t(translations.excluded);
                            } else if (isDropped) {
                              statusText = t(translations.dropped);
                            }
                            // A bounded (external) assessment whose raw grade
                            // fell outside [0, maxGrade] counts as its clamped
                            // value — surface which bound bit so the instructor
                            // sees the grade that actually contributes.
                            const assessmentData = assessmentsById.get(
                              a.assessmentId,
                            );
                            const eff =
                              a.grade != null && assessmentData != null
                                ? effectiveGrade(a.grade, assessmentData)
                                : null;
                            const wasCapped =
                              eff != null &&
                              a.grade != null &&
                              a.grade > a.maxGrade &&
                              eff !== a.grade;
                            const wasFloored =
                              eff != null &&
                              a.grade != null &&
                              a.grade < 0 &&
                              eff !== a.grade;
                            const clamped = wasCapped || wasFloored;
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
                                  {...groupEndIf(lastIdentityField === 'name')}
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
                                  {/* Fixed-layout table: the Name column is a
                                      fixed width (widened to NAME_WIDTH_EXPANDED while
                                      this student is expanded), so a long title can't
                                      grow the column — it's kept on one line (nowrap)
                                      and ellipsis-clipped, with a Tooltip exposing the
                                      full title on hover. The metadata line below is
                                      clipped the same way, so every breakdown row is
                                      exactly 2 lines. */}
                                  <Tooltip title={a.title}>
                                    <Typography
                                      color={
                                        isInactive ? 'text.disabled' : undefined
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
                                  {/* Muted metadata on its own line below the
                                      title: raw mark · effective weightage, kept on
                                      one line and clipped. Weightage is always "% of
                                      grade" — never routed through the points/percent
                                      lens. */}
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
                                    {`${gradeText} · ${statusText}`}
                                    {clamped && (
                                      <Tooltip
                                        title={t(translations.gradeCountsAs, {
                                          value: eff,
                                        })}
                                      >
                                        <InfoOutlined
                                          aria-label={
                                            wasCapped
                                              ? t(translations.gradeCapped, {
                                                  value: eff,
                                                })
                                              : t(translations.gradeFloored, {
                                                  value: eff,
                                                })
                                          }
                                          fontSize="inherit"
                                          sx={{ ml: 0.5 }}
                                        />
                                      </Tooltip>
                                    )}
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
                                {/* Mirror the parent row's two level columns so
                                  the tab cells below stay column-aligned. Raw
                                  Level has no per-assessment breakdown (empty);
                                  Level Contribution carries its value on the
                                  synthetic level row (tabId === LEVEL_TAB_ID),
                                  matching how each tab cell carries its own. */}
                                {showRawLevelCol && <TableCell />}
                                {showLevelContributionCol && (
                                  <TableCell align="right">
                                    {tb.tabId === LEVEL_TAB_ID
                                      ? fmtDisplay(
                                          levelDisplayValue(a.points),
                                          columnPrecisions.level,
                                        )
                                      : ''}
                                  </TableCell>
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
                                      {/* Place the value by tab id, not array
                                        position, so the breakdown row order is
                                        free to differ from the column order. */}
                                      {tab.id === tb.tabId ? tabCellValue : ''}
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
          courseMaxLevel={courseMaxLevel}
          gamificationEnabled={gamificationEnabled}
          levelContribution={levelContribution}
          onClose={() => setConfigureOpen(false)}
          open={configureOpen}
          students={students}
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
