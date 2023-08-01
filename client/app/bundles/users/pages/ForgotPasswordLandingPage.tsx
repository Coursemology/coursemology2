import { Navigate } from 'react-router-dom';
import { Typography } from '@mui/material';

import Link from 'lib/components/core/Link';
import { useEmailFromLocationState } from 'lib/containers/AuthPagesContainer';
import useTranslation from 'lib/hooks/useTranslation';

import Widget from '../components/Widget';
import translations from '../translations';

const ForgotPasswordLandingPage = (): JSX.Element => {
  const { t } = useTranslation();

  const email = useEmailFromLocationState();
  if (!email) return <Navigate to="/users/password/new" />;

  return (
    <Widget
      subtitle={t(translations.forgotPasswordCheckYourEmailSubtitle, {
        email,
        strong: (chunk) => <strong>{chunk}</strong>,
      })}
      title={t(translations.checkYourEmail)}
    >
      <Widget.Foot className="flex space-x-3">
        <Typography color="text.secondary" variant="body2">
          {t(translations.suddenlyRememberPassword)}
        </Typography>

        <Link to="/users/sign_in">{t(translations.signIn)}</Link>
      </Widget.Foot>
    </Widget>
  );
};

export default ForgotPasswordLandingPage;
