import {
  McqMrqFormData,
  McqMrqPostData,
} from 'types/course/assessment/multiple-responses';

import { APIResponse, JustRedirect } from 'api/types';

import BaseAPI from '../Base';

export default class McqMrqAPI extends BaseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.getCourseId()}/assessments/${this.getAssessmentId()}/question/multiple_responses`;
  }

  fetchNewMrq(): APIResponse<McqMrqFormData<'new'>> {
    return this.getClient().get(`${this.#urlPrefix}/new`);
  }

  fetchNewMcq(): APIResponse<McqMrqFormData<'new'>> {
    return this.getClient().get(`${this.#urlPrefix}/new`, {
      params: { multiple_choice: true },
    });
  }

  fetchEdit(id: number): APIResponse<McqMrqFormData<'edit'>> {
    return this.getClient().get(`${this.#urlPrefix}/${id}/edit`);
  }

  create(data: McqMrqPostData): APIResponse<JustRedirect> {
    return this.getClient().post(`${this.#urlPrefix}`, data);
  }

  update(id: number, data: McqMrqPostData): APIResponse<JustRedirect> {
    return this.getClient().patch(`${this.#urlPrefix}/${id}`, data);
  }
}
