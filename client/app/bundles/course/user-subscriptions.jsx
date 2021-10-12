import React from 'react';
import { render } from 'react-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import UserSubscriptions from 'course/pages/UserSubscriptions';
import storeCreator from './store';

$(document).ready(() => {
  const mountNode = document.getElementById('user-subscriptions');

  if (mountNode) {
    const data = mountNode.getAttribute('data');
    const attributes = JSON.parse(data);
    const initialData = {
      course: {
        userSubscriptions: {
          settings: attributes.settings,
          pageFilter: attributes.subscription_page_filter,
        },
      },
    };
    const store = storeCreator(initialData);
    const Page = () => (
      <ProviderWrapper store={store}>
        <UserSubscriptions />
      </ProviderWrapper>
    );

    render(<Page />, mountNode);
  }
});
