import {
  RubricBasedResponseFormData,
  RubricBasedResponsePostData,
} from 'types/course/assessment/question/rubric-based-responses';

import { APIResponse, JustRedirect } from 'api/types';

import BaseAPI from '../Base';

export default class RubricBasedResponseAPI extends BaseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/assessments/${this.assessmentId}/question/rubric_based_responses`;
  }

  fetchNewRubricBasedResponse(): APIResponse<RubricBasedResponseFormData> {
    return this.client.get(`${this.#urlPrefix}/new`);
  }

  fetchEditRubricBasedResponse(
    id: number,
  ): APIResponse<RubricBasedResponseFormData> {
    return this.client.get(`${this.#urlPrefix}/${id}/edit`);
  }

  create(data: RubricBasedResponsePostData): APIResponse<JustRedirect> {
    return this.client.post(`${this.#urlPrefix}`, data);
  }

  update(
    id: number,
    data: RubricBasedResponsePostData,
  ): APIResponse<JustRedirect> {
    return this.client.patch(`${this.#urlPrefix}/${id}`, data);
  }
}
