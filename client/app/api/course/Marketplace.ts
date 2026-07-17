import { AxiosResponse } from 'axios';

import { DestinationTab, MarketplaceListing } from 'course/marketplace/types';

import { APIResponse } from '../types';

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
  ): Promise<AxiosResponse> {
    return this.client.post(`${this.#urlPrefix}/listings/duplicate`, {
      listing_ids: listingIds,
      ...(destinationTabId ? { destination_tab_id: destinationTabId } : {}),
    });
  }

  fetchListing(id: number): Promise<AxiosResponse> {
    return this.client.get(`${this.#urlPrefix}/listings/${id}`);
  }

  fetchQuestion(listingId: number, questionId: number): Promise<AxiosResponse> {
    return this.client.get(
      `${this.#urlPrefix}/listings/${listingId}/questions/${questionId}`,
    );
  }

  // Creates (or resumes an existing) preview attempt for the listing's source assessment.
  // No `courseId` override — the scoped preview provider (PreviewContext, T10/T11) makes it
  // unnecessary for every subsequent (member-route) call this attempt makes.
  createPreviewAttempt(
    listingId: number,
  ): APIResponse<{ id: number; assessmentId: number }> {
    return this.client.post(`${this.#urlPrefix}/listings/${listingId}/attempt`);
  }

  // Discards the attempt's answers and returns it to a fresh attempting state (same attempt id).
  resetPreviewAttempt(attemptId: number): Promise<AxiosResponse> {
    return this.client.post(`${this.#urlPrefix}/attempt/${attemptId}/reset`);
  }
}
