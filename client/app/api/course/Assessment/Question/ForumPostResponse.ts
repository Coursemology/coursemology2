import {
  ForumPostResponseFormData,
  ForumPostResponsePostData,
} from 'types/course/assessment/question/forum-post-responses';

import { APIResponse, JustRedirect } from 'api/types';

import BaseAPI from '../Base';

export default class ForumPostResponseAPI extends BaseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/assessments/${this.assessmentId}/question/forum_post_responses`;
  }

  fetchNewForumPostResponse(): APIResponse<ForumPostResponseFormData<'new'>> {
    return this.client.get(`${this.#urlPrefix}/new`);
  }

  fetchEditForumPostResponse(
    id: number,
  ): APIResponse<ForumPostResponseFormData<'edit'>> {
    return this.client.get(`${this.#urlPrefix}/${id}/edit`);
  }

  createForumPostResponse(
    data: ForumPostResponsePostData,
  ): APIResponse<JustRedirect> {
    return this.client.post(`${this.#urlPrefix}`, data);
  }

  // confirmRubricAdvance lets an incompatible rubric change (which would re-grade existing answers) go
  // through; without it the backend rolls back and 409s so the frontend can confirm with the user first.
  updateForumPostResponse(
    id: number,
    data: ForumPostResponsePostData,
    confirmRubricAdvance = false,
  ): APIResponse<JustRedirect> {
    return this.client.patch(`${this.#urlPrefix}/${id}`, {
      ...data,
      confirm_rubric_advance: confirmRubricAdvance,
    });
  }
}
