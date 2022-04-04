import CourseAPI from 'api/course';
import actionTypes from '../constants';

// eslint-disable-next-line import/prefer-default-export
export function fetchUserStatistics(failureMessage) {
  return (dispatch) => {
    dispatch({ type: actionTypes.LOAD_USER_STATISTICS_REQUEST });
    return CourseAPI.statistics.user
      .fetchLearningRateRecords()
      .then((response) => {
        dispatch({
          type: actionTypes.LOAD_USER_STATISTICS_SUCCESS,
          learningRateRecords: response.data.learningRateRecords.map((r) => ({
            id: parseInt(r.id, 10),
            learningRate: Math.round(10000 / parseFloat(r.learningRate)) / 100,
            createdAt: new Date(r.createdAt),
          })),
        }).catch(() => {
          dispatch({
            type: actionTypes.LOAD_USER_STATISTICS_FAILURE,
            message: failureMessage,
          });
        });
      });
  };
}
