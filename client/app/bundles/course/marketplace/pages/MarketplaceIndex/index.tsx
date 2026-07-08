import { useState } from 'react';
import { useIntl } from 'react-intl';
import { useSearchParams } from 'react-router-dom';

import Page from 'lib/components/core/layouts/Page';
import Preload from 'lib/components/wrappers/Preload';

import DuplicateConfirmation from '../../components/DuplicateConfirmation';
import { fetchListings } from '../../operations';
import translations from '../../translations';
import { MarketplaceListing } from '../../types';

import MarketplaceTable from './MarketplaceTable';

const MarketplaceIndex = (): JSX.Element => {
  const { formatMessage: t } = useIntl();
  const [params] = useSearchParams();
  const destinationTabId = parseInt(params.get('from_tab') ?? '', 10) || null;
  const [pending, setPending] = useState<MarketplaceListing[]>([]);

  return (
    <Preload render={<div />} while={fetchListings}>
      {(listings): JSX.Element => (
        <Page title={t(translations.pageTitle)}>
          <MarketplaceTable listings={listings} onDuplicate={setPending} />
          <DuplicateConfirmation
            destinationTabId={destinationTabId}
            listings={pending}
            onClose={(): void => setPending([])}
            open={pending.length > 0}
          />
        </Page>
      )}
    </Preload>
  );
};

export default MarketplaceIndex;
