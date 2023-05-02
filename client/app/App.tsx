import { ReactNode } from 'react';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import { store } from './store';

// eslint-disable-next-line @typescript-eslint/naming-convention
interface TEMPORARY_AppProps {
  children: NonNullable<ReactNode>;
}

const App = (props: TEMPORARY_AppProps): JSX.Element => (
  <ProviderWrapper store={store}>{props.children}</ProviderWrapper>
);

export default App;
