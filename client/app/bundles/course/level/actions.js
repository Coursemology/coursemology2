import CourseAPI from 'api/course';
import actionTypes from 'course/level/constants';
import { setNotification } from 'lib/actions';

export function fetchLevels() {
  return (dispatch) => {
    dispatch({ type: actionTypes.LOAD_LEVELS_REQUEST });
    return CourseAPI.level.fetch()
      .then((response) => {
        dispatch({
          type: actionTypes.LOAD_LEVELS_SUCCESS,
          levelData: response.data,
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.LOAD_LEVELS_FAILURE });
      });
  };
}
