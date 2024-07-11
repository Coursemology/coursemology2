import { ForumDisbursementPostData } from 'types/course/disbursement';
import {
  ForumData,
  ForumListData,
  ForumMetadata,
  ForumPatchData,
  ForumPermissions,
  ForumPostData,
  ForumSearchParams,
  ForumTopicListData,
} from 'types/course/forums';

import { APIResponse } from 'api/types';

import BaseCourseAPI from '../Base';

export default class ForumsAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/forums`;
  }

  /**
   * Fetches an array of forums.
   */
  index(): APIResponse<{
    forumTitle: string;
    forums: ForumListData[];
    metadata: ForumMetadata;
    permissions: ForumPermissions;
  }> {
    return this.client.get(this.#urlPrefix);
  }

  /**
   * Fetches an existing forum.
   */
  fetch(
    forumId: string,
  ): APIResponse<{ forum: ForumData; topics: ForumTopicListData[] }> {
    return this.client.get(`${this.#urlPrefix}/${forumId}`);
  }

  /**
   * Creates a new forum.
   */
  create(params: ForumPostData): APIResponse<ForumListData> {
    return this.client.post(this.#urlPrefix, params);
  }

  /**
   * Updates an existing forum.
   */
  update(forumId: number, params: ForumPatchData): APIResponse<ForumListData> {
    return this.client.patch(`${this.#urlPrefix}/${forumId}`, params);
  }

  /**
   * Deletes an existing forum.
   */
  delete(forumId: number): APIResponse {
    return this.client.delete(`${this.#urlPrefix}/${forumId}`);
  }

  /**
   * Update the subscription of a forum.
   */
  updateSubscription(url: string, isCurrentlySubscribed: boolean): APIResponse {
    if (isCurrentlySubscribed) {
      return this.client.delete(`${url}/unsubscribe`);
    }
    return this.client.post(`${url}/subscribe`);
  }

  /**
   * Mark all topics as read in all forums.
   */
  markAllAsRead(): APIResponse {
    return this.client.patch(`${this.#urlPrefix}/mark_all_as_read`);
  }

  /**
   * Mark all topics as read in a forum.
   */
  markAsRead(
    forumId: number,
  ): APIResponse<{ nextUnreadTopicUrl: string | null }> {
    return this.client.patch(`${this.#urlPrefix}/${forumId}/mark_as_read`);
  }

  /**
   * Fetches forum post data with search params.
   */
  search(
    params: ForumSearchParams,
  ): APIResponse<{ userPosts: ForumDisbursementPostData[] }> {
    return this.client.get(`${this.#urlPrefix}/search`, params);
  }
}
