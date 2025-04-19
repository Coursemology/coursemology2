import { createIntl, createIntlCache, IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { createTheme } from '@mui/material/styles';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme from 'enzyme';
import PropTypes from 'prop-types';

import 'jest-canvas-mock';
import '@testing-library/jest-dom';
// define all mocks/polyfills
import './mocks/requestAnimationFrame';
import './mocks/ResizeObserver';
import './mocks/matchMedia';

Enzyme.configure({ adapter: new Adapter() });

const timeZone = 'Asia/Singapore';
const intlCache = createIntlCache();
const intl = createIntl({ locale: 'en', timeZone }, intlCache);
const courseId = '1';

const muiTheme = createTheme();

const buildContextOptions = (store) => {
  // eslint-disable-next-line react/prop-types
  const WrapWithProviders = ({ children }) => (
    <IntlProvider {...intl}>
      <Provider store={store}>{children}</Provider>
    </IntlProvider>
  );
  return {
    context: { muiTheme },
    childContextTypes: {
      muiTheme: PropTypes.object,
      intl: PropTypes.object,
    },
    wrappingComponent: store ? WrapWithProviders : IntlProvider,
    wrappingComponentProps: store ? null : intl,
  };
};

// Global variables
global.courseId = courseId;
global.window = window;
global.muiTheme = muiTheme;
global.buildContextOptions = buildContextOptions;

window.history.pushState({}, '', `/courses/${courseId}`);

// Global helper functions

// Sleep for a given period in ms.
function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
global.sleep = sleep;

// summernote does not work well with jsdom in tests, stub it to normal text field.
jest.mock('lib/components/form/fields/RichTextField', () =>
  jest.requireActual('lib/components/form/fields/TextField'),
);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  unstable_usePrompt: jest.fn(),
}));
