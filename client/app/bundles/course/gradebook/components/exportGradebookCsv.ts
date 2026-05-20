import { unparse } from 'papaparse';

import { downloadCsv } from 'lib/components/table/utils';

import type { AssessmentData, StudentData, SubmissionData } from '../types';

interface ColMeta {
  id: string;
  title: string;
}

export interface ExportGradebookCsvArgs {
  visibleColumnIds: string[];
  columnMeta: ColMeta[];
  assessments: AssessmentData[];
  students: StudentData[];
  submissions: SubmissionData[];
  filename?: string;
}

const asnIdFromColId = (colId: string): number | null => {
  const match = colId.match(/^asn-(\d+)$/);
  return match ? Number(match[1]) : null;
};

export const exportGradebookCsv = ({
  visibleColumnIds,
  columnMeta,
  assessments,
  students,
  submissions,
  filename,
}: ExportGradebookCsvArgs): void => {
  const maxGrades = new Map(assessments.map((a) => [a.id, a.maxGrade]));
  const subMap = new Map<number, Map<number, number>>();
  submissions.forEach((s) => {
    if (!subMap.has(s.studentId)) subMap.set(s.studentId, new Map());
    subMap.get(s.studentId)!.set(s.assessmentId, s.grade);
  });

  const visible = columnMeta.filter((c) => visibleColumnIds.includes(c.id));
  const header = visible.map((c) => c.title);
  const pointsPossible = visible.map((c) => {
    const asnId = asnIdFromColId(c.id);
    return asnId !== null ? String(maxGrades.get(asnId) ?? '') : '';
  });

  const studentRows = students.map((student) =>
    visible.map((c) => {
      switch (c.id) {
        case 'name':
          return student.name;
        case 'email':
          return student.email;
        case 'externalId':
          return student.externalId ?? '';
        case 'level':
          return String(student.level);
        default: {
          const asnId = asnIdFromColId(c.id);
          if (asnId === null) return '';
          const grade = subMap.get(student.id)?.get(asnId);
          return grade != null ? String(grade) : '';
        }
      }
    }),
  );

  downloadCsv(unparse([header, pointsPossible, ...studentRows]), filename);
};
