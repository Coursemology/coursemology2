import BaseCourseAPI from './Base';

export default class AnnouncementsAPI extends BaseCourseAPI {
    /**
  * Fetches all announcements for the course accessible by the current user.
  *
  * @return {Promise}
  * success response: {
  *   canCreate: bool,
  *     - true if user can create an announcement
  *   announcements:Array.<{ id: number, title: string, ...etc }>
  *     - Array of announcements
  * }
  */
  index() {
    return this.getClient().get(this._getUrlPrefix());
  }

  /**
   * Create an announcement.
   *
   * @param {object} params - params in the format of:
   *   {
   *     announcement: { :title, :content, etc }
   *   }
   * @return {Promise}
   * success response: announcement: { :title, :content, etc }
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  create(params) {
    return this.getClient().post(this._getUrlPrefix(), params);
  }

  /**
   * Update the announcement.
   *
   * @param {number} announcementtId
   * @param {object} params - params in the format of { announcement: { :title, :content, etc } }
   * @return {Promise}
   * success response: announcement: { :title, :content, etc }
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  update(announcementId, params) {
    return this.getClient().patch(`${this._getUrlPrefix()}/${announcementId}`, params);
  }

  /**
  * Deletes an announcement
  *
  * @param {number} announcementId
  * @return {Promise}
  * success response: {}
  * error response: {}
  */
  delete(announcementId) {
    return this.getClient().delete(`${this._getUrlPrefix()}/${announcementId}`);
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/announcements`;
  }
}
