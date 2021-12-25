import { render } from 'react-dom';

import ProviderWrapper from 'lib/components/ProviderWrapper';

import ScribingQuestion from './scribing/ScribingQuestion';
import storeCreator from './scribing/store';

$(() => {
  const mountNode = document.getElementById('scribing-question');

  if (mountNode) {
    const store = storeCreator({ scribingQuestion: {} });

    render(
      <ProviderWrapper store={store}>
        <ScribingQuestion />
      </ProviderWrapper>,
      mountNode,
    );
  }
});
