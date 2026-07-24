import { useState } from 'react';
import { useIntl } from 'react-intl';
import { useSearchParams } from 'react-router-dom';

import { useCourseContext } from 'course/container/CourseLoader';
import Page from 'lib/components/core/layouts/Page';
import Preload from 'lib/components/wrappers/Preload';

import DuplicateConfirmation from '../../components/DuplicateConfirmation';
import { fetchListings } from '../../operations';
import translations from '../../translations';
import { MarketplaceListing } from '../../types';
import useStartPreviewAttempt from '../../useStartPreviewAttempt';

import MarketplaceTable from './MarketplaceTable';

const MarketplaceIndex = (): JSX.Element => {
  const { formatMessage: t } = useIntl();
  const { courseTitle, courseUrl } = useCourseContext();
  const [params] = useSearchParams();
  const fromTab = params.get('from_tab');
  const destinationTabId = parseInt(fromTab ?? '', 10) || null;
  const [pending, setPending] = useState<MarketplaceListing[]>([]);
  const { start: startAttempt } = useStartPreviewAttempt();

  return (
    <Preload render={<div />} while={fetchListings}>
      {({ listings, destinationTabs }): JSX.Element => (
        <Page title={t(translations.pageTitle)}>
          <MarketplaceTable
            fromTab={fromTab}
            listings={listings}
            onAttempt={(listing): Promise<void> => startAttempt(listing.id)}
            onDuplicate={setPending}
          />
          <DuplicateConfirmation
            destinationCourse={{ title: courseTitle, url: courseUrl }}
            destinationTabs={destinationTabs}
            initialDestinationTabId={destinationTabId}
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
