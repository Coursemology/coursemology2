import {
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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import { flexRender } from '@tanstack/react-table';

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
import useTranslation from 'lib/hooks/useTranslation';
import tableTranslations from 'lib/translations/table';

import { GAMIFICATION_COL_IDS } from '../constants';
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
  email: 220,
  externalId: 160,
  level: 70,
  totalXp: 100,
  assessment: 150,
} as const;

const CHECKBOX_WIDTH = 56;

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
  name: {
    id: 'course.gradebook.GradebookColumnTree.name',
    defaultMessage: 'Name',
  },
  email: {
    id: 'course.gradebook.GradebookColumnTree.email',
    defaultMessage: 'Email',
  },
  level: {
    id: 'course.gradebook.GradebookColumnTree.level',
    defaultMessage: 'Level',
  },
  totalXp: {
    id: 'course.gradebook.GradebookColumnTree.totalXp',
    defaultMessage: 'Total XP',
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

interface GradeEntry {
  grade: number;
  submissionId: number;
}

interface GradebookRow {
  studentId: number;
  name: string;
  email: string;
  externalId: string | null;
  level: number;
  totalXp: number;
  grades: Partial<Record<number, GradeEntry>>;
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
}: GradebookTableProps): JSX.Element => {
  const { t } = useTranslation();

  const submissionsByStudent = useMemo(() => {
    const map = new Map<number, SubmissionData[]>();
    submissions.forEach((s) => {
      const existing = map.get(s.studentId);
      if (existing) {
        existing.push(s);
      } else {
        map.set(s.studentId, [s]);
      }
    });
    return map;
  }, [submissions]);

  const rows = useMemo<GradebookRow[]>(
    () =>
      students.map((student) => {
        const subs = submissionsByStudent.get(student.id) ?? [];
        const grades: Partial<Record<number, GradeEntry>> = {};
        assessments.forEach((a) => {
          const sub = subs.find((s) => s.assessmentId === a.id);
          if (sub != null && sub.grade != null)
            grades[a.id] = { grade: sub.grade, submissionId: sub.submissionId };
        });
        return {
          studentId: student.id,
          name: student.name,
          email: student.email,
          externalId: student.externalId,
          level: student.level,
          totalXp: student.totalXp,
          grades,
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
        title: t(translations.name),
        of: 'name',
        cell: (row) => row.name,
        csvDownloadable: true,
        searchable: true,
        searchProps: { getValue: (row) => row.name },
      },
      {
        id: 'email',
        title: t(translations.email),
        of: 'email',
        cell: (row) => row.email,
        csvDownloadable: true,
        searchable: true,
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
      defaultVisible: hasExternalIds,
    });


    if (gamificationEnabled) {
      cols.push({
        id: 'level',
        title: t(translations.level),
        of: 'level',
        cell: (row) => row.level,
        csvDownloadable: true,
      });
      cols.push({
        id: 'totalXp',
        title: t(translations.totalXp),
        of: 'totalXp',
        cell: (row) => row.totalXp,
        csvDownloadable: true,
      });
    }

    assessments.forEach((asn) => {
      const colId = buildAssessmentColumnId(asn.id);
      cols.push({
        id: colId,
        title: asn.title,
        accessorFn: (row) => row.grades[asn.id]?.grade,
        cell: (row) => {
          const entry = row.grades[asn.id];
          if (entry === undefined) return '—';
          const href = `/courses/${courseId}/assessments/${asn.id}/submissions/${entry.submissionId}/edit`;
          return (
            <a
              href={href}
              style={{
                color: 'inherit',
                textDecoration: 'underline dotted',
                textUnderlineOffset: '2px',
              }}
            >
              {entry.grade}
            </a>
          );
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

  const { toolbar, body, pagination } = useTanStackTableBuilder<GradebookRow>({
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
      initialPageSize: DEFAULT_TABLE_ROWS_PER_PAGE,
      showAllRows: true,
    },
    search: { searchPlaceholder: t(translations.searchStudents) },
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

  const selectedCount = body.selectedCount ?? 0;

  const directExportLabel = useMemo((): string => {
    const isPartialSelection = selectedCount > 0 && selectedCount < rows.length;
    if (isPartialSelection)
      return t(translations.exportRows, { count: selectedCount });
    return t(translations.exportButton);
  }, [selectedCount, rows.length, t]);

  const toolbarWithLabel = toolbar?.columnPicker
    ? {
        ...toolbar,
        columnPicker: {
          ...toolbar.columnPicker,
          directExportLabel,
          directExportTooltip:
            selectedCount === 0 ? t(translations.exportAllTooltip) : undefined,
        },
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
          <TableContainer sx={{ overflowX: 'auto' }}>
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
                    sx={{
                      top: 0,
                      left: 0,
                      zIndex: 4,
                      bgcolor: 'background.paper',
                      width: CHECKBOX_WIDTH,
                      minWidth: CHECKBOX_WIDTH,
                      maxWidth: CHECKBOX_WIDTH,
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
                  {visibleCols.map((c) => {
                    const id = c.id ?? (c.of as string);
                    const label = typeof c.title === 'string' ? c.title : id;
                    const isLeft = isLeftAligned(id);
                    const fits = headerFits[id] ?? false;
                    const isName = id === 'name';
                    return (
                      <TableCell
                        key={id}
                        align={isLeft ? 'left' : 'right'}
                        sx={{
                          verticalAlign: isLeft || fits ? 'middle' : 'bottom',
                          ...(isName && {
                            top: 0,
                            left: CHECKBOX_WIDTH,
                            zIndex: 4,
                            bgcolor: 'background.paper',
                          }),
                        }}
                      >
                        <Tooltip title={label}>
                          <HeaderLabel
                            onSingleLine={singleLineCallbacks.get(id)!}
                            text={label}
                          />
                        </Tooltip>
                      </TableCell>
                    );
                  })}
                </TableRow>
                {hasVisibleAssessments && (
                  <TableRow>
                    <TableCell
                      sx={{
                        top: row2Top,
                        left: 0,
                        zIndex: 3,
                        bgcolor: 'grey.100',
                        width: CHECKBOX_WIDTH,
                        minWidth: CHECKBOX_WIDTH,
                        maxWidth: CHECKBOX_WIDTH,
                        px: 0,
                      }}
                    />
                    {visibleCols.map((c) => {
                      const id = c.id ?? (c.of as string);
                      const asnId = parseAssessmentColumnId(id);
                      const isName = id === 'name';
                      let cellContent: string | number = '';
                      if (isName) cellContent = t(translations.maxMarks);
                      else if (asnId !== null)
                        cellContent = assessmentMaxGrades.get(asnId) ?? '';
                      return (
                        <TableCell
                          key={id}
                          align={asnId !== null ? 'right' : 'left'}
                          sx={{
                            top: row2Top,
                            zIndex: isName ? 3 : 2,
                            bgcolor: 'grey.100',
                            ...(isName && { left: CHECKBOX_WIDTH }),
                          }}
                        >
                          {cellContent}
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
                        sx={{
                          position: 'sticky',
                          left: 0,
                          zIndex: 1,
                          bgcolor: 'background.paper',
                          width: CHECKBOX_WIDTH,
                          minWidth: CHECKBOX_WIDTH,
                          maxWidth: CHECKBOX_WIDTH,
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
                      {row
                        .getVisibleCells()
                        .filter((cell) => cell.column.id !== 'rowSelector')
                        .map((cell) => {
                          const isName = cell.column.id === 'name';
                          return (
                            <TableCell
                              key={cell.id}
                              align={
                                isLeftAligned(cell.column.id) ? 'left' : 'right'
                              }
                              sx={
                                isName
                                  ? {
                                      position: 'sticky',
                                      left: CHECKBOX_WIDTH,
                                      zIndex: 1,
                                      bgcolor: 'background.paper',
                                    }
                                  : undefined
                              }
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
