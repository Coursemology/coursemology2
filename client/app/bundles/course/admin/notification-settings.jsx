import React from 'react';
import { render } from 'react-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import NotificationSettings from 'course/admin/pages/NotificationSettings';
import storeCreator from './store';

$(document).ready(() => {
  const mountNode = document.getElementById('notification-settings');

  if (mountNode) {
    const data = mountNode.getAttribute('data');
    const attributes = JSON.parse(data);
    const initialData = { admin: { notificationSettings: attributes } };
    const store = storeCreator(initialData);

    const Page = () => (
      <ProviderWrapper store={store}>
        <NotificationSettings />
      </ProviderWrapper>
    );

    render(
      <Page />,
      mountNode
    );
  }
});
