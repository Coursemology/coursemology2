import BaseCourseAPI from './Base';

export default class CommentsAPI extends BaseCourseAPI {
  /**
   * post = {
   *   id: number, title: string, text: string, createdAt: datetime,
   *      - Post attributes
   *   formattedText: string,
   *      - same as text attribute but formatted for html
   *   creator = {
   *     name: string, avatar: string
   *       - user attributes for creator, avatar is an url
   *   },
   *   topicId:
   *     - the id of the discussion topic the post belongs to
   *   canUpdate: bool, canDelete: bool,
   *      - true if user can update and delete this post respectively
   * }
   */

  /**
   * Creates a comment (discussion post)
   *
   * @param {string} topicId
   * @param {object} params
   *    - params in the format of { :discussion_post }
   * @return {Promise}
   * success response: post
   */
  create(topicId, params) {
    return this.getClient().post(
      `${this._getUrlPrefix()}/${topicId}/posts/`,
      params
    );
  }

  /**
   * Updates a comment (discussion post)
   *
   * @param {string} topicId
   * @param {string} postId
   * @param {object} params
   *   - params in the format of { :discussion_post }
   * @return {Promise}
   * success response: post
   */
  update(topicId, postId, params) {
    return this.getClient().patch(
      `${this._getUrlPrefix()}/${topicId}/posts/${postId}`,
      params
    );
  }

  /**
   * Deletes a comment (discussion post)
   *
   * @param {string} topicId
   * @param {string} postId
   * @return {Promise}
   * success response: {}
   */
  delete(topicId, postId) {
    return this.getClient().delete(
      `${this._getUrlPrefix()}/${topicId}/posts/${postId}`
    );
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/comments`;
  }
}
