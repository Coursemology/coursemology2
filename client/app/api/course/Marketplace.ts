import { AxiosResponse } from 'axios';

import { MarketplaceListing } from 'course/marketplace/types';

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

  index(): Promise<
    AxiosResponse<{ listings: MarketplaceListing[]; canAccess: boolean }>
  > {
    return this.client.get(this.#urlPrefix);
  }

  duplicate(
    listingIds: number[],
    destinationTabId: number | null,
  ): Promise<AxiosResponse> {
    return this.client.post(`${this.#urlPrefix}/listings/duplicate`, {
      listing_ids: listingIds,
      ...(destinationTabId ? { destination_tab_id: destinationTabId } : {}),
    });
  }
}
