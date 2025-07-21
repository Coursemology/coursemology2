import { FC } from 'react';
import { useParams } from 'react-router-dom';

import {
  downloadSubmissionPairResult,
  shareAssessmentResult,
  shareSubmissionPairResult,
} from 'course/assessment/operations/similarity';
import { ASSESSMENT_SIMILARITY_WORKFLOW_STATE } from 'lib/constants/sharedConstants';
import { useAppSelector } from 'lib/hooks/store';

import { getAssessmentSimilarity } from './selectors';
import SimilarityResultsTable from './SimilarityResultsTable';

const AssessmentSimilarityPage: FC = () => {
  const { assessmentId } = useParams();
  const parsedAssessmentId = parseInt(assessmentId!, 10);

  const { data } = useAppSelector(getAssessmentSimilarity);
  const isRunning =
    data.status.workflowState === ASSESSMENT_SIMILARITY_WORKFLOW_STATE.running;

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
    <SimilarityResultsTable
      downloadSubmissionPairResult={handleDownloadSubmissionPairResult}
      isLoading={isRunning}
      shareAssessmentResult={handleShareAssessmentResult}
      shareSubmissionPairResult={handleShareSubmissionPairResult}
      submissionPairs={data.submissionPairs}
    />
  );
};

export default AssessmentSimilarityPage;
