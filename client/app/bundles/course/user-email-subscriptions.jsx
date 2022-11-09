import { createRoot } from 'react-dom/client';

import UserEmailSubscriptions from 'course/pages/UserEmailSubscriptions';
import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import { fetchUserEmailSubscriptions } from './actions/user-email-subscriptions';
import storeCreator from './store';

$(async () => {
  const mountNode = document.getElementById('user-email-subscriptions');

  if (mountNode) {
    const data = await fetchUserEmailSubscriptions();
    const initialData = {
      course: {
        userEmailSubscriptions: {
          settings: data.settings,
          pageFilter: data.subscription_page_filter,
        },
      },
    };

    const store = storeCreator(initialData);
    const root = createRoot(mountNode);

    root.render(
      <ProviderWrapper store={store}>
        <UserEmailSubscriptions />
      </ProviderWrapper>,
    );
  }
});
