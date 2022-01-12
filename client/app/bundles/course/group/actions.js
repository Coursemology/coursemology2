import CourseAPI from 'api/course';
import { setNotification } from 'lib/actions';
import actionTypes, { errorMessages } from './constants';

export function fetchGroupData() {
  return (dispatch) => {
    dispatch({ type: actionTypes.FETCH_GROUPS_REQUEST });
    return CourseAPI.groups
      .fetch()
      .then((response) => {
        dispatch({
          type: actionTypes.FETCH_GROUPS_SUCCESS,
          categories: response.data.categories,
          courseUsers: response.data.courseUsers,
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.FETCH_GROUPS_FAILURE });
        setNotification(errorMessages.fetchFailure)(dispatch);
      });
  };
}
