import { ReactNode } from 'react';
import { createIntl, createIntlCache, IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { MountRendererProps } from 'enzyme';
import { Store } from 'redux';

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

// Mount options for the remaining Enzyme tests: wraps the component in the intl provider, and the
// Redux provider when a store is given.
const buildContextOptions = (store?: Store): MountRendererProps => {
  if (!store) {
    return { wrappingComponent: IntlProvider, wrappingComponentProps: intl };
  }

  const WrapWithProviders = ({
    children,
  }: {
    children: ReactNode;
  }): JSX.Element => (
    <IntlProvider {...intl}>
      <Provider store={store}>{children}</Provider>
    </IntlProvider>
  );
  return { wrappingComponent: WrapWithProviders };
};

// Global variables
global.courseId = courseId;
global.buildContextOptions = buildContextOptions;

window.history.pushState({}, '', `/courses/${courseId}`);

// Global helper functions

// Sleep for a given period in ms.
const sleep = (time: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
  });
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
