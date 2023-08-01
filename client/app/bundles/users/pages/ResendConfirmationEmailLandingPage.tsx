import { Navigate } from 'react-router-dom';
import { Typography } from '@mui/material';

import Link from 'lib/components/core/Link';
import { SUPPORT_EMAIL } from 'lib/constants/sharedConstants';
import { useEmailFromLocationState } from 'lib/containers/AuthPagesContainer';
import useTranslation from 'lib/hooks/useTranslation';

import Widget from '../components/Widget';
import translations from '../translations';

const ResendConfirmationEmailLandingPage = (): JSX.Element => {
  const { t } = useTranslation();

  const email = useEmailFromLocationState();
  if (!email) return <Navigate to="/users/confirmation/new" />;

  return (
    <Widget
      subtitle={t(translations.resendConfirmationEmailCheckYourEmailSubtitle, {
        email,
        strong: (chunk) => <strong>{chunk}</strong>,
      })}
      title={t(translations.checkYourEmail)}
    >
      <Typography color="text.secondary" variant="body2">
        {t(translations.resendConfirmationEmailIfIssuePersistsContactUs, {
          supportEmail: SUPPORT_EMAIL,
          link: (chunk) => (
            <Link external href={`mailto:${SUPPORT_EMAIL}`}>
              {chunk}
            </Link>
          ),
        })}
      </Typography>

      <Widget.Foot className="flex space-x-3">
        <Typography color="text.secondary" variant="body2">
          {t(translations.confirmedYourEmail)}
        </Typography>

        <Link to="/users/sign_in">{t(translations.signIn)}</Link>
      </Widget.Foot>

      <Widget.Foot className="flex space-x-3">
        <Typography color="text.secondary" variant="body2">
          {t(translations.dontYetHaveAnAccount)}
        </Typography>

        <Link to="/users/sign_up">{t(translations.signUp)}</Link>
      </Widget.Foot>
    </Widget>
  );
};

export default ResendConfirmationEmailLandingPage;
