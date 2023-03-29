import { SessionFormPostData } from 'types/course/assessment/sessions';

import { APIResponse, JustRedirect } from 'api/types';

import BaseCourseAPI from './Base';

export default class SessionsAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/assessments/${this.assessmentId}/sessions`;
  }

  create(params: SessionFormPostData): Promise<APIResponse<JustRedirect>> {
    return this.client.post(this.#urlPrefix, params);
  }
}
