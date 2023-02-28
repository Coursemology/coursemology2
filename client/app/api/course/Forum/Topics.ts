import { RecursiveArray } from 'types';
import {
  ForumTopicData,
  ForumTopicListData,
  ForumTopicPatchData,
  ForumTopicPostData,
  ForumTopicPostListData,
} from 'types/course/forums';

import { APIResponse, JustRedirect } from 'api/types';

import BaseCourseAPI from '../Base';

export default class TopicsAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/forums/`;
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
    return this.client.get(`${this.#urlPrefix}/${forumId}/topics/${topicId}`);
  }

  /**
   * Creates a new topic.
   */
  create(
    forumId: string,
    params: ForumTopicPostData,
  ): APIResponse<JustRedirect> {
    return this.client.post(`${this.#urlPrefix}/${forumId}/topics`, params);
  }

  /**
   * Updates an existing topic.
   */
  update(
    urlSlug: string,
    params: ForumTopicPatchData,
  ): APIResponse<ForumTopicListData> {
    return this.client.patch(`${urlSlug}`, params);
  }

  /**
   * Deletes an existing topic.
   */
  delete(urlSlug: string): APIResponse {
    return this.client.delete(urlSlug);
  }

  /**
   * Update the subscription of a topic.
   */
  updateSubscription(
    urlSlug: string,
    isCurrentlySubscribed: boolean,
  ): APIResponse {
    if (isCurrentlySubscribed) {
      return this.client.delete(`${urlSlug}/subscribe`, {
        params: {
          subscribe: false,
        },
      });
    }
    return this.client.post(`${urlSlug}/subscribe`, {
      subscribe: true,
    });
  }

  /**
   * Update the hidden status of a topic.
   */
  updateHidden(urlSlug: string, isCurrentlyHidden: boolean): APIResponse {
    return this.client.patch(`${urlSlug}/hidden`, {
      hidden: !isCurrentlyHidden,
    });
  }

  /**
   * Update the locked status of a topic.
   */
  updateLocked(urlSlug: string, isCurrentlyLocked: boolean): APIResponse {
    return this.client.patch(`${urlSlug}/locked`, {
      locked: !isCurrentlyLocked,
    });
  }
}
