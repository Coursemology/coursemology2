import { AxiosError } from 'axios';
import { Operation } from 'store';

import CourseAPI from 'api/course';
import { ASSESSMENT_SIMILARITY_WORKFLOW_STATE } from 'lib/constants/sharedConstants';

import { plagiarismAssessmentsActions } from './reducers/assessments';

export function fetchAssessments(): Operation {
  return async (dispatch) =>
    CourseAPI.plagiarism.fetchAssessments().then((response) => {
      const data = response.data;
      dispatch(plagiarismAssessmentsActions.updateAssessments(data));
    });
}

export function updateAssessmentWorkflowState(
  assessmentId: number,
  workflowState: keyof typeof ASSESSMENT_SIMILARITY_WORKFLOW_STATE,
): Operation {
  return async (dispatch) => {
    dispatch(
      plagiarismAssessmentsActions.updateAssessmentWorkflowState({
        assessmentId,
        workflowState,
      }),
    );
  };
}

export const runAssessmentsPlagiarism = async (
  assessmentIds: number[],
): Promise<void> => {
  try {
    await CourseAPI.plagiarism.runAssessmentsPlagiarism(assessmentIds);
  } catch (error) {
    if (error instanceof AxiosError)
      throw new Error(error.response?.data?.error);
    throw error;
  }
};
