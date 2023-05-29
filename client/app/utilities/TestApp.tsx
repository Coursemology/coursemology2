import { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AppState, setUpStoreWithState, store as appStore } from 'store';

import Providers from 'lib/components/wrappers/Providers';
import NotificationPopup from 'lib/containers/NotificationPopup';

export interface CustomRenderOptions {
  at?: string[];
  state?: Partial<AppState>;
}

interface TestAppProps extends CustomRenderOptions {
  children: ReactNode;
}

const TestApp = (props: TestAppProps): JSX.Element => {
  const { at: entries } = props;

  const store = props.state ? setUpStoreWithState(props.state) : appStore;

  return (
    <Providers store={store}>
      <MemoryRouter initialEntries={entries}>{props.children}</MemoryRouter>

      <NotificationPopup />
    </Providers>
  );
};

export default TestApp;
