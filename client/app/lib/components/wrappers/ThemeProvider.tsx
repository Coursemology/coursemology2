import { ReactNode } from 'react';
import type {} from '@mui/lab/themeAugmentation';
import { CssBaseline } from '@mui/material';
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
  const theme = createTheme({
    palette,
    // https://material-ui.com/customization/themes/#typography---html-font-size
    // https://material-ui.com/style/typography/#migration-to-typography-v2
    typography: {
      htmlFontSize: 10,
      fontFamily: `'Inter', 'sans-serif'`,
      h1: undefined,
      h2: undefined,
      h3: {
        fontWeight: 800,
        letterSpacing: '-0.05em',
      },
      h4: {
        fontWeight: 700,
        letterSpacing: '-0.04em',
      },
    },
    breakpoints: {
      values: {
        xs: pxToNumber(tailwindConfig.theme.screens.xs),
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
          classes: {
            root: 'rounded-full',
          },
        },
        styleOverrides: {
          root: { textTransform: 'none' },
        },
      },
      MuiLoadingButton: {
        defaultProps: {
          disableElevation: true,
          classes: {
            root: 'rounded-full',
            sizeLarge: 'px-5 py-3',
            sizeMedium: 'px-2 py-2',
            sizeSmall: 'min-w-[6rem] px-1 py-1',
          },
        },
      },
      MuiDialog: {
        defaultProps: {
          PaperProps: {
            className: 'rounded-2xl shadow-2xl',
          },
        },
      },
      MuiCard: { styleOverrides: { root: { overflow: 'visible' } } },
      MuiMenuItem: { styleOverrides: { root: { height: '48px' } } },
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
      MuiFilledInput: {
        defaultProps: {
          disableUnderline: true,
          classes: {
            root: 'rounded-xl overflow-hidden',
            focused: 'ring-2 ring-primary',
            error: 'ring-2 ring-red-400',
          },
        },
      },
      MuiAlert: {
        defaultProps: {
          classes: {
            // For some reasons, `Alert`s with `error` and `success` severities
            // is shown with the faintest of colour that's almost invisible.
            standardError: 'bg-red-100/70',
            standardSuccess: 'bg-lime-50',
          },
        },
      },
    },
  });

  return (
    <StyledEngineProvider injectFirst>
      <CssBaseline />
      <MuiThemeProvider theme={theme}>{props.children}</MuiThemeProvider>
    </StyledEngineProvider>
  );
};

export default ThemeProvider;
