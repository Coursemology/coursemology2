import { AxiosError } from 'axios';
import { dispatch } from 'store';

import CourseAPI from 'api/course';
import { ASSESSMENT_SIMILARITY_WORKFLOW_STATE } from 'lib/constants/sharedConstants';
import pollJob from 'lib/helpers/jobHelpers';

import { plagiarismActions as actions } from '../reducers/plagiarism';

const PLAGIARISM_JOB_POLL_INTERVAL_MS = 5000 as const;

const startPollingPlagiarismJob = (
  jobUrl: string,
  assessmentId: number,
): void => {
  pollJob(
    jobUrl,
    async () => {
      const plagiarismData =
        await CourseAPI.plagiarism.fetchAssessmentPlagiarism(assessmentId);
      dispatch(actions.pollPlagiarismJobFinished(plagiarismData.data));
    },
    () => {
      dispatch(
        actions.pollPlagiarismJobFinished({
          status: {
            workflowState: ASSESSMENT_SIMILARITY_WORKFLOW_STATE.failed,
            updatedAt: new Date(),
          },
          submissionPairs: [],
        }),
      );
    },
    PLAGIARISM_JOB_POLL_INTERVAL_MS,
  );
};

export const fetchAssessmentPlagiarism = async (
  assessmentId: number,
): Promise<void> => {
  try {
    dispatch(actions.reset());
    const response =
      await CourseAPI.plagiarism.fetchAssessmentPlagiarism(assessmentId);
    dispatch(actions.initialize(response.data));
    if (
      response.data.status.workflowState ===
        ASSESSMENT_SIMILARITY_WORKFLOW_STATE.running &&
      response.data.status.job?.jobUrl
    ) {
      startPollingPlagiarismJob(response.data.status.job.jobUrl, assessmentId);
    }
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const downloadSubmissionPairResult = async (
  assessmentId: number,
  submissionPairId: number,
): Promise<{ html: string }> => {
  const response = await CourseAPI.plagiarism.downloadSubmissionPairResult(
    assessmentId,
    submissionPairId,
  );
  return response.data;
};

export const shareSubmissionPairResult = async (
  assessmentId: number,
  submissionPairId: number,
): Promise<{ url: string }> => {
  const response = await CourseAPI.plagiarism.shareSubmissionPairResult(
    assessmentId,
    submissionPairId,
  );
  return response.data;
};

export const shareAssessmentResult = async (
  assessmentId: number,
): Promise<{ url: string }> => {
  const response =
    await CourseAPI.plagiarism.shareAssessmentResult(assessmentId);
  return response.data;
};

export const runAssessmentPlagiarism = (
  assessmentId: number,
): Promise<void> => {
  return CourseAPI.plagiarism
    .runAssessmentPlagiarism(assessmentId)
    .then((response) => {
      dispatch(
        actions.runPlagiarismCheckSuccess({
          workflowState: ASSESSMENT_SIMILARITY_WORKFLOW_STATE.running,
          updatedAt: new Date(),
        }),
      );
      if (response.data.jobUrl) {
        startPollingPlagiarismJob(response.data.jobUrl, assessmentId);
      }
    });
};

export const runAssessmentsPlagiarism = async (
  assessmentId: number,
): Promise<void> => {
  try {
    await CourseAPI.plagiarism.runAssessmentsPlagiarism([assessmentId]);
  } catch (error) {
    if (error instanceof AxiosError)
      throw new Error(error.response?.data?.error);
    throw error;
  }
};
