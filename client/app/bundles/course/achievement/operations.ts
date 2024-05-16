import { AxiosResponse } from 'axios';
import { Operation } from 'store';
import { AchievementFormData } from 'types/course/achievements';

import CourseAPI from 'api/course';

import { actions } from './store';
import { SaveAchievementAction } from './types';

/**
 * Prepares and maps object attributes to a FormData object for an post/patch request.
 * Expected FormData attributes shape:
 *   { achievement :
 *     { title, description, badge: file }
 *   }
 */
const formatAttributes = (data: AchievementFormData): FormData => {
  const payload = new FormData();

  ['title', 'description', 'published'].forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      payload.append(`achievement[${field}]`, data[field]);
    }
  });
  if (data.badge.file) {
    payload.append('achievement[badge]', data.badge.file);
  }

  return payload;
};

export function fetchAchievements(): Operation {
  return async (dispatch) =>
    CourseAPI.achievements.index().then((response) => {
      const data = response.data;

      dispatch(
        actions.saveAchievementList(data.achievements, data.permissions),
      );
    });
}

export function loadAchievement(
  achievementId: number,
): Operation<SaveAchievementAction> {
  return async (dispatch) =>
    CourseAPI.achievements
      .fetch(achievementId)
      .then((response) =>
        dispatch(actions.saveAchievement(response.data.achievement)),
      );
}

export function loadAchievementCourseUsers(achievementId: number): Operation {
  return async (dispatch) =>
    CourseAPI.achievements
      .fetchAchievementCourseUsers(achievementId)
      .then((response) => {
        dispatch(
          actions.saveAchievementCourseUsers(
            achievementId,
            response.data.achievementCourseUsers,
          ),
        );
      });
}

export function createAchievement(data: AchievementFormData): Operation<
  AxiosResponse<{
    id: number;
  }>
> {
  const attributes = formatAttributes(data);
  return async () => CourseAPI.achievements.create(attributes);
}

export function updateAchievement(
  achievementId: number,
  data: AchievementFormData,
): Operation {
  const attributes = formatAttributes(data);
  return async (dispatch) =>
    CourseAPI.achievements
      .update(achievementId, attributes)
      .then((response) => {
        dispatch(actions.saveAchievement(response.data.achievement));
      });
}

export function deleteAchievement(achievementId: number): Operation {
  return async (dispatch) =>
    CourseAPI.achievements.delete(achievementId).then(() => {
      dispatch(actions.deleteAchievement(achievementId));
    });
}

export function awardAchievement(
  achievementId: number,
  data: number[],
): Operation {
  const attributes = { achievement: { course_user_ids: data } };
  return async (dispatch) =>
    CourseAPI.achievements
      .update(achievementId, attributes)
      .then((response) => {
        dispatch(actions.saveAchievement(response.data.achievement));
      });
}

export function updatePublishedAchievement(
  achievementId: number,
  data: boolean,
): Operation {
  const attributes = { achievement: { published: data } };
  return async (dispatch) =>
    CourseAPI.achievements
      .update(achievementId, attributes)
      .then((response) => {
        dispatch(actions.saveAchievement(response.data.achievement));
      });
}
