import { createRoot } from 'react-dom/client';

import { fromJS } from 'immutable';
import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';
import storeCreator from './programming/store';
import ProgrammingQuestion from './programming/ProgrammingQuestion';

$(() => {
  const mountNode = document.getElementById('programming-question');
  if (mountNode) {
    const data = mountNode.getAttribute('data');
    const props = fromJS(JSON.parse(data));
    const store = storeCreator(props);
    const root = createRoot(mountNode);

    root.render(
      <ProviderWrapper store={store}>
        <ProgrammingQuestion />
      </ProviderWrapper>,
    );
  }
});
