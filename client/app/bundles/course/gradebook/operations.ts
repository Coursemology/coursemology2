import type { Operation } from 'store';
import type { UpdateWeightsPayload } from 'types/course/gradebook';

import CourseAPI from 'api/course';

import { actions } from './store';

const fetchGradebook = (): Operation => async (dispatch) => {
  const response = await CourseAPI.gradebook.index();
  dispatch(actions.saveGradebook(response.data));
};

export const updateGradebookWeights =
  (weights: UpdateWeightsPayload['weights']): Operation =>
  async (dispatch) => {
    const response = await CourseAPI.gradebook.updateWeights({ weights });
    dispatch(actions.updateTabWeights(response.data));
  };

// Optimistic: apply the new grade immediately, then reconcile with the server.
// On failure, restore the previous value and rethrow so the caller can toast.
export const setExternalGrade =
  (assessmentId: number, studentId: number, grade: number | null): Operation =>
  async (dispatch, getState) => {
    const prev =
      getState().gradebook.submissions.find(
        (s) => s.studentId === studentId && s.assessmentId === assessmentId,
      )?.grade ?? null;
    dispatch(actions.setExternalGrade({ studentId, assessmentId, grade }));
    try {
      const response = await CourseAPI.gradebook.setExternalGrade(
        -assessmentId,
        {
          studentId,
          grade,
        },
      );
      dispatch(actions.setExternalGrade(response.data));
    } catch (error) {
      dispatch(
        actions.setExternalGrade({ studentId, assessmentId, grade: prev }),
      );
      throw error;
    }
  };

export default fetchGradebook;
