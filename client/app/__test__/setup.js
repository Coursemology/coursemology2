import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { createIntl, createIntlCache, IntlProvider } from 'react-intl';
import { createTheme } from '@mui/material/styles';
import Enzyme from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import '@testing-library/jest-dom';

Enzyme.configure({ adapter: new Adapter() });

require('@babel/polyfill');
// Our jquery is from CDN and loaded at runtime, so this is required in test.
const jQuery = require('jquery');

const timeZone = 'Asia/Singapore';
const intlCache = createIntlCache();
const intl = createIntl({ locale: 'en', timeZone }, intlCache);
const courseId = '1';

const muiTheme = createTheme();

const buildContextOptions = (store) => {
  // eslint-disable-next-line react/prop-types
  function WrapWithProviders({ children }) {
    return (
      <IntlProvider {...intl}>
        <Provider store={store}>{children}</Provider>
      </IntlProvider>
    );
  }
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
global.$ = jQuery;
global.jQuery = jQuery;
global.buildContextOptions = buildContextOptions;

// Global mocks
document.head.innerHTML = `<meta name="server-context" data-i18n-locale="en" data-time-zone="${timeZone}">`;

window.history.pushState({}, '', `/courses/${courseId}`);

// Global helper functions

// Sleep for a given period in ms.
function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
global.sleep = sleep;

// summernote does not work well with jsdom in tests, stub it to normal text field.
jest.mock('lib/components/form/fields/RichTextField', () => {
  const TextField = jest.requireActual('lib/components/form/fields/TextField');
  return TextField;
});
