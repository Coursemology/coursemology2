import { getIdFromUnknown } from 'utilities';

import CourseAPI from 'api/course';
import { DataHandle } from 'lib/hooks/router/dynamicNest';

const getAchievementTitle = async (achievementId: number): Promise<string> => {
  const { data } = await CourseAPI.achievements.fetch(achievementId);
  return data.achievement.title;
};

export const achievementHandle: DataHandle = (match) => {
  const achievementId = getIdFromUnknown(match.params?.achievementId);
  if (!achievementId)
    throw new Error(`Invalid achievement id: ${achievementId}`);

  return { getData: () => getAchievementTitle(achievementId) };
};
