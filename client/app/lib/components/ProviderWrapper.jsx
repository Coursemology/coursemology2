import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { IntlProvider, addLocaleData } from 'react-intl';
import { i18nLocale } from 'lib/helpers/server-context';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import zh from 'react-intl/locale-data/zh';

import ErrorBoundary from './ErrorBoundary';
import translations from '../../../build/locales/locales.json';

const propTypes = {
  store: PropTypes.shape({
    subscribe: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    getState: PropTypes.func.isRequired,
  }),
  persistor: PropTypes.object,
  children: PropTypes.element.isRequired,
};

const ProviderWrapper = ({ store, persistor, children }) => {
  const availableForeignLocales = { zh };
  const localeWithoutRegionCode = i18nLocale.toLowerCase().split(/[_-]+/)[0];

  let messages;
  if (
    localeWithoutRegionCode !== 'en' &&
    availableForeignLocales[localeWithoutRegionCode]
  ) {
    addLocaleData(availableForeignLocales[localeWithoutRegionCode]);
    messages =
      translations[localeWithoutRegionCode] || translations[i18nLocale];
  }

  let providers = children;

  if (store && persistor) {
    providers = (
      <PersistGate loading={<LoadingIndicator />} persistor={persistor}>
        {providers}
      </PersistGate>
    );
  }

  providers = (
    <IntlProvider locale={i18nLocale} messages={messages}>
      <MuiThemeProvider>{providers}</MuiThemeProvider>
    </IntlProvider>
  );

  if (store) {
    providers = <Provider store={store}>{providers}</Provider>;
  }

  return <ErrorBoundary>{providers}</ErrorBoundary>;
};

ProviderWrapper.propTypes = propTypes;

export default ProviderWrapper;
