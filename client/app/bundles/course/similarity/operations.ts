import { AxiosError } from 'axios';
import { Operation } from 'store';

import CourseAPI from 'api/course';

import { similarityAssessmentsActions } from './reducers/assessments';

export function fetchAssessments(): Operation {
  return async (dispatch) =>
    CourseAPI.similarity.fetchAssessments().then((response) => {
      const data = response.data;
      dispatch(similarityAssessmentsActions.updateAssessments(data));
    });
}

export const runAssessmentsSimilarity = async (
  assessmentIds: number[],
): Promise<void> => {
  try {
    await CourseAPI.similarity.runAssessmentsSimilarity(assessmentIds);
  } catch (error) {
    if (error instanceof AxiosError)
      throw new Error(error.response?.data?.error);
    throw error;
  }
};
