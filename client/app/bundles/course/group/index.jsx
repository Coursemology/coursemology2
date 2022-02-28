import React from 'react';
import { render } from 'react-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import storeCreator from './store';
import GroupIndex from './pages/GroupIndex';
import GroupShow from './pages/GroupShow';
import GroupNew from './pages/GroupNew';

$(document).ready(() => {
  const categoryShowMountNode = document.getElementById(
    'course-group-show-component',
  );
  const categoryIndexMountNode = document.getElementById(
    'course-group-index-component',
  );
  const newButtonMountNode = $('.new-btn')[0];

  let store;
  if (categoryShowMountNode || newButtonMountNode) {
    store = storeCreator();
  }

  if (categoryShowMountNode) {
    const data = categoryShowMountNode.getAttribute('data');
    const attributes = JSON.parse(data);

    render(
      <ProviderWrapper store={store}>
        <GroupShow groupCategoryId={attributes.group_category_id} />
      </ProviderWrapper>,
      categoryShowMountNode,
    );
  }

  if (categoryIndexMountNode) {
    render(
      <ProviderWrapper>
        <GroupIndex />
      </ProviderWrapper>,
      categoryIndexMountNode,
    );
  }

  if (newButtonMountNode) {
    render(
      <ProviderWrapper store={store}>
        <GroupNew />
      </ProviderWrapper>,
      newButtonMountNode,
    );
  }
});
