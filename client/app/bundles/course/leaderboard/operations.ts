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
        dispatch(
          actions.saveLeaderboardSettings({
            leaderboardTitle: data.leaderboardTitle,
            groupleaderboardTitle: data.groupleaderboardTitle,
          }),
        );
        dispatch(actions.saveLeaderboardPoints(data.leaderboardByExpPoints));
        if (data.leaderboardByAchievementCount) {
          dispatch(
            actions.saveLeaderboardAchievement(
              data.leaderboardByAchievementCount,
            ),
          );
        }
        if (data.groupleaderboardByExpPoints) {
          dispatch(
            actions.saveGroupLeaderboardPoints(
              data.groupleaderboardByExpPoints,
            ),
          );
        }
        if (data.groupleaderboardByAchievementCount) {
          dispatch(
            actions.saveGroupLeaderboardAchievement(
              data.groupleaderboardByAchievementCount,
            ),
          );
        }
      })
      .catch((error) => {
        throw error;
      });
};

export default fetchLeaderboard;
