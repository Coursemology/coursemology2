import { AxiosError } from 'axios';
import { dispatch } from 'store';
import { AncestorAssessmentStats } from 'types/course/statistics/assessmentStatistics';

import CourseAPI from 'api/course';

import { statisticsActions as actions } from '../reducers/statistics';

export const fetchAssessmentStatistics = async (
  assessmentId: number,
): Promise<void> => {
  try {
    const response =
      await CourseAPI.statistics.assessment.fetchAssessmentStatistics(
        assessmentId,
      );
    dispatch(actions.setAssessmentStatistics(response.data));
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const fetchSubmissionStatistics = async (
  assessmentId: number,
): Promise<void> => {
  try {
    const response =
      await CourseAPI.statistics.assessment.fetchSubmissionStatistics(
        assessmentId,
      );
    dispatch(actions.setSubmissionStatistics(response.data));
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const fetchAncestorInfo = async (
  assessmentId: number,
): Promise<void> => {
  try {
    const response =
      await CourseAPI.statistics.assessment.fetchAncestorInfo(assessmentId);
    dispatch(actions.setAncestorInfo(response.data));
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const fetchAncestorStatistics = async (
  ancestorId: number,
): Promise<AncestorAssessmentStats> => {
  const response =
    await CourseAPI.statistics.assessment.fetchAncestorStatistics(ancestorId);

  return response.data;
};

export const fetchLiveFeedbackStatistics = async (
  assessmentId: number,
): Promise<void> => {
  try {
    const response =
      await CourseAPI.statistics.assessment.fetchLiveFeedbackStatistics(
        assessmentId,
      );
    dispatch(actions.setLiveFeedbackStatistics(response.data));
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};
