import BaseCourseAPI from '../Base';

// Contains individual assessment-level statistics.
export default class AssessmentStatisticsAPI extends BaseCourseAPI {
  /**
   * Fetches the statistics for a specific individual assessment.
   *
   * This is used both for an assessment and for its ancestors.
   */
  fetchStatistics(assessmentId) {
    return this.getClient().get(`${this._getUrlPrefix()}/${assessmentId}`);
  }

  /**
   * Fetches the ancestors for a specific individual assessment.
   */
  fetchAncestors(assessmentId) {
    return this.getClient().get(
      `${this._getUrlPrefix()}/${assessmentId}/ancestors`,
    );
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/statistics/assessment`;
  }
}
