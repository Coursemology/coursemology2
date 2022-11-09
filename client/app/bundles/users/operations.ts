import { Operation } from 'types/store';

import GlobalUsersAPI from 'api/Users';

import * as actions from './actions';

// eslint-disable-next-line import/prefer-default-export
export function fetchUser(userId: number): Operation<void> {
  return async (dispatch) =>
    GlobalUsersAPI.users.fetch(userId).then((response) => {
      const data = response.data;
      dispatch(actions.saveUser(data.user));
      dispatch(actions.saveCourses(data.currentCourses, 'current'));
      dispatch(actions.saveCourses(data.completedCourses, 'completed'));
      dispatch(actions.saveInstances(data.instances));
    });
}
