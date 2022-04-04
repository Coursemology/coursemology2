import { render } from 'react-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import storeCreator from './store';
import StatisticsIndex from './pages/StatisticsIndex';

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
