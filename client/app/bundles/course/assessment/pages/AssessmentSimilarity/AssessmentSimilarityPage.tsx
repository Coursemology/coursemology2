import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';

import {
  downloadSubmissionPairResult,
  runAssessmentSimilarity,
  shareAssessmentResult,
  shareSubmissionPairResult,
} from 'course/assessment/operations/similarity';
import { ASSESSMENT_SIMILARITY_WORKFLOW_STATE } from 'lib/constants/sharedConstants';
import { useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { getAssessmentSimilarity } from './selectors';
import SimilarityCheckStatus from './SimilarityCheckStatus';
import SimilarityResultsTable from './SimilarityResultsTable';

const translations = defineMessages({
  startSuccess: {
    id: 'course.assessment.similarity.startSuccess',
    defaultMessage: 'Similarity check started successfully',
  },
  startError: {
    id: 'course.assessment.similarity.startError',
    defaultMessage: 'Similarity check failed to start',
  },
});

const AssessmentSimilarityPage: FC = () => {
  const { assessmentId } = useParams();
  const parsedAssessmentId = parseInt(assessmentId!, 10);

  const { t } = useTranslation();

  const { data } = useAppSelector(getAssessmentSimilarity);
  const isRunning =
    data.status.workflowState === ASSESSMENT_SIMILARITY_WORKFLOW_STATE.running;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartSimilarityCheck = (): void => {
    setIsSubmitting(true);
    runAssessmentSimilarity(parsedAssessmentId)
      .then(() => {
        toast.success(t(translations.startSuccess));
      })
      .catch(() => {
        toast.error(t(translations.startError));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

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
    <>
      <div className="m-6">
        <SimilarityCheckStatus
          isSubmitting={isSubmitting}
          startSimilarityCheck={handleStartSimilarityCheck}
          status={data.status}
        />
      </div>
      <SimilarityResultsTable
        downloadSubmissionPairResult={handleDownloadSubmissionPairResult}
        isLoading={isRunning}
        shareAssessmentResult={handleShareAssessmentResult}
        shareSubmissionPairResult={handleShareSubmissionPairResult}
        submissionPairs={data.submissionPairs}
      />
    </>
  );
};

export default AssessmentSimilarityPage;
