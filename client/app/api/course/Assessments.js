import BaseCourseAPI from './Base';

export default class AssessmentsAPI extends BaseCourseAPI {
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
    return this.getClient().patch(`${this._geturlprefix()}/${assessmentid}`, params);
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/assessments`;
  }
}
