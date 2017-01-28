import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory } from 'react-router';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import storeCreator from './surveys/store';
import routes from './surveys/routes';

const mountNode = document.getElementById('course-survey-component');

if (mountNode) {
  const store = storeCreator({ surveys: {} });

  $(document).ready(() => {
    render(
      <ProviderWrapper {...{ store }}>
        <Router routes={routes} history={browserHistory} />
      </ProviderWrapper>
    , mountNode);
  });
}
