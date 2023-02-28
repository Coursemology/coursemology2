import { AxiosResponse } from 'axios';
import { LeaderboardData } from 'types/course/leaderboard';

import BaseCourseAPI from './Base';

export default class LeaderboardsAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/leaderboard`;
  }

  /**
   * Fetches a list of leaderboard data in a course.
   */
  index(): Promise<AxiosResponse<LeaderboardData>> {
    return this.client.get(this.#urlPrefix);
  }
}
