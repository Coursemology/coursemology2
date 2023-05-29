import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Providers from 'lib/components/wrappers/Providers';

import router from './router';
import { store } from './store';

const App = (): JSX.Element => (
  <Providers store={store}>
    <RouterProvider router={createBrowserRouter(router)} />
  </Providers>
);

export default App;
