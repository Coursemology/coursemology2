import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { IntlProvider, intlShape } from 'react-intl';
import { createTheme } from '@mui/material/styles';
import Enzyme from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';

Enzyme.configure({ adapter: new Adapter() });

require('@babel/polyfill');
// Our jquery is from CDN and loaded at runtime, so this is required in test.
const jQuery = require('jquery');

const timeZone = 'Asia/Singapore';
const intlProvider = new IntlProvider({ locale: 'en', timeZone }, {});
const courseId = '1';

const muiTheme = createTheme();
const intl = intlProvider.getChildContext().intl;

const buildContextOptions = (store) => {
  // eslint-disable-next-line react/prop-types
  function WrapWithProviders({ children }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return {
    context: { intl, muiTheme },
    childContextTypes: {
      muiTheme: PropTypes.object,
      intl: intlShape,
    },
    wrappingComponent: store ? WrapWithProviders : null,
  };
};

// Global variables
global.courseId = courseId;
global.window = window;
global.intl = intl;
global.intlShape = intlShape;
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
