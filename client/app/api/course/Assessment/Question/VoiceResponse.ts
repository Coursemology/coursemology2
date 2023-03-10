import {
  VoiceResponseFormData,
  VoiceResponsePostData,
} from 'types/course/assessment/question/voice-responses';

import { APIResponse, JustRedirect } from 'api/types';

import BaseAPI from '../Base';

export default class VoiceResponseAPI extends BaseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/assessments/${this.assessmentId}/question/voice_responses`;
  }

  fetchNewVoiceResponse(): APIResponse<VoiceResponseFormData<'new'>> {
    return this.client.get(`${this.#urlPrefix}/new`);
  }

  fetchEditVoiceResponse(
    id: number,
  ): APIResponse<VoiceResponseFormData<'edit'>> {
    return this.client.get(`${this.#urlPrefix}/${id}/edit`);
  }

  create(data: VoiceResponsePostData): APIResponse<JustRedirect> {
    return this.client.post(`${this.#urlPrefix}`, data);
  }

  update(id: number, data: VoiceResponsePostData): APIResponse<JustRedirect> {
    return this.client.patch(`${this.#urlPrefix}/${id}`, data);
  }
}
