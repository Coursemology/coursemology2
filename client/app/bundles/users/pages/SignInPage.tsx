import { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Alert, Typography } from '@mui/material';
import { AxiosError } from 'axios';
import { ValidationError } from 'yup';

import GlobalAPI from 'api';
import Checkbox from 'lib/components/core/buttons/Checkbox';
import PasswordTextField from 'lib/components/core/fields/PasswordTextField';
import TextField from 'lib/components/core/fields/TextField';
import Link from 'lib/components/core/Link';
import { useEmailFromAuthPagesContext } from 'lib/containers/AuthPagesContainer';
import { useRedirectable } from 'lib/hooks/router/redirect';
import { useAuthenticator } from 'lib/hooks/session';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import Widget from '../components/Widget';
import translations from '../translations';
import { emailValidationSchema } from '../validations';

const SignInPage = (): JSX.Element => {
  const { t } = useTranslation();

  const [email, setEmail] = useEmailFromAuthPagesContext();

  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errored, setErrored] = useState(false);
  const [emailError, setEmailError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const { redirectable, expired } = useRedirectable();
  const { authenticate } = useAuthenticator();

  const handleSignIn = async (): Promise<void> => {
    setSubmitting(true);
    setErrored(false);
    setEmailError(undefined);

    try {
      const validatedEmail = await emailValidationSchema(t).validate(email);
      if (!validatedEmail) throw new Error('Email validation failed');

      await GlobalAPI.users.signIn(validatedEmail, password, rememberMe);
      authenticate();
    } catch (error) {
      if (error instanceof ValidationError) {
        setEmailError(error.message);
        return;
      }

      if (!(error instanceof AxiosError)) throw error;

      if (error.response?.status === 401) {
        setErrored(true);
        toast.error(
          error.response?.data?.error || t(translations.invalidEmailOrPassword),
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Widget
      className={errored ? 'animate-shake' : undefined}
      title={t(translations.signInToYourAccount)}
    >
      <Widget.Body>
        {redirectable && (
          <Alert severity="warning">
            {expired
              ? t(translations.sessionExpiredSignInToContinue)
              : t(translations.mustSignInToAccessPage)}
          </Alert>
        )}

        <TextField
          autoFocus
          disabled={submitting}
          error={errored || Boolean(emailError)}
          fullWidth
          helperText={emailError}
          label={t(translations.emailAddress)}
          name="email"
          onChange={(e): void => setEmail(e.target.value)}
          onPressEnter={handleSignIn}
          trims
          type="email"
          value={email}
          variant="filled"
        />

        <PasswordTextField
          autoFocus={Boolean(email)}
          disabled={submitting}
          error={errored}
          fullWidth
          label={t(translations.password)}
          name="password"
          onChange={(e): void => setPassword(e.target.value)}
          onPressEnter={handleSignIn}
          trims
          type="password"
          value={password}
          variant="filled"
        />

        <Checkbox
          description={t(translations.rememberMeHint)}
          disabled={submitting}
          label={t(translations.rememberMe)}
          onChange={(_, value): void => setRememberMe(value)}
          size="small"
          value={rememberMe}
        />
      </Widget.Body>

      <LoadingButton
        className="mt-10"
        disabled={!email.trim() || !password.trim()}
        fullWidth
        loading={submitting}
        onClick={handleSignIn}
        type="submit"
        variant="contained"
      >
        {t(translations.signIn)}
      </LoadingButton>

      <Widget.Foot className="flex space-x-3">
        <Typography color="text.secondary" variant="body2">
          {t(translations.dontYetHaveAnAccount)}
        </Typography>

        <Link disabled={submitting} to="/users/sign_up">
          {t(translations.signUp)}
        </Link>
      </Widget.Foot>

      <Widget.Foot className="flex flex-col">
        <Typography className="mb-4" color="text.secondary" variant="body2">
          {t(translations.troubleSigningIn)}
        </Typography>

        <div className="flex flex-col items-start space-y-3">
          <Link disabled={submitting} to="/users/password/new">
            {t(translations.forgotPassword)}
          </Link>

          <Link disabled={submitting} to="/users/confirmation/new">
            {t(translations.resendConfirmationEmail)}
          </Link>
        </div>
      </Widget.Foot>
    </Widget>
  );
};

export default SignInPage;
