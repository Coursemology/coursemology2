import CourseAPI from 'api/course';
import { setNotification } from 'lib/actions';
import { setReactHookFormError } from 'lib/helpers/actions-helper';
import { getCourseId } from 'lib/helpers/url-helpers';
import actionTypes from '../constants';

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
  setError,
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
          setReactHookFormError(setError, error.response.data.errors);
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

export function updateGroupMembers(
  categoryId,
  groupData, // {groups: []}
  successMessage,
  failureMessage,
) {
  return (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_GROUP_MEMBERS_REQUEST });

    return CourseAPI.groups
      .updateGroupMembers(categoryId, groupData)
      .then((response) => {
        setNotification(successMessage)(dispatch);
        dispatch({ type: actionTypes.UPDATE_GROUP_MEMBERS_SUCCESS });
        setTimeout(() => {
          if (response.data && response.data.id) {
            window.location = `/courses/${getCourseId()}/groups/${
              response.data.id
            }`;
          }
        }, 200);
      })
      .catch(() => {
        dispatch({ type: actionTypes.UPDATE_GROUP_MEMBERS_FAILURE });
        setNotification(failureMessage)(dispatch);
      });
  };
}
