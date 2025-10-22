import { FC, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PaginationState } from '@tanstack/react-table';

import { PLAGIARISM_JOB_POLL_INTERVAL_MS } from 'course/assessment/constants';
import {
  downloadSubmissionPairResult,
  fetchAssessmentPlagiarism,
  INITIAL_SUBMISSION_PAIR_QUERY_SIZE,
  shareAssessmentResult,
  shareSubmissionPairResult,
} from 'course/assessment/operations/plagiarism';
import { ASSESSMENT_SIMILARITY_WORKFLOW_STATE } from 'lib/constants/sharedConstants';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';

import { plagiarismActions } from '../../reducers/plagiarism';

import PlagiarismResultsTable from './PlagiarismResultsTable';
import { getAssessmentPlagiarism } from './selectors';

const AssessmentPlagiarismPage: FC = () => {
  const dispatch = useAppDispatch();
  const { assessmentId } = useParams();
  const parsedAssessmentId = parseInt(assessmentId!, 10);

  const { data, isAllSubmissionPairsLoaded } = useAppSelector(
    getAssessmentPlagiarism,
  );
  const isRunning =
    data.status.workflowState ===
      ASSESSMENT_SIMILARITY_WORKFLOW_STATE.starting ||
    data.status.workflowState === ASSESSMENT_SIMILARITY_WORKFLOW_STATE.running;
  const [rowsToLoad, setRowsToLoad] = useState(
    INITIAL_SUBMISSION_PAIR_QUERY_SIZE,
  );

  const shouldQuery =
    isRunning ||
    (data.status.workflowState === 'completed' &&
      !isAllSubmissionPairsLoaded &&
      data.submissionPairs.length < rowsToLoad);

  const plagiarismPollerRef = useRef<NodeJS.Timeout | null>(null);

  const handlePlagiarismPolling = async (): Promise<void> => {
    if (shouldQuery) {
      const plagiarismData = await fetchAssessmentPlagiarism(
        parsedAssessmentId,
        rowsToLoad - data.submissionPairs.length,
        data.submissionPairs.length,
      );
      if (isRunning) {
        dispatch(plagiarismActions.initialize(plagiarismData));
      } else {
        dispatch(plagiarismActions.addSubmissionPairs(plagiarismData));
      }
    }
  };

  const onPaginationChange = (newValue: PaginationState): void => {
    const { pageIndex, pageSize } = newValue;
    // Load at least up to the full next page.
    setRowsToLoad(Math.max((pageIndex + 2) * pageSize, rowsToLoad));
  };

  useEffect(() => {
    plagiarismPollerRef.current = setInterval(
      handlePlagiarismPolling,
      PLAGIARISM_JOB_POLL_INTERVAL_MS,
    );

    // clean up poller on unmount
    return () => {
      if (plagiarismPollerRef.current) {
        clearInterval(plagiarismPollerRef.current);
      }
    };
  });

  const handleDownloadSubmissionPairResult = (
    submissionPairId: number,
  ): void => {
    downloadSubmissionPairResult(parsedAssessmentId, submissionPairId).then(
      (response) => {
        const newTab = window.open();
        if (newTab) {
          newTab.document.body.innerHTML = response.html;
          newTab.document.close();
          newTab.print();
        }
      },
    );
  };

  const handleShareSubmissionPairResult = (submissionPairId: number): void => {
    shareSubmissionPairResult(parsedAssessmentId, submissionPairId).then(
      (response) => {
        window.open(response.url, '_blank');
      },
    );
  };

  const handleShareAssessmentResult = (): void => {
    shareAssessmentResult(parsedAssessmentId).then((response) => {
      window.open(response.url, '_blank');
    });
  };

  return (
    <PlagiarismResultsTable
      allLoaded={isAllSubmissionPairsLoaded}
      downloadSubmissionPairResult={handleDownloadSubmissionPairResult}
      isLoading={isRunning}
      onPaginationChange={onPaginationChange}
      shareAssessmentResult={handleShareAssessmentResult}
      shareSubmissionPairResult={handleShareSubmissionPairResult}
      submissionPairs={data.submissionPairs}
    />
  );
};

export default AssessmentPlagiarismPage;
