import type { Operation } from 'store';
import type {
  ImportCommitSummary,
  ImportPreviewRequest,
  ImportPreviewResult,
  UpdateWeightsPayload,
} from 'types/course/gradebook';

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
  (title: string, maximumGrade: number): Operation =>
  async (dispatch) => {
    const response = await CourseAPI.gradebook.createExternal({
      title,
      maximumGrade,
    });
    dispatch(actions.applyCreatedExternal(response.data));
  };

export const renameExternalAssessment =
  (assessmentId: number, title: string): Operation =>
  async (dispatch) => {
    const response = await CourseAPI.gradebook.updateExternal(-assessmentId, {
      title,
    });
    dispatch(actions.updateExternalAssessment(response.data));
  };

export const updateExternalMaxGrade =
  (assessmentId: number, maximumGrade: number): Operation =>
  async (dispatch) => {
    const response = await CourseAPI.gradebook.updateExternal(-assessmentId, {
      maximumGrade,
    });
    dispatch(actions.updateExternalAssessment(response.data));
  };

export const deleteExternalAssessment =
  (assessmentId: number): Operation =>
  async (dispatch) => {
    await CourseAPI.gradebook.deleteExternal(-assessmentId);
    dispatch(actions.deleteExternalAssessment(assessmentId));
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

export const previewImport =
  (payload: ImportPreviewRequest): Operation<ImportPreviewResult> =>
  async () => {
    const response = await CourseAPI.gradebook.importPreview(payload);
    return response.data;
  };

export const commitImport =
  (
    payload: ImportPreviewRequest & { onConflict: 'keep' | 'replace' },
  ): Operation<ImportCommitSummary> =>
  async (dispatch) => {
    const response = await CourseAPI.gradebook.importCommit(payload);
    const refreshed = await CourseAPI.gradebook.index();
    dispatch(actions.saveGradebook(refreshed.data));
    return response.data;
  };

export default fetchGradebook;
