/* eslint-disable import/prefer-default-export */
import CourseAPI from 'api/course';
import actionTypes from '../../constants';
import { mapCategoriesData } from '../../utils';

/**
 * Fetches data for all tabs in the given course through the categories API.
 *
 *  * Sample Output (Ordered by Category weights, then Tab weights):
 *  [
 *    { tab_id: 1, title: 'Missions > Easy' },
 *    { tab_id: 2, title: 'Missions > Dangerous' },
 *    { tab_id: 6, title: 'Trainings > Lectures' },
 *    { tab_id: 7, title: 'Trainings > Practice' }
 *  ]
 */
export function fetchTabs(failureMessage) {
  return (dispatch) => {
    dispatch({ type: actionTypes.FETCH_TABS_REQUEST });
    return CourseAPI.assessment.categories
      .fetchCategories()
      .then((response) => {
        dispatch({
          type: actionTypes.FETCH_TABS_SUCCESS,
          tabs: mapCategoriesData(response.data.categories),
        });
      })
      .catch(() => {
        dispatch({
          type: actionTypes.FETCH_TABS_FAILURE,
          message: failureMessage,
        });
      });
  };
}
