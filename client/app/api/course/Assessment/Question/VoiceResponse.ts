import {
  VoiceFormData,
  VoicePostData,
} from 'types/course/assessment/question/voice-responses';

import { APIResponse, JustRedirect } from 'api/types';

import BaseAPI from '../Base';

export default class VoiceResponseAPI extends BaseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/assessments/${this.assessmentId}/question/voice_responses`;
  }

  fetchNewVoice(): APIResponse<VoiceFormData<'new'>> {
    return this.client.get(`${this.#urlPrefix}/new`);
  }

  fetchEditVoice(id: number): APIResponse<VoiceFormData<'edit'>> {
    return this.client.get(`${this.#urlPrefix}/${id}/edit`);
  }

  create(data: VoicePostData): APIResponse<JustRedirect> {
    return this.client.post(`${this.#urlPrefix}`, data);
  }

  update(id: number, data: VoicePostData): APIResponse<JustRedirect> {
    return this.client.patch(`${this.#urlPrefix}/${id}`, data);
  }
}
