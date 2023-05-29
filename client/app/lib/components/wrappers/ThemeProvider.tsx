import { ReactNode } from 'react';
import {
  createTheme,
  StyledEngineProvider,
  ThemeProvider as MuiThemeProvider,
} from '@mui/material/styles';
// eslint-disable-next-line import/no-extraneous-dependencies
import resolveConfig from 'tailwindcss/resolveConfig';
import { grey } from 'theme/colors';
import palette from 'theme/palette';

import tailwindUserConfig from '../../../../tailwind.config';

interface ThemeProviderProps {
  children: ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tailwindConfig = resolveConfig(tailwindUserConfig) as any;

const pxToNumber = (pixels: string): number =>
  parseInt(pixels.replace('px', ''), 10);

const ThemeProvider = (props: ThemeProviderProps): JSX.Element => {
  // TODO: Replace with React's createRoot once true SPA is ready
  const rootElement = document.getElementById('root');

  const theme = createTheme({
    palette,
    // https://material-ui.com/customization/themes/#typography---html-font-size
    // https://material-ui.com/style/typography/#migration-to-typography-v2
    typography: {
      htmlFontSize: 10,
      fontFamily: `'Inter', 'sans-serif'`,
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: pxToNumber(tailwindConfig.theme.screens.sm),
        md: pxToNumber(tailwindConfig.theme.screens.md),
        lg: pxToNumber(tailwindConfig.theme.screens.lg),
        xl: pxToNumber(tailwindConfig.theme.screens.xl),
      },
    },
    components: {
      MuiTab: {
        styleOverrides: {
          root: { textTransform: 'none' },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
          classes: { root: 'rounded-full px-4 py-2' },
        },
        styleOverrides: {
          root: { textTransform: 'none' },
        },
      },
      MuiDialog: {
        defaultProps: {
          container: rootElement,
          PaperProps: {
            className: 'rounded-2xl shadow-2xl',
          },
        },
      },
      MuiPopover: {
        // TODO: *Must* remove once SPA is ready
        // Popover elements, e.g., Menu, MenuItem, attaches an `overflow: hidden` style to this `container` to
        // prevent scrolling and having the Popover floating senselessly in the `container`. Usually, this `container`
        // defaults to `body`. This time, we set it to `rootElement` which is NOT `body` nor the viewport. This causes
        // the senseless floating issue while the page scrolls.
        defaultProps: { container: rootElement },
      },
      MuiPopper: {
        defaultProps: { container: rootElement },
      },
      MuiCard: { styleOverrides: { root: { overflow: 'visible' } } },
      MuiMenuItem: { styleOverrides: { root: { height: '48px' } } },
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

  return (
    <StyledEngineProvider injectFirst>
      <MuiThemeProvider theme={theme}>{props.children}</MuiThemeProvider>
    </StyledEngineProvider>
  );
};

export default ThemeProvider;
