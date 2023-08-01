import { AxiosResponse } from 'axios';
import {
  AchievementCourseUserData,
  AchievementData,
  AchievementListData,
  AchievementPermissions,
} from 'types/course/achievements';

import { APIResponse } from 'api/types';

import BaseCourseAPI from './Base';

export default class AchievementsAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/achievements`;
  }

  /**
   * Fetches a list of achievements in a course.
   */
  index(): APIResponse<{
    achievements: AchievementListData[];
    permissions: AchievementPermissions;
  }> {
    return this.client.get(this.#urlPrefix);
  }

  /**
   * Fetches an achievement.
   */
  fetch(id: number): APIResponse<{ achievement: AchievementData }> {
    return this.client.get(`${this.#urlPrefix}/${id}`);
  }

  /**
   * Fetches course users related to an achievement.
   */
  fetchAchievementCourseUsers(id: number): APIResponse<{
    achievementCourseUsers: AchievementCourseUserData[];
  }> {
    return this.client.get(`${this.#urlPrefix}/${id}/achievement_course_users`);
  }

  /**
   * Creates an achievement.
   *
   * @param {object} params - params in the format of:
   *   {
   *     achievement: { :title, :description, etc }
   *   }
   */
  create(params: FormData): APIResponse<{ id: number }> {
    return this.client.post(this.#urlPrefix, params);
  }

  /**
   * Updates the achievement.
   *
   * @param {number} id
   * @param {object} params - params in the format of { achievement: { :title, :description, etc } }
   */
  update(
    id: number,
    params: FormData | object,
  ): APIResponse<{ achievement: AchievementData }> {
    return this.client.patch(`${this.#urlPrefix}/${id}`, params);
  }

  /**
   * Deletes an achievement.
   *
   * @param {number} achievementId
   */
  delete(achievementId: number): Promise<AxiosResponse> {
    return this.client.delete(`${this.#urlPrefix}/${achievementId}`);
  }

  reorder(ordering: string): APIResponse {
    return this.client.post(`${this.#urlPrefix}/reorder`, ordering);
  }
}
