import React from 'react';
import { render } from 'react-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import Submission from './containers/Submission';
import storeCreator from './store';

$(document).ready(() => {
  const mountNode = document.getElementById('video-component');

  if (mountNode) {
    const data = mountNode.getAttribute('data');
    const initialState = JSON.parse(data);
    const store = storeCreator(initialState);

    render(
      <ProviderWrapper {...{ store }}>
        <Submission />
      </ProviderWrapper>
      , mountNode);
  }
});
