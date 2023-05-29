import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { Persistor } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';

export interface StoreProviderProps {
  store?: Store;
  children: ReactNode;
  persistor?: Persistor;
}

const StoreProvider = (props: StoreProviderProps): JSX.Element => {
  if (!props.store) return props.children as JSX.Element;

  return (
    <Provider store={props.store}>
      {props.persistor ? (
        <PersistGate loading={<LoadingIndicator />} persistor={props.persistor}>
          {props.children}
        </PersistGate>
      ) : (
        props.children
      )}
    </Provider>
  );
};

export default StoreProvider;
