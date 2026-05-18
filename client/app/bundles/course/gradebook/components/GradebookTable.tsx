import { FC, useMemo } from 'react';
import { defineMessages } from 'react-intl';

import { ColumnTemplate } from 'lib/components/table';
import Table from 'lib/components/table/Table';
import useTranslation from 'lib/hooks/useTranslation';

import { AssessmentData, StudentRow, TabData } from '../types';

const translations = defineMessages({
  studentName: {
    id: 'course.gradebook.GradebookTable.studentName',
    defaultMessage: 'Student Name',
  },
  total: {
    id: 'course.gradebook.GradebookTable.total',
    defaultMessage: 'Total',
  },
});

// Golden-angle hue spacing gives maximally distinct pastels for any number of tabs.
const tabColor = (index: number): string =>
  `hsl(${(index * 137) % 360}, 60%, 92%)`;

interface Props {
  tabs: TabData[];
  assessments: AssessmentData[];
  students: StudentRow[];
  showRawScore: boolean;
}

const formatGrade = (
  grade: number,
  maxGrade: number,
  showRawScore: boolean,
): string => {
  if (maxGrade === 0) return '–';
  if (showRawScore) return `${grade} / ${maxGrade}`;
  return `${((grade / maxGrade) * 100).toFixed(2)}%`;
};

const GradebookTable: FC<Props> = ({
  tabs,
  assessments,
  students,
  showRawScore,
}) => {
  const { t } = useTranslation();

  const tabColorMap = useMemo(() => {
    const map = new Map<number, string>();
    tabs.forEach((tab, i) => {
      map.set(tab.id, tabColor(i));
    });
    return map;
  }, [tabs]);

  const columns = useMemo((): ColumnTemplate<StudentRow>[] => {
    const nameColumn: ColumnTemplate<StudentRow> = {
      of: 'name',
      title: t(translations.studentName),
      sortable: true,
      cell: (student) => student.name,
      className: 'sticky left-0 z-10 bg-white min-w-[12rem]',
    };

    const assessmentColumns: ColumnTemplate<StudentRow>[] = assessments.map(
      (assessment) => ({
        id: `assessment-${assessment.id}`,
        title: () => (
          <div className="w-[180px]">
            <span
              className="block truncate rounded px-2 py-1 text-gray-900"
              style={{
                backgroundColor:
                  tabColorMap.get(assessment.tabId) ?? 'transparent',
              }}
            >
              {assessment.title}
            </span>
          </div>
        ),
        className: 'min-w-[9rem]',
        cell: (student) =>
          formatGrade(
            student.grades[String(assessment.id)] ?? 0,
            assessment.maxGrade,
            showRawScore,
          ),
      }),
    );

    const totalColumn: ColumnTemplate<StudentRow> = {
      id: 'total',
      title: t(translations.total),
      className: 'min-w-[9rem]',
      cell: (student) =>
        formatGrade(student.totalGrade, student.totalMaxGrade, showRawScore),
    };

    return [nameColumn, ...assessmentColumns, totalColumn];
  }, [assessments, tabColorMap, showRawScore, t]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 px-4 py-2">
        {tabs.map((tab) => (
          <span
            key={tab.id}
            className="rounded px-2 py-1"
            style={{ backgroundColor: tabColorMap.get(tab.id) }}
          >
            {tab.title}
          </span>
        ))}
      </div>

      <div className="max-h-[70vh] overflow-auto">
        <Table
          columns={columns}
          data={students}
          getRowEqualityData={(student): object => ({
            ...student,
            showRawScore,
          })}
          getRowId={(student): string => student.id.toString()}
        />
      </div>
    </div>
  );
};

export default GradebookTable;
