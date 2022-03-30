import CourseAPI from 'api/course';

import actionTypes from '../constants';

export function fetchGroupData(groupCategoryId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.FETCH_GROUPS_REQUEST });
    return CourseAPI.groups
      .fetch(groupCategoryId)
      .then((response) => {
        dispatch({
          type: actionTypes.FETCH_GROUPS_SUCCESS,
          groupCategory: response.data.groupCategory,
          groups: response.data.groups,
          canManageCategory: response.data.canManageCategory,
          canManageGroups: response.data.canManageGroups,
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.FETCH_GROUPS_FAILURE });
      });
  };
}

export function fetchCourseUsers(groupCategoryId) {
  return (dispatch) =>
    CourseAPI.groups
      .fetchCourseUsers(groupCategoryId)
      .then((response) => {
        dispatch({
          type: actionTypes.FETCH_USERS_SUCCESS,
          courseUsers: response.data.courseUsers,
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.FETCH_USERS_FAILURE });
      });
}
