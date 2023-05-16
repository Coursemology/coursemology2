import { Operation } from 'store';
import { LeaderboardData } from 'types/course/leaderboard';

import CourseAPI from 'api/course';

import { actions } from './store';

const fetchLeaderboard = (): Operation => {
  return async (dispatch) =>
    CourseAPI.leaderboard.index().then((response) => {
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
          actions.saveGroupLeaderboardPoints(data.groupleaderboardByExpPoints),
        );
      }
      if (data.groupleaderboardByAchievementCount) {
        dispatch(
          actions.saveGroupLeaderboardAchievement(
            data.groupleaderboardByAchievementCount,
          ),
        );
      }
    });
};

export default fetchLeaderboard;
