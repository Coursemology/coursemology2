import CourseAPI from 'api/course';
import { setNotification } from 'lib/actions';
import { getCourseId } from 'lib/helpers/url-helpers';
import { SubmissionError } from 'redux-form';
import actionTypes from './constants';

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
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.FETCH_GROUPS_FAILURE });
      });
  };
}

export function fetchCourseUsers() {
  return (dispatch) =>
    CourseAPI.groups
      .fetchCourseUsers()
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

export function createCategory(
  { name, description },
  successMessage,
  failureMessage,
) {
  return (dispatch) => {
    dispatch({ type: actionTypes.CREATE_CATEGORY_REQUEST });

    return CourseAPI.groups
      .createCategory({ name, description })
      .then((response) => {
        dispatch({
          type: actionTypes.CREATE_CATEGORY_SUCCESS,
        });
        setNotification(successMessage)(dispatch);
        setTimeout(() => {
          if (response.data && response.data.id) {
            window.location = `/courses/${getCourseId()}/groups/${
              response.data.id
            }`;
          }
        }, 200);
      })
      .catch((error) => {
        dispatch({
          type: actionTypes.CREATE_CATEGORY_FAILURE,
        });
        setNotification(failureMessage)(dispatch);

        if (error.response && error.response.data) {
          throw new SubmissionError(error.response.data.errors);
        }
      });
  };
}

export function updateCategory(
  id,
  { name, description },
  successMessage,
  failureMessage,
) {
  return (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_CATEGORY_REQUEST });

    return CourseAPI.groups
      .updateCategory(id, { name, description })
      .then((response) => {
        dispatch({
          type: actionTypes.UPDATE_CATEGORY_SUCCESS,
          groupCategory: response.data,
        });
        setNotification(successMessage)(dispatch);
      })
      .catch((error) => {
        dispatch({
          type: actionTypes.UPDATE_CATEGORY_FAILURE,
        });
        setNotification(failureMessage)(dispatch);

        if (error.response && error.response.data) {
          throw new SubmissionError(error.response.data.errors);
        }
      });
  };
}

export function deleteCategory(id, successMessage, failureMessage) {
  return (dispatch) =>
    CourseAPI.groups
      .deleteCategory(id)
      .then((response) => {
        setNotification(successMessage)(dispatch);
        setTimeout(() => {
          if (response.data && response.data.id) {
            window.location = `/courses/${getCourseId()}/groups`;
          }
        }, 200);
      })
      .catch(() => {
        setNotification(failureMessage)(dispatch);
      });
}

// Group data is of the form of { name: string, description: string? }[].
export function createGroups(id, groupData, getCreatedGroupsMessage) {
  return (dispatch) => {
    dispatch({ type: actionTypes.CREATE_GROUP_REQUEST });
    return CourseAPI.groups
      .createGroups(id, groupData)
      .then((response) => {
        dispatch({
          type: actionTypes.CREATE_GROUP_SUCCESS,
          groups: response.data.groups,
        });
        setNotification(
          getCreatedGroupsMessage(response.data.groups, response.data.failed),
        )(dispatch);
      })
      .catch(() => {
        dispatch({ type: actionTypes.CREATE_GROUP_FAILURE });
        setNotification(getCreatedGroupsMessage(0, groupData.groups.length))(
          dispatch,
        );
      });
  };
}

export function updateGroup(
  categoryId,
  groupId,
  { name, description },
  successMessage,
  failureMessage,
) {
  return (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_GROUP_REQUEST });

    return CourseAPI.groups
      .updateGroup(categoryId, groupId, { name, description })
      .then((response) => {
        dispatch({
          type: actionTypes.UPDATE_GROUP_SUCCESS,
          group: response.data.group,
        });
        setNotification(successMessage)(dispatch);
      })
      .catch((error) => {
        dispatch({
          type: actionTypes.UPDATE_GROUP_FAILURE,
        });
        setNotification(failureMessage)(dispatch);

        if (error.response && error.response.data) {
          throw new SubmissionError(error.response.data.errors);
        }
      });
  };
}

export function deleteGroup(
  categoryId,
  groupId,
  successMessage,
  failureMessage,
) {
  return (dispatch) =>
    CourseAPI.groups
      .deleteGroup(categoryId, groupId)
      .then((response) => {
        setNotification(successMessage)(dispatch);
        dispatch({
          type: actionTypes.DELETE_GROUP_SUCCESS,
          id: response.data.id,
        });
      })
      .catch(() => {
        setNotification(failureMessage)(dispatch);
      });
}
