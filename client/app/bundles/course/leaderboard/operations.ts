// import { AxiosResponse } from 'axios';
import CourseAPI from 'api/course';
import { Operation } from 'types/store';
// import * as actions from './actions';

export function fetchLeaderboard(): Operation<void> {
  return async () =>
    CourseAPI.leaderboard
      .index()
      .then((response) => {
        const data = response.data;
        console.log(data);
        // dispatch(
        //   actions.saveAchievementList(data.achievements, data.permissions),
        // );
      })
      .catch((error) => {
        throw error;
      });
}