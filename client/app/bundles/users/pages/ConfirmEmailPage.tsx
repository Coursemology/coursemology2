import {
  LoaderFunction,
  Navigate,
  redirect,
  useLoaderData,
} from 'react-router-dom';
import { Button, Typography } from '@mui/material';

import GlobalAPI from 'api';
import Link from 'lib/components/core/Link';
import { useEmailFromAuthPagesContext } from 'lib/containers/AuthPagesContainer';
import toast from 'lib/hooks/toast';
import useEffectOnce from 'lib/hooks/useEffectOnce';
import useTranslation from 'lib/hooks/useTranslation';

import Widget from '../components/Widget';
import translations from '../translations';

const ConfirmEmailPage = (): JSX.Element => {
  const { t } = useTranslation();

  const email = useLoaderData() as string;

  const [, setEmail] = useEmailFromAuthPagesContext();

  return (
    <Widget
      subtitle={t(translations.emailConfirmedSubtitle, {
        email,
        strong: (chunk) => <strong>{chunk}</strong>,
      })}
      title={t(translations.emailConfirmed)}
    >
      <Link to="/users/sign_in">
        <Button
          fullWidth
          onClick={(): void => setEmail(email)}
          type="submit"
          variant="contained"
        >
          {t(translations.signIn)}
        </Button>
      </Link>

      <Widget.Foot>
        <Typography color="text.secondary" variant="body2">
          {t(translations.manageAllEmailsInAccountSettings, {
            link: (chunk) => <Link to="/user/profile/edit">{chunk}</Link>,
          })}
        </Typography>
      </Widget.Foot>
    </Widget>
  );
};

const loader: LoaderFunction = async ({ request }) => {
  const token = new URL(request.url).searchParams.get('confirmation_token');
  if (!token) return redirect('/users/confirmation/new');

  const { data } = await GlobalAPI.users.confirmEmail(token);
  return data.email;
};

const ConfirmEmailInvalidRedirect = (): JSX.Element => {
  const { t } = useTranslation();

  useEffectOnce(() => {
    toast.error(t(translations.confirmEmailLinkInvalidOrExpired));
  });

  return <Navigate replace to="/users/confirmation/new" />;
};

export default Object.assign(ConfirmEmailPage, {
  loader,
  InvalidRedirect: ConfirmEmailInvalidRedirect,
});
