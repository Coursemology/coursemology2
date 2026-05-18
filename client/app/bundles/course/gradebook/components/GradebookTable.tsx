import { FC, useMemo } from 'react';
import { defineMessages } from 'react-intl';
import { Tooltip } from '@mui/material';

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

interface Props {
  tabs: TabData[];
  assessments: AssessmentData[];
  students: StudentRow[];
  showPercentage: boolean;
}

const RawScore: FC<{ grade: number; maxGrade: number }> = ({
  grade,
  maxGrade,
}) => (
  <>
    <span className="sr-only">
      {grade} / {maxGrade}
    </span>
    <div aria-hidden className="grid grid-cols-[1fr_auto_1fr] tabular-nums">
      <span className="text-right">{grade}</span>
      <span className="px-0.5">/</span>
      <span>{maxGrade}</span>
    </div>
  </>
);

const formatGrade = (
  grade: number,
  maxGrade: number,
  showPercentage: boolean,
): string | JSX.Element => {
  if (maxGrade === 0) return '–';
  if (!showPercentage) return <RawScore grade={grade} maxGrade={maxGrade} />;
  return `${((grade / maxGrade) * 100).toFixed(2)}%`;
};

const buildColumns = (
  assessments: AssessmentData[],
  tabMap: Map<number, TabData>,
  t: ReturnType<typeof useTranslation>['t'],
  showPercentage: boolean,
): ColumnTemplate<StudentRow>[] => {
  const numberAlign = showPercentage ? 'text-right' : 'text-left';

  const leaves: ColumnTemplate<StudentRow>[] = assessments
    .map((a) => {
      const tab = tabMap.get(a.tabId);
      if (!tab) return null;
      return {
        id: `assessment-${a.id}`,
        title: (
          <Tooltip placement="top" title={a.title}>
            <span className="block truncate">{a.title}</span>
          </Tooltip>
        ),
        groupPath: [
          { id: tab.categoryId, title: tab.categoryTitle, label: tab.categoryTitle },
          { id: tab.id, title: tab.title, label: tab.title },
        ],
        widthPx: 160,
        className: `${numberAlign} tabular-nums`,
        cell: (row) =>
          formatGrade(row.grades[String(a.id)] ?? 0, a.maxGrade, showPercentage),
      } satisfies ColumnTemplate<StudentRow>;
    })
    .filter((c): c is ColumnTemplate<StudentRow> => c !== null);

  return [
    {
      id: 'name',
      title: t(translations.studentName),
      pin: 'left',
      widthPx: 192,
      cell: (row) => row.name,
    },
    ...leaves,
    {
      id: 'total',
      title: t(translations.total),
      pin: 'right',
      widthPx: 96,
      className: `${numberAlign} tabular-nums`,
      cell: (row) =>
        formatGrade(row.totalGrade, row.totalMaxGrade, showPercentage),
    },
  ];
};

const GradebookTable: FC<Props> = ({ tabs, assessments, students, showPercentage }) => {
  const { t } = useTranslation();
  const tabMap = useMemo(
    () => new Map(tabs.map((tab) => [tab.id, tab])),
    [tabs],
  );
  const columns = useMemo(
    () => buildColumns(assessments, tabMap, t, showPercentage),
    [assessments, tabMap, t, showPercentage],
  );

  return (
    <Table
      columns={columns}
      data={students}
      getRowId={(s) => s.id.toString()}
      getRowEqualityData={(s) => ({ ...s, showPercentage })}
      maxHeight="70vh"
    />
  );
};

export default GradebookTable;
