import { render } from 'react-dom';
import { Router } from 'react-router-dom';

import PopupNotifier from 'course/user-notification/containers/PopupNotifier';
import storeCreator from 'course/user-notification/store';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import history from 'lib/history';

$(() => {
  const mountNode = document.getElementById('popup-notifier');

  if (mountNode) {
    const store = storeCreator({});

    render(
      <ProviderWrapper {...{ store }}>
        <Router history={history}>
          <PopupNotifier />
        </Router>
      </ProviderWrapper>,
      mountNode,
    );
  }
});
