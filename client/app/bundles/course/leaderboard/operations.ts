// import { AxiosResponse } from 'axios';
import CourseAPI from 'api/course';
import { LeaderboardData } from 'types/course/leaderboard';
import { Operation } from 'types/store';
import * as actions from './actions';

export function fetchLeaderboard(): Operation<void> {
  return async (dispatch) =>
    CourseAPI.leaderboard
      .index()
      .then((response) => {
        const data: LeaderboardData = response.data;
        console.log(data);
        dispatch(
          actions.saveLeaderboardPoints(data.usersPoints),
        );
        data.usersCount && 
          dispatch(actions.saveLeaderboardAchievement(data.usersCount));
      })
      .catch((error) => {
        throw error;
      });
}