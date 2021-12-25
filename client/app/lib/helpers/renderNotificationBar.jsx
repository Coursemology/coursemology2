import { render } from 'react-dom';

import NotificationBar from 'lib/components/NotificationBar';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import { getOrCreateNode } from 'lib/helpers/rails-helpers';

/**
 * Renders a react notification bar with the given message.
 *
 * @param {string} id The id of the DOM node
 * @param {string} message The notification message.
 */
function renderNotificationBar(id, message) {
  const mountNode = getOrCreateNode(id);
  render(
    <ProviderWrapper>
      <NotificationBar notification={{ message }} />
    </ProviderWrapper>,
    mountNode,
  );
}

export default renderNotificationBar;
