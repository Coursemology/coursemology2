import BaseCourseAPI from './Base';

export default class PostsAPI extends BaseCourseAPI {

  /**
   * Updates a discussion post
   *
   * @param {number} topicId
   * @param {number} postId
   * @param {object} fields
   *   - params in the format of { :discussion_post }
   * @return {Promise}
   */
  update(topicId, postId, fields) {
    return this.getClient().patch(this._getUrl(topicId, postId), fields);
  }

  /**
   * Deletes a discussion post
   *
   * @param {number} topicId
   * @param {number} postId
   * @return {Promise}
   */
  delete(topicId, postId) {
    return this.getClient().delete(this._getUrl(topicId, postId));
  }

  _getUrl(topicId, postId) {
    return `/courses/${this.getCourseId()}/comments/${topicId}/posts/${postId}`;
  }
}
