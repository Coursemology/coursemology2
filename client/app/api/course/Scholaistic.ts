import { ScholaisticAssessmentsIndexData } from 'types/course/scholaistic';

import { APIResponse } from 'api/types';

import BaseCourseAPI from './Base';

export default class ScholaisticAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/scholaistic`;
  }

  fetchAssessments(): APIResponse<ScholaisticAssessmentsIndexData> {
    return this.client.get(`${this.#urlPrefix}/assessments`);
  }
}
