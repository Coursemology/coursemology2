import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Typography } from '@mui/material';

import { CourseAssessment } from 'course/statistics/types';
import Link from 'lib/components/core/Link';
import { ColumnTemplate } from 'lib/components/table';
import Table from 'lib/components/table/Table';
import { DEFAULT_TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';
import {
  getAssessmentStatisticsURL,
  getAssessmentWithCategoryURL,
  getAssessmentWithTabURL,
} from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  title: {
    id: 'course.statistics.StatisticsIndex.assessments.title',
    defaultMessage: 'Title',
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
  numAttempting: {
    id: 'course.statistics.StatisticsIndex.assessments.numSubmittedStudents',
    defaultMessage: '# Attempting',
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

  assessments.sort((a1, a2) => a1.title.localeCompare(a2.title));

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
      of: 'numSubmitted',
      title: t(translations.numSubmitted),
      sortable: true,
      className: 'text-right',
      cell: (assessment) => (
        <div className="text-right">{assessment.numSubmitted}</div>
      ),
      csvDownloadable: true,
    },
    {
      of: 'numLate',
      title: t(translations.numLate),
      sortable: true,
      className: 'text-right',
      cell: (assessment) => (
        <div className="text-right">{assessment.numLate}</div>
      ),
      csvDownloadable: true,
    },
    {
      of: 'numAttempting',
      title: t(translations.numAttempting),
      sortable: true,
      className: 'text-right',
      cell: (assessment) => (
        <div className="text-right">{assessment.numAttempting}</div>
      ),
      csvDownloadable: true,
    },
    {
      of: 'averageGrade',
      title: t(translations.averageGrade),
      sortable: true,
      cell: (assessment): string => {
        const averageGrade = Number(assessment.averageGrade).toFixed(2);
        const maximumGrade = Number(assessment.maximumGrade).toFixed(2);
        return `${averageGrade} / ${maximumGrade}`;
      },
      csvDownloadable: true,
    },
    {
      of: 'stdevGrade',
      title: t(translations.stdevGrade),
      sortable: true,
      cell: (assessment): string => {
        const stdevGrade = Number(assessment.stdevGrade).toFixed(2);
        const maximumGrade = Number(assessment.maximumGrade).toFixed(2);
        return `${stdevGrade} / ${maximumGrade}`;
      },
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
      <Typography className="ml-2" variant="h6">
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
    </>
  );
};

export default AssessmentsStatisticsTable;
