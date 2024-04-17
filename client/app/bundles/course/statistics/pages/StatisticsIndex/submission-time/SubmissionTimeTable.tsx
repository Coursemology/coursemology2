import { FC, memo } from 'react';
import { defineMessages } from 'react-intl';
import { Chip, Typography } from '@mui/material';
import palette from 'theme/palette';

import { translateStatus } from 'course/assessment/submissions/components/misc/SubmissionStatus';
import {
  CourseAssessmentTime,
  SubmissionTimeStatistics,
} from 'course/statistics/types';
import Link from 'lib/components/core/Link';
import Table, { ColumnTemplate } from 'lib/components/table';
import { DEFAULT_TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';
import {
  getAssessmentURL,
  getAssessmentWithCategoryURL,
  getAssessmentWithTabURL,
  getEditAssessmentSubmissionURL,
} from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  tableTitle: {
    id: 'course.statistics.StatisticsIndex.SubmissionTime.tableTitle',
    defaultMessage: 'Submission Time for {studentName}',
  },
  title: {
    id: 'course.statistics.StatisticsIndex.SubmissionTime.title',
    defaultMessage: 'Title',
  },
  tab: {
    id: 'course.statistics.StatisticsIndex.SubmissionTime.tab',
    defaultMessage: 'Tab',
  },
  category: {
    id: 'course.statistics.StatisticsIndex.SubmissionTime.category',
    defaultMessage: 'Category',
  },
  status: {
    id: 'course.statistics.StatisticsIndex.SubmissionTime.status',
    defaultMessage: 'Status',
  },
  grade: {
    id: 'course.statistics.StatisticsIndex.SubmissionTime.grade',
    defaultMessage: 'Grade',
  },
  dueIn: {
    id: 'course.statistics.StatisticsIndex.SubmissionTime.timeOverdue',
    defaultMessage: 'Due In',
  },
  timeTaken: {
    id: 'course.statistics.StatisticsIndex.SubmissionTime.timeTaken',
    defaultMessage: 'Time Taken',
  },
  csvFileTitle: {
    id: 'course.statistics.StatisticsIndex.assessments.csvFileTitle',
    defaultMessage: 'Submission Time for {studentName}',
  },
  searchBar: {
    id: 'course.statistics.StatisticsIndex.assessments.searchBar',
    defaultMessage: 'Search by Assessment Title, Tab, or Category',
  },
});

interface Props {
  data: SubmissionTimeStatistics;
}

const SubmissionTimeTable: FC<Props> = (props) => {
  const {
    data: { name, assessments },
  } = props;
  const { t } = useTranslation();
  const courseId = getCourseId();

  assessments.sort((a1, a2) => a1.title.localeCompare(a2.title));

  const columns: ColumnTemplate<CourseAssessmentTime>[] = [
    {
      of: 'title',
      title: t(translations.title),
      sortable: true,
      searchable: true,
      cell: (assessment) => (
        <Link opensInNewTab to={getAssessmentURL(courseId, assessment.id)}>
          {assessment.title}
        </Link>
      ),
      csvDownloadable: true,
    },
    {
      title: t(translations.category),
      sortable: true,
      searchable: true,
      searchProps: {
        getValue: (assessment) => assessment.category.title,
      },
      cell: (assessment) => (
        <Link
          opensInNewTab
          to={getAssessmentWithCategoryURL(courseId, assessment.category.id)}
        >
          {assessment.category.title}
        </Link>
      ),
      csvDownloadable: true,
    },
    {
      title: t(translations.tab),
      sortable: true,
      searchable: true,
      searchProps: {
        getValue: (assessment) => assessment.tab.title,
      },
      cell: (assessment) => (
        <Link
          opensInNewTab
          to={getAssessmentWithTabURL(
            courseId,
            assessment.category.id,
            assessment.tab.id,
          )}
        >
          {assessment.tab.title}
        </Link>
      ),
      csvDownloadable: true,
    },
    {
      of: 'workflowState',
      title: t(translations.status),
      sortable: true,
      cell: (assessment) => (
        <Link
          opensInNewTab
          to={
            assessment.submissionId
              ? getEditAssessmentSubmissionURL(
                  courseId,
                  assessment.id,
                  assessment.submissionId,
                )
              : null
          }
        >
          <Chip
            label={translateStatus(assessment.workflowState)}
            style={{
              width: 120,
              backgroundColor:
                palette.submissionStatus[assessment.workflowState],
              color: assessment.submissionId ? palette.links : 'black',
            }}
          />
        </Link>
      ),
      csvDownloadable: true,
    },
    {
      of: 'dueIn',
      title: t(translations.dueIn),
      sortable: true,
      cell: (assessment) => assessment.dueIn,
      csvDownloadable: true,
    },
  ];

  return (
    <div className="mt-2">
      <Typography className="ml-2" variant="h6">
        {t(translations.tableTitle, { studentName: name })}
      </Typography>
      <Table
        className="border-none"
        columns={columns}
        csvDownload={{
          filename: t(translations.csvFileTitle, { studentName: name }),
        }}
        data={assessments}
        getRowClassName={(assessment): string =>
          `submission_time_${assessment.id}`
        }
        getRowEqualityData={(assessment): CourseAssessmentTime => assessment}
        getRowId={(assessment): string => assessment.id.toString()}
        indexing={{ indices: true }}
        pagination={{
          rowsPerPage: [DEFAULT_TABLE_ROWS_PER_PAGE],
          showAllRows: true,
        }}
        search={{
          searchPlaceholder: t(translations.searchBar),
          searchProps: {
            shouldInclude: (assessment, filterValue?: string): boolean => {
              if (!assessment.title && !assessment.tab.title) return false;
              if (!filterValue) return true;

              return (
                assessment.title
                  .toLowerCase()
                  .trim()
                  .includes(filterValue.toLowerCase().trim()) ||
                assessment.tab.title
                  .toLowerCase()
                  .trim()
                  .includes(filterValue.toLowerCase().trim()) ||
                assessment.category.title
                  .toLowerCase()
                  .trim()
                  .includes(filterValue.toLowerCase().trim())
              );
            },
          },
        }}
        toolbar={{ show: true }}
      />
    </div>
  );
};

export default memo(
  SubmissionTimeTable,
  (prevProps, nextProps) => prevProps.data.name === nextProps.data.name,
);
