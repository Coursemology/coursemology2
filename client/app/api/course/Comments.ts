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

  get #urlPrefix(): string {
    return `/courses/${this.courseId}/comments`;
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
    return this.client.get(this.#urlPrefix);
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
    return this.client.get(
      `${this.#urlPrefix}/${tabValue}?page_num=${pageNum}`,
    );
  }

  /**
   * Updates comment topic to be isPending.
   */
  togglePending(topicId: number): Promise<AxiosResponse<void>> {
    return this.client.patch(`${this.#urlPrefix}/${topicId}/toggle_pending`);
  }

  /**
   * Updates comment topic to be marked as read.
   */
  markAsRead(topicId: number): Promise<AxiosResponse<void>> {
    return this.client.patch(`${this.#urlPrefix}/${topicId}/mark_as_read`);
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
    return this.client.post(`${this.#urlPrefix}/${topicId}/posts/`, params);
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
    return this.client.patch(
      `${this.#urlPrefix}/${topicId}/posts/${postId}`,
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
    return this.client.delete(`${this.#urlPrefix}/${topicId}/posts/${postId}`);
  }
}
