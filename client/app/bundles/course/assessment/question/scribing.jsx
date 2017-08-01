import React from 'react';
import { render } from 'react-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import storeCreator from './scribing/store';
import ScribingQuestion from './scribing/ScribingQuestion';

$(document).ready(() => {
  const mountNode = document.getElementById('scribing-question');

  if (mountNode) {
    const store = storeCreator({ scribingQuestion: {} });

    render(
      <ProviderWrapper store={store}>
        <ScribingQuestion />
      </ProviderWrapper>,
      mountNode
    );
  }
});
