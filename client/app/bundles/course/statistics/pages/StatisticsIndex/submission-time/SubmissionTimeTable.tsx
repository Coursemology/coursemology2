import { FC, memo } from 'react';
import { defineMessages } from 'react-intl';
import { AccessTime, Lock } from '@mui/icons-material';
import { Chip, Typography } from '@mui/material';
import palette from 'theme/palette';

import { translateStatus } from 'course/assessment/submissions/components/misc/SubmissionStatus';
import {
  CourseAssessmentTime,
  SubmissionTimeStatistics,
} from 'course/statistics/types';
import {
  fetchDueInTimeAndStates,
  sortByDueIn,
} from 'course/statistics/utils/dueTimeHelper';
import CustomTooltip from 'lib/components/core/CustomTooltip';
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
import { formatMiniDateTime } from 'lib/moment';

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
  endAt: {
    id: 'course.statistics.StatisticsIndex.SubmissionTime.endAt',
    defaultMessage: 'Due Date',
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
  timeTooltip: {
    id: 'lib.components.extensions.PersonalStartEndTime.timeTooltip',
    defaultMessage:
      'Personalized time is in effect. The original time is {time}.',
  },
  lockTooltip: {
    id: 'lib.components.extensions.PersonalStartEndTime.lockTooltip',
    defaultMessage:
      'The timeline for this is fixed and will not be automatically modified.',
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
  const filteredAssessments = assessments.filter((a) => !!a.dueIn);

  filteredAssessments.sort(sortByDueIn);

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
      of: 'endAt',
      title: t(translations.endAt),
      sortable: true,
      cell: (assessment) => (
        <div className="flex items-center">
          <Typography variant="body2">
            {formatMiniDateTime(assessment.endAt)}
          </Typography>

          <div className="ml-2 flex items-center space-x-1">
            {assessment.isTimelineFixed && (
              <CustomTooltip arrow title={t(translations.lockTooltip)}>
                <Lock className="text-neutral-500" fontSize="small" />
              </CustomTooltip>
            )}

            {assessment.endAt !== assessment.referenceEndAt &&
              assessment.referenceEndAt && (
                <CustomTooltip
                  arrow
                  title={t(translations.timeTooltip, {
                    time: formatMiniDateTime(assessment.referenceEndAt),
                  })}
                >
                  <AccessTime className="text-neutral-500" fontSize="small" />
                </CustomTooltip>
              )}
          </div>
        </div>
      ),
      csvDownloadable: true,
    },
    {
      of: 'dueIn',
      title: t(translations.dueIn),
      sortable: true,
      sortProps: {
        sort: sortByDueIn,
      },
      cell: (assessment): JSX.Element | null => {
        const dueInTimeAndStates = fetchDueInTimeAndStates(assessment.dueIn);
        if (!dueInTimeAndStates) return null;
        return (
          <Chip
            label={dueInTimeAndStates.formattedTime}
            style={{
              width: 120,
              backgroundColor:
                palette.dueInStatus[dueInTimeAndStates.dueStates],
            }}
          />
        );
      },
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
        data={filteredAssessments}
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
