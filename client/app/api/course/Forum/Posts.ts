import { RecursiveArray } from 'types';
import {
  ForumTopicPostListData,
  ForumTopicPostPostData,
} from 'types/course/forums';
import { JobSubmitted } from 'types/jobs';

import { APIResponse } from 'api/types';
import { POST_WORKFLOW_STATE } from 'lib/constants/sharedConstants';

import BaseCourseAPI from '../Base';

export default class PostsAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/forums/`;
  }

  /**
   * Creates a new post.
   */
  create(
    forumId: string,
    topicId: string,
    discussionPost: ForumTopicPostPostData,
  ): APIResponse<{
    post: ForumTopicPostListData;
    postTreeIds: RecursiveArray<number>;
  }> {
    return this.client.post(
      `${this.#urlPrefix}/${forumId}/topics/${topicId}/posts`,
      discussionPost,
    );
  }

  /**
   * Updates an existing post.
   */
  update(
    urlSlug: string,
    postText: string,
  ): APIResponse<ForumTopicPostListData> {
    return this.client.patch(`${urlSlug}`, {
      discussion_post: { text: postText },
    });
  }

  /**
   * Deletes an existing post.
   */
  delete(urlSlug: string): APIResponse<{
    isTopicResolved?: boolean;
    isTopicDeleted?: boolean;
    topicId: number;
    postTreeIds: RecursiveArray<number>;
  }> {
    return this.client.delete(urlSlug);
  }

  /**
   * Mark/unmark a post as an answer.
   */
  toggleAnswer(urlSlug: string): APIResponse<{ isTopicResolved: boolean }> {
    return this.client.put(`${urlSlug}/toggle_answer`);
  }

  /**
   * Mark AI generated drafted post as answer and publish
   */
  markAnswerAndPublish(urlSlug: string): APIResponse<{
    workflowState: keyof typeof POST_WORKFLOW_STATE;
    isTopicResolved: boolean;
    creator: { id: number; userUrl: string; name: string; imageUrl: string };
  }> {
    return this.client.put(`${urlSlug}/mark_answer_and_publish`);
  }

  /**
   * Upvote/downvote an existing post.
   */
  vote(urlSlug: string, vote: -1 | 0 | 1): APIResponse<ForumTopicPostListData> {
    return this.client.put(`${urlSlug}/vote`, {
      vote,
    });
  }

  /**
   * Publish a drafted post. Optionally carries the edited `postText` so an AI-generated draft can be finalised
   * (edit + publish) in a single request.
   */
  publish(
    urlSlug: string,
    postText?: string,
  ): APIResponse<{
    workflowState: keyof typeof POST_WORKFLOW_STATE;
    creator: { id: number; userUrl: string; name: string; imageUrl: string };
  }> {
    return this.client.put(
      `${urlSlug}/publish`,
      postText === undefined
        ? undefined
        : { discussion_post: { text: postText } },
    );
  }

  /**
   * Toggle Between Publish and Draft workflow state for a rag auto generated post.
   */
  generateReply(urlSlug: string): APIResponse<JobSubmitted> {
    return this.client.put(`${urlSlug}/generate_reply`);
  }

  /**
   * Sets the numeric rating for a RagWise-generated answer post. The edited content is captured separately
   * from the post lifecycle (on publish/reject) -- see the backend post hook.
   */
  updateRagWiseRating(
    urlSlug: string,
    rating: number | null,
  ): APIResponse<{ id: number; rating: number | null }> {
    return this.client.patch(`${urlSlug}/rag_wise_rating`, { rating });
  }
}
