import CourseAPI from 'api/course';

import { MarketplaceListing } from './types';

export const fetchListings = async (): Promise<MarketplaceListing[]> => {
  const response = await CourseAPI.marketplace.index();
  return response.data.listings as MarketplaceListing[];
};
