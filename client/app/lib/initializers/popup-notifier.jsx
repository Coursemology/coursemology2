import { createRoot } from 'react-dom/client';

import { BrowserRouter } from 'react-router-dom';
import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';
import PopupNotifier from 'course/user-notification/containers/PopupNotifier';
import storeCreator from 'course/user-notification/store';

$(() => {
  const mountNode = document.getElementById('popup-notifier');

  if (mountNode) {
    const store = storeCreator({});
    const root = createRoot(mountNode);

    root.render(
      <ProviderWrapper store={store}>
        <BrowserRouter>
          <PopupNotifier />
        </BrowserRouter>
      </ProviderWrapper>,
    );
  }
});
