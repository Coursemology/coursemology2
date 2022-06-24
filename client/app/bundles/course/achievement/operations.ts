import { AxiosResponse } from 'axios';
import CourseAPI from 'api/course';
import { AchievementFormData } from 'types/course/achievements';
import { Operation } from 'types/store';
import * as actions from './actions';
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

export function fetchAchievements(): Operation<void> {
  return async (dispatch) =>
    CourseAPI.achievements
      .index()
      .then((response) => {
        const data = response.data;

        dispatch(
          actions.saveAchievementList(data.achievements, data.permissions),
        );
      })
      .catch((error) => {
        throw error;
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

export function loadAchievementCourseUsers(
  achievementId: number,
): Operation<void> {
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
      })
      .catch((error) => {
        throw error;
      });
}

export function createAchievement(data: AchievementFormData): Operation<
  AxiosResponse<{
    id: number;
  }>
> {
  const attributes = formatAttributes(data);
  return async (_) => CourseAPI.achievements.create(attributes);
}

export function updateAchievement(
  achievementId: number,
  data: AchievementFormData,
): Operation<AxiosResponse<unknown, unknown>> {
  const attributes = formatAttributes(data);
  return async (_) => CourseAPI.achievements.update(achievementId, attributes);
}

export function deleteAchievement(achievementId: number): Operation<void> {
  return async (dispatch) =>
    CourseAPI.achievements.delete(achievementId).then(() => {
      dispatch(actions.deleteAchievement(achievementId));
    });
}

export function awardAchievement(
  achievementId: number,
  data: number[],
): Operation<void> {
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
): Operation<void> {
  const attributes = { achievement: { published: data } };
  return async (dispatch) =>
    CourseAPI.achievements
      .update(achievementId, attributes)
      .then((response) => {
        dispatch(actions.saveAchievement(response.data.achievement));
      });
}
