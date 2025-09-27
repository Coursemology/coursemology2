import { FC, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

import { PLAGIARISM_JOB_POLL_INTERVAL_MS } from 'course/assessment/constants';
import {
  downloadSubmissionPairResult,
  fetchAssessmentPlagiarism,
  shareAssessmentResult,
  shareSubmissionPairResult,
} from 'course/assessment/operations/plagiarism';
import { ASSESSMENT_SIMILARITY_WORKFLOW_STATE } from 'lib/constants/sharedConstants';
import { useAppSelector } from 'lib/hooks/store';

import PlagiarismResultsTable from './PlagiarismResultsTable';
import { getAssessmentPlagiarism } from './selectors';

const AssessmentPlagiarismPage: FC = () => {
  const { assessmentId } = useParams();
  const parsedAssessmentId = parseInt(assessmentId!, 10);

  const { data } = useAppSelector(getAssessmentPlagiarism);
  const isRunning =
    data.status.workflowState ===
      ASSESSMENT_SIMILARITY_WORKFLOW_STATE.starting ||
    data.status.workflowState === ASSESSMENT_SIMILARITY_WORKFLOW_STATE.running;

  const plagiarismPollerRef = useRef<NodeJS.Timeout | null>(null);

  const handlePlagiarismPolling = (): void => {
    if (isRunning) {
      fetchAssessmentPlagiarism(parsedAssessmentId);
    }
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
      downloadSubmissionPairResult={handleDownloadSubmissionPairResult}
      isLoading={isRunning}
      shareAssessmentResult={handleShareAssessmentResult}
      shareSubmissionPairResult={handleShareSubmissionPairResult}
      submissionPairs={data.submissionPairs}
    />
  );
};

export default AssessmentPlagiarismPage;
