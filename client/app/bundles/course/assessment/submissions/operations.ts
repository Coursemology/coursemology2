import CourseAPI from 'api/course';
import { Operation } from 'types/store';
import * as actions from './actions';

export function fetchSubmissions(): Operation<void> {
  return async (dispatch) =>
    CourseAPI.submissions
      .index()
      .then((response) => {
        const data = response.data;
        dispatch(
          actions.saveSubmissionList(
            data.isGamified,
            data.submissionCount,
            data.submissions,
            data.tabs,
            data.filter,
            data.permissions,
          ),
        );
      })
      .catch((error) => {
        throw error;
      });
}

export function fetchMyStudentsPendingSubmissions(): Operation<void> {
  return async (dispatch) =>
    CourseAPI.submissions
      .pending(true)
      .then((response) => {
        const data = response.data;
        dispatch(
          actions.saveOverwriteSubmissionList(
            data.isGamified,
            data.submissionCount,
            data.submissions,
            data.tabs,
            data.filter,
            data.permissions,
          ),
        );
      })
      .catch((error) => {
        throw error;
      });
}

export function fetchAllStudentsPendingSubmissions(): Operation<void> {
  return async (dispatch) =>
    CourseAPI.submissions
      .pending(false)
      .then((response) => {
        const data = response.data;
        dispatch(
          actions.saveOverwriteSubmissionList(
            data.isGamified,
            data.submissionCount,
            data.submissions,
            data.tabs,
            data.filter,
            data.permissions,
          ),
        );
      })
      .catch((error) => {
        throw error;
      });
}

export function fetchCategorySubmissions(categoryId: number): Operation<void> {
  return async (dispatch) =>
    CourseAPI.submissions
      .category(categoryId)
      .then((response) => {
        const data = response.data;
        dispatch(
          actions.saveOverwriteSubmissionList(
            data.isGamified,
            data.submissionCount,
            data.submissions,
            data.tabs,
            data.filter,
            data.permissions,
          ),
        );
      })
      .catch((error) => {
        throw error;
      });
}

export function filterSubmissions(
  categoryId: number,
  assessmentId: number | null,
  groupId: number | null,
  userId: number | null,
  pageNum: number | null,
): Operation<void> {
  return async (dispatch) =>
    CourseAPI.submissions
      .filter(categoryId, assessmentId, groupId, userId, pageNum)
      .then((response) => {
        const data = response.data;
        dispatch(
          actions.saveOverwriteSubmissionList(
            data.isGamified,
            data.submissionCount,
            data.submissions,
            data.tabs,
            data.filter,
            data.permissions,
          ),
        );
      })
      .catch((error) => {
        throw error;
      });
}
