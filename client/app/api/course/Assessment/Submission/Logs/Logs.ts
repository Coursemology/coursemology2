import { LogInfo } from 'types/course/assessment/submission/logs';

import { APIResponse } from 'api/types';

import BaseAPI from '../../Base';

export default class LogsAPI extends BaseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/assessments/${this.assessmentId}/submissions/${this.submissionId}/logs`;
  }

  index(): APIResponse<LogInfo> {
    return this.client.get(this.#urlPrefix);
  }
}
