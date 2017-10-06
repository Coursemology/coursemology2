import { getVideoId } from 'lib/helpers/url-helpers';

import BaseCourseAPI from '../Base';

export default class TopicsAPI extends BaseCourseAPI {

  /**
   * topic = {
   *    timestamp: int
   *      - the video progress for this topic
   *    topLevelPostIds: Array.<int>
   *      - ids are for posts directly under the topic without parent posts
   */

  /**
   * post = {
   *   userName: string.
   *   userLink: string,
   *     - HTML <a> tag
   *   userPicElement: string
   *     - HTML element with image
   *   createdAt: string
   *     - Formatted datetime
   *   content: string
   *     - content in HTML
   *   canUpdate: bool
   *     - true if server allows current user to update the post
   *   canDelete: bool
   *     - true if server allows current user to delete the post
   *   topicId:
   *     - id for the Course::Video::Topic
   *   discussionTopicId:
   *     - id for the Course::Discussion::Topic
   *   childrenIds:
   *     - ids for children posts
   * }
   */

  /**
   * Creates a video discussion post
   *
   * @param {object} fields
   *   - params in the format of { :timestamp, :discussion_topic } }
   * @return {Promise} A promise for the server's response.
   * success response: {
   *    topicId: string.
   *    topic: topic.
   *    postId: string,
   *    post: post,
   *    parentPostId: string,
   *    parentPost: post
   *      - parentPostId and parentPost are only shown if the post created has a parent
   * }
   */
  create(fields) {
    return this.getClient().post(this._getUrlPrefix(), fields);
  }

  /**
   * Retrieves a video discussion topic
   *
   * @param {number} topicId The id of the topic to retrieve
   * @return {Promise} A promise for the server's response.
   * success response: {
   *    topicId: string,
   *    topic: topic
   *    posts: { <postId>: post, ... }
   * }
   */
  show(topicId) {
    return this.getClient().get(`${this._getUrlPrefix()}/${topicId}`);
  }

  /**
   * Retrieves all topics and discussion for this video.
   *
   * @return {Promise} A promise for the server's response.
   * success response: {
   *    topics: { <topicId>: topic, ... }
   *    posts: { <postId>: post, ... }
   * }
   */
  index() {
    return this.getClient().get(this._getUrlPrefix());
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/videos/${getVideoId()}/topics`;
  }
}
