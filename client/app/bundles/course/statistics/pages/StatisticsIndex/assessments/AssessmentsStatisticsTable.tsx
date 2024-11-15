import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Typography } from '@mui/material';

import { CourseAssessment } from 'course/statistics/types';
import Link from 'lib/components/core/Link';
import { ColumnTemplate } from 'lib/components/table';
import Table from 'lib/components/table/Table';
import {
  DEFAULT_TABLE_ROWS_PER_PAGE,
  NUM_CELL_CLASS_NAME,
} from 'lib/constants/sharedConstants';
import {
  getAssessmentStatisticsURL,
  getAssessmentWithCategoryURL,
  getAssessmentWithTabURL,
} from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import useTranslation from 'lib/hooks/useTranslation';
import { formatMiniDateTime } from 'lib/moment';

import AssessmentsScoreSummaryDownload from './AssessmentsScoreSummaryDownload';

const translations = defineMessages({
  title: {
    id: 'course.statistics.StatisticsIndex.assessments.title',
    defaultMessage: 'Title',
  },
  startAt: {
    id: 'course.statistics.StatisticsIndex.assessments.startAt',
    defaultMessage: 'Starts At',
  },
  tab: {
    id: 'course.statistics.StatisticsIndex.assessments.tab',
    defaultMessage: 'Tab',
  },
  category: {
    id: 'course.statistics.StatisticsIndex.assessments.category',
    defaultMessage: 'Category',
  },
  numSubmitted: {
    id: 'course.statistics.StatisticsIndex.assessments.numSubmittedStudents',
    defaultMessage: '# Submitted',
  },
  numAttempted: {
    id: 'course.statistics.StatisticsIndex.assessments.numSubmittedStudents',
    defaultMessage: '# Attempted',
  },
  numLate: {
    id: 'course.statistics.StatisticsIndex.assessments.numLateStudents',
    defaultMessage: '# Late',
  },
  averageGrade: {
    id: 'course.statistics.StatisticsIndex.assessments.averageGrade',
    defaultMessage: 'Avg Grade',
  },
  stdevGrade: {
    id: 'course.statistics.StatisticsIndex.assessments.stdevGrade',
    defaultMessage: 'Stdev Grade',
  },
  averageTimeTaken: {
    id: 'course.statistics.StatisticsIndex.assessments.averageTimeTaken',
    defaultMessage: 'Avg Time',
  },
  stdevTimeTaken: {
    id: 'course.statistics.StatisticsIndex.assessments.stdevTimeTaken',
    defaultMessage: 'Stdev Time',
  },
  tableTitle: {
    id: 'course.statistics.StatisticsIndex.assessments.tableTitle',
    defaultMessage: 'Assessments Statistics ({numStudents} students)',
  },
  csvFileTitle: {
    id: 'course.statistics.StatisticsIndex.assessments.csvFileTitle',
    defaultMessage: 'Assessments Statistics',
  },
  searchBar: {
    id: 'course.statistics.StatisticsIndex.assessments.searchBar',
    defaultMessage: 'Search by Assessment Title, Tab, or Category',
  },
});

interface Props {
  numStudents: number;
  assessments: CourseAssessment[];
}

const AssessmentsStatisticsTable: FC<Props> = (props) => {
  const { numStudents, assessments } = props;
  const courseId = getCourseId();
  const { t } = useTranslation();

  assessments
    .sort((a1, a2) => a1.title.localeCompare(a2.title))
    .sort(
      (a1, a2) =>
        new Date(a1.startAt).getTime() - new Date(a2.startAt).getTime(),
    );

  const columns: ColumnTemplate<CourseAssessment>[] = [
    {
      of: 'title',
      title: t(translations.title),
      sortable: true,
      searchable: true,
      cell: (assessment) => (
        <Link
          opensInNewTab
          to={getAssessmentStatisticsURL(courseId, assessment.id)}
        >
          {assessment.title}
        </Link>
      ),
      csvDownloadable: true,
    },
    {
      of: 'startAt',
      title: t(translations.startAt),
      sortable: true,
      searchable: true,
      cell: (assessment) => formatMiniDateTime(assessment.startAt),
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
      of: 'numAttempted',
      title: t(translations.numAttempted),
      sortable: true,
      cell: (assessment) => (
        <div className="text-center align-center">
          {assessment.numAttempted}
        </div>
      ),
      csvDownloadable: true,
    },
    {
      of: 'numSubmitted',
      title: t(translations.numSubmitted),
      sortable: true,
      cell: (assessment) => (
        <div className="text-center align-center">
          {assessment.numSubmitted}
        </div>
      ),
      csvDownloadable: true,
    },
    {
      of: 'numLate',
      title: t(translations.numLate),
      sortable: true,
      cell: (assessment) => (
        <div className="text-center align-center">{assessment.numLate}</div>
      ),
      csvDownloadable: true,
    },
    {
      of: 'averageGrade',
      title: t(translations.averageGrade),
      sortable: true,
      className: NUM_CELL_CLASS_NAME,
      cell: (assessment): JSX.Element => {
        const averageGrade = parseFloat(
          Number(assessment.averageGrade).toFixed(1),
        );
        const maximumGrade = parseFloat(
          Number(assessment.maximumGrade).toFixed(1),
        );
        return (
          <div className={NUM_CELL_CLASS_NAME}>
            {`${averageGrade} / ${maximumGrade}`}
          </div>
        );
      },
      csvDownloadable: true,
    },
    {
      of: 'stdevGrade',
      title: t(translations.stdevGrade),
      sortable: true,
      className: NUM_CELL_CLASS_NAME,
      cell: (assessment) => (
        <div className={NUM_CELL_CLASS_NAME}>
          {parseFloat(Number(assessment.stdevGrade).toFixed(1))}
        </div>
      ),
      csvDownloadable: true,
    },
    {
      of: 'averageTimeTaken',
      title: t(translations.averageTimeTaken),
      sortable: true,
      cell: (assessment) => assessment.averageTimeTaken,
      csvDownloadable: true,
    },
    {
      of: 'stdevTimeTaken',
      title: t(translations.stdevTimeTaken),
      sortable: true,
      cell: (assessment) => assessment.stdevTimeTaken,
      csvDownloadable: true,
    },
  ];

  return (
    <>
      <Typography className="ml-6" variant="h6">
        {t(translations.tableTitle, { numStudents })}
      </Typography>
      <Table
        className="border-none"
        columns={columns}
        csvDownload={{ filename: t(translations.csvFileTitle) }}
        data={assessments}
        getRowClassName={(assessment): string =>
          `assessment_statistics_${assessment.id}`
        }
        getRowEqualityData={(assessment): CourseAssessment => assessment}
        getRowId={(assessment): string => assessment.id.toString()}
        indexing={{ indices: true, rowSelectable: true }}
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
        toolbar={{
          show: true,
          activeToolbar: (selectedAssessments): JSX.Element => (
            <AssessmentsScoreSummaryDownload
              assessments={selectedAssessments}
            />
          ),
          keepNative: true,
        }}
      />
    </>
  );
};

export default AssessmentsStatisticsTable;
