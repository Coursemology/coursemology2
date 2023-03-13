import {
  TextResponseFormData,
  TextResponsePostData,
} from 'types/course/assessment/question/text-responses';

import { APIResponse, JustRedirect } from 'api/types';

import BaseAPI from '../Base';

export default class TextResponseAPI extends BaseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/assessments/${this.assessmentId}/question/text_responses`;
  }

  fetchNewTextResponse(): APIResponse<TextResponseFormData<'new'>> {
    return this.client.get(`${this.#urlPrefix}/new`);
  }

  fetchNewFileUpload(): APIResponse<TextResponseFormData<'new'>> {
    return this.client.get(`${this.#urlPrefix}/new`, {
      params: { file_upload: true },
    });
  }

  fetchEdit(id: number): APIResponse<TextResponseFormData<'edit'>> {
    return this.client.get(`${this.#urlPrefix}/${id}/edit`);
  }

  create(data: TextResponsePostData): APIResponse<JustRedirect> {
    return this.client.post(`${this.#urlPrefix}`, data);
  }

  update(id: number, data: TextResponsePostData): APIResponse<JustRedirect> {
    return this.client.patch(`${this.#urlPrefix}/${id}`, data);
  }
}
