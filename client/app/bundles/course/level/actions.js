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

export function updateExpThreshold(levelNumber, newValue) {
  return (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_EXP_THRESHOLD, payload: { levelNumber, newValue } });
  };
}

export function sortLevels() {
  return (dispatch) => {
    dispatch({ type: actionTypes.SORT_LEVELS });
  };
}

export function addLevel() {
  return (dispatch) => {
    dispatch({ type: actionTypes.ADD_LEVEL });
  };
}

export function deleteLevel(levelNumber) {
  return (dispatch) => {
    dispatch({ type: actionTypes.DELETE_LEVEL, payload: { levelNumber } });
  };
}

export function saveLevels(levels, successMessage, failureMessage) {
  return (dispatch) => {
    dispatch({ type: actionTypes.SAVE_LEVELS });
    return CourseAPI.level.save(levels)
      .then(() => {
        setNotification(successMessage)(dispatch);
        dispatch({ type: actionTypes.SAVE_LEVELS_SUCCESS });
      })
      .catch(() => {
        setNotification(failureMessage)(dispatch);
        dispatch({ type: actionTypes.SAVE_LEVELS_FAILURE });
      });
  };
}
