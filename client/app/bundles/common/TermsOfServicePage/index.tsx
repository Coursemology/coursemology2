import { lazy, Suspense } from 'react';
import { defineMessages } from 'react-intl';

const TermsOfServicePage = lazy(
  () =>
    import(/* webpackChunkName: "TermsOfServicePage" */ './TermsOfServicePage'),
);

const translations = defineMessages({
  termsOfService: {
    id: 'app.TermsOfServicePage.termsOfService',
    defaultMessage: 'Terms of Service',
  },
});

const SuspensedTermsOfServicePage = (): JSX.Element => (
  <Suspense>
    <TermsOfServicePage />
  </Suspense>
);

const handle = translations.termsOfService;

export default Object.assign(SuspensedTermsOfServicePage, { handle });
