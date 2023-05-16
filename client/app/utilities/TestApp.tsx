import { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AppState, setUpStoreWithState, store as appStore } from 'store';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';
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
    <ProviderWrapper store={store}>
      <MemoryRouter initialEntries={entries}>{props.children}</MemoryRouter>

      <NotificationPopup />
    </ProviderWrapper>
  );
};

export default TestApp;
