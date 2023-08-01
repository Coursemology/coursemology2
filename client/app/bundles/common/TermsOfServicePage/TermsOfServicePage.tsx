import MarkdownPage from 'lib/components/core/layouts/MarkdownPage';

import termsOfService from './terms-of-service.md';

const TermsOfServicePage = (): JSX.Element => (
  <MarkdownPage className="m-auto max-w-7xl" markdown={termsOfService} />
);

export default TermsOfServicePage;
