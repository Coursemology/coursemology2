import { render } from 'react-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import NotificationPopup from 'lib/containers/NotificationPopup';
import Level from 'course/level/pages/Level';
import storeCreator from './store';

$(document).ready(() => {
  const mountNode = document.getElementById('course-level');

  if (mountNode) {
    const store = storeCreator({});

    render(
      <ProviderWrapper store={store}>
        <div>
          <NotificationPopup />
          <Level />
        </div>
      </ProviderWrapper>,
      mountNode,
    );
  }
});
