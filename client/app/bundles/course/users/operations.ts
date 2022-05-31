// import { AxiosResponse } from 'axios';
import CourseAPI from 'api/course';
import { Operation } from 'types/store';
import * as actions from './actions';
import { SaveUserAction } from './types';

export function fetchUsers(): Operation<void> {
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

export function loadUser(userId: number): Operation<SaveUserAction> {
  return async (dispatch) =>
    CourseAPI.users
      .fetch(userId)
      .then((response) => dispatch(actions.saveUser(response.data.user)));
}
