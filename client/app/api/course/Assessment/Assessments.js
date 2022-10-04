import BaseCourseAPI from './Base';

export default class AssessmentsAPI extends BaseCourseAPI {
  index() {
    return this.getClient().get(this._getUrlPrefix());
  }

  fetchEditData(assessmentId) {
    return this.getClient().get(`${this._getUrlPrefix()}/${assessmentId}/edit`);
  }

  /**
   * Create an assessment.
   *
   * @param {object} params - params in the format of:
   *   {
   *     category: number, tab: number,
   *     assessment: { :title, :description, etc }
   *   }
   * @return {Promise}
   * success response: {}
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  create(params) {
    return this.getClient().post(this._getUrlPrefix(), params);
  }

  /**
   * Update the assessment.
   *
   * @param {number} assessmentId
   * @param {object} params - params in the format of { assessment: { :title, :description, etc } }
   * @return {Promise}
   * success response: {}
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  update(assessmentId, params) {
    return this.getClient().patch(
      `${this._getUrlPrefix()}/${assessmentId}`,
      params,
    );
  }

  /**
   * Fetches assessment skills options
   *
   * @return {Promise}
   * success response: array of skills
   */
  fetchSkills() {
    return this.getClient().get(`${this._getUrlPrefix()}/skills/options`);
  }

  /**
   * Sends emails to remind students to complete the assessment.
   *
   * @return {Promise}
   * success response: {}
   * error response: {}
   */
  remind(assessmentId, courseUsers) {
    return this.getClient().post(
      `${this._getUrlPrefix()}/${assessmentId}/remind`,
      {
        course_users: courseUsers,
      },
    );
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/assessments`;
  }
}
