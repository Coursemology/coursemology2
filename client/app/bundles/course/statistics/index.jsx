import { render } from 'react-dom';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import StatisticsIndex from './pages/StatisticsIndex';
import storeCreator from './store';

$(() => {
  const mountNode = document.getElementById('course-statistics-component');
  if (mountNode) {
    const store = storeCreator();
    render(
      <ProviderWrapper store={store}>
        <StatisticsIndex />
      </ProviderWrapper>,
      mountNode,
    );
  }
});
