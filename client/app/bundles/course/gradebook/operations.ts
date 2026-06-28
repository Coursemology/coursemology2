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

export const createExternalAssessment =
  (
    title: string,
    maximumGrade: number,
    floorAtZero: boolean,
    capAtMaximum: boolean,
    weight?: number,
  ): Operation =>
  async (dispatch) => {
    const response = await CourseAPI.gradebook.createExternal({
      title,
      maximumGrade,
      floorAtZero,
      capAtMaximum,
      ...(weight === undefined ? {} : { weight }),
    });
    dispatch(actions.applyCreatedExternal(response.data));
  };

export const editExternalAssessment =
  (
    assessmentId: number,
    patch: {
      title?: string;
      maximumGrade?: number;
      floorAtZero?: boolean;
      capAtMaximum?: boolean;
      weight?: number;
    },
  ): Operation =>
  async (dispatch) => {
    const response = await CourseAPI.gradebook.updateExternal(
      -assessmentId,
      patch,
    );
    dispatch(actions.updateExternalAssessment(response.data));
  };

export const deleteExternalAssessment =
  (assessmentId: number): Operation =>
  async (dispatch) => {
    await CourseAPI.gradebook.deleteExternal(-assessmentId);
    dispatch(actions.deleteExternalAssessment(assessmentId));
  };

// Optimistic: apply the new external order immediately, persist via one PUT.
// On failure, restore the previous order and rethrow so the caller can toast.
// `orderedAssessmentIds` are the negative serialized ids (store ids); the API
// wants the positive external ids, so we negate them.
export const reorderExternalAssessments =
  (orderedAssessmentIds: number[]): Operation =>
  async (dispatch, getState) => {
    const prevOrder = getState()
      .gradebook.assessments.filter((a) => a.external)
      .map((a) => a.id);
    dispatch(actions.reorderExternalAssessments(orderedAssessmentIds));
    try {
      await CourseAPI.gradebook.reorderExternals({
        orderedIds: orderedAssessmentIds.map((id) => -id),
      });
    } catch (error) {
      dispatch(actions.reorderExternalAssessments(prevOrder));
      throw error;
    }
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
