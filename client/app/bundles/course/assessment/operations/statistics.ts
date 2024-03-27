import { AxiosError } from 'axios';
import { dispatch } from 'store';
import {
  AncestorAssessmentStats,
  MainAssessmentStats,
} from 'types/course/statistics/assessmentStatistics';

import CourseAPI from 'api/course';

import { statisticsActions as actions } from '../reducers/statistics';

export const fetchAssessmentStatistics = async (
  assessmentId: number,
): Promise<MainAssessmentStats> => {
  try {
    dispatch(actions.reset());
    const response =
      await CourseAPI.statistics.assessment.fetchMainStatistics(assessmentId);
    const data = response.data;
    dispatch(
      actions.initialize({
        assessment: data.assessment,
        submissions: data.submissions,
        ancestors: data.ancestors,
      }),
    );
    return data;
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
