import { Operation } from 'store';

import GlobalAPI from 'api';

import { actions } from './store';

export function fetchUser(userId: number): Operation {
  return async (dispatch) =>
    GlobalAPI.users.fetch(userId).then((response) => {
      const data = response.data;
      dispatch(actions.saveUser(data.user));
      dispatch(actions.saveCourses(data.currentCourses, 'current'));
      dispatch(actions.saveCourses(data.completedCourses, 'completed'));
      dispatch(actions.saveInstances(data.instances));
    });
}
