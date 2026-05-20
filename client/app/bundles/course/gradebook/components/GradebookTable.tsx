import { useMemo } from 'react';
import { defineMessages } from 'react-intl';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

import MuiTableToolbar from 'lib/components/table/MuiTableAdapter/MuiTableToolbar';
import useTanStackTableBuilder from 'lib/components/table/TanStackTableBuilder';
import type { ColumnTemplate } from 'lib/components/table/builder';
import { DEFAULT_TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';
import useTranslation from 'lib/hooks/useTranslation';

import type {
  AssessmentData,
  CategoryData,
  StudentData,
  SubmissionData,
  TabData,
} from '../types';
import { buildAssessmentColumnId } from './buildAssessmentColumnIds';
import { exportGradebookCsv } from './exportGradebookCsv';
import GradebookColumnTree from './GradebookColumnTree';

const translations = defineMessages({
  searchStudents: {
    id: 'course.gradebook.GradebookIndex.searchStudents',
    defaultMessage: 'Search by student name',
  },
  exportButton: {
    id: 'course.gradebook.GradebookIndex.exportButton',
    defaultMessage: 'Export…',
  },
  dialogTitle: {
    id: 'course.gradebook.GradebookIndex.dialogTitle',
    defaultMessage: 'Select columns to export',
  },
  exportCsv: {
    id: 'course.gradebook.GradebookIndex.exportCsv',
    defaultMessage: 'Export CSV',
  },
  name: {
    id: 'course.gradebook.GradebookColumnTree.name',
    defaultMessage: 'Name',
  },
  email: {
    id: 'course.gradebook.GradebookColumnTree.email',
    defaultMessage: 'Email',
  },
  externalId: {
    id: 'course.gradebook.GradebookColumnTree.externalId',
    defaultMessage: 'External ID',
  },
  level: {
    id: 'course.gradebook.GradebookColumnTree.level',
    defaultMessage: 'Level',
  },
});

interface GradebookRow {
  studentId: number;
  name: string;
  email: string;
  externalId: string | null;
  level: number;
  grades: Record<number, number | null>;
}

interface GradebookTableProps {
  categories: CategoryData[];
  tabs: TabData[];
  assessments: AssessmentData[];
  students: StudentData[];
  submissions: SubmissionData[];
}

const GradebookTable = ({
  categories,
  tabs,
  assessments,
  students,
  submissions,
}: GradebookTableProps): JSX.Element => {
  const { t } = useTranslation();

  const submissionsByStudent = useMemo(() => {
    const map = new Map<number, SubmissionData[]>();
    submissions.forEach((s) => {
      const existing = map.get(s.studentId) ?? [];
      map.set(s.studentId, [...existing, s]);
    });
    return map;
  }, [submissions]);

  const rows = useMemo<GradebookRow[]>(
    () =>
      students.map((student) => {
        const subs = submissionsByStudent.get(student.id) ?? [];
        const grades: Record<number, number | null> = {};
        assessments.forEach((a) => {
          const sub = subs.find((s) => s.assessmentId === a.id);
          grades[a.id] = sub != null ? sub.grade : null;
        });
        return {
          studentId: student.id,
          name: student.name,
          email: student.email,
          externalId: student.externalId,
          level: student.level,
          grades,
        };
      }),
    [students, assessments, submissionsByStudent],
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
      },
      {
        id: 'externalId',
        title: t(translations.externalId),
        of: 'externalId',
        cell: (row) => row.externalId ?? '—',
        csvDownloadable: true,
      },
      {
        id: 'level',
        title: t(translations.level),
        of: 'level',
        cell: (row) => row.level,
        csvDownloadable: true,
      },
    ];
    assessments.forEach((asn) => {
      const colId = buildAssessmentColumnId(asn.id);
      cols.push({
        id: colId,
        title: asn.title,
        cell: (row) => (row.grades[asn.id] != null ? row.grades[asn.id] : '—'),
        csvDownloadable: true,
      });
    });
    return cols;
  }, [assessments, t]);

  const columnMeta = useMemo(
    () =>
      columns.map((c) => ({
        id: c.id ?? (c.of as string),
        title: typeof c.title === 'string' ? c.title : '',
      })),
    [columns],
  );

  const assessmentMaxGrades = useMemo(
    () => new Map(assessments.map((a) => [a.id, a.maxGrade])),
    [assessments],
  );

  const { toolbar, body } = useTanStackTableBuilder<GradebookRow>({
    data: rows,
    columns,
    getRowId: (row) => row.studentId.toString(),
    getRowEqualityData: (row) => row,
    pagination: {
      rowsPerPage: [DEFAULT_TABLE_ROWS_PER_PAGE],
      showAllRows: true,
    },
    search: { searchPlaceholder: t(translations.searchStudents) },
    toolbar: { show: true },
    columnPicker: {
      renderTree: (ctx) => (
        <GradebookColumnTree
          {...ctx}
          assessments={assessments}
          categories={categories}
          tabs={tabs}
        />
      ),
      locked: ['name'],
      triggerLabel: t(translations.exportButton),
      dialogTitle: t(translations.dialogTitle),
      exportLabel: t(translations.exportCsv),
      onExport: (visibleIds) =>
        exportGradebookCsv({
          visibleColumnIds: visibleIds,
          columnMeta,
          assessments,
          students,
          submissions,
          filename: 'gradebook',
        }),
    },
  });

  const visibility = toolbar.getColumnVisibility?.() ?? {};
  const isColVisible = (id: string): boolean => visibility[id] ?? true;
  const visibleCols = columns.filter((c) => isColVisible(c.id ?? (c.of as string)));

  return (
    <div>
      <MuiTableToolbar
        {...toolbar}
        searchPlaceholder={t(translations.searchStudents)}
      />
      <TableContainer component={Paper}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {visibleCols.map((c) => {
                const id = c.id ?? (c.of as string);
                return (
                  <TableCell key={id}>
                    {typeof c.title === 'string' ? c.title : id}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              {visibleCols.map((c) => {
                const id = c.id ?? (c.of as string);
                const asnId = id.match(/^asn-(\d+)$/);
                return (
                  <TableCell key={id} align={asnId ? 'right' : 'left'}>
                    {asnId
                      ? (assessmentMaxGrades.get(Number(asnId[1])) ?? '')
                      : ''}
                  </TableCell>
                );
              })}
            </TableRow>
            {body.rows.map((row) => {
              const rowProps = body.forEachRow(row);
              const datum = row.original;
              return (
                <TableRow key={rowProps.id} className={rowProps.className ?? ''}>
                  {isColVisible('name') && <TableCell>{datum.name}</TableCell>}
                  {isColVisible('email') && <TableCell>{datum.email}</TableCell>}
                  {isColVisible('externalId') && (
                    <TableCell>{datum.externalId ?? '—'}</TableCell>
                  )}
                  {isColVisible('level') && <TableCell>{datum.level}</TableCell>}
                  {assessments
                    .filter((a) => isColVisible(buildAssessmentColumnId(a.id)))
                    .map((asn) => (
                      <TableCell key={asn.id} align="right">
                        {datum.grades[asn.id] != null ? datum.grades[asn.id] : '—'}
                      </TableCell>
                    ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default GradebookTable;
