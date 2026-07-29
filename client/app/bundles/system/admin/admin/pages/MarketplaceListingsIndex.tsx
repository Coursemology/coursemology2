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
  // "We do not know what is listed", which an empty `listings` cannot say on its own: the table's
  // empty state is a claim about the marketplace, and a failed fetch has no standing to make it.
  // Set on refetch failures too — rows that predate a mutation are as unknown as no rows at all.
  const [failed, setFailed] = useState(false);

  const fetchListings = (): Promise<void> =>
    SystemAPI.admin
      .indexMarketplaceListings()
      .then((response) => {
        setListings(response.data.listings);
        setFailed(false);
      })
      .catch(() => {
        setFailed(true);
        toast.error(t(translations.fetchFailure));
      });

  useEffect(() => {
    fetchListings().finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number): Promise<void> => {
    try {
      await SystemAPI.admin.deleteMarketplaceListing(id);
      toast.success(t(translations.deleteSuccess));
      await fetchListings();
    } catch (error) {
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

      {failed ? (
        <Typography color="text.secondary" variant="body2">
          {t(translations.fetchFailure)}
        </Typography>
      ) : (
        <MarketplaceListingsTable
          listings={listings}
          onDelete={handleDelete}
          onRestored={fetchListings}
          onVisibilityChanged={fetchListings}
        />
      )}
    </Page>
  );
};

export default MarketplaceListingsIndex;
