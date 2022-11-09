import { AxiosResponse } from 'axios';
import {
  CommentPermissions,
  CommentPostListData,
  CommentSettings,
  CommentTabInfo,
  CommentTopicData,
} from 'types/course/comments';

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

  _getUrlPrefix(): string {
    return `/courses/${this.getCourseId()}/comments`;
  }

  /**
   * Fetches comments tab data in a course.
   */
  index(): Promise<
    AxiosResponse<{
      permissions: CommentPermissions;
      settings: CommentSettings;
      tabs: CommentTabInfo;
    }>
  > {
    return this.getClient().get(this._getUrlPrefix());
  }

  /**
   * Fetches comment topic and post data in a course.
   */
  fetchCommentData(
    tabValue: string,
    pageNum: number,
  ): Promise<
    AxiosResponse<{
      topicCount: number;
      topicList: CommentTopicData[];
    }>
  > {
    return this.getClient().get(
      `${this._getUrlPrefix()}/${tabValue}?page_num=${pageNum}`,
    );
  }

  /**
   * Updates comment topic to be isPending.
   */
  togglePending(topicId: number): Promise<AxiosResponse<void>> {
    return this.getClient().patch(
      `${this._getUrlPrefix()}/${topicId}/toggle_pending`,
    );
  }

  /**
   * Updates comment topic to be marked as read.
   */
  markAsRead(topicId: number): Promise<AxiosResponse<void>> {
    return this.getClient().patch(
      `${this._getUrlPrefix()}/${topicId}/mark_as_read`,
    );
  }

  /**
   * Creates a comment (discussion post)
   *
   * @param {string} topicId
   * @param {object} params
   *    - params in the format of { :discussion_post }
   * @return {Promise}
   * success response: post
   */
  create(
    topicId: string,
    params: object,
  ): Promise<AxiosResponse<CommentPostListData>> {
    return this.getClient().post(
      `${this._getUrlPrefix()}/${topicId}/posts/`,
      params,
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
  update(
    topicId: string,
    postId: string,
    params: object,
  ): Promise<AxiosResponse<CommentPostListData>> {
    return this.getClient().patch(
      `${this._getUrlPrefix()}/${topicId}/posts/${postId}`,
      params,
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
  delete(topicId: string, postId: string): Promise<AxiosResponse<void>> {
    return this.getClient().delete(
      `${this._getUrlPrefix()}/${topicId}/posts/${postId}`,
    );
  }
}
