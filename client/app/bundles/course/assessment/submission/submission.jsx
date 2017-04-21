import React from 'react';
import { render } from 'react-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import { Router, browserHistory } from 'react-router';
import store from './store';
import routes from './routes';

$(document).ready(() => {
  const mountNode = document.getElementById('submission-edit');

  if (mountNode) {
    render(
      <ProviderWrapper store={store}>
        <Router routes={routes} history={browserHistory} />
      </ProviderWrapper>
    , mountNode);
  }
});
