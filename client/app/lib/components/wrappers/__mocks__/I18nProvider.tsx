import { ReactNode } from 'react';
import { IntlProvider } from 'react-intl';

// Manual mock for lib/components/wrappers/I18nProvider. The real provider renders
// a LoadingIndicator while it async-loads locale messages, so suites that assert
// synchronously would only ever see the spinner. Activate this synchronous
// stand-in per-suite with `jest.mock('lib/components/wrappers/I18nProvider')`.
// It is NOT applied automatically — only when a test opts in — so suites relying
// on the real provider's loading transition are unaffected.
const I18nProvider = ({ children }: { children: ReactNode }): JSX.Element => (
  <IntlProvider defaultLocale="en" locale="en" messages={{}}>
    {children}
  </IntlProvider>
);

export default I18nProvider;
