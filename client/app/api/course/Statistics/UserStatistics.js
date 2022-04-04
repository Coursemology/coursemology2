import BaseCourseAPI from '../Base';

// Contains individual-level statistics
export default class UserStatisticsAPI extends BaseCourseAPI {
  /**
   * Fetches the history of learning rate records for a given user.
   */
  fetchLearningRateRecords() {
    return this.getClient().get(
      `${this._getUrlPrefix()}/learning_rate_records`,
    );
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/statistics/user/${this.getCourseUserId()}`;
  }
}
