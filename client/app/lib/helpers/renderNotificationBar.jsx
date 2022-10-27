import { createRoot } from 'react-dom/client';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';
import NotificationBar from 'lib/components/core/NotificationBar';
import { getOrCreateNode } from 'lib/helpers/rails-helpers';

/**
 * Renders a react notification bar with the given message.
 *
 * @param {string} id The id of the DOM node
 * @param {string} message The notification message.
 */
function renderNotificationBar(id, message) {
  const mountNode = getOrCreateNode(id);
  const root = createRoot(mountNode);

  root.render(
    <ProviderWrapper>
      <NotificationBar notification={{ message }} />
    </ProviderWrapper>,
  );
}

export default renderNotificationBar;
