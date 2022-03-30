import { render } from 'react-dom';
import { Router } from 'react-router-dom';
import history from 'lib/history';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import SurveysLayout from './containers/SurveysLayout';
import storeCreator from './store';

$(() => {
  const mountNode = document.getElementById('course-survey-component');

  if (mountNode) {
    const store = storeCreator({ surveys: {} });

    render(
      <ProviderWrapper {...{ store }}>
        <Router history={history}>
          <SurveysLayout />
        </Router>
      </ProviderWrapper>,
      mountNode,
    );
  }
});
