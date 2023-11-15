import { AxiosResponse } from 'axios';
import { PersonalTimeListData } from 'types/course/personalTimes';

import BaseCourseAPI from './Base';

export default class PersonalTimesAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}`;
  }

  /**
   * Fetches personal time data from specified user
   */
  index(userId: number): Promise<
    AxiosResponse<{
      personalTimes: PersonalTimeListData[];
    }>
  > {
    return this.client.get(`${this.#urlPrefix}/users/${userId}/personal_times`);
  }

  /**
   * Recomputes personal time for specified user
   * @returns new personal time data
   */
  recompute(userId: number): Promise<
    AxiosResponse<{
      personalTimes: PersonalTimeListData[];
    }>
  > {
    const url = `${this.#urlPrefix}/users/${userId}/personal_times`;
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    const payload = new FormData();
    payload.append('course_user[user_id]', userId.toString());
    return this.client.postForm(`${url}/recompute`, payload, config);
  }

  /**
   * Update personal time for user
   * @returns new personal time data
   */
  update(
    data: FormData,
    userId: number,
  ): Promise<AxiosResponse<PersonalTimeListData>> {
    const url = `${this.#urlPrefix}/users/${userId}/personal_times`;
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: {
        ...data,
        user_id: userId,
      },
    };
    return this.client.post(url, data, config);
  }

  /**
   * Delete personal time for user
   * @returns new personal time data
   */
  delete(personalTimeId: number, userId: number): Promise<AxiosResponse<void>> {
    const url = `${this.#urlPrefix}/users/${userId}/personal_times/${personalTimeId}`;
    return this.client.delete(url);
  }
}
