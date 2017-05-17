import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { IntlProvider, addLocaleData } from 'react-intl';
import { i18nLocale } from 'lib/helpers/server-context';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'lib/injectTapEventPlugin';

import zh from 'react-intl/locale-data/zh';

import translations from '../../../build/locales/locales.json';

injectTapEventPlugin();

const propTypes = {
  store: PropTypes.shape({
    subscribe: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    getState: PropTypes.func.isRequired,
  }),
  children: PropTypes.element.isRequired,
};

const ProviderWrapper = ({ store, children }) => {
  const availableForeignLocales = { zh };
  const localeWithoutRegionCode = i18nLocale.toLowerCase().split(/[_-]+/)[0];

  let messages;
  if (localeWithoutRegionCode !== 'en' && availableForeignLocales[localeWithoutRegionCode]) {
    addLocaleData(availableForeignLocales[localeWithoutRegionCode]);
    messages = translations[localeWithoutRegionCode] || translations[i18nLocale];
  }

  let providers =
    (<IntlProvider locale={i18nLocale} messages={messages}>
      <MuiThemeProvider>
        { children }
      </MuiThemeProvider>
    </IntlProvider>);

  if (store) {
    providers =
      (<Provider store={store}>
        {providers}
      </Provider>);
  }

  return providers;
};

ProviderWrapper.propTypes = propTypes;

export default ProviderWrapper;
