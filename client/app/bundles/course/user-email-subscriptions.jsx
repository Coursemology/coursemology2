import { createRoot } from 'react-dom/client';

import UserEmailSubscriptions from 'course/pages/UserEmailSubscriptions';
import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import { fetchUserEmailSubscriptions } from './actions/user-email-subscriptions';
import storeCreator from './store';

$(async () => {
  const mountNode = document.getElementById('app-root');

  if (mountNode) {
    // When unsubscribe link is clicked from an email, it passes some params
    // for unsubscription. Below, we extract the params and pass it
    // to the backend through the API call to trigger the unsubscription action.
    const queryParams = new URLSearchParams(window.location.search);
    const data = await fetchUserEmailSubscriptions(queryParams);
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
