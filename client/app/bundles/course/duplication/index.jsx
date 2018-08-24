import React from 'react';
import { render } from 'react-dom';
import { Router } from 'react-router-dom';
import history from 'lib/history';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import DuplicationLayout from 'course/duplication/containers/DuplicationLayout';
import storeCreator from './store';

$(document).ready(() => {
  const mountNode = document.getElementById('course-duplication');

  if (mountNode) {
    const store = storeCreator({ duplication: {} });

    render(
      <ProviderWrapper {...{ store }}>
        <Router history={history}>
          <DuplicationLayout />
        </Router>
      </ProviderWrapper>,
      mountNode
    );
  }
});
