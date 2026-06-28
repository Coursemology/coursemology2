import {
  cloneElement,
  forwardRef,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { defineMessages } from 'react-intl';
import {
  Checkbox,
  Chip,
  Paper,
  type SxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  type Theme,
  Tooltip,
} from '@mui/material';
import { lighten } from '@mui/material/styles';
import { flexRender } from '@tanstack/react-table';
import palette from 'theme/palette';

import Link from 'lib/components/core/Link';
import type {
  ColumnPickerRenderContext,
  ColumnTemplate,
} from 'lib/components/table/builder';
import MuiTablePagination from 'lib/components/table/MuiTableAdapter/MuiTablePagination';
import MuiTableToolbar from 'lib/components/table/MuiTableAdapter/MuiTableToolbar';
import useTanStackTableBuilder from 'lib/components/table/TanStackTableBuilder';
import {
  DEFAULT_MINI_TABLE_ROWS_PER_PAGE,
  DEFAULT_TABLE_ROWS_PER_PAGE,
} from 'lib/constants/sharedConstants';
import { getEditSubmissionURL } from 'lib/helpers/url-builders';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import tableTranslations from 'lib/translations/table';

import { GAMIFICATION_COL_IDS } from '../constants';
import { setExternalGrade } from '../operations';
import type {
  AssessmentData,
  CategoryData,
  StudentData,
  SubmissionData,
  TabData,
} from '../types';

import {
  buildAssessmentColumnId,
  parseAssessmentColumnId,
} from './buildAssessmentColumnIds';
import GradebookColumnTree from './GradebookColumnTree';

const COL_WIDTHS = {
  name: 160,
  email: 250,
  externalId: 160,
  level: 80,
  totalXp: 120,
  assessment: 150,
} as const;

const CHECKBOX_WIDTH = 56;

// Faint blue wash that marks external-assessment columns. Kept very light (4% of
// info.main) so the band reads as a subtle tint, not a coloured header.
export const EXTERNAL_ASSESSMENT_BACKGROUND = lighten(palette.info.main, 0.96);

const getColWidth = (id: string): number =>
  COL_WIDTHS[id as keyof typeof COL_WIDTHS] ?? COL_WIDTHS.assessment;

const isLeftAligned = (id: string): boolean =>
  id === 'name' || id === 'email' || id === 'externalId';

const translations = defineMessages({
  searchStudents: {
    id: 'course.gradebook.GradebookIndex.searchStudents',
    defaultMessage: 'Search students',
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
  selectColumns: {
    id: 'course.gradebook.GradebookIndex.selectColumns',
    defaultMessage: 'Select Columns',
  },
  dialogTitle: {
    id: 'course.gradebook.GradebookIndex.dialogTitle',
    defaultMessage: 'Select columns',
  },
  maxMarks: {
    id: 'course.gradebook.GradebookTable.maxMarks',
    defaultMessage: 'Max Marks',
  },
  noDataColumnsHint: {
    id: 'course.gradebook.GradebookTable.noDataColumnsHint',
    defaultMessage:
      'No grade columns selected - export will include student info only.',
  },
  noDataColumnsHintWithGamification: {
    id: 'course.gradebook.GradebookTable.noDataColumnsHintWithGamification',
    defaultMessage:
      'No grade or gamification columns selected - export will include student info only.',
  },
  externalBadge: {
    id: 'course.gradebook.GradebookTable.externalBadge',
    defaultMessage: 'External',
  },
  externalGradeAria: {
    id: 'course.gradebook.GradebookTable.externalGradeAria',
    defaultMessage: '{title} grade for {name}',
  },
  gradeSaveError: {
    id: 'course.gradebook.GradebookTable.gradeSaveError',
    defaultMessage: 'Could not save the grade. Please try again.',
  },
  gradeSaved: {
    id: 'course.gradebook.GradebookTable.gradeSaved',
    defaultMessage: 'Grade saved. {title} · {name}: {oldGrade} → {newGrade}',
  },
});

const HeaderLabel = forwardRef<
  HTMLSpanElement,
  { text: string; onSingleLine: (fits: boolean) => void }
>(({ text, onSingleLine }, forwardedRef): JSX.Element => {
  const innerRef = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(text);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const lh = parseFloat(getComputedStyle(el).lineHeight) || 20;
    const oneLineH = lh + 1;
    const twoLineH = lh * 2 + 1;

    el.textContent = text;

    if (el.scrollHeight <= oneLineH) {
      onSingleLine(true);
      setDisplay(text);
      return;
    }

    onSingleLine(false);

    if (el.scrollHeight <= twoLineH) {
      setDisplay(text);
      return;
    }

    let lo = 1;
    let hi = text.length;
    let best = `${text[0]}…`;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const candidate = `${text.slice(0, mid)}…`;
      el.textContent = candidate;
      if (el.scrollHeight <= twoLineH) {
        best = candidate;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    // Ensure DOM reflects `best` before React reconciles — the loop's last
    // el.textContent assignment may be a too-long candidate, not `best`.
    el.textContent = best;
    setDisplay(best);
  }, [text, onSingleLine]);

  return (
    <span
      ref={(node) => {
        innerRef.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      style={{ display: 'block' }}
    >
      {display}
    </span>
  );
});
HeaderLabel.displayName = 'HeaderLabel';

const ExternalGradeCell = ({
  assessmentId,
  studentId,
  studentName,
  title,
  value,
}: {
  assessmentId: number;
  studentId: number;
  studentName: string;
  title: string;
  value: number | null | undefined;
}): JSX.Element => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');
  const [localValue, setLocalValue] = useState<number | null | undefined>(
    value,
  );

  useLayoutEffect(() => {
    if (!editing) setLocalValue(value);
  }, [value, editing]);

  const commit = async (): Promise<void> => {
    setEditing(false);
    const trimmed = text.trim();
    const next = trimmed === '' ? null : Number(trimmed);
    if (trimmed !== '' && Number.isNaN(next)) return;
    if (next === (localValue ?? null)) return;
    const prev = localValue;
    setLocalValue(next);
    try {
      await dispatch(setExternalGrade(assessmentId, studentId, next));
      // Persistent confirmation: external grades flow to exported finals, and the
      // optimistic update has already discarded the old value from the cell — this
      // toast is the only in-session record of what changed, so it must echo the
      // full mutation (who · which assessment · old → new) to catch a row/column
      // misclick and stay until the user dismisses it (no auto-dismiss).
      toast.success(
        t(translations.gradeSaved, {
          title,
          name: studentName,
          oldGrade: prev ?? '—',
          newGrade: next ?? '—',
        }),
        { autoClose: false },
      );
    } catch {
      setLocalValue(prev);
      toast.error(t(translations.gradeSaveError));
    }
  };

  if (editing) {
    return (
      <TextField
        autoFocus
        inputProps={{
          'aria-label': t(translations.externalGradeAria, {
            title,
            name: studentName,
          }),
          style: { textAlign: 'right' },
        }}
        onBlur={commit}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') setEditing(false);
        }}
        size="small"
        value={text}
        variant="standard"
      />
    );
  }

  return (
    <span
      aria-label={t(translations.externalGradeAria, {
        title,
        name: studentName,
      })}
      onClick={() => {
        setText(localValue == null ? '' : String(localValue));
        setEditing(true);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setText(localValue == null ? '' : String(localValue));
          setEditing(true);
        }
      }}
      role="button"
      style={{ cursor: 'pointer', display: 'inline-block', minWidth: 24 }}
      tabIndex={0}
    >
      {localValue == null ? '—' : localValue}
    </span>
  );
};

interface GradebookRow {
  studentId: number;
  name: string;
  email: string;
  externalId: string | null;
  level: number;
  totalXp: number;
  grades: Partial<Record<number, number | null>>;
  submissionIds: Partial<Record<number, number>>;
}

interface GradebookTableProps {
  categories: CategoryData[];
  tabs: TabData[];
  assessments: AssessmentData[];
  students: StudentData[];
  submissions: SubmissionData[];
  courseTitle: string;
  courseId: number;
  gamificationEnabled: boolean;
  /** Optional action rendered in the toolbar, left of the column picker. */
  toolbarAction?: JSX.Element;
}

const GradebookTable = ({
  categories,
  tabs,
  assessments,
  students,
  submissions,
  courseTitle,
  courseId,
  gamificationEnabled,
  toolbarAction,
}: GradebookTableProps): JSX.Element => {
  const { t } = useTranslation();

  const submissionsByStudent = useMemo(() => {
    const map = new Map<number, Map<number, SubmissionData>>();
    submissions.forEach((s) => {
      let byAssessment = map.get(s.studentId);
      if (!byAssessment) {
        byAssessment = new Map<number, SubmissionData>();
        map.set(s.studentId, byAssessment);
      }
      byAssessment.set(s.assessmentId, s);
    });
    return map;
  }, [submissions]);

  const rows = useMemo<GradebookRow[]>(
    () =>
      students.map((student) => {
        const subs = submissionsByStudent.get(student.id);
        const grades: Partial<Record<number, number | null>> = {};
        const submissionIds: Partial<Record<number, number>> = {};
        assessments.forEach((a) => {
          const sub = subs?.get(a.id);
          if (sub != null) {
            grades[a.id] = sub.grade;
            submissionIds[a.id] = sub.submissionId;
          }
        });
        return {
          studentId: student.id,
          name: student.name,
          email: student.email,
          externalId: student.externalId,
          level: student.level,
          totalXp: student.totalXp,
          grades,
          submissionIds,
        };
      }),
    [students, assessments, submissionsByStudent],
  );

  const hasExternalIds = useMemo(
    () => students.some((s) => s.externalId != null && s.externalId !== ''),
    [students],
  );

  const columns = useMemo<ColumnTemplate<GradebookRow>[]>(() => {
    const cols: ColumnTemplate<GradebookRow>[] = [
      {
        id: 'name',
        title: t(tableTranslations.name),
        of: 'name',
        cell: (row) => row.name,
        csvDownloadable: true,
        searchable: true,
        sortable: true,
        searchProps: { getValue: (row) => row.name },
      },
      {
        id: 'email',
        title: t(tableTranslations.email),
        of: 'email',
        cell: (row) => row.email,
        csvDownloadable: true,
        searchable: true,
        sortable: true,
      },
    ];

    // The External ID column is always offered in the picker, but only shown by
    // default when the course actually uses external IDs (see column picker).
    cols.push({
      id: 'externalId',
      title: t(tableTranslations.externalId),
      of: 'externalId',
      cell: (row) => row.externalId ?? '',
      csvDownloadable: true,
      searchable: true,
      sortable: true,
      defaultVisible: hasExternalIds,
    });

    if (gamificationEnabled) {
      cols.push({
        id: 'level',
        title: t(tableTranslations.level),
        of: 'level',
        cell: (row) => row.level,
        csvDownloadable: true,
        sortable: true,
      });
      cols.push({
        id: 'totalXp',
        title: t(tableTranslations.totalXp),
        of: 'totalXp',
        cell: (row) => row.totalXp,
        csvDownloadable: true,
        sortable: true,
      });
    }

    assessments.forEach((asn) => {
      const colId = buildAssessmentColumnId(asn.id);
      cols.push({
        id: colId,
        title: asn.title,
        // null (ungraded) → undefined so sortUndefined: 'last' fires for both missing and ungraded rows
        accessorFn: (row) => row.grades[asn.id] ?? undefined,
        sortable: true,
        sortProps: {
          undefinedPriority: 'last',
          sort: (a, b) => {
            const aGrade = a.grades[asn.id];
            const bGrade = b.grades[asn.id];
            if (aGrade == null || bGrade == null) return 0;
            return aGrade - bGrade;
          },
        },
        cell: (row) => {
          if (asn.external) {
            return (
              <ExternalGradeCell
                assessmentId={asn.id}
                studentId={row.studentId}
                studentName={row.name}
                title={asn.title}
                value={row.grades[asn.id]}
              />
            );
          }
          const grade = row.grades[asn.id];
          if (grade === undefined) return '—';
          if (grade === null) return '';
          const submissionId = row.submissionIds[asn.id];
          if (submissionId != null)
            return (
              <Link to={getEditSubmissionURL(courseId, asn.id, submissionId)}>
                {grade}
              </Link>
            );
          return grade;
        },
        csvDownloadable: true,
        defaultVisible: false,
      });
    });
    return cols;
  }, [assessments, gamificationEnabled, hasExternalIds, t]);

  const assessmentMaxGrades = useMemo(
    () => new Map(assessments.map((a) => [a.id, a.maxGrade])),
    [assessments],
  );

  const dataColumnIds = useMemo(
    () => [
      ...assessments.map((a) => buildAssessmentColumnId(a.id)),
      ...GAMIFICATION_COL_IDS,
    ],
    [assessments],
  );

  const externalAssessmentColumnIds = useMemo(
    () =>
      new Set(
        assessments
          .filter((assessment) => assessment.external)
          .map((assessment) => buildAssessmentColumnId(assessment.id)),
      ),
    [assessments],
  );

  const columnPicker = useMemo(
    () => ({
      render: (context: ColumnPickerRenderContext) => (
        <GradebookColumnTree
          {...context}
          assessments={assessments}
          categories={categories}
          gamificationEnabled={gamificationEnabled}
          tabs={tabs}
        />
      ),
      locked: ['name'],
      triggerLabel: t(translations.selectColumns),
      dialogTitle: t(translations.dialogTitle),
      getExtraHeaderRows: (colIds): string[][] => {
        const hasAssessments = colIds.some(
          (id) => parseAssessmentColumnId(id) !== null,
        );
        if (!hasAssessments) return [];
        return [
          colIds.map((id) => {
            if (id === 'name') return t(translations.maxMarks);
            const asnId = parseAssessmentColumnId(id);
            if (asnId !== null)
              return String(assessmentMaxGrades.get(asnId) ?? '');
            return '';
          }),
        ];
      },
      storageKey: `gradebook_columns_${courseId}`,
      dataColumnIds,
      noDataColumnsHint: gamificationEnabled
        ? t(translations.noDataColumnsHintWithGamification)
        : t(translations.noDataColumnsHint),
    }),
    [
      assessments,
      categories,
      gamificationEnabled,
      tabs,
      t,
      assessmentMaxGrades,
      courseId,
      dataColumnIds,
    ],
  );

  const { toolbar, body, pagination, header } =
    useTanStackTableBuilder<GradebookRow>({
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
      sort: {
        initially: { by: 'name', order: 'asc' },
        enableRemoval: false,
        resetOnHide: true,
      },
      toolbar: { show: true, keepNative: true },
      csvDownload: {
        filename: `${courseTitle}_gradebook`,
        showDownloadButton: false,
      },
      columnPicker,
    });

  const visibility = toolbar?.getColumnVisibility?.() ?? {};
  const isColVisible = (id: string): boolean => visibility[id] ?? true;
  const visibleCols = columns.filter((c) =>
    isColVisible(c.id ?? (c.of as string)),
  );

  const sortByColId = new Map(
    (header?.headers ?? []).map(
      (h, i) => [h.id, header?.forEach(h, i).sorting] as const,
    ),
  );

  const selectedCount = body.selectedCount ?? 0;

  const directExportLabel = useMemo((): string => {
    const isPartialSelection = selectedCount > 0 && selectedCount < rows.length;
    if (isPartialSelection)
      return t(translations.exportRows, { count: selectedCount });
    return t(translations.exportButton);
  }, [selectedCount, rows.length, t]);

  const toolbarWithLabel = toolbar
    ? {
        ...toolbar,
        buttons: toolbarAction
          ? [
              ...(toolbar.buttons ?? []),
              cloneElement(toolbarAction, { key: 'toolbar-action' }),
            ]
          : toolbar.buttons,
        ...(toolbar.columnPicker && {
          columnPicker: {
            ...toolbar.columnPicker,
            directExportLabel,
            directExportTooltip:
              selectedCount === 0
                ? t(translations.exportAllTooltip)
                : undefined,
          },
        }),
      }
    : toolbar;

  const totalWidth = useMemo(
    () =>
      CHECKBOX_WIDTH +
      visibleCols.reduce((sum, c) => {
        const id = c.id ?? (c.of as string);
        return sum + getColWidth(id);
      }, 0),
    [visibleCols],
  );

  const allRowsSelected = body.allFilteredSelected ?? false;
  const someRowsSelected = body.someFilteredSelected ?? false;
  const toggleAllRows = (): void => body.toggleAllFiltered?.();

  const hasVisibleAssessments = useMemo(
    () =>
      visibleCols.some(
        (c) => parseAssessmentColumnId(c.id ?? (c.of as string)) !== null,
      ),
    [visibleCols],
  );

  const row1Ref = useRef<HTMLTableRowElement>(null);
  const [row2Top, setRow2Top] = useState(0);
  useLayoutEffect(() => {
    setRow2Top(row1Ref.current?.offsetHeight ?? 0);
  }, [visibleCols]);

  const headerFitsRef = useRef<Record<string, boolean>>({});
  const [headerFits, setHeaderFits] = useState<Record<string, boolean>>({});
  const onSingleLine = useCallback((id: string, fits: boolean): void => {
    if (headerFitsRef.current[id] !== fits) {
      headerFitsRef.current[id] = fits;
      setHeaderFits((prev) => ({ ...prev, [id]: fits }));
    }
  }, []);
  const singleLineCallbacks = useMemo(
    () =>
      new Map(
        visibleCols.map((c) => {
          const id = c.id ?? (c.of as string);
          return [id, (f: boolean): void => onSingleLine(id, f)];
        }),
      ),
    [visibleCols, onSingleLine],
  );

  return (
    <div>
      <MuiTableToolbar {...toolbarWithLabel} />
      <div className="px-5">
        <Paper elevation={0} sx={{ width: 'fit-content', maxWidth: '100%' }}>
          {/* A bounded maxHeight is what makes `stickyHeader` actually stick:
            `overflowX: 'auto'` already promotes this container to a scroll
            container on both axes, so the sticky <thead> and the frozen
            checkbox/Name columns pin relative to THIS element. Without a height
            cap the container grows to fit every row and never scrolls
            internally, leaving the header no scroll range. */}
          <TableContainer
            sx={{ maxHeight: 'calc(100vh - 22rem)', overflowX: 'auto' }}
          >
            <Table
              size="small"
              stickyHeader
              style={{ width: totalWidth }}
              sx={(theme) => ({
                tableLayout: 'fixed',
                borderCollapse: 'separate',
                borderSpacing: 0,

                '& th, & td': {
                  boxSizing: 'border-box',
                  border: 0,

                  // Draws the cell grid without relying on collapsed borders.
                  borderBottom: `0.5px solid ${theme.palette.grey[200]}`,
                },
              })}
            >
              <colgroup>
                <col style={{ width: CHECKBOX_WIDTH }} />
                {visibleCols.map((c) => {
                  const id = c.id ?? (c.of as string);
                  return <col key={id} style={{ width: getColWidth(id) }} />;
                })}
              </colgroup>
              <TableHead>
                <TableRow ref={row1Ref}>
                  <TableCell
                    sx={(theme) => ({
                      top: 0,
                      zIndex: 3,
                      position: 'sticky',
                      left: 0,
                      bgcolor: 'background.default',
                      width: CHECKBOX_WIDTH,
                      minWidth: CHECKBOX_WIDTH,
                      maxWidth: CHECKBOX_WIDTH,
                      px: 0,
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      // Solid 1px bottom seam under the frozen header columns. The
                      // table's 0.5px grid border (specificity 0,1,1) outranks a
                      // plain per-cell sx (0,1,0), so double the selector with `&&`
                      // (0,2,0) to win — and a full 1px survives sticky scroll
                      // compositing where 0.5px can drop and let the body show
                      // through the row1/row2 seam.
                      '&&': {
                        borderBottom: `1px solid ${theme.palette.grey[200]}`,
                      },
                    })}
                  >
                    <Checkbox
                      checked={allRowsSelected}
                      indeterminate={someRowsSelected && !allRowsSelected}
                      onChange={toggleAllRows}
                      size="small"
                    />
                  </TableCell>
                  {visibleCols.map((c) => {
                    const id = c.id ?? (c.of as string);
                    const label = typeof c.title === 'string' ? c.title : id;
                    const isLeft = isLeftAligned(id);
                    const fits = headerFits[id] ?? false;
                    const sort = sortByColId.get(id);
                    const isExternalCol = externalAssessmentColumnIds.has(id);
                    const labelNode = (
                      <Tooltip title={label}>
                        <span>
                          <HeaderLabel
                            onSingleLine={singleLineCallbacks.get(id)!}
                            text={label}
                          />
                        </span>
                      </Tooltip>
                    );
                    const sortedLabel = sort ? (
                      <TableSortLabel
                        active={sort.sorted}
                        direction={sort.direction || 'asc'}
                        onClick={sort.onClickSort}
                      >
                        {labelNode}
                      </TableSortLabel>
                    ) : (
                      labelNode
                    );
                    return (
                      <TableCell
                        key={id}
                        align={isLeft ? 'left' : 'right'}
                        sx={(theme) => ({
                          verticalAlign: isLeft || fits ? 'middle' : 'bottom',
                          ...(id === 'name' && {
                            position: 'sticky',
                            left: CHECKBOX_WIDTH,
                            zIndex: 3,
                            bgcolor: 'background.default',
                            // Right edge of the frozen region + matching 1px
                            // bottom seam. `&&` (0,2,0) is needed to beat the
                            // table's `& th` border rule (0,1,1).
                            '&&': {
                              borderRight: `1px solid ${theme.palette.grey[200]}`,
                              borderBottom: `1px solid ${theme.palette.grey[200]}`,
                            },
                          }),
                        })}
                      >
                        {isExternalCol ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                          >
                            {sortedLabel}
                            <Chip
                              label={t(translations.externalBadge)}
                              size="small"
                              sx={{ ml: 0.5 }}
                            />
                          </span>
                        ) : (
                          sortedLabel
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
                {hasVisibleAssessments && (
                  <TableRow
                    sx={(theme) => ({
                      '& .MuiTableCell-stickyHeader': {
                        top: row2Top,
                      },
                      // Solid 1px bottom edge under the whole Max Marks row so the
                      // frozen columns read as a complete header block and the
                      // body never shows through on scroll. `& .MuiTableCell-root`
                      // (0,2,0) outranks the table's `& th` rule (0,1,1).
                      '& .MuiTableCell-root': {
                        borderTop: `1px solid ${theme.palette.grey[200]}`,
                        borderBottom: `1px solid ${theme.palette.grey[200]}`,
                      },
                    })}
                  >
                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 3,
                        bgcolor: 'grey.100',
                        width: CHECKBOX_WIDTH,
                        minWidth: CHECKBOX_WIDTH,
                        maxWidth: CHECKBOX_WIDTH,
                        px: 0,
                        py: 0,
                      }}
                    />
                    {visibleCols.map((c) => {
                      const id = c.id ?? (c.of as string);
                      const asnId = parseAssessmentColumnId(id);
                      let cellNode: React.ReactNode = '';
                      if (id === 'name') cellNode = t(translations.maxMarks);
                      else if (asnId !== null) {
                        const maxGrade = assessmentMaxGrades.get(asnId);
                        cellNode = maxGrade != null ? `/${maxGrade}` : '';
                      }
                      return (
                        <TableCell
                          key={id}
                          align={asnId !== null ? 'right' : 'left'}
                          sx={(theme) => ({
                            bgcolor: 'grey.100',
                            ...(id === 'name' && {
                              position: 'sticky',
                              left: CHECKBOX_WIDTH,
                              zIndex: 3,
                              // Continue the frozen region's right edge.
                              '&&': {
                                borderTop: `1px solid ${theme.palette.grey[200]}`,
                                borderRight: `1px solid ${theme.palette.grey[200]}`,
                              },
                            }),
                          })}
                        >
                          {cellNode}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                )}
              </TableHead>
              <TableBody>
                {body.rows.map((row, idx) => {
                  const rowProps = body.forEachRow(row, idx);
                  return (
                    <TableRow
                      key={rowProps.id}
                      className={rowProps.className ?? ''}
                    >
                      <TableCell
                        sx={(theme) => ({
                          position: 'sticky',
                          left: 0,
                          zIndex: 1,
                          bgcolor: 'background.paper',
                          width: CHECKBOX_WIDTH,
                          minWidth: CHECKBOX_WIDTH,
                          maxWidth: CHECKBOX_WIDTH,
                          px: 0,
                          textAlign: 'center',
                          // Sticky cells composite on their own layer, so this
                          // cell's `borderBottom` gets covered by the next row's
                          // opaque sticky background (Blink) — dropping the
                          // separator. Draw it as the lower row's `borderTop`
                          // instead; that border is owned by the row's own
                          // layer and always paints. Row 0's top edge is already
                          // the header cell's (higher z-index) bottom border.
                          borderBottom: 'none',
                          borderTop:
                            idx === 0
                              ? undefined
                              : `0.5px solid ${theme.palette.grey[200]}`,
                        })}
                      >
                        <Checkbox
                          checked={row.getIsSelected()}
                          onChange={row.getToggleSelectedHandler()}
                          size="small"
                        />
                      </TableCell>
                      {row
                        .getVisibleCells()
                        .filter((cell) => cell.column.id !== 'rowSelector')
                        .map((cell) => {
                          // Sticky cover for the frozen `name` column, mirroring
                          // the checkbox cell above. Declared as a directly-typed
                          // const so the callback is contextually typed (a ternary
                          // in the `sx` prop would strip that context).
                          const nameCellSx: SxProps<Theme> = (theme) => ({
                            position: 'sticky',
                            left: CHECKBOX_WIDTH,
                            zIndex: 1,
                            bgcolor: 'background.paper',
                            // Same sticky-layer cover as the checkbox column: draw
                            // the separator as the lower row's `borderTop`, not a
                            // covered `borderBottom`.
                            borderBottom: 'none',
                            borderTop:
                              idx === 0
                                ? undefined
                                : `0.5px solid ${theme.palette.grey[200]}`,
                            // Continue the frozen region's right edge down the data
                            // rows. `&&` (0,2,0) beats the table's `& td` border
                            // rule (0,1,1).
                            '&&': {
                              borderRight: `1px solid ${theme.palette.grey[200]}`,
                            },
                          });
                          let cellSx: SxProps<Theme> | undefined;
                          if (cell.column.id === 'name') cellSx = nameCellSx;
                          else if (
                            externalAssessmentColumnIds.has(cell.column.id)
                          )
                            // bgcolor is the faint external-column tint.
                            cellSx = {
                              bgcolor: EXTERNAL_ASSESSMENT_BACKGROUND,
                            };
                          return (
                            <TableCell
                              key={cell.id}
                              align={
                                isLeftAligned(cell.column.id) ? 'left' : 'right'
                              }
                              sx={cellSx}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          );
                        })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          {pagination && <MuiTablePagination {...pagination} />}
        </Paper>
      </div>
    </div>
  );
};

export default GradebookTable;
