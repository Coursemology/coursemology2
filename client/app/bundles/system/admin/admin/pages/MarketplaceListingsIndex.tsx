import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Typography } from '@mui/material';
import { AxiosError } from 'axios';
import { MarketplaceListingAdminData } from 'types/system/marketplaceListings';

import SystemAPI from 'api/system';
import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import MarketplaceListingsTable from '../components/tables/MarketplaceListingsTable';

const translations = defineMessages({
  header: {
    id: 'system.admin.admin.MarketplaceListingsIndex.header',
    defaultMessage: 'Marketplace Listings',
  },
  // The second sentence is here rather than in a tooltip because it is the one thing about this page
  // that cannot be inferred from any row: that a deleted original does not end the listing. Without
  // it, "Original assessment (deleted)" beside a Published chip looks like a contradiction.
  subtitle: {
    id: 'system.admin.admin.MarketplaceListingsIndex.subtitle',
    defaultMessage:
      'Every published assessment, the version currently served, and how many courses have copied it. Publish a new version from the source assessment - if the original is deleted, a source assessment is saved in the marketplace’s preview course so new versions can still be published.',
  },
  fetchFailure: {
    id: 'system.admin.admin.MarketplaceListingsIndex.fetchFailure',
    defaultMessage: 'Failed to load marketplace listings.',
  },
  deleteSuccess: {
    id: 'system.admin.admin.MarketplaceListingsIndex.deleteSuccess',
    defaultMessage: 'Listing deleted permanently.',
  },
  deleteFailure: {
    id: 'system.admin.admin.MarketplaceListingsIndex.deleteFailure',
    defaultMessage: 'Failed to delete the listing.',
  },
});

const MarketplaceListingsIndex: FC = () => {
  const { t } = useTranslation();
  const [listings, setListings] = useState<MarketplaceListingAdminData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = (): Promise<void> =>
    SystemAPI.admin
      .indexMarketplaceListings()
      .then((response) => setListings(response.data.listings))
      .catch(() => {
        toast.error(t(translations.fetchFailure));
      });

  useEffect(() => {
    fetchListings().finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number): Promise<void> => {
    try {
      // A 200 here carries an EMPTY body (`head :ok`) — there is nothing to read off the response.
      await SystemAPI.admin.deleteMarketplaceListing(id);
      toast.success(t(translations.deleteSuccess));
      await fetchListings();
    } catch (error) {
      // The server enforces the same orphaned-and-unadopted rule the buttons do and is the
      // authority on it, so show its reason rather than the generic fallback when it disagrees.
      const message =
        error instanceof AxiosError
          ? error.response?.data?.errors?.[0]
          : undefined;
      toast.error(message ?? t(translations.deleteFailure));
    }
  };

  if (loading) return <LoadingIndicator />;

  return (
    <Page title={t(translations.header)}>
      <Typography className="mb-4" color="text.secondary" variant="body2">
        {t(translations.subtitle)}
      </Typography>

      <MarketplaceListingsTable
        listings={listings}
        onDelete={handleDelete}
        onRestored={fetchListings}
        onVisibilityChanged={fetchListings}
      />
    </Page>
  );
};

export default MarketplaceListingsIndex;
