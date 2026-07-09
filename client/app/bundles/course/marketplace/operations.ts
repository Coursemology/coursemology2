import CourseAPI from 'api/course';

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

// Returns the URL of the duplication job to poll. Polling is deliberately left to the caller: it
// has to be started and torn down by the component that owns the flow, so that navigating away
// cannot leave an orphaned poller behind.
export const duplicateListings = async (
  listingIds: number[],
  destinationTabId: number | null,
): Promise<string> => {
  const response = await CourseAPI.marketplace.duplicate(
    listingIds,
    destinationTabId,
  );
  return response.data.jobUrl;
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
