import BaseCourseAPI from './Base';

export default class LecturesAPI extends BaseCourseAPI {
  /**
  * Get Braincert Virtual Classroom Access Link
  *
  * @param {number} lectureId
  * @return {Promise}
  * success response: { link }
  * error response: { errors: String } - An error string will be returned upon validation error.
  */
  accessLink(lectureId) {
    return this.getClient()
      .get(`${this._getUrlPrefix()}/${lectureId}/access_link`,
        this.getCourseId(), lectureId, { format: 'json' });
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/lectures`;
  }
}