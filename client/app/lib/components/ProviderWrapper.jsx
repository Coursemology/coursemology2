import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { IntlProvider, addLocaleData } from 'react-intl';
import { i18nLocale } from 'lib/helpers/server-context';
import { MuiThemeProvider, createTheme } from '@material-ui/core/styles';
import {
  createTheme as createThemeV5,
  adaptV4Theme,
  ThemeProvider,
} from '@mui/material/styles';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import zh from 'react-intl/locale-data/zh';
import palette from '../../theme/palette';
import { black, grey, white } from '../../theme/colors';

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

const themeSettings = {
  palette,
  // https://material-ui.com/customization/themes/#typography---html-font-size
  // https://material-ui.com/style/typography/#migration-to-typography-v2
  typography: {
    htmlFontSize: 10,
  },
  overrides: {
    MuiButton: {
      contained: {
        color: black,
        backgroundColor: white,
      },
    },
    MuiDialogContent: {
      root: {
        color: 'black',
        fontSize: '16px',
        fontFamily: `'Roboto', 'sans-serif'`,
      },
    },
    MuiAccordionSummary: {
      content: {
        margin: 0,
        '&$expanded': { margin: 0 },
      },
    },
    MuiMenuItem: {
      root: {
        height: '48px',
      },
    },
    MuiModal: {
      root: {
        zIndex: 1800,
      },
    },
    MuiStepLabel: {
      iconContainer: {
        paddingLeft: '2px',
        paddingRight: '2px',
      },
    },
    MuiTableCell: {
      root: {
        padding: '8px 14px',
        height: '48px',
      },
      head: {
        color: grey[500],
        padding: '16px 16px',
      },
    },
    MuiTabs: {
      root: {
        backgroundColor: palette.primary.main,
        color: 'white',
      },
    },
  },
};

const theme = createTheme(themeSettings);
const themeV5 = createThemeV5(adaptV4Theme(themeSettings));

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
      <ThemeProvider theme={themeV5}>
        <MuiThemeProvider theme={theme}>{providers}</MuiThemeProvider>{' '}
      </ThemeProvider>
    </IntlProvider>
  );

  if (store) {
    providers = <Provider store={store}>{providers}</Provider>;
  }

  return <ErrorBoundary>{providers}</ErrorBoundary>;
};

ProviderWrapper.propTypes = propTypes;

export default ProviderWrapper;
