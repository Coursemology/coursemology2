import { createRoot } from 'react-dom/client';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';
import UserEmailSubscriptions from 'course/pages/UserEmailSubscriptions';
import storeCreator from './store';
import { fetchUserEmailSubscriptions } from './actions/user-email-subscriptions';

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
