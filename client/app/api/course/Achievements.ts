import { AxiosResponse } from 'axios';
import {
  AchievementCourseUserData,
  AchievementData,
  AchievementListData,
  AchievementPermissions,
} from 'types/course/achievements';

import BaseCourseAPI from './Base';

export default class AchievementsAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.getCourseId()}/achievements`;
  }

  /**
   * Fetches a list of achievements in a course.
   */
  index(): Promise<
    AxiosResponse<{
      achievements: AchievementListData[];
      permissions: AchievementPermissions;
    }>
  > {
    return this.getClient().get(this.#urlPrefix);
  }

  /**
   * Fetches an achievement.
   */
  fetch(achievementId: number): Promise<
    AxiosResponse<{
      achievement: AchievementData;
    }>
  > {
    return this.getClient().get(`${this.#urlPrefix}/${achievementId}`);
  }

  /**
   * Fetches course users related to an achievement.
   *
   * @param {number} achievementId
   * @return {Promise}
   */
  fetchAchievementCourseUsers(achievementId: number): Promise<
    AxiosResponse<{
      achievementCourseUsers: AchievementCourseUserData[];
    }>
  > {
    return this.getClient().get(
      `${this.#urlPrefix}/${achievementId}/achievement_course_users`,
    );
  }

  /**
   * Creates an achievement.
   *
   * @param {object} params - params in the format of:
   *   {
   *     achievement: { :title, :description, etc }
   *   }
   * @return {Promise}
   * success response: { :id } - ID of created achievement.
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  create(params: FormData): Promise<
    AxiosResponse<{
      id: number;
    }>
  > {
    return this.getClient().post(this.#urlPrefix, params);
  }

  /**
   * Updates the achievement.
   *
   * @param {number} achievementId
   * @param {object} params - params in the format of { achievement: { :title, :description, etc } }
   * @return {Promise}
   * success response: {}
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  update(
    achievementId: number,
    params: FormData | object,
  ): Promise<AxiosResponse> {
    return this.getClient().patch(
      `${this.#urlPrefix}/${achievementId}`,
      params,
    );
  }

  /**
   * Deletes an achievement.
   *
   * @param {number} achievementId
   * @return {Promise}
   * success response: {}
   * error response: {}
   */
  delete(achievementId: number): Promise<AxiosResponse> {
    return this.getClient().delete(`${this.#urlPrefix}/${achievementId}`);
  }
}
