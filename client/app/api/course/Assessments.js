import BaseCourseAPI from './Base';

export default class AssessmentsAPI extends BaseCourseAPI {
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
    return this.getClient().patch(`${this._getUrlPrefix()}/${assessmentId}`, params);
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/assessments`;
  }
}
