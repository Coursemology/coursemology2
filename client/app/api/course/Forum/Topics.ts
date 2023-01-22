import { RecursiveArray } from 'types';
import {
  ForumTopicData,
  ForumTopicListData,
  ForumTopicPatchData,
  ForumTopicPostData,
  ForumTopicPostListData,
} from 'types/course/forums';

import { APIResponse } from 'api/types';

import BaseCourseAPI from '../Base';

export default class TopicsAPI extends BaseCourseAPI {
  _getUrlPrefix(): string {
    return `/courses/${this.getCourseId()}/forums/`;
  }

  /**
   * Fetches an existing topic.
   */
  fetch(
    forumId: string,
    topicId: string,
  ): APIResponse<{
    topic: ForumTopicData;
    postTreeIds: RecursiveArray<number>;
    nextUnreadTopicUrl: string | null;
    posts: ForumTopicPostListData[];
  }> {
    return this.getClient().get(
      `${this._getUrlPrefix()}/${forumId}/topics/${topicId}`,
    );
  }

  /**
   * Creates a new topic.
   */
  create(
    forumId: string,
    params: ForumTopicPostData,
  ): APIResponse<{ redirectUrl: string }> {
    return this.getClient().post(
      `${this._getUrlPrefix()}/${forumId}/topics`,
      params,
    );
  }

  /**
   * Updates an existing topic.
   */
  update(
    urlSlug: string,
    params: ForumTopicPatchData,
  ): APIResponse<ForumTopicListData> {
    return this.getClient().patch(`${urlSlug}`, params);
  }

  /**
   * Deletes an existing topic.
   */
  delete(urlSlug: string): APIResponse {
    return this.getClient().delete(urlSlug);
  }

  /**
   * Update the subscription of a topic.
   */
  updateSubscription(
    urlSlug: string,
    isCurrentlySubscribed: boolean,
  ): APIResponse {
    if (isCurrentlySubscribed) {
      return this.getClient().delete(`${urlSlug}/subscribe`, {
        params: {
          subscribe: false,
        },
      });
    }
    return this.getClient().post(`${urlSlug}/subscribe`, {
      subscribe: true,
    });
  }

  /**
   * Update the hidden status of a topic.
   */
  updateHidden(urlSlug: string, isCurrentlyHidden: boolean): APIResponse {
    return this.getClient().patch(`${urlSlug}/hidden`, {
      hidden: !isCurrentlyHidden,
    });
  }

  /**
   * Update the locked status of a topic.
   */
  updateLocked(urlSlug: string, isCurrentlyLocked: boolean): APIResponse {
    return this.getClient().patch(`${urlSlug}/locked`, {
      locked: !isCurrentlyLocked,
    });
  }
}
