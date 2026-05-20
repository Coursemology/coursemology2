import CourseAPI from 'api/course';
import type { Operation } from 'store';

import { actions } from './store';

const fetchGradebook = (): Operation =>
  async (dispatch) => {
    const response = await CourseAPI.gradebook.index();
    dispatch(actions.saveGradebook(response.data));
  };

export default fetchGradebook;
