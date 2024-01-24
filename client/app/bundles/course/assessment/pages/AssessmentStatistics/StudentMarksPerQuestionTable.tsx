import { FC, ReactNode } from 'react';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';
import { Box, Chip } from '@mui/material';
import palette from 'theme/palette';
import {
  AssessmentMarksPerQuestionStats,
  SubmissionMarksPerQuestionStats,
} from 'types/course/statistics/assessmentStatistics';

import { workflowStates } from 'course/assessment/submission/constants';
import Link from 'lib/components/core/Link';
import Table, { ColumnTemplate } from 'lib/components/table';
import { DEFAULT_TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';
import useTranslation from 'lib/hooks/useTranslation';

import { getClassNameForMarkCell } from './ColorGradationLevel';

interface Props {
  data: AssessmentMarksPerQuestionStats;
}

const translations = defineMessages({
  name: {
    id: 'course.assessment.statistics.name',
    defaultMessage: 'Name',
  },
  group: {
    id: 'course.assessment.statistics.group',
    defaultMessage: 'Group',
  },
  totalGrade: {
    id: 'course.assessment.statistics.totalGrade',
    defaultMessage: 'Total',
  },
  grader: {
    id: 'course.assessment.statistics.grader',
    defaultMessage: 'Grader',
  },
  searchText: {
    id: 'course.assessment.statistics.searchText',
    defaultMessage: 'Search by Group or Grader Name',
  },
  answers: {
    id: 'course.assessment.statistics.answers',
    defaultMessage: 'Answers',
  },
  questionIndex: {
    id: 'course.assessment.statistics.questionIndex',
    defaultMessage: 'Q{index}',
  },
  questionDisplayTitle: {
    id: 'course.assessment.statistics.questionDisplayTitle',
    defaultMessage: 'Q{index} for {student}',
  },
  noSubmission: {
    id: 'course.assessment.statistics.noSubmission',
    defaultMessage: 'No Submission yet',
  },
  workflowState: {
    id: 'course.assessment.statistics.workflowState',
    defaultMessage: 'Status',
  },
  filename: {
    id: 'course.assessment.statistics.filename',
    defaultMessage: 'Question-level Statistics for {assessment}',
  },
});

const statusTranslations = {
  attempting: 'Attempting',
  submitted: 'Submitted',
  graded: 'Graded, unpublished',
  published: 'Graded',
  unstarted: 'Not Started',
};

const StudentMarksPerQuestionTable: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { courseId } = useParams();
  const { data } = props;

  const sortedSubmission = data.submissions.sort((datum1, datum2) =>
    datum1.courseUser.name.localeCompare(datum2.courseUser.name),
  );

  // the case where the grade is null is handled separately inside the column
  // (refer to the definition of answerColumns below)
  const renderNonNullGradeCell = (
    grade: number | null,
    maxGrade: number | null,
  ): ReactNode => {
    if (!grade || !maxGrade) {
      return null;
    }

    const className = getClassNameForMarkCell(grade, maxGrade);
    return (
      <div className={className}>
        <Box>{grade}</Box>
      </div>
    );
  };

  // the customised sorting for grades to ensure null always is less than any non-null grade
  const sortNullableGrade = (
    grade1: number | null,
    grade2: number | null,
  ): number => {
    if (!grade1 && !grade2) {
      return 0;
    }
    if (!grade1) {
      return -1;
    }
    if (!grade2) {
      return 1;
    }
    return grade1 - grade2;
  };

  const answerColumns: ColumnTemplate<SubmissionMarksPerQuestionStats>[] =
    Array.from({ length: data.questionCount }, (_, index) => {
      return {
        searchProps: {
          getValue: (datum) => datum.answers?.[index]?.grade?.toString() ?? '',
        },
        title: t(translations.questionIndex, { index: index + 1 }),
        cell: (datum): ReactNode => {
          return datum.answers?.[index].grade
            ? renderNonNullGradeCell(
                datum.answers?.[index].grade ?? null,
                datum.answers?.[index].maximumGrade ?? null,
              )
            : null;
        },
        sortable: true,
        csvDownloadable: true,
        className: 'text-right',
        sortProps: {
          sort: (datum1, datum2): number => {
            return sortNullableGrade(
              datum1.answers?.[index].grade ?? null,
              datum2.answers?.[index].grade ?? null,
            );
          },
        },
      };
    });

  const jointGroupsName = (datum: SubmissionMarksPerQuestionStats): string =>
    datum.groups ? datum.groups.map((g) => g.name).join(', ') : '';

  const columns: ColumnTemplate<SubmissionMarksPerQuestionStats>[] = [
    {
      searchProps: {
        getValue: (datum) => datum.courseUser.name,
      },
      title: t(translations.name),
      sortable: true,
      cell: (datum) => (
        <Link to={`/courses/${courseId}/users/${datum.courseUser.id}`}>
          {datum.courseUser.name}
        </Link>
      ),
      csvDownloadable: true,
    },
    {
      of: 'groups',
      title: t(translations.group),
      sortable: true,
      searchable: true,
      searchProps: {
        getValue: (datum) => jointGroupsName(datum),
      },
      cell: (datum) => jointGroupsName(datum),
      csvDownloadable: true,
    },
    {
      of: 'workflowState',
      title: t(translations.workflowState),
      sortable: true,
      cell: (datum) => (
        <Chip
          className="w-100"
          label={
            statusTranslations[datum.workflowState ?? workflowStates.Unstarted]
          }
          style={{
            backgroundColor:
              palette.submissionStatus[
                datum.workflowState ?? workflowStates.Unstarted
              ],
          }}
          variant="filled"
        />
      ),
      className: 'center',
    },
    ...answerColumns,
    {
      searchProps: {
        getValue: (datum) => datum.totalGrade?.toString() ?? '',
      },
      title: t(translations.totalGrade),
      sortable: true,
      cell: (datum): ReactNode =>
        datum.totalGrade
          ? renderNonNullGradeCell(datum.totalGrade ?? null, data.maximumGrade)
          : null,
      className: 'text-right',
      sortProps: {
        sort: (datum1, datum2): number => {
          return sortNullableGrade(
            datum1.totalGrade ?? null,
            datum2.totalGrade ?? null,
          );
        },
      },
      csvDownloadable: true,
    },
    {
      searchProps: {
        getValue: (datum) => datum.grader?.name ?? '',
      },
      title: t(translations.grader),
      sortable: true,
      searchable: true,
      cell: (datum): JSX.Element | string => {
        if (datum.grader && datum.grader.id !== 0) {
          return (
            <Link to={`/courses/${courseId}/users/${datum.grader.id}`}>
              {datum.grader.name}
            </Link>
          );
        }
        return datum.grader?.name ?? '';
      },
      csvDownloadable: true,
    },
  ];

  return (
    <Table
      columns={columns}
      csvDownload={{
        filename: t(translations.filename, {
          assessment: data.assessmentTitle,
        }),
      }}
      data={sortedSubmission}
      getRowClassName={(datum): string =>
        `data_${datum.courseUser.id} bg-slot-1 hover?:bg-slot-2 slot-1-white slot-2-neutral-100`
      }
      getRowEqualityData={(datum): SubmissionMarksPerQuestionStats => datum}
      getRowId={(datum): string => datum.courseUser.id.toString()}
      indexing={{ indices: true }}
      pagination={{
        rowsPerPage: [DEFAULT_TABLE_ROWS_PER_PAGE],
        showAllRows: true,
      }}
      search={{ searchPlaceholder: t(translations.searchText) }}
      toolbar={{ show: true }}
    />
  );
};

export default StudentMarksPerQuestionTable;
