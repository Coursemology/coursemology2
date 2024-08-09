import { defineMessages } from 'react-intl';

import CourseAPI from 'api/course';
import { CrumbPath, DataHandle } from 'lib/hooks/router/dynamicNest';

const translations = defineMessages({
  header: {
    id: 'course.leaderboard.LeaderboardIndex.leaderboard',
    defaultMessage: 'Leaderboard',
  },
});

export const leaderboardHandle: DataHandle = (match) => {
  const courseId = match.params.courseId;

  return {
    getData: async (): Promise<CrumbPath> => {
      const { data } = await CourseAPI.leaderboard.index();

      return {
        activePath: `/courses/${courseId}/leaderboard`,
        content: { title: data.leaderboardTitle || translations.header },
      };
    },
  };
};
