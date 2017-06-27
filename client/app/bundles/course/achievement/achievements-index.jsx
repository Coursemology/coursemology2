import React from 'react';
import { render } from 'react-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import storeCreator from './store';
import AchievementIndexPage from './pages/AchievementIndex';

$(document).ready(() => {
  const mountNode = $('.new-btn')[0];

  if (mountNode) {
    const data = mountNode.getAttribute('data');
    const attributes = JSON.parse(data);
    const store = storeCreator({ achievements: {} });
    const Page = () => (
      <ProviderWrapper store={store}>
        <AchievementIndexPage
          badge={{ ...attributes.badge }}
        />
      </ProviderWrapper>
    );

    render(
      <Page />,
      mountNode
    );
  }
});
