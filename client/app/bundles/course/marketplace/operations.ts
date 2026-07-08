import CourseAPI from 'api/course';
import pollJob from 'lib/helpers/jobHelpers';

import { MarketplaceListing } from './types';

export const fetchListings = async (): Promise<MarketplaceListing[]> => {
  const response = await CourseAPI.marketplace.index();
  return response.data.listings as MarketplaceListing[];
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
