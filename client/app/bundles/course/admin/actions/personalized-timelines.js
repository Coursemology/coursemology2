import CourseAPI from 'api/course';
import actionTypes from '../constants';

const removeTime = (date) => {
  const time = date.getTime() % (3600 * 1000 * 24);
  return new Date(date - time);
};

// eslint-disable-next-line import/prefer-default-export
export function fetchLearningRates() {
  return (dispatch) => {
    dispatch({ type: actionTypes.FETCH_LEARNING_RATES_REQUEST });
    return CourseAPI.admin.personalizedTimeline
      .fetchLearningRates()
      .then((response) => {
        dispatch({
          type: actionTypes.FETCH_LEARNING_RATES_SUCCESS,
          learningRateRecords: response.data.learningRateRecords.map((r) => ({
            id: parseInt(r.id, 10),
            records: r.records.map((r2) => ({
              createdAt: removeTime(new Date(r2.createdAt)),
              learningRate: Math.floor(100 / parseFloat(r2.learningRate)),
            })),
          })),
        });
      })
      .catch(() => {
        dispatch({
          type: actionTypes.FETCH_LEARNING_RATES_FAILURE,
        });
      });
  };
}
