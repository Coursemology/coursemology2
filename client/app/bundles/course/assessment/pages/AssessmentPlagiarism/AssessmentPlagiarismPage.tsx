import { FC, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

import CourseAPI from 'api/course';
import { PLAGIARISM_JOB_POLL_INTERVAL_MS } from 'course/assessment/constants';
import {
  downloadSubmissionPairResult,
  shareAssessmentResult,
  shareSubmissionPairResult,
} from 'course/assessment/operations/plagiarism';
import { plagiarismActions } from 'course/assessment/reducers/plagiarism';
import { getJobStatus } from 'course/assessment/submission/actions';
import { ASSESSMENT_SIMILARITY_WORKFLOW_STATE } from 'lib/constants/sharedConstants';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';

import PlagiarismResultsTable from './PlagiarismResultsTable';
import { getAssessmentPlagiarism } from './selectors';

const AssessmentPlagiarismPage: FC = () => {
  const { assessmentId } = useParams();
  const parsedAssessmentId = parseInt(assessmentId!, 10);

  const dispatch = useAppDispatch();

  const { data } = useAppSelector(getAssessmentPlagiarism);
  const isRunning =
    data.status.workflowState === ASSESSMENT_SIMILARITY_WORKFLOW_STATE.running;

  const plagiarismPollerRef = useRef<NodeJS.Timeout | null>(null);

  const handlePlagiarismPolling = (): void => {
    if (!isRunning || !data.status.job?.jobUrl) {
      return;
    }

    getJobStatus(data.status.job.jobUrl).then((response) => {
      const onFailure = (): void => {
        dispatch(
          plagiarismActions.pollPlagiarismJobFinished({
            status: {
              workflowState: ASSESSMENT_SIMILARITY_WORKFLOW_STATE.failed,
              lastRunAt: new Date(),
            },
            submissionPairs: [],
          }),
        );
      };
      switch (response.data.status) {
        case 'submitted':
          break;
        case 'completed':
          CourseAPI.plagiarism
            .fetchAssessmentPlagiarism(parsedAssessmentId)
            .then((plagiarismResponse) => {
              dispatch(
                plagiarismActions.pollPlagiarismJobFinished(
                  plagiarismResponse.data,
                ),
              );
            })
            .catch(() => {
              onFailure();
            });
          break;
        case 'errored':
          onFailure();
          break;
        default:
          throw new Error('Unknown job status');
      }
    });
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
