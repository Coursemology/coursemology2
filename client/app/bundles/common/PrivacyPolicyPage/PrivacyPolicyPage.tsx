import MarkdownPage from 'lib/components/core/layouts/MarkdownPage';

import privacyPolicy from './privacy-policy.md';

const PrivacyPolicyPage = (): JSX.Element => (
  <MarkdownPage className="m-auto max-w-7xl" markdown={privacyPolicy} />
);

export default PrivacyPolicyPage;
