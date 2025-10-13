import { useEffect, useState } from 'react';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Note from 'lib/components/core/Note';
import { DataHandle } from 'lib/hooks/router/dynamicNest';
import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { fetchUserEmailSubscriptions } from './operations';
import translations from './translations';
import UserEmailSubscriptionsTable from './UserEmailSubscriptionsTable';

type Status = 'loading' | 'success' | 'error';

const UserEmailSubscriptions = (): JSX.Element => {
  const { t } = useTranslation();

  const [status, setStatus] = useState<Status>('loading');

  const dispatch = useAppDispatch();

  // When unsubscribe link is clicked from an email, it passes some params
  // for unsubscription. Below, we extract the params and pass it
  // to the backend through the API call to trigger the unsubscription action.
  const queryParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    if (status !== 'loading') return;

    dispatch(
      fetchUserEmailSubscriptions(
        Object.fromEntries(queryParams.entries()),
        () => setStatus('success'),
        () => setStatus('error'),
      ),
    );
  }, []);

  if (status === 'loading') return <LoadingIndicator />;

  if (status === 'error')
    return <Note message={t(translations.fetchFailure)} severity="error" />;

  return <UserEmailSubscriptionsTable />;
};

const handle: DataHandle = (match) => ({
  getData: () => ({
    activePath: null,
    content: {
      title: translations.emailSubscriptions,
      url: match.pathname,
    },
  }),
});

export default Object.assign(UserEmailSubscriptions, { handle });
