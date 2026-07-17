import { AxiosResponse } from 'axios';

import BaseCourseAPI from './Base';

export default class MarketplaceAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/marketplace`;
  }

  publishListing(assessmentId: number): Promise<AxiosResponse> {
    return this.client.post(
      `/courses/${this.courseId}/assessments/${assessmentId}/marketplace_listing`,
    );
  }

  removeListing(assessmentId: number): Promise<AxiosResponse> {
    return this.client.delete(
      `/courses/${this.courseId}/assessments/${assessmentId}/marketplace_listing`,
    );
  }
}
