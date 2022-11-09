import { AxiosResponse } from 'axios';
import { RecursiveArray } from 'types';
import { ForumTopicPostListData } from 'types/course/forums';

import BaseCourseAPI from '../Base';

export default class PostsAPI extends BaseCourseAPI {
  _getUrlPrefix(): string {
    return `/courses/${this.getCourseId()}/forums/`;
  }

  /**
   * Creates a new post.
   */
  create(
    forumId: string,
    topicId: string,
    postText: string,
    parentId?: number,
  ): Promise<
    AxiosResponse<{
      post: ForumTopicPostListData;
      postTreeIds: RecursiveArray<number>;
    }>
  > {
    return this.getClient().post(
      `${this._getUrlPrefix()}/${forumId}/topics/${topicId}/posts`,
      { discussion_post: { text: postText, parent_id: parentId } },
    );
  }

  /**
   * Updates an existing post.
   */
  update(
    urlSlug: string,
    postText: string,
  ): Promise<AxiosResponse<ForumTopicPostListData>> {
    return this.getClient().patch(`${urlSlug}`, {
      discussion_post: { text: postText },
    });
  }

  /**
   * Deletes an existing post.
   */
  delete(urlSlug: string): Promise<
    AxiosResponse<{
      isTopicDeleted?: boolean;
      topicId: number;
      postTreeIds: RecursiveArray<number>;
    }>
  > {
    return this.getClient().delete(urlSlug);
  }

  /**
   * Mark/unmark a post as an answer.
   */
  toggleAnswer(urlSlug: string): Promise<AxiosResponse> {
    return this.getClient().put(`${urlSlug}/toggle_answer`);
  }

  /**
   * Upvote/downvote an existing post.
   */
  vote(
    urlSlug: string,
    vote: -1 | 0 | 1,
  ): Promise<AxiosResponse<ForumTopicPostListData>> {
    return this.getClient().put(`${urlSlug}/vote`, {
      vote,
    });
  }
}
