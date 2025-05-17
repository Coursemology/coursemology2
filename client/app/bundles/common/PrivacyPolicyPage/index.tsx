import { defineMessages } from 'react-intl';

import MarkdownPage from 'lib/components/core/layouts/MarkdownPage';

import privacyPolicy from './privacy-policy.md';

const translations = defineMessages({
  privacyPolicy: {
    id: 'app.PrivacyPolicyPage.privacyPolicy',
    defaultMessage: 'Privacy Policy',
  },
});

const PrivacyPolicyPage = (): JSX.Element => (
  <MarkdownPage className="m-auto max-w-7xl" markdown={privacyPolicy} />
);

const handle = translations.privacyPolicy;

export default Object.assign(PrivacyPolicyPage, { handle });
