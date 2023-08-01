import Providers from 'lib/components/wrappers/Providers';

import AuthenticatableApp from './routers/AuthenticatableApp';
import { store } from './store';

const App = (): JSX.Element => (
  <Providers store={store}>
    <AuthenticatableApp />
  </Providers>
);

export default App;
