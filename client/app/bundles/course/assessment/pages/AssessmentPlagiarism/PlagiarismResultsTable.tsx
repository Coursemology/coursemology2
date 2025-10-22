import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { OpenInNew, PictureAsPdf } from '@mui/icons-material';
import { IconButton, Tooltip, Typography } from '@mui/material';
import { PaginationState } from '@tanstack/react-table';
import {
  AssessmentPlagiarismSubmission,
  AssessmentPlagiarismSubmissionPair,
} from 'types/course/plagiarism';

import Link from 'lib/components/core/Link';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Table from 'lib/components/table';
import ColumnTemplate from 'lib/components/table/builder/ColumnTemplate';
import {
  DEFAULT_TABLE_ROWS_PER_PAGE,
  NUM_CELL_CLASS_NAME,
} from 'lib/constants/sharedConstants';
import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  allLoaded: boolean;
  isLoading: boolean;
  submissionPairs: AssessmentPlagiarismSubmissionPair[];
  downloadSubmissionPairResult: (submissionPairId: number) => void;
  onPaginationChange: (newValue: PaginationState) => void;
  shareSubmissionPairResult: (submissionPairId: number) => void;
  shareAssessmentResult: () => void;
}

const translations = defineMessages({
  results: {
    id: 'course.assessment.plagiarism.results',
    defaultMessage:
      'Plagiarism Results (Top 100 Most Similar Submission Pairs)',
  },
  baseSubmission: {
    id: 'course.assessment.plagiarism.baseSubmission',
    defaultMessage: 'Base Submission',
  },
  comparedSubmission: {
    id: 'course.assessment.plagiarism.comparedSubmission',
    defaultMessage: 'Compared Submission',
  },
  similarityScore: {
    id: 'course.assessment.plagiarism.similarityScore',
    defaultMessage: 'Similarity Score',
  },
  actions: {
    id: 'course.assessment.plagiarism.actions',
    defaultMessage: 'Actions',
  },
  viewReport: {
    id: 'course.assessment.plagiarism.viewReport',
    defaultMessage: 'View Report',
  },
  downloadPdf: {
    id: 'course.assessment.plagiarism.downloadPdf',
    defaultMessage: 'Download PDF',
  },
  searchByStudentName: {
    id: 'course.assessment.plagiarism.searchByStudentName',
    defaultMessage: 'Search by Student Name',
  },
  cannotManageSubmission: {
    id: 'course.assessment.plagiarism.cannotManageSubmission',
    defaultMessage: 'You do not have permission to manage this submission.',
  },
});

const PlagiarismResultsTable: FC<Props> = (props) => {
  const { t } = useTranslation();

  const {
    allLoaded,
    isLoading,
    submissionPairs,
    downloadSubmissionPairResult,
    onPaginationChange,
    shareSubmissionPairResult,
    shareAssessmentResult,
  } = props;

  if (isLoading) {
    return <LoadingIndicator />;
  }

  const createSubmissionCell = (
    submission: AssessmentPlagiarismSubmission,
  ): JSX.Element => {
    const link = (
      <Link
        className={!submission.canManage ? 'text-neutral-500' : ''}
        opensInNewTab
        to={submission.submissionUrl}
      >
        {submission.courseUser.name}
      </Link>
    );
    return (
      <div>
        {submission.canManage ? (
          link
        ) : (
          <Tooltip title={t(translations.cannotManageSubmission)}>
            {link}
          </Tooltip>
        )}
        <Typography className="text-gray-600" variant="body2">
          {submission.assessmentTitle}
        </Typography>
        <Typography className="text-gray-600" variant="body2">
          {submission.courseTitle}
        </Typography>
      </div>
    );
  };

  const columns: ColumnTemplate<AssessmentPlagiarismSubmissionPair>[] = [
    {
      of: 'baseSubmission',
      title: t(translations.baseSubmission),
      sortable: true,
      searchable: true,
      searchProps: {
        getValue: (datum) => datum.baseSubmission.courseUser.name,
      },
      cell: (datum) => createSubmissionCell(datum.baseSubmission),
    },
    {
      of: 'comparedSubmission',
      title: t(translations.comparedSubmission),
      sortable: true,
      searchable: true,
      searchProps: {
        getValue: (datum) => datum.comparedSubmission.courseUser.name,
      },
      cell: (datum) => createSubmissionCell(datum.comparedSubmission),
    },
    {
      of: 'similarityScore',
      title: t(translations.similarityScore),
      sortable: true,
      sortProps: {
        sort: (a, b) => a.similarityScore - b.similarityScore,
      },
      cell: (datum) => (
        <div className="flex items-center justify-center">
          <span className={`${NUM_CELL_CLASS_NAME} min-w-[4ch]`}>
            {(datum.similarityScore * 100).toFixed(1)}
          </span>
        </div>
      ),
    },
    {
      title: t(translations.actions),
      cell: (datum) => (
        <div className="flex">
          <Tooltip title={t(translations.viewReport)}>
            <IconButton
              color="primary"
              onClick={() => shareSubmissionPairResult(datum.submissionPairId)}
              size="small"
            >
              <OpenInNew />
            </IconButton>
          </Tooltip>
          <Tooltip title={t(translations.downloadPdf)}>
            <IconButton
              color="secondary"
              onClick={() =>
                downloadSubmissionPairResult(datum.submissionPairId)
              }
              size="small"
            >
              <PictureAsPdf />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex">
        <Typography className="ml-6" variant="h6">
          {t(translations.results)}
        </Typography>
        {submissionPairs.length > 0 && (
          <Tooltip title={t(translations.viewReport)}>
            <IconButton
              color="primary"
              onClick={shareAssessmentResult}
              size="small"
            >
              <OpenInNew />
            </IconButton>
          </Tooltip>
        )}
      </div>
      <Table
        className="border-none"
        columns={columns}
        data={submissionPairs}
        getRowClassName={(datum): string =>
          `plagiarism_result_${datum.baseSubmission.id}_${datum.comparedSubmission.id} bg-slot-1 hover?:bg-slot-2 slot-1-white slot-2-neutral-100`
        }
        getRowEqualityData={(datum): AssessmentPlagiarismSubmissionPair =>
          datum
        }
        getRowId={(datum): string =>
          `${datum.baseSubmission.id}_${datum.comparedSubmission.id}`
        }
        indexing={{ indices: true }}
        pagination={{
          rowsPerPage: [DEFAULT_TABLE_ROWS_PER_PAGE],
          showAllRows: false,
          showTotalPlus: !allLoaded,
          onPaginationChange,
        }}
        search={{
          searchPlaceholder: t(translations.searchByStudentName),
          searchProps: {
            shouldInclude: (datum, filterValue?: string): boolean => {
              if (!filterValue) return true;

              return (
                datum.baseSubmission.courseUser.name
                  .toLowerCase()
                  .trim()
                  .includes(filterValue.toLowerCase().trim()) ||
                datum.comparedSubmission.courseUser.name
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

export default PlagiarismResultsTable;
