import BaseCourseAPI from './Base';

export default class VirtualClassroomsAPI extends BaseCourseAPI {
  /**
  * Get Braincert Virtual Classroom Access Link
  *
  * @param {number} virtualClassroomId
  * @return {Promise}
  * success response: { link }
  * error response: { errors: String } - An error string will be returned upon validation error.
  */
  accessLink(virtualClassroomId) {
    return this.getClient()
      .get(`${this._getUrlPrefix()}/${virtualClassroomId}/access_link`,
        this.getCourseId(), virtualClassroomId, { format: 'json' });
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/virtual_classrooms`;
  }
}
