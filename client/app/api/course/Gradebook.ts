import { AxiosResponse } from 'axios';
import { GradebookData } from 'types/course/gradebook';

import BaseCourseAPI from './Base';

export default class GradebookAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/gradebook`;
  }

  index(): Promise<AxiosResponse<GradebookData>> {
    return this.client.get(this.#urlPrefix);
  }
}
