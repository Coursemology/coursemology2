import { ReactNode } from 'react';

import AttributionsProvider from './AttributionsProvider';
import ErrorBoundary from './ErrorBoundary';
import I18nProvider from './I18nProvider';
import RollbarProvider from './RollbarWrapper';
import StoreProvider, { StoreProviderProps } from './StoreProvider';
import ThemeProvider from './ThemeProvider';
import ToastProvider from './ToastProvider';

interface ProvidersProps extends StoreProviderProps {
  children: ReactNode;
}

const Providers = (props: ProvidersProps): JSX.Element => (
  <RollbarProvider>
    <ErrorBoundary>
      <StoreProvider persistor={props.persistor} store={props.store}>
        <I18nProvider>
          <ThemeProvider>
            <ToastProvider>
              <AttributionsProvider>{props.children}</AttributionsProvider>
            </ToastProvider>
          </ThemeProvider>
        </I18nProvider>
      </StoreProvider>
    </ErrorBoundary>
  </RollbarProvider>
);

export default Providers;
