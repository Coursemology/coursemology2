import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { OpenInNew, PictureAsPdf } from '@mui/icons-material';
import { IconButton, Tooltip, Typography } from '@mui/material';
import { AssessmentSimilaritySubmissionPair } from 'types/course/similarity';

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
  isLoading: boolean;
  submissionPairs: AssessmentSimilaritySubmissionPair[];
  downloadSubmissionPairResult: (submissionPairId: number) => void;
  shareSubmissionPairResult: (submissionPairId: number) => void;
  shareAssessmentResult: () => void;
}

const translations = defineMessages({
  results: {
    id: 'course.assessment.similarity.results',
    defaultMessage:
      'Similarity Results (Top 100 Most Similar Submission Pairs)',
  },
  baseSubmission: {
    id: 'course.assessment.similarity.baseSubmission',
    defaultMessage: 'Base Submission',
  },
  comparedSubmission: {
    id: 'course.assessment.similarity.comparedSubmission',
    defaultMessage: 'Compared Submission',
  },
  similarityScore: {
    id: 'course.assessment.similarity.similarityScore',
    defaultMessage: 'Similarity Score',
  },
  actions: {
    id: 'course.assessment.similarity.actions',
    defaultMessage: 'Actions',
  },
  viewReport: {
    id: 'course.assessment.similarity.viewReport',
    defaultMessage: 'View Report',
  },
  downloadPdf: {
    id: 'course.assessment.similarity.downloadPdf',
    defaultMessage: 'Download PDF',
  },
  searchByStudentName: {
    id: 'course.assessment.similarity.searchByStudentName',
    defaultMessage: 'Search by Student Name',
  },
});

const SimilarityResultsTable: FC<Props> = (props) => {
  const { t } = useTranslation();

  const {
    isLoading,
    submissionPairs,
    downloadSubmissionPairResult,
    shareSubmissionPairResult,
    shareAssessmentResult,
  } = props;

  if (isLoading) {
    return <LoadingIndicator />;
  }

  const columns: ColumnTemplate<AssessmentSimilaritySubmissionPair>[] = [
    {
      of: 'baseSubmission',
      title: t(translations.baseSubmission),
      sortable: true,
      searchable: true,
      searchProps: {
        getValue: (datum) => datum.baseSubmission.courseUser.name,
      },
      cell: (datum) => (
        <Link opensInNewTab to={datum.baseSubmission.submissionUrl}>
          {datum.baseSubmission.courseUser.name}
        </Link>
      ),
    },
    {
      of: 'comparedSubmission',
      title: t(translations.comparedSubmission),
      sortable: true,
      searchable: true,
      searchProps: {
        getValue: (datum) => datum.comparedSubmission.courseUser.name,
      },
      cell: (datum) => (
        <Link opensInNewTab to={datum.comparedSubmission.submissionUrl}>
          {datum.comparedSubmission.courseUser.name}
        </Link>
      ),
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
          `similarity_result_${datum.baseSubmission.id}_${datum.comparedSubmission.id} bg-slot-1 hover?:bg-slot-2 slot-1-white slot-2-neutral-100`
        }
        getRowEqualityData={(datum): AssessmentSimilaritySubmissionPair =>
          datum
        }
        getRowId={(datum): string =>
          `${datum.baseSubmission.id}_${datum.comparedSubmission.id}`
        }
        indexing={{ indices: true }}
        pagination={{
          rowsPerPage: [DEFAULT_TABLE_ROWS_PER_PAGE],
          showAllRows: true,
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

export default SimilarityResultsTable;
