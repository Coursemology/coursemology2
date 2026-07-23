import { getIdFromUnknown } from 'utilities';

import { CrumbPath, DataHandle } from 'lib/hooks/router/dynamicNest';
import { Descriptor } from 'lib/hooks/useTranslation';

import { readFromTab, withFromTab } from './fromTab';
import { fetchListing, fetchQuestion } from './operations';
import translations from './translations';

// Both crumbs link to their own route's pathname, but carry the browse flow's `from_tab` forward
// so returning to the marketplace/listing preserves the origin-tab context (see ./fromTab).
export const marketplaceHandle: DataHandle = (match, location) => {
  const fromTab = readFromTab(location.search);
  return {
    getData: (): CrumbPath => ({
      // Descriptor title; Breadcrumbs runs t() on it.
      content: {
        title: translations.pageTitle,
        url: withFromTab(match.pathname, fromTab),
      },
    }),
  };
};

export const listingHandle: DataHandle = (match, location) => {
  const listingId = getIdFromUnknown(match.params?.listingId);
  if (!listingId) throw new Error(`Invalid listing id: ${listingId}`);
  const fromTab = readFromTab(location.search);
  return {
    getData: async (): Promise<CrumbPath> => ({
      content: {
        title: (await fetchListing(listingId)).title,
        url: withFromTab(match.pathname, fromTab),
      },
    }),
  };
};

export const questionHandle: DataHandle = (match) => {
  const listingId = getIdFromUnknown(match.params?.listingId);
  const questionId = getIdFromUnknown(match.params?.questionId);
  if (!listingId || !questionId)
    throw new Error('Invalid marketplace question route');
  return {
    getData: async (): Promise<string> => {
      const q = await fetchQuestion(listingId, questionId);
      return q.title ? `${q.defaultTitle}: ${q.title}` : q.defaultTitle;
    },
  };
};

export const attemptHandle: DataHandle = () => ({
  getData: (): Descriptor => translations.tryItOutBreadcrumb,
});
