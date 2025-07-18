import { AxiosError } from 'axios';
import { dispatch } from 'store';

import CourseAPI from 'api/course';
import { ASSESSMENT_SIMILARITY_WORKFLOW_STATE } from 'lib/constants/sharedConstants';
import pollJob from 'lib/helpers/jobHelpers';

import { similarityActions as actions } from '../reducers/similarity';

const PLAGIARISM_JOB_POLL_INTERVAL_MS = 5000 as const;

const startPollingSimilarityJob = (
  jobUrl: string,
  assessmentId: number,
): void => {
  pollJob(
    jobUrl,
    async () => {
      const similarityData =
        await CourseAPI.similarity.fetchAssessmentSimilarity(assessmentId);
      dispatch(actions.pollSimilarityJobFinished(similarityData.data));
    },
    () => {
      dispatch(
        actions.pollSimilarityJobFinished({
          status: {
            workflowState: ASSESSMENT_SIMILARITY_WORKFLOW_STATE.failed,
            lastRunAt: new Date(),
          },
          submissionPairs: [],
        }),
      );
    },
    PLAGIARISM_JOB_POLL_INTERVAL_MS,
  );
};

export const fetchAssessmentSimilarity = async (
  assessmentId: number,
): Promise<void> => {
  try {
    dispatch(actions.reset());
    const response =
      await CourseAPI.similarity.fetchAssessmentSimilarity(assessmentId);
    dispatch(actions.initialize(response.data));
    if (
      response.data.status.workflowState ===
        ASSESSMENT_SIMILARITY_WORKFLOW_STATE.running &&
      response.data.status.job?.jobUrl
    ) {
      startPollingSimilarityJob(response.data.status.job.jobUrl, assessmentId);
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
  const response = await CourseAPI.similarity.downloadSubmissionPairResult(
    assessmentId,
    submissionPairId,
  );
  return response.data;
};

export const shareSubmissionPairResult = async (
  assessmentId: number,
  submissionPairId: number,
): Promise<{ url: string }> => {
  const response = await CourseAPI.similarity.shareSubmissionPairResult(
    assessmentId,
    submissionPairId,
  );
  return response.data;
};

export const shareAssessmentResult = async (
  assessmentId: number,
): Promise<{ url: string }> => {
  const response =
    await CourseAPI.similarity.shareAssessmentResult(assessmentId);
  return response.data;
};

export const runAssessmentsSimilarity = async (
  assessmentId: number,
): Promise<void> => {
  try {
    await CourseAPI.similarity.runAssessmentsSimilarity([assessmentId]);
  } catch (error) {
    if (error instanceof AxiosError)
      throw new Error(error.response?.data?.error);
    throw error;
  }
};
