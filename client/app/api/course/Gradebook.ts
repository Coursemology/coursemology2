import { GradebookData } from 'types/course/gradebook';

import { APIResponse } from 'api/types';

import BaseCourseAPI from './Base';

export default class GradebookAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/gradebook`;
  }

  index(): APIResponse<GradebookData> {
    return this.client.get(this.#urlPrefix);
  }
}
