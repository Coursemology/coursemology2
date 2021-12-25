import { render } from 'react-dom';
import { Router } from 'react-router';

import ProviderWrapper from 'lib/components/ProviderWrapper';
import history from 'lib/history';

import SubmissionsLayout from './containers/SubmissionsLayout';
import store from './store';

$(() => {
  const mountNode = document.getElementById('course-assessment-submission');

  if (mountNode) {
    render(
      <ProviderWrapper store={store}>
        <Router history={history}>
          <SubmissionsLayout />
        </Router>
      </ProviderWrapper>,
      mountNode,
    );
  }
});
