import {
  McqMrqFormData,
  McqMrqPostData,
} from 'types/course/assessment/question/multiple-responses';
import { McqMrqGenerateResponse } from 'types/course/assessment/question-generation';

import { APIResponse, RedirectWithEditUrl } from 'api/types';

import BaseAPI from '../Base';

export default class McqMrqAPI extends BaseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/assessments/${this.assessmentId}/question/multiple_responses`;
  }

  fetchNewMrq(): APIResponse<McqMrqFormData<'new'>> {
    return this.client.get(`${this.#urlPrefix}/new`);
  }

  fetchNewMcq(): APIResponse<McqMrqFormData<'new'>> {
    return this.client.get(`${this.#urlPrefix}/new`, {
      params: { multiple_choice: true },
    });
  }

  fetchEdit(id: number): APIResponse<McqMrqFormData<'edit'>> {
    return this.client.get(`${this.#urlPrefix}/${id}/edit`);
  }

  create(data: McqMrqPostData): APIResponse<RedirectWithEditUrl> {
    return this.client.post(`${this.#urlPrefix}`, data);
  }

  update(id: number, data: McqMrqPostData): APIResponse<RedirectWithEditUrl> {
    return this.client.patch(`${this.#urlPrefix}/${id}`, data);
  }

  generate(data: FormData): APIResponse<McqMrqGenerateResponse> {
    return this.client.post(`${this.#urlPrefix}/generate`, data);
  }
}
