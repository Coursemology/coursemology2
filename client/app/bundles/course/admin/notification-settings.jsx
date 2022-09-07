import { render } from 'react-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import NotificationSettings from 'course/admin/pages/NotificationSettings';
import { store } from './store';
import { update } from './reducers/notificationSettings';

$(() => {
  const mountNode = document.getElementById('notification-settings');

  if (mountNode) {
    const data = mountNode.getAttribute('data');
    const attributes = JSON.parse(data);

    store.dispatch(update(attributes));

    const Page = () => (
      <ProviderWrapper store={store}>
        <NotificationSettings />
      </ProviderWrapper>
    );

    render(<Page />, mountNode);
  }
});
