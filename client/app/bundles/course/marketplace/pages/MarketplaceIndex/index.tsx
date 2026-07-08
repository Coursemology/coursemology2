import { useState } from 'react';
import { useIntl } from 'react-intl';

import Page from 'lib/components/core/layouts/Page';
import Preload from 'lib/components/wrappers/Preload';

import { fetchListings } from '../../operations';
import translations from '../../translations';
import { MarketplaceListing } from '../../types';

import MarketplaceTable from './MarketplaceTable';

const MarketplaceIndex = (): JSX.Element => {
  const { formatMessage: t } = useIntl();
  const [pending, setPending] = useState<MarketplaceListing[]>([]);

  return (
    <Preload render={<div />} while={fetchListings}>
      {(listings): JSX.Element => (
        <Page title={t(translations.pageTitle)}>
          <MarketplaceTable listings={listings} onDuplicate={setPending} />
        </Page>
      )}
    </Preload>
  );
};

export default MarketplaceIndex;
