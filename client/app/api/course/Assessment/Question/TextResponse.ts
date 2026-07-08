import { TextResponseFormData } from 'types/course/assessment/question/text-responses';

import { APIResponse, JustRedirect } from 'api/types';

import BaseAPI from '../Base';

export default class TextResponseAPI extends BaseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/assessments/${this.assessmentId}/question/text_responses`;
  }

  fetchNewTextResponse(): APIResponse<Omit<TextResponseFormData, 'question'>> {
    return this.client.get(`${this.#urlPrefix}/new`);
  }

  fetchNewFileUpload(): APIResponse<Omit<TextResponseFormData, 'question'>> {
    return this.client.get(`${this.#urlPrefix}/new`, {
      params: { file_upload: true },
    });
  }

  fetchEdit(id: number): APIResponse<TextResponseFormData> {
    return this.client.get(`${this.#urlPrefix}/${id}/edit`);
  }

  create(data: FormData): APIResponse<JustRedirect> {
    return this.client.post(`${this.#urlPrefix}`, data);
  }

  update(id: number, data: FormData): APIResponse<JustRedirect> {
    return this.client.patch(`${this.#urlPrefix}/${id}`, data);
  }
}
