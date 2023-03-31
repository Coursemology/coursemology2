import CourseAPI from 'api/course';

import actionTypes from '../constants';

export default function fetchLogs() {
  return (dispatch) => {
    dispatch({ type: actionTypes.FETCH_LOGS_REQUEST });

    return CourseAPI.assessment.logs
      .index()
      .then((response) => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.FETCH_LOGS_SUCCESS,
          payload: data,
        });
      })
      .catch(() => dispatch({ type: actionTypes.FETCH_LOGS_FAILURE }));
  };
}
