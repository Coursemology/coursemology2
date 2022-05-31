// import { AxiosResponse } from 'axios';
import CourseAPI from 'api/course';
import { Operation } from 'types/store';
import * as actions from './actions';

export function fetchUsers(): Operation<void> {
  console.log('calling fetchusers in operations');
  return async (dispatch) =>
    CourseAPI.users
      .index()
      .then((response) => {
        const data = response.data;

        dispatch(actions.saveUsersList(data.users, data.permissions));
      })
      .catch((error) => {
        throw error;
      });
}
