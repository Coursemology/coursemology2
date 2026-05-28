import type { Operation } from 'store';

import CourseAPI from 'api/course';
import { UpdateWeightsPayload } from 'types/course/gradebook';

import { actions } from './store';

const fetchGradebook = (): Operation => async (dispatch) => {
  const response = await CourseAPI.gradebook.index();
  dispatch(actions.saveGradebook(response.data));
};

export const updateGradebookWeights =
  (weights: UpdateWeightsPayload['weights']): Operation =>
  async (dispatch) => {
    const response = await CourseAPI.gradebook.updateWeights({ weights });
    dispatch(actions.updateTabWeights(response.data.weights));
  };

export default fetchGradebook;
