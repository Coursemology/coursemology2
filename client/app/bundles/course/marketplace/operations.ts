import CourseAPI from 'api/course';

import { MarketplaceListing } from './types';

export const fetchListings = async (): Promise<MarketplaceListing[]> => {
  const response = await CourseAPI.marketplace.index();
  return response.data.listings as MarketplaceListing[];
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
