import CourseAPI from 'api/course';
import { LeaderboardData } from 'types/course/leaderboard';
import { Operation } from 'types/store';
import * as actions from './actions';

const fetchLeaderboard = (): Operation<void> => {
  return async (dispatch) =>
    CourseAPI.leaderboard
      .index()
      .then((response) => {
        const data: LeaderboardData = response.data;
        dispatch(actions.saveLeaderboardPoints(data.usersPoints));
        if (data.usersCount) {
          dispatch(actions.saveLeaderboardAchievement(data.usersCount));
        }
        if (data.groupPoints) {
          dispatch(actions.saveGroupLeaderboardPoints(data.groupPoints));
        }
        if (data.groupCount) {
          dispatch(actions.saveGroupLeaderboardAchievement(data.groupCount));
        }
      })
      .catch((error) => {
        throw error;
      });
};

export default fetchLeaderboard;
