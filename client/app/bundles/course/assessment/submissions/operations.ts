import { Operation } from 'types/store';

import CourseAPI from 'api/course';

import * as actions from './actions';

export function fetchSubmissions(): Operation<void> {
  return async (dispatch) =>
    CourseAPI.submissions.index().then((response) => {
      const data = response.data;
      dispatch(
        actions.saveSubmissionList(
          data.submissions,
          data.metaData,
          data.permissions,
          false,
        ),
      );
    });
}

export function fetchMyStudentsPendingSubmissions(): Operation<void> {
  return async (dispatch) =>
    CourseAPI.submissions.pending(true).then((response) => {
      const data = response.data;
      dispatch(
        actions.saveSubmissionList(
          data.submissions,
          data.metaData,
          data.permissions,
          true,
        ),
      );
    });
}

export function fetchAllStudentsPendingSubmissions(): Operation<void> {
  return async (dispatch) =>
    CourseAPI.submissions.pending(false).then((response) => {
      const data = response.data;
      dispatch(
        actions.saveSubmissionList(
          data.submissions,
          data.metaData,
          data.permissions,
          true,
        ),
      );
    });
}

export function fetchCategorySubmissions(categoryId: number): Operation<void> {
  return async (dispatch) =>
    CourseAPI.submissions.category(categoryId).then((response) => {
      const data = response.data;
      dispatch(
        actions.saveSubmissionList(
          data.submissions,
          data.metaData,
          data.permissions,
          true,
        ),
      );
    });
}

export function filterSubmissions(
  categoryId: number | null,
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
          actions.saveSubmissionList(
            data.submissions,
            data.metaData,
            data.permissions,
            true,
          ),
        );
      });
}

export function filterPendingSubmissions(
  myStudents: boolean,
  pageNum: number | null,
): Operation<void> {
  return async (dispatch) =>
    CourseAPI.submissions
      .filterPending(myStudents, pageNum)
      .then((response) => {
        const data = response.data;
        dispatch(
          actions.saveSubmissionList(
            data.submissions,
            data.metaData,
            data.permissions,
            true,
          ),
        );
      });
}
