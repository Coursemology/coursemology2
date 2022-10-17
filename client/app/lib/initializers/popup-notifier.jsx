import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';
import PopupNotifier from 'course/user-notification/containers/PopupNotifier';
import storeCreator from 'course/user-notification/store';

$(() => {
  const mountNode = document.getElementById('popup-notifier');

  if (mountNode) {
    const store = storeCreator({});

    render(
      <ProviderWrapper {...{ store }}>
        <BrowserRouter>
          <PopupNotifier />
        </BrowserRouter>
      </ProviderWrapper>,
      mountNode,
    );
  }
});
