import { render } from 'react-dom';
import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';
import storeCreator from './scribing/store';
import ScribingQuestion from './scribing/ScribingQuestion';

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
