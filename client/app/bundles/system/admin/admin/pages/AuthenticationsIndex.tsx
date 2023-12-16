import { defineMessages } from 'react-intl';

import Page from 'lib/components/core/layouts/Page';
import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  manageOauthApplications: {
    id: 'system.admin.admin.AuthenticationsIndex.manageOauthApplications',
    defaultMessage: 'Manage connected OAuth 2.0 applications',
  },
});

const AuthenticationsIndex = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Page>
      <Link external href="/oauth/applications">
        {t(translations.manageOauthApplications)}
      </Link>
    </Page>
  );
};

export default AuthenticationsIndex;
