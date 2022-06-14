import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { IntlProvider } from 'react-intl';
import { ToastContainer } from 'react-toastify';
import { i18nLocale } from 'lib/helpers/server-context';
import { createTheme, adaptV4Theme, ThemeProvider } from '@mui/material/styles';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { injectStyle } from 'react-toastify/dist/inject-style';
import palette from '../../theme/palette';
import { grey } from '../../theme/colors';
import ErrorBoundary from './ErrorBoundary';
import translations from '../../../build/locales/locales.json';

injectStyle();

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
    MuiAppBar: {
      // When there is a MUI Dialog component, somehow
      // the color of appbar is changed... smh
      root: {
        background: `${palette.primary.main} !important`,
        color: 'white !important',
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
      root: {
        width: '100%',
      },
      content: {
        margin: 0,
        paddingLeft: '16px',
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
        zIndex: 1,
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
      sizeSmall: {
        padding: '6px 12px',
        height: '40px',
      },
    },
  },
};

export const adaptedTheme = adaptV4Theme(themeSettings);

const themeV5 = createTheme(adaptedTheme);

const ProviderWrapper = ({ store, persistor, children }) => {
  const localeWithoutRegionCode = i18nLocale.toLowerCase().split(/[_-]+/)[0];

  let messages;
  if (localeWithoutRegionCode !== 'en') {
    messages =
      translations[localeWithoutRegionCode] || translations[i18nLocale];
  }

  let providers = (
    <>
      {children}
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );

  if (store && persistor) {
    providers = (
      <PersistGate loading={<LoadingIndicator />} persistor={persistor}>
        {providers}
      </PersistGate>
    );
  }

  providers = (
    <IntlProvider locale={i18nLocale} messages={messages} textComponent="span">
      <ThemeProvider theme={themeV5}>{providers}</ThemeProvider>
    </IntlProvider>
  );

  if (store) {
    providers = <Provider store={store}>{providers}</Provider>;
  }

  return <ErrorBoundary>{providers}</ErrorBoundary>;
};

ProviderWrapper.propTypes = propTypes;

export default ProviderWrapper;
