import { defineMessages } from 'react-intl';

import MarkdownPage from 'lib/components/core/layouts/MarkdownPage';

import termsOfService from './terms-of-service.md';

const translations = defineMessages({
  termsOfService: {
    id: 'app.TermsOfServicePage.termsOfService',
    defaultMessage: 'Terms of Service',
  },
});

const TermsOfServicePage = (): JSX.Element => (
  <MarkdownPage className="m-auto max-w-7xl" markdown={termsOfService} />
);

const handle = translations.termsOfService;

export default Object.assign(TermsOfServicePage, { handle });
