import { IntlProvider } from 'react-intl';
import { Provider as ReduxProvider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { injectStyle } from 'react-toastify/dist/inject-style';
import {
  createTheme,
  StyledEngineProvider,
  ThemeProvider,
} from '@mui/material/styles';
import PropTypes from 'prop-types';
import { PersistGate } from 'redux-persist/lib/integration/react';
import resolveConfig from 'tailwindcss/resolveConfig';
import { grey } from 'theme/colors';
import palette from 'theme/palette';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { i18nLocale } from 'lib/helpers/server-context';

import translations from '../../../../build/locales/locales.json';
import tailwindUserConfig from '../../../../tailwind.config';

import ErrorBoundary from './ErrorBoundary';
import RollBarWrapper from './RollbarWrapper';

injectStyle();

const propTypes = {
  store: PropTypes.shape({
    subscribe: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    getState: PropTypes.func.isRequired,
  }),
  persistor: PropTypes.object,
  children: PropTypes.node.isRequired,
};

const tailwindConfig = resolveConfig(tailwindUserConfig);

const pxInInt = (pixels) => parseInt(pixels.replace('px', ''), 10);

const ProviderWrapper = ({ store, persistor, children }) => {
  const localeWithoutRegionCode = i18nLocale.toLowerCase().split(/[_-]+/)[0];

  // TODO: Replace with React's createRoot once true SPA is ready
  const rootElement = document.getElementById('root');

  const theme = createTheme({
    palette,
    // https://material-ui.com/customization/themes/#typography---html-font-size
    // https://material-ui.com/style/typography/#migration-to-typography-v2
    typography: {
      htmlFontSize: 10,
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: pxInInt(tailwindConfig.theme.screens.sm),
        md: pxInInt(tailwindConfig.theme.screens.md),
        lg: pxInInt(tailwindConfig.theme.screens.lg),
        xl: pxInInt(tailwindConfig.theme.screens.xl),
      },
    },
    components: {
      MuiDialog: {
        defaultProps: { container: rootElement },
      },
      MuiPopover: {
        defaultProps: { container: rootElement },
      },
      MuiPopper: {
        defaultProps: { container: rootElement },
      },
      MuiCard: { styleOverrides: { root: { overflow: 'visible' } } },
      MuiMenuItem: { styleOverrides: { root: { height: '48px' } } },
      MuiAppBar: {
        styleOverrides: {
          // When there is a MUI Dialog component, somehow
          // the color of appbar is changed... smh
          root: {
            background: `${palette.primary.main} !important`,
            color: 'white !important',
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            color: 'black',
            fontSize: '16px',
            fontFamily: `'Roboto', 'sans-serif'`,
          },
        },
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: { width: '100%' },
          content: {
            margin: 0,
            paddingLeft: '16px',
            '&$expanded': { margin: 0 },
          },
        },
      },
      MuiStepLabel: {
        styleOverrides: {
          iconContainer: {
            paddingLeft: '2px',
            paddingRight: '2px',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
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
      MuiTableRow: {
        styleOverrides: {
          root: { '&:last-child td, &:last-child th': { border: 0 } },
        },
      },
    },
  });

  let messages;
  if (localeWithoutRegionCode !== 'en') {
    messages =
      translations[localeWithoutRegionCode] || translations[i18nLocale];
  }

  let providers = (
    <>
      {children}
      <ToastContainer position="bottom-center" />
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
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>{providers}</ThemeProvider>
      </StyledEngineProvider>
    </IntlProvider>
  );

  if (store) {
    providers = <ReduxProvider store={store}>{providers}</ReduxProvider>;
  }

  return (
    <RollBarWrapper>
      <ErrorBoundary>{providers}</ErrorBoundary>
    </RollBarWrapper>
  );
};

ProviderWrapper.propTypes = propTypes;

export const StoreProviderWrapper = ({ store, persistor, children }) => {
  let providers = children;

  if (store && persistor) {
    providers = (
      <PersistGate loading={<LoadingIndicator />} persistor={persistor}>
        {providers}
      </PersistGate>
    );
  }

  if (store)
    providers = <ReduxProvider store={store}>{providers}</ReduxProvider>;

  return providers;
};

StoreProviderWrapper.propTypes = propTypes;

export default ProviderWrapper;
