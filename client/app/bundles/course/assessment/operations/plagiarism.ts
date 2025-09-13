import { AxiosError } from 'axios';
import { dispatch } from 'store';
import { PlagiarismCheck } from 'types/course/plagiarism';

import CourseAPI from 'api/course';

import { plagiarismActions as actions } from '../reducers/plagiarism';

export const fetchAssessmentPlagiarism = async (
  assessmentId: number,
): Promise<void> => {
  try {
    dispatch(actions.reset());
    const response =
      await CourseAPI.plagiarism.fetchAssessmentPlagiarism(assessmentId);
    dispatch(actions.initialize(response.data));
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

export const runAssessmentsPlagiarism = async (
  assessmentId: number,
): Promise<PlagiarismCheck[]> => {
  try {
    const response = await CourseAPI.plagiarism.runAssessmentsPlagiarism([
      assessmentId,
    ]);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      throw new Error(error.response?.data?.error);
    throw error;
  }
};
