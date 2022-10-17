import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';
import SurveysLayout from './containers/SurveysLayout';
import storeCreator from './store';

$(() => {
  const mountNode = document.getElementById('course-survey-component');

  if (mountNode) {
    const store = storeCreator({ surveys: {} });

    render(
      <ProviderWrapper {...{ store }}>
        <BrowserRouter>
          <SurveysLayout />
        </BrowserRouter>
      </ProviderWrapper>,
      mountNode,
    );
  }
});
