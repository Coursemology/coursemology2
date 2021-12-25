import { render } from 'react-dom';

import UserEmailSubscriptions from 'course/pages/UserEmailSubscriptions';
import ProviderWrapper from 'lib/components/ProviderWrapper';

import storeCreator from './store';

$(document).ready(() => {
  const mountNode = document.getElementById('user-email-subscriptions');

  if (mountNode) {
    const data = mountNode.getAttribute('data');
    const attributes = JSON.parse(data);
    const initialData = {
      course: {
        userEmailSubscriptions: {
          settings: attributes.settings,
          pageFilter: attributes.subscription_page_filter,
        },
      },
    };
    const store = storeCreator(initialData);
    const Page = () => (
      <ProviderWrapper store={store}>
        <UserEmailSubscriptions />
      </ProviderWrapper>
    );

    render(<Page />, mountNode);
  }
});
