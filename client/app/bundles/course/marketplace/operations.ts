import CourseAPI from 'api/course';
import pollJob from 'lib/helpers/jobHelpers';

import {
  ListingPreviewData,
  MarketplaceIndexData,
  QuestionPreviewData,
} from './types';

export const fetchListings = async (): Promise<MarketplaceIndexData> => {
  const response = await CourseAPI.marketplace.index();
  return {
    listings: (response.data.listings ??
      []) as MarketplaceIndexData['listings'],
    destinationTabs: (response.data.destinationTabs ??
      []) as MarketplaceIndexData['destinationTabs'],
  };
};

export const duplicateListings = async (
  listingIds: number[],
  destinationTabId: number | null,
  onSuccess: (redirectUrl?: string) => void,
  onFailure: () => void,
): Promise<void> => {
  const response = await CourseAPI.marketplace.duplicate(
    listingIds,
    destinationTabId,
  );
  pollJob(
    response.data.jobUrl,
    (data) => onSuccess(data.redirectUrl),
    onFailure,
    2000,
  );
};

export const fetchListing = async (id: number): Promise<ListingPreviewData> => {
  const response = await CourseAPI.marketplace.fetchListing(id);
  return response.data as ListingPreviewData;
};

export const fetchQuestion = async (
  listingId: number,
  questionId: number,
): Promise<QuestionPreviewData> => {
  const response = await CourseAPI.marketplace.fetchQuestion(
    listingId,
    questionId,
  );
  return response.data as QuestionPreviewData;
};

export const createAttempt = async (
  listingId: number,
): Promise<{ id: number; assessmentId: number }> => {
  const response = await CourseAPI.marketplace.createAttempt(listingId);
  return response.data;
};
