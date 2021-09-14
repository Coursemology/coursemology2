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
    return this.getClient().get(
      `${this._getUrlPrefix()}/${virtualClassroomId}/access_link`,
      this.getCourseId(),
      virtualClassroomId,
      { format: 'json' }
    );
  }

  /**
   * Get Braincert Virtual Classroom list of recorded videos
   *
   * @param {number} virtualClassroomId
   * @return {Promise}
   * response: [video_info_hash]
   */
  recordedVideos(virtualClassroomId) {
    return this.getClient().get(
      `${this._getUrlPrefix()}/${virtualClassroomId}/recorded_videos`,
      this.getCourseId(),
      virtualClassroomId,
      { format: 'json' }
    );
  }

  /**
   * Get BrainCert Virtual Classroom recorded video access link
   *
   * @param recordId BrainCert Record ID
   * @return {Promise}
   * success response: { link }
   * error response: { errors: String } - An error string will be returned upon error.
   */
  recordedVideoLink(recordId) {
    return this.getClient().get(
      `${this._getUrlPrefix()}/recorded_video_link/${recordId}`,
      this.getCourseId(),
      { format: 'json' }
    );
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/virtual_classrooms`;
  }
}
