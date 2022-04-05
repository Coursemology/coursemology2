import { render } from 'react-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import LearningMap from './containers/LearningMap';
import storeCreator from './store';

$(() => {
  const mountNode = document.getElementById('course-learning-map');
  const store = storeCreator({ learningMap: {} });

  if (mountNode) {
    render(
      <ProviderWrapper {...{ store }}>
        <LearningMap />
      </ProviderWrapper>,
      mountNode,
    );
  }
});
