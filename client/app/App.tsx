import { BrowserRouter } from 'react-router-dom';

import Providers from 'lib/components/wrappers/Providers';
import NotificationPopup from 'lib/containers/NotificationPopup';

import RoutedApp from './RoutedApp';
import { store } from './store';

const App = (): JSX.Element => (
  <Providers store={store}>
    <BrowserRouter>
      <RoutedApp />
    </BrowserRouter>

    <NotificationPopup />
  </Providers>
);

export default App;
