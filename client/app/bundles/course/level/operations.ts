import { Operation } from 'store';

import CourseAPI from 'api/course';
import { setNotification } from 'lib/actions';

import { actions } from './store';
import { LevelsInfo } from './types';

export function fetchLevels(): Operation {
  return async (dispatch) => {
    return CourseAPI.level.fetch().then((response) => {
      dispatch(
        actions.saveLevelsData({
          levels: response.data.levels,
          canManage: response.data.canManage,
        }),
      );
    });
  };
}

export function saveLevels(
  levels: LevelsInfo[],
  successMessage,
  failureMessage,
): Operation {
  const sortedLevels = levels.sort(
    (level1, level2) =>
      level1.experiencePointsThreshold - level2.experiencePointsThreshold,
  );
  const experiencePointsThresholds = sortedLevels.map(
    (level) => level.experiencePointsThreshold,
  );

  return async (dispatch) => {
    try {
      await CourseAPI.level.save(experiencePointsThresholds);
      dispatch(
        actions.saveLevelsData({
          levels: sortedLevels,
          canManage: true,
        }),
      );
      setNotification(successMessage)(dispatch);
    } catch {
      setNotification(failureMessage)(dispatch);
    }
  };
}
