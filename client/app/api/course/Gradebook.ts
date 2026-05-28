import { GradebookData, UpdateWeightsPayload } from 'types/course/gradebook';

import { APIResponse } from 'api/types';

import BaseCourseAPI from './Base';

export default class GradebookAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/gradebook`;
  }

  index(): APIResponse<GradebookData> {
    return this.client.get(this.#urlPrefix);
  }

  updateWeights(payload: UpdateWeightsPayload): APIResponse<UpdateWeightsPayload> {
    return this.client.patch(`${this.#urlPrefix}/weights`, payload);
  }
}
