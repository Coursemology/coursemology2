import { BrowserRouter } from 'react-router-dom';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';
import NotificationPopup from 'lib/containers/NotificationPopup';

import RoutedApp from './RoutedApp';
import { store } from './store';

const App = (): JSX.Element => (
  <ProviderWrapper store={store}>
    <BrowserRouter>
      <RoutedApp />
    </BrowserRouter>

    <NotificationPopup />
  </ProviderWrapper>
);

export default App;
