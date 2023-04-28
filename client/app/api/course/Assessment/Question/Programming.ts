import {
  ProgrammingFormData,
  ProgrammingPostStatusData,
} from 'types/course/assessment/question/programming';

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
}
