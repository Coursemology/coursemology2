import { AxiosResponse } from 'axios';
import { LeaderboardData } from 'types/course/leaderboard';
import BaseCourseAPI from './Base';

export default class LeaderboardsAPI extends BaseCourseAPI {
  _getUrlPrefix(): string {
    return `/courses/${this.getCourseId()}/leaderboard`;
  }

  /**
   * Fetches a list of achievements in a course.
   */
  index(): Promise<AxiosResponse<LeaderboardData>> {
    return this.getClient().get(this._getUrlPrefix());
  }
}
