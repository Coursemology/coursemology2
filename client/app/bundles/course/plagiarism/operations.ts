import { AxiosError } from 'axios';
import { Operation } from 'store';

import CourseAPI from 'api/course';

import { plagiarismAssessmentsActions } from './reducers/assessments';

export function fetchAssessments(): Operation {
  return async (dispatch) =>
    CourseAPI.plagiarism.fetchAssessments().then((response) => {
      const data = response.data;
      dispatch(plagiarismAssessmentsActions.updateAssessments(data));
    });
}

export function fetchPlagiarismChecks(): Operation {
  return async (dispatch) =>
    CourseAPI.plagiarism.fetchPlagiarismChecks().then((response) => {
      const data = response.data;
      dispatch(plagiarismAssessmentsActions.updatePlagiarismChecks(data));
    });
}

export function runAssessmentsPlagiarism(assessmentIds: number[]): Operation {
  return async (dispatch) => {
    try {
      const response =
        await CourseAPI.plagiarism.runAssessmentsPlagiarism(assessmentIds);
      dispatch(
        plagiarismAssessmentsActions.updatePlagiarismChecks(response.data),
      );
    } catch (error) {
      if (error instanceof AxiosError)
        throw new Error(error.response?.data?.error);
      throw error;
    }
  };
}
