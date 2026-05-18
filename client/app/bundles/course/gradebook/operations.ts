import { Operation } from 'store';

import CourseAPI from 'api/course';

import { actions } from './store';

const fetchGradebook = (): Operation => async (dispatch) =>
  CourseAPI.gradebook.index().then((response) => {
    const { tabs, assessments, students } = response.data;
    dispatch(actions.saveGradebook(tabs, assessments, students));
  });

export default fetchGradebook;
