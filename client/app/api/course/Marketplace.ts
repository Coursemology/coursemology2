import { AxiosResponse } from 'axios';

import { DestinationTab, MarketplaceListing } from 'course/marketplace/types';

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
    AxiosResponse<{
      listings: MarketplaceListing[];
      destinationTabs: DestinationTab[];
      canAccess: boolean;
    }>
  > {
    return this.client.get(this.#urlPrefix);
  }

  duplicate(
    listingIds: number[],
    destinationTabId: number | null,
    courseId: number | null = null,
  ): Promise<AxiosResponse> {
    const urlPrefix = `/courses/${courseId ?? this.courseId}/marketplace`;

    return this.client.post(`${urlPrefix}/listings/duplicate`, {
      listing_ids: listingIds,
      ...(destinationTabId ? { destination_tab_id: destinationTabId } : {}),
    });
  }

  fetchListing(id: number): Promise<AxiosResponse> {
    return this.client.get(`${this.#urlPrefix}/listings/${id}`);
  }

  // Redirects server-side into the platform's own attempt action (submissions#create), which is what
  // actually creates or resumes the submission. XHR follows that 302 transparently, so what lands
  // here is that action's response. The masked preview deliberately ignores `redirectUrl` — it names
  // the hidden container course — and reads the ids instead.
  attempt(listingId: number): Promise<
    AxiosResponse<{
      redirectUrl: string;
      courseId: number;
      assessmentId: number;
      submissionId: number;
    }>
  > {
    return this.client.get(`${this.#urlPrefix}/listings/${listingId}/attempt`);
  }

  fetchQuestion(listingId: number, questionId: number): Promise<AxiosResponse> {
    return this.client.get(
      `${this.#urlPrefix}/listings/${listingId}/questions/${questionId}`,
    );
  }
}
