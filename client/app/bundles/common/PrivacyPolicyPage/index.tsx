import { lazy, Suspense } from 'react';
import { defineMessages } from 'react-intl';

const PrivacyPolicyPage = lazy(
  () =>
    import(/* webpackChunkName: "PrivacyPolicyPage" */ './PrivacyPolicyPage'),
);

const translations = defineMessages({
  privacyPolicy: {
    id: 'app.PrivacyPolicyPage.privacyPolicy',
    defaultMessage: 'Privacy Policy',
  },
});

const SuspensedPrivacyPolicyPage = (): JSX.Element => (
  <Suspense>
    <PrivacyPolicyPage />
  </Suspense>
);

const handle = translations.privacyPolicy;

export default Object.assign(SuspensedPrivacyPolicyPage, { handle });
