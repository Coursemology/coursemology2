import React from 'react';
import { render } from 'react-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import storeCreator from './store';
import Groups from './pages/Groups';

$(document).ready(() => {
  const mountNode = document.getElementById('course-group-component');

  if (mountNode) {
    // TODO: Create store with data
    const store = storeCreator({});

    render(
      <ProviderWrapper store={store}>
        <Groups />
      </ProviderWrapper>,
      mountNode,
    );
  }
});
