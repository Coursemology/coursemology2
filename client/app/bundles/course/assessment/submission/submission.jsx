/* eslint-disable import/no-extraneous-dependencies, import/extensions, import/no-unresolved */

import React from 'react';
import { render } from 'react-dom';
import { Router } from 'react-router';
import history from 'lib/history';
import ProviderWrapper from 'lib/components/ProviderWrapper';

import store from './store';
import SubmissionsLayout from './containers/SubmissionsLayout';

$(document).ready(() => {
  const mountNode = document.getElementById('course-assessment-submission');

  if (mountNode) {
    render(
      <ProviderWrapper store={store}>
        <Router history={history}>
          <SubmissionsLayout />
        </Router>
      </ProviderWrapper>
      , mountNode
    );
  }
});
