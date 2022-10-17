import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';
import DuplicationLayout from 'course/duplication/containers/DuplicationLayout';
import storeCreator from './store';

$(() => {
  const mountNode = document.getElementById('course-duplication');

  if (mountNode) {
    const store = storeCreator({ duplication: {} });

    render(
      <ProviderWrapper {...{ store }}>
        <BrowserRouter>
          <DuplicationLayout />
        </BrowserRouter>
      </ProviderWrapper>,
      mountNode,
    );
  }
});
