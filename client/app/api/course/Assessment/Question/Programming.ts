import {
  LanguageData,
  ProgrammingFormData,
  ProgrammingPostStatusData,
} from 'types/course/assessment/question/programming';
import { CodaveriGenerateResponse } from 'types/course/assessment/question-generation';

import { APIResponse } from 'api/types';

import BaseAPI from '../Base';

export default class ProgrammingAPI extends BaseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/assessments/${this.assessmentId}/question/programming`;
  }

  fetchNew(): APIResponse<ProgrammingFormData> {
    return this.client.get(`${this.#urlPrefix}/new`);
  }

  fetchEdit(id: number): APIResponse<ProgrammingFormData> {
    return this.client.get(`${this.#urlPrefix}/${id}/edit`);
  }

  create(data: FormData): APIResponse<ProgrammingPostStatusData> {
    return this.client.post(`${this.#urlPrefix}`, data);
  }

  update(id: number, data: FormData): APIResponse<ProgrammingPostStatusData> {
    return this.client.patch(`${this.#urlPrefix}/${id}`, data);
  }

  fetchCodaveriLanguages(): APIResponse<LanguageData[]> {
    return this.client.get(`${this.#urlPrefix}/codaveri_languages`);
  }

  generate(data: FormData): APIResponse<CodaveriGenerateResponse> {
    return this.client.post(`${this.#urlPrefix}/generate`, data);
  }

  updateQnSetting(assessmentId: number, id: number, data: object): APIResponse {
    return this.client.patch(
      `/courses/${this.courseId}/assessments/${assessmentId}/question/programming/${id}/update_question_setting`,
      data,
    );
  }
}
