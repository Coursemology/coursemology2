import { AxiosResponse } from 'axios';
import { ForumPostData } from 'types/course/disbursement';
import {
  ForumListData,
  ForumTopicListData,
  ForumData,
  ForumMetadata,
  ForumPermissions,
  ForumSearchParams,
} from 'types/course/forums';
import BaseCourseAPI from '../Base';

export default class ForumsAPI extends BaseCourseAPI {
  _getUrlPrefix(): string {
    return `/courses/${this.getCourseId()}/forums`;
  }

  /**
   * Fetches an array of forums.
   */
  index(): Promise<
    AxiosResponse<{
      forums: ForumListData[];
      metadata: ForumMetadata;
      permissions: ForumPermissions;
    }>
  > {
    return this.getClient().get(this._getUrlPrefix());
  }

  /**
   * Fetches an existing forum.
   */
  fetch(
    forumId: string,
  ): Promise<
    AxiosResponse<{ forum: ForumData; topics: ForumTopicListData[] }>
  > {
    return this.getClient().get(`${this._getUrlPrefix()}/${forumId}`);
  }

  /**
   * Creates a new forum.
   */
  create(params: FormData): Promise<AxiosResponse<ForumListData>> {
    return this.getClient().post(this._getUrlPrefix(), params);
  }

  /**
   * Updates an existing forum.
   */
  update(
    forumId: number,
    params: FormData,
  ): Promise<AxiosResponse<ForumListData>> {
    return this.getClient().patch(`${this._getUrlPrefix()}/${forumId}`, params);
  }

  /**
   * Deletes an existing forum.
   */
  delete(forumId: number): Promise<AxiosResponse> {
    return this.getClient().delete(`${this._getUrlPrefix()}/${forumId}`);
  }

  /**
   * Update the subscription of a forum.
   */
  updateSubscription(
    url: string,
    isCurrentlySubscribed: boolean,
  ): Promise<AxiosResponse> {
    if (isCurrentlySubscribed) {
      return this.getClient().delete(`${url}/unsubscribe`);
    }
    return this.getClient().post(`${url}/subscribe`);
  }

  /**
   * Mark all topics as read in a forum.
   */
  markAllAsRead(): Promise<void> {
    return this.getClient().patch(`${this._getUrlPrefix()}/mark_all_as_read`);
  }

  /**
   * Mark all topics as read in a forum.
   */
  markAsRead(forumId: number): Promise<void> {
    return this.getClient().patch(
      `${this._getUrlPrefix()}/${forumId}/mark_as_read`,
    );
  }

  /**
   * Fetches forum post data with search params.
   */
  search(params: ForumSearchParams): Promise<
    AxiosResponse<{
      userPosts: ForumPostData[];
    }>
  > {
    return this.getClient().get(`${this._getUrlPrefix()}/search`, params);
  }
}
